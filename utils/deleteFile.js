const fs = require("fs");
const path = require("path");

const deleteFile = (postImg) => {
  const pathToImagesDir = path.resolve(path.join(".", "images"));
  fs.readdir(pathToImagesDir, (err, files) => {
    if (err) console.log(err);
    else {
      const filename = files.find((file) => {
        return postImg.includes(file);
      });
      fs.unlink(`${pathToImagesDir}/${filename}`, (err) => {
        if (err) {
          console.log(err);
        }
      });
    }
  });
};

module.exports = deleteFile;
