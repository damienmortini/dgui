import ZoomableElement from "../../elements/src/util/ZoomableElement.js";
import DraggableElement from "../../elements/src/util/DraggableElement.js";
import LinkableConnectorElement from "./connector/LinkableConnectorElement.js";
import GraphElement from "./graph/GraphElement.js";
import NodeElement from "./node/NodeElement.js";
import LinkElement from "./link/LinkElement.js";
import ButtonInputElement from "../../elements/src/input/ButtonInputElement.js";
import CheckboxInputElement from "../../elements/src/input/CheckboxInputElement.js";
import Pad2DInputElement from "../../elements/src/input/Pad2DInputElement.js";
import ColorPickerInputElement from "../../elements/src/input/ColorPickerInputElement.js";
import NumberInputElement from "../../elements/src/input/NumberInputElement.js";
import RangeInputElement from "../../elements/src/input/RangeInputElement.js";
import SelectInputElement from "../../elements/src/input/SelectInputElement.js";
import TextInputElement from "../../elements/src/input/TextInputElement.js";
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
    "graph-input-pad2d": Pad2DInputElement,
    "graph-input-color": ColorPickerInputElement,
    "graph-input-number": NumberInputElement,
    "graph-input-range": RangeInputElement,
    "graph-input-select": SelectInputElement,
    "graph-input-text": TextInputElement,
  },
};
