import "../src/index.js";

let graph;
let mainNode;

const tagNameResolvers = new Map([
  ["graph-input-button", (attributes) => !!attributes.onclick],
  ["graph-input-select", (attributes) => !!attributes.options],
  ["graph-input-color", (attributes) => {
    return typeof attributes.object[attributes.key] === "string" && ((attributes.object[attributes.key].length === 7 && attributes.object[attributes.key].startsWith("#")) || attributes.object[attributes.key].startsWith("rgb") || attributes.object[attributes.key].startsWith("hsl")) || (typeof attributes.object[attributes.key] === "object" && attributes.object[attributes.key].r !== undefined && attributes.object[attributes.key].g !== undefined && attributes.object[attributes.key].b !== undefined);
  }],
  ["graph-input-text", (attributes) => typeof attributes.object[attributes.key] === "string"],
  ["graph-input-range", (attributes) => typeof attributes.object[attributes.key] === "number"],
  ["graph-input-checkbox", (attributes) => typeof attributes.object[attributes.key] === "boolean"],
]);

export default class GUI {
  get graph() {
    return graph;
  }

  set graph(value) {
    graph = value;
  }

  static addFolder(options, parent = undefined) {
    const folder = GUI.add({
      tagName: "graph-node",
      ...options,
    }, parent);
    folder.style.resize = "none";
    return folder;
  }

  static add(options, parent = undefined) {
    options = { ...options };

    if (!options.tagName) {
      for (const [tagName, resolve] of tagNameResolvers) {
        if (resolve(options)) {
          options.tagName = tagName;
          break;
        }
      }
    }

    let { object, key } = options;
    delete options.object;
    delete options.key;

    if (!graph) {
      graph = document.createElement("graph-editor");
      document.body.appendChild(graph);
      graph.insertAdjacentHTML("afterbegin", `
        <style>
          graph-node {
            background: transparent;
            border: none;
          }
        </style>
      `);
      graph.style.position = "absolute";
      graph.style.top = "0";
      graph.style.left = "0";
      graph.style.width = "250px";
      graph.style.color = "white";
      graph.style.textShadow = "0 0 3px black";
      mainNode = graph.add({
        name: "GUI",
        tagName: "graph-node",
      });
    }

    if (!options.id && key) {
      options.id = key;
    }

    const input = graph.add(options, parent || mainNode);
    if (object) {
      input.value = object[key];
      input.addEventListener("input", (event) => {
        object[key] = input.value;
      });
    }

    return input;
  }
}
