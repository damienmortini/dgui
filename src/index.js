import GUINodeElement from "./GUINodeElement.js";

const GUI_NODE = new GUINodeElement();
document.body.appendChild(GUI_NODE);

window.DGUI = GUI_NODE;

export default GUI_NODE;