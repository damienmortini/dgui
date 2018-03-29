const fs = require("fs");
const WebSocket = require("ws");
const WebSocketServer = WebSocket.Server;

const reviver = (key, value) => {
  if (value instanceof Array && value[0] instanceof Array) {
    return new Map(value);
  }
  return value;
}

let guiData = {};

let webSocketServer = new WebSocketServer({ port: 80 });
webSocketServer.on("connection", function connection(webSocket) {
  console.log("GUI Connected");
  webSocket.on("message", function (message) {
    const data = JSON.parse(message, reviver);
    if (data.type === "save") {
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
      deepAssign(guiData, data.data);
      fs.writeFile("gui-data.json", JSON.stringify(guiData, undefined, "\t"), function (error) {
        if (error) throw error;
      });
    } else {
      for (let client of webSocketServer.clients) {
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
