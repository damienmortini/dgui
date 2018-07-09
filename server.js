const browserSyncServer = require("../../AppData/Local/Microsoft/TypeScript/2.9/node_modules/@types/browser-sync/index").create();

browserSyncServer.init({
  server: {
    baseDir: ".",
  },
  https: true,
  ghostMode: false,
  tunnel: false,
  open: false,
  notify: false,
  files: ["**/*.js", "**/*.html", "!server"],
  startPath: "?dev",
});
