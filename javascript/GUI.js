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

    if (!graph) {
      graph = document.createElement("graph-editor");
      document.body.appendChild(graph);
      graph.insertAdjacentHTML("afterbegin", `
        <style>
          graph-editor {
            position: absolute;
            top: 0;
            left: 0;
            width: 250px;
            color: white;
            text-shadow: 0 0 3px black;
          }
          graph-node {
            background: transparent;
            border: none;
          }
          graph-connector {
            display: none;
          }
        </style>
      `);
      mainNode = graph.add({
        name: "GUI",
        tagName: "graph-node",
        noConnector: true,
      });
    }

    if (!options.tagName) {
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

    let folderElement;

    if (folder) {
      const folderNames = folder.split("/");
      let path = "";
      let parentFolderElement = undefined;
      for (const folderName of folderNames) {
        if (path) {
          path += "/";
        }
        path += folderName;
        folderElement = foldersMap.get(folder);
        console.log(folderName, parentFolderElement);
        
        if (!folderElement) {
          folderElement = graph.add({
            name: folderName,
            tagName: "graph-node",
            noConnector: true,
          }, parentFolderElement);
          folderElement.style.resize = "none";
          foldersMap.set(path, folderElement);
        }
        parentFolderElement = folderElement;
      }
    }

    if (!options.id && key) {
      options.id = key;
    }

    const input = graph.add(options, folderElement || mainNode);
    if (object) {
      input.value = object[key];
      input.addEventListener("input", (event) => {
        object[key] = input.value;
      });
    }

    return input;
  }
}
