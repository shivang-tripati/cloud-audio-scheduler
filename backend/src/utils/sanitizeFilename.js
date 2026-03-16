const sanitizeFilename = (filename) => {
  // Remove trailing extensions if somehow present
  const baseName = filename.replace(/\.[^/.]+$/, "");
  // Replace invalid characters, spaces with underscores, and convert to lowercase
  return baseName
    .replace(/[^a-zA-Z0-9_\-]/g, '_') // Replace non-alphanumeric, -, _ with _
    .replace(/_+/g, '_') // Replace multiple underscores with a single underscore
    .replace(/^_|_$/g, '') // Trim underscores from ends
    .toLowerCase();
};

module.exports = sanitizeFilename;
