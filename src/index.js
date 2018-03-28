import GUIElement from "./GUIElement.js";

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
  Object.assign(GUI, JSON.parse(event.data));
});
GUI.addEventListener("input", (e) => {
  socket.send(JSON.stringify({
    nodes: [{
      name: e.target.parentElement.name,
      inputs: [
        e.target.toJSON()
      ]
    }]
  }));
});

window.DGUI = GUI;
export default GUI;