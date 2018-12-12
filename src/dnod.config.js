import ZoomableElement from "../node_modules/dlmn/utils/ZoomableElement.js";
import DraggableElement from "../node_modules/dlmn/utils/DraggableElement.js";
import LinkableConnectorElement from "./connector/LinkableConnectorElement.js";
import EditorElement from "./editor/EditorElement.js";
import NodeElement from "./node/NodeElement.js";
import LinkElement from "./link/LinkElement.js";
import InputElement from "../node_modules/dlmn/input/InputElement.js";
import ButtonInputElement from "../node_modules/dlmn/input/ButtonInputElement.js";
import CheckboxInputElement from "../node_modules/dlmn/input/CheckboxInputElement.js";
import ColorInputElement from "../node_modules/dlmn/input/ColorInputElement.js";
import NumberInputElement from "../node_modules/dlmn/input/NumberInputElement.js";
import RangeInputElement from "../node_modules/dlmn/input/RangeInputElement.js";
import SelectInputElement from "../node_modules/dlmn/input/SelectInputElement.js";
import TextInputElement from "../node_modules/dlmn/input/TextInputElement.js";
import ConnectorsElement from "./connectors/ConnectorsElement.js";

export default {
    customElementsMap: {
        "dnod-draggable": DraggableElement,
        "dnod-zoomable": ZoomableElement,
        "dnod-editor": EditorElement,
        "dnod-link": LinkElement,
        "dnod-connector": LinkableConnectorElement,
        "dnod-connectors": ConnectorsElement,
        "dnod-node": NodeElement,
        "dnod-input": InputElement,
        "dnod-input-button": ButtonInputElement,
        "dnod-input-checkbox": CheckboxInputElement,
        "dnod-input-color": ColorInputElement,
        "dnod-input-number": NumberInputElement,
        "dnod-input-range": RangeInputElement,
        "dnod-input-select": SelectInputElement,
        "dnod-input-text": TextInputElement,
    },
    inputTypeMap: {
        "button": "dnod-node-input-button",
        "checkbox": "dnod-node-input-checkbox",
        "color": "dnod-node-input-color",
        "number": "dnod-node-input-number",
        "range": "dnod-node-input-range",
        "select": "dnod-node-input-select",
        "text": "dnod-node-input-text",
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
