const fs = require("fs");
const WebSocket = require("ws");
const WebSocketServer = WebSocket.Server;
const https = require("https");

const server = new https.createServer({
  key: fs.readFileSync("server/certs/server.key"),
  cert: fs.readFileSync("server/certs/server.crt")
}, (req, res) => {
  res.writeHead(200);
  res.end("WebSocket server running");
}).listen(8000);

module.exports = class GUIServer {
  constructor(options = { server }) {
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
      console.log("GUI - Connected");
      var dataFileURL = "";
      webSocket.on("message", (message) => {
        const data = JSON.parse(message);
        if (data.type === "save") {
          if(!dataFileURL) {
            return;
          }
          let guiData;
          try {
            guiData = JSON.parse(fs.readFileSync(dataFileURL));
          } catch (error) {
            guiData = {};
          }

          deepAssign(guiData, data.data);

          fs.writeFile(dataFileURL, JSON.stringify(guiData, undefined, "\t"), function (error) {
            if (error) throw error;
          });
        } else if (data.type === "datafileurl") {
          console.log(`GUI - Data File URL: "${data.data}"`);
          dataFileURL = data.data;
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