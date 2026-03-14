const express = require("express");
const router = express.Router();
const fs = require("fs/promises");
const path = require("path");

const downloadsPath = "/app/downloads";

let cachedInstaller = null;
let lastCheck = 0;
const CACHE_TTL = 60000;

async function getLatestInstaller() {
    const now = Date.now();

    if (cachedInstaller && now - lastCheck < CACHE_TTL) {
        return cachedInstaller;
    }

    const files = await fs.readdir(downloadsPath);

    const installers = files.filter(
        f => f.startsWith("AudioAgentSetup") && f.endsWith(".exe")
    );

    if (!installers.length) return null;

    const stats = await Promise.all(
        installers.map(async file => ({
            file,
            stat: await fs.stat(path.join(downloadsPath, file))
        }))
    );

    stats.sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);

    cachedInstaller = stats[0].file;
    lastCheck = now;

    return cachedInstaller;
}

router.get("/latest", async (req, res) => {
    try {
        const latest = await getLatestInstaller();

        if (!latest) {
            return res.status(404).json({
                success: false,
                message: "No installer found"
            });
        }

        return res.redirect(`/downloads/${latest}`);
    } catch (err) {
        console.error("Agent latest error:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch installer"
        });
    }
});

module.exports = router;