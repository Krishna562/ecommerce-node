const path = require("path");

const getAbsolutePath = path.dirname(require.main.filename);

module.exports = getAbsolutePath;
