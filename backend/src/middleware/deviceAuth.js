// middleware/deviceAuth.js
const bcrypt = require('bcrypt');
const { Device } = require('../models');

module.exports = async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).end();

    const devices = await Device.findAll({
        where: { activation_status: 'ACTIVE' }
    });

    for (const d of devices) {
        if (await bcrypt.compare(token, d.device_token)) {
            req.device = d;
            return next();
        }
    }

    return res.status(401).end();
};
