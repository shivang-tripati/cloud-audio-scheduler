const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const { AudioFile } = require("../models");
const sanitizeFilename = require("../utils/sanitizeFilename");
const logger = require("../utils/logger");

const UPLOADS_DIR = path.join(__dirname, "../../uploads/audio");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

class YoutubeService {

  constructor() {
    this.ytdlpPath = process.env.YTDLP_PATH || "yt-dlp";
    this.maxConcurrent = 3;
    this.activeDownloads = 0;
    this.queue = [];
  }

  isValidYoutubeUrl(url) {
    try {
      const parsed = new URL(url);
      return ["youtube.com", "www.youtube.com", "youtu.be"].includes(parsed.hostname);
    } catch {
      return false;
    }
  }

  _executeYtDlp(args, context) {
    return new Promise((resolve, reject) => {
      const proc = spawn(this.ytdlpPath, args, { windowsHide: true });
      let output = "";
      let errorOutput = "";

      proc.stdout.on("data", (data) => {
        output += data.toString();
      });

      proc.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      proc.on("close", (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`yt-dlp ${context} failed: code ${code}, ${errorOutput}`));
        }
      });

      proc.on("error", (err) => {
        reject(new Error(`yt-dlp spawn error: ${err.message}`));
      });
    });
  }

  async getMetadata(url) {
    const buildArgs = (useAndroid) => {
      const args = [
        "--no-playlist",
        "--dump-single-json",
        "--skip-download"
      ];
      if (process.env.YTDLP_COOKIES) {
        args.push("--cookies", process.env.YTDLP_COOKIES);
      }
      args.push("--user-agent", "Mozilla/5.0", "--geo-bypass", "--js-runtimes", "node");
      if (useAndroid) {
        args.push("--extractor-args", "youtube:player_client=android");
      }
      args.push(url);
      return args;
    };

    let output;
    try {
      logger.info("yt-dlp extracting metadata (Attempt 1)", { url });
      output = await this._executeYtDlp(buildArgs(false), "metadata");
    } catch (error1) {
      logger.warn("yt-dlp metadata attempt 1 failed, retrying with android client", { error: error1.message });
      try {
        logger.info("yt-dlp extracting metadata (Attempt 2 - Android)", { url });
        output = await this._executeYtDlp(buildArgs(true), "metadata fallback");
      } catch (error2) {
        logger.error("yt-dlp metadata failed permanently", { 
          url,
          error1: error1.message,
          error2: error2.message 
        });
        throw new Error("⚠️ This video cannot be processed due to YouTube restrictions. Try another video.");
      }
    }

    try {
      const meta = JSON.parse(output);
      return {
        title: meta.title,
        duration: meta.duration,
        uploader: meta.uploader
      };
    } catch (err) {
      logger.error("Failed to parse metadata JSON", { error: err.message });
      throw new Error("Failed to parse metadata JSON");
    }
  }

  enqueue(task) {

    return new Promise((resolve, reject) => {

      this.queue.push({ task, resolve, reject });
      this.processQueue();

    });
  }

  async processQueue() {

    if (this.activeDownloads >= this.maxConcurrent) return;
    if (this.queue.length === 0) return;

    const job = this.queue.shift();

    this.activeDownloads++;

    try {

      const result = await job.task();

      job.resolve(result);

    } catch (e) {

      job.reject(e);

    } finally {

      this.activeDownloads--;
      this.processQueue();

    }

  }

  runDownload = async (url, filePath) => {
    const buildArgs = (useAndroid) => {
      const args = [
        "-f", "bestaudio",
        "--extract-audio",
        "--audio-format", "mp3",
        "--audio-quality", "5",
        "--no-playlist",
        "--restrict-filenames"
      ];
      if (process.env.YTDLP_COOKIES) {
        args.push("--cookies", process.env.YTDLP_COOKIES);
      }
      args.push("--user-agent", "Mozilla/5.0", "--geo-bypass", "--js-runtimes", "node");
      if (useAndroid) {
        args.push("--extractor-args", "youtube:player_client=android");
      }
      args.push("-o", filePath, url);
      return args;
    };

    try {
      logger.info("Starting yt-dlp download (Attempt 1)", { url, filePath });
      await this._executeYtDlp(buildArgs(false), "download");
      logger.info("yt-dlp download completed on attempt 1", { filePath });
    } catch (error1) {
      logger.warn("yt-dlp download attempt 1 failed, retrying with android client", { error: error1.message });
      try {
        logger.info("Starting yt-dlp download (Attempt 2 - Android)", { url, filePath });
        await this._executeYtDlp(buildArgs(true), "download fallback");
        logger.info("yt-dlp download completed on attempt 2", { filePath });
      } catch (error2) {
        logger.error("yt-dlp download failed permanently", { 
          url,
          filePath,
          error1: error1.message,
          error2: error2.message 
        });
        throw new Error("⚠️ This video cannot be processed due to YouTube restrictions. Try another video.");
      }
    }
  };

  async importLink(url) {

    if (!url || !this.isValidYoutubeUrl(url)) {
      throw new Error("Invalid YouTube URL");
    }

    logger.info("Importing YouTube audio", { url });

    const metadata = await this.getMetadata(url);

    if (metadata.duration > 3600) {
      throw new Error("Audio longer than 1 hour not allowed");
    }

    const title = metadata.title || "Unknown Title";

    const existing = await AudioFile.findOne({ where: { title } });
    if (existing) {
      logger.info("Duplicate audio found");
      return existing.toJSON();
    }

    const safeTitle = sanitizeFilename(title);
    const fileName = `${safeTitle}_${uuidv4().slice(0, 8)}.mp3`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    await this.enqueue(async () => {
      return this.runDownload(url, filePath);
    });

    if (!fs.existsSync(filePath)) {
      throw new Error("Download finished but file missing");
    }

    const audio = await AudioFile.create({
      title,
      audio_type: "OTHER",
      language: "OTHER",
      file_url: `uploads/audio/${fileName}`,
      file_path: filePath,
      duration_seconds: metadata.duration || 0,
      is_active: true
    });

    logger.info("Audio import completed", { id: audio.id });

    return audio.toJSON();
  }

}

module.exports = new YoutubeService();