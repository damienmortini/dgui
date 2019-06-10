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

const foldersMap = new Map();

export default class GUI {
  get graph() {
    return graph;
  }

  set graph(value) {
    graph = value;
  }

  static add(options) {
    options = { ...options };

    if (!mainNode) {
      mainNode = document.createElement("graph-node");
      mainNode.name = "GUI";
      mainNode.classList.add("gui");
      mainNode.noConnector = true;
      document.body.appendChild(mainNode);
      mainNode.insertAdjacentHTML("afterbegin", `
        <style>
          graph-node.gui {
            position: absolute;
            top: 0;
            left: 0;
            width: 250px;
            color: white;
            text-shadow: 0 0 3px black;
            font-family: sans-serif;
          }
          graph-node {
            background: transparent;
            border: none;
          }
        </style>
      `);
    }

    if (!options.tagName) {
      options.tagName = "graph-input-text";
      for (const [tagName, resolve] of tagNameResolvers) {
        if (resolve(options)) {
          options.tagName = tagName;
          break;
        }
      }
    }

    let { object, key, folder } = options;
    delete options.object;
    delete options.key;
    delete options.folder;

    let folderElement = mainNode;

    if (folder) {
      const folderNames = folder.split("/");
      let path = "";
      let parentFolderElement = mainNode;
      for (const folderName of folderNames) {
        if (path) {
          path += "/";
        }
        path += folderName;
        folderElement = foldersMap.get(path);
        if (!folderElement) {
          const template = document.createElement("template");
          template.innerHTML = `<graph-node name="${folderName}" noconnector></graph-node>`;
          folderElement = template.content.firstChild;
          parentFolderElement.appendChild(folderElement);
          folderElement.style.resize = "none";
          foldersMap.set(path, folderElement);
        }
        parentFolderElement = folderElement;
      }
    }

    if (!options.id && key) {
      options.id = key;
    }

    // const input = graph.add(options, folderElement);

    const element = document.createElement(options.tagName);
    for (const key in options) {
      if (key === "tagName") {
        continue;
      }
      element[key] = options[key];
    }
    folderElement.appendChild(element);

    if (object) {
      element.value = object[key];
      element.addEventListener("input", (event) => {
        object[key] = element.value;
      });
    }

    return element;
  }
}
