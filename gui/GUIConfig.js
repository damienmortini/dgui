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
        "text": (value) => typeof value === "string",
        "range": (value) => typeof value === "number",
        "checkbox": (value) => typeof value === "boolean",
        "button": (value) => typeof value === "function",
        "color": (value) => {
            return typeof value === "string" && ((value.length === 7 && value.startsWith("#")) || value.startsWith("rgb") || value.startsWith("hsl")) || (typeof value === "object" && value.r !== undefined && value.g !== undefined && value.b !== undefined);
        },
    },
};
