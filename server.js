const browserSyncServer = require("browser-sync").create();
require("./src/server.js");

browserSyncServer.init({
  server: true,
  // httpModule: "http2",
  https: true,
  ghostMode: false,
  tunnel: false,
  open: "local",
  notify: false,
  files: "src",
  startPath: "?dev"
});