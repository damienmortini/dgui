import GUIElement from "./GUIElement.js";
import GUINodeElement from "./GUINodeElement.js";

const GUI = new GUIElement();
GUI.addNode({
  label: "Main"
});
document.body.appendChild(GUI);

GUI.addInput = (...parameters) => {
  return GUI.nodes.get("main").addInput(...parameters);
}

const socket = new WebSocket("ws://localhost");
socket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  if(data.type === "input") {
    Object.assign(GUI, data.data);
  }
});
const sendInputData = (e) => {
  socket.send(JSON.stringify({
    type: e.type,
    data: Object.assign(GUI.toJSON(), {
      nodes: {
        [e.target.parentElement.name]: Object.assign(e.target.parentElement.toJSON(), {
          inputs: {
            [e.target.name]: e.target.toJSON()
          }
        })
      }
    })
  }));
}
GUI.addEventListener("input", sendInputData);
GUI.addEventListener("save", sendInputData);

window.DGUI = GUI;
export default GUI;