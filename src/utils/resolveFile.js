const fs = require('fs');

module.exports = async function resolveFile(filePath) {
  try {
    await fs.promises.access(filePath, fs.F_OK);
    return true;
  } catch (error) {
    console.error(__dirname, error);
    return false;
  }
};
