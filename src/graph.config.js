import ZoomableElement from "../node_modules/@damienmortini/elements/src/util/ZoomableElement.js";
import DraggableElement from "../node_modules/@damienmortini/elements/src/util/DraggableElement.js";
import LinkableConnectorElement from "./connector/LinkableConnectorElement.js";
import EditorElement from "./editor/EditorElement.js";
import NodeElement from "./node/NodeElement.js";
import LinkElement from "./link/LinkElement.js";
import InputElement from "../node_modules/@damienmortini/elements/src/input/InputElement.js";
import ButtonInputElement from "../node_modules/@damienmortini/elements/src/input/ButtonInputElement.js";
import CheckboxInputElement from "../node_modules/@damienmortini/elements/src/input/CheckboxInputElement.js";
import ColorInputElement from "../node_modules/@damienmortini/elements/src/input/ColorInputElement.js";
import NumberInputElement from "../node_modules/@damienmortini/elements/src/input/NumberInputElement.js";
import RangeInputElement from "../node_modules/@damienmortini/elements/src/input/RangeInputElement.js";
import SelectInputElement from "../node_modules/@damienmortini/elements/src/input/SelectInputElement.js";
import TextInputElement from "../node_modules/@damienmortini/elements/src/input/TextInputElement.js";
import ConnectorsElement from "./connectors/ConnectorsElement.js";

export default {
  customElementsMap: {
    "graph-draggable": DraggableElement,
    "graph-zoomable": ZoomableElement,
    "graph-editor": EditorElement,
    "graph-link": LinkElement,
    "graph-connector": LinkableConnectorElement,
    "graph-connectors": ConnectorsElement,
    "graph-node": NodeElement,
    "graph-input": InputElement,
    "graph-input-button": ButtonInputElement,
    "graph-input-checkbox": CheckboxInputElement,
    "graph-input-color": ColorInputElement,
    "graph-input-number": NumberInputElement,
    "graph-input-range": RangeInputElement,
    "graph-input-select": SelectInputElement,
    "graph-input-text": TextInputElement,
  },
  inputTypeMap: {
    "button": "graph-node-input-button",
    "checkbox": "graph-node-input-checkbox",
    "color": "graph-node-input-color",
    "number": "graph-node-input-number",
    "range": "graph-node-input-range",
    "select": "graph-node-input-select",
    "text": "graph-node-input-text",
  },
  typeResolvers: {
    "text": (attributes) => typeof attributes.value === "string",
    "range": (attributes) => typeof attributes.value === "number",
    "checkbox": (attributes) => typeof attributes.value === "boolean",
    "button": (attributes) => typeof attributes.value === "function",
    "color": (attributes) => {
      return typeof attributes.value === "string" && ((attributes.value.length === 7 && attributes.value.startsWith("#")) || attributes.value.startsWith("rgb") || attributes.value.startsWith("hsl")) || (typeof attributes.value === "object" && attributes.value.r !== undefined && attributes.value.g !== undefined && attributes.value.b !== undefined);
    },
    "select": (attributes) => !!attributes.options,
  },
};
