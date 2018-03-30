const fs = require("fs");
const WebSocket = require("ws");
const WebSocketServer = WebSocket.Server;

module.exports = class GUIServer {
  constructor(options = { port: 80 }) {
    this.webSocketServer = new WebSocketServer(options);

    const deepAssign = (target, source) => {
      for (const [key, sourceData] of Object.entries(source)) {
        if (typeof sourceData === "object") {
          if (!target[key]) {
            target[key] = {};
          }
          deepAssign(target[key], sourceData);
        }
      }
      Object.assign(target, source);
      Object.assign(source, target);
    }

    this.webSocketServer.on("connection", (webSocket) => {
      console.log("GUI Connected");
      webSocket.on("message", (message) => {
        const data = JSON.parse(message);
        if (data.type === "save") {
          let guiData;
          try {
            guiData = JSON.parse(fs.readFileSync("gui-data.json"));
          } catch (error) {
            guiData = {};
          }

          deepAssign(guiData, data.data);

          fs.writeFile("gui-data.json", JSON.stringify(guiData, undefined, "\t"), function (error) {
            if (error) throw error;
          });
        } else {
          for (let client of this.webSocketServer.clients) {
            if (webSocket === client) {
              continue;
            }
            client.send(message, (error) => {
              if (error) {
                console.log(error);
              }
            });
          }
        }
      });
    });
  }
}

