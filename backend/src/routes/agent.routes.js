const express = require("express");
const router = express.Router();
const fs = require("fs/promises");
const path = require("path");

const downloadsPath = path.join(
    __dirname,
    "../../var/www/rediocast/downloads"
);

// Cache installer name for performance
let cachedInstaller = null;
let lastCheck = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

async function getLatestInstaller() {
    const now = Date.now();

    // Use cache if still valid
    if (cachedInstaller && now - lastCheck < CACHE_TTL) {
        return cachedInstaller;
    }

    const files = await fs.readdir(downloadsPath);

    const installers = files
        .filter(f => f.startsWith("AudioAgentSetup") && f.endsWith(".exe"))
        .sort()
        .reverse();

    cachedInstaller = installers[0] || null;
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