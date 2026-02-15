// deviceController.js
const crypto = require('crypto');
const bcrypt = require('bcrypt');

exports.activate = async (req, res) => {
  const { device_code, device_uuid } = req.body;

  const device = await Device.findOne({ where: { device_code } });
  if (!device) {
    return res.status(400).json({ message: 'Invalid device code' });
  }

  // Block cloning
  if (device.device_uuid && device.device_uuid !== device_uuid) {
    return res.status(409).json({
      message: 'Device already activated on another system'
    });
  }

  // First activation OR reinstall
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = await bcrypt.hash(rawToken, 10);

  await device.update({
    device_uuid,
    device_token: hashedToken,
    activation_status: 'ACTIVE',
    status: 'OFFLINE'
  });

  res.json({
    token: rawToken,
    branch_id: device.branch_id
  });
};
