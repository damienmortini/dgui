export default {
    inputTypeMap: {
        "text": "dgui-input-text",
        "color": "dgui-input-color",
        "number": "dgui-input-number",
        "range": "dgui-input-range",
        "select": "dgui-input-select",
        "checkbox": "dgui-input-checkbox",
        "button": "dgui-input-button",
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
