import "../node/NodeInElement.js";
import "../node/NodeOutElement.js";
import "../misc/DraggableHandlerElement.js";

export default {
    inputTypeMap: {
        "button": "dgui-node-input-button",
        "checkbox": "dgui-node-input-checkbox",
        "color": "dgui-node-input-color",
        "number": "dgui-node-input-number",
        "range": "dgui-node-input-range",
        "select": "dgui-node-input-select",
        "text": "dgui-node-input-text",
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
