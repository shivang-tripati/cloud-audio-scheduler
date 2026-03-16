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

  getMetadata(url) {
    return new Promise((resolve, reject) => {

      const args = [
        "--no-playlist",
        "--dump-single-json",
        "--skip-download",
        url
      ];

      logger.info("yt-dlp extracting metadata", { url });

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

        if (code !== 0) {
          logger.error("yt-dlp metadata failed", { code, errorOutput });
          return reject(new Error(`yt-dlp metadata extraction failed: ${errorOutput}`));
        }

        try {

          const meta = JSON.parse(output);

          resolve({
            title: meta.title,
            duration: meta.duration,
            uploader: meta.uploader
          });

        } catch (err) {
          reject(new Error("Failed to parse metadata JSON"));
        }

      });

      proc.on("error", reject);

    });
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

  runDownload = (url, filePath) => {
    return new Promise((resolve, reject) => {

      logger.info("Starting yt-dlp download", { url, filePath });

      const args = [
        "-f", "bestaudio",
        "--extract-audio",
        "--audio-format", "mp3",
        "--audio-quality", "5",
        "--no-playlist",
        "--restrict-filenames",
        "--js-runtimes", "node",
        "-o", filePath,
        url
      ];

      const proc = spawn(this.ytdlpPath, args, { windowsHide: true });

      let errorOutput = "";

      proc.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      proc.on("close", (code) => {

        if (code === 0) {
          logger.info("yt-dlp download completed", { filePath });
          resolve();
        } else {
          logger.error("yt-dlp download failed", { code, errorOutput });
          reject(new Error(`yt-dlp download failed: ${errorOutput}`));
        }

      });

      proc.on("error", (err) => {
        logger.error("yt-dlp spawn error", { error: err.message });
        reject(err);
      });

    });
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