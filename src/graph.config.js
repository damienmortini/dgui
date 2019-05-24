import ZoomableElement from "../node_modules/@damienmortini/elements/src/util/ZoomableElement.js";
import DraggableElement from "../node_modules/@damienmortini/elements/src/util/DraggableElement.js";
import LinkableConnectorElement from "./connector/LinkableConnectorElement.js";
import GraphElement from "./graph/GraphElement.js";
import NodeElement from "./node/NodeElement.js";
import LinkElement from "./link/LinkElement.js";
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
    "graph-editor": GraphElement,
    "graph-link": LinkElement,
    "graph-connector": LinkableConnectorElement,
    "graph-connectors": ConnectorsElement,
    "graph-node": NodeElement,
    "graph-input-button": ButtonInputElement,
    "graph-input-checkbox": CheckboxInputElement,
    "graph-input-color": ColorInputElement,
    "graph-input-number": NumberInputElement,
    "graph-input-range": RangeInputElement,
    "graph-input-select": SelectInputElement,
    "graph-input-text": TextInputElement,
  },
};
