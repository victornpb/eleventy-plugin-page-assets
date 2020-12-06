const crypto = require('crypto');
const fs = require('fs');

module.exports = function fileHash(filename, algorithm = "md5", digest="hex") {
  return new Promise((resolve, reject) => {
    // Algorithm depends on availability of OpenSSL on platform
    // Another algorithms: 'sha1', 'md5', 'sha256', 'sha512' ...
    let shasum = crypto.createHash(algorithm);
    try {
      let s = fs.ReadStream(filename);
      s.on("data", function (data) {
        shasum.update(data);
      });
      // making digest
      s.on("end", function () {
        const hash = shasum.digest(digest);
        return resolve(hash);
      });
    } catch (error) {
      return reject(error);
    }
  });
}
