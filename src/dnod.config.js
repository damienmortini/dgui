import LinkableConnectorElement from "./connector/LinkableConnectorElement.js";
import EditorElement from "./editor/EditorElement.js";
import NodeElement from "./node/NodeElement.js";
import ZoomableElement from "./misc/ZoomableElement.js";
import DraggableElement from "./misc/DraggableElement.js";
import LinkElement from "./link/LinkElement.js";
import InputElement from "./input/InputElement.js";
import ButtonInputElement from "./input/ButtonInputElement.js";
import CheckboxInputElement from "./input/CheckboxInputElement.js";
import ColorInputElement from "./input/ColorInputElement.js";
import NumberInputElement from "./input/NumberInputElement.js";
import RangeInputElement from "./input/RangeInputElement.js";
import SelectInputElement from "./input/SelectInputElement.js";
import TextInputElement from "./input/TextInputElement.js";
import ConnectorsElement from "./connectors/ConnectorsElement.js";

export default {
    customElementsMap: {
        "dnod-editor": EditorElement,
        "dnod-link": LinkElement,
        "dnod-connector": LinkableConnectorElement,
        "dnod-connectors": ConnectorsElement,
        "dnod-draggable": DraggableElement,
        "dnod-zoomable": ZoomableElement,
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
