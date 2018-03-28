import GUIElement from "./GUIElement.js";

const GUI = new GUIElement();
GUI.addNode({
  label: "Main"
});
document.body.appendChild(GUI);

GUI.addInput = (...parameters) => {
  return GUI.nodes.get("main").addInput(...parameters);
}

window.DGUI = GUI;
export default GUI;