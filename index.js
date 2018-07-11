import "./gui/GUIConfig.js";

import "./gui/GUIInputElement.js";
import "./node/NodeGroupElement.js";

const nodeGroup = document.createElement("dgui-node-group");
nodeGroup.name = "GUI";
nodeGroup.style.position = "absolute";
nodeGroup.style.top = "0";
nodeGroup.style.left = "0";

const objectDataMap = new Map();

nodeGroup.addEventListener("input", (event) => {
  const objectData = objectDataMap.get(event.target.name);
  if (objectData) {
    objectData.object[objectData.key] = event.target.value;
  }
});


export default class GUI {
  static add(object, key, attributes = {}) {
    attributes = (key ? (typeof key === "string" ? attributes : key) : object);
    if (typeof attributes !== "object" || !("value" in attributes || "type" in attributes)) {
      if (typeof object === "object" && typeof key === "string") {
        attributes.value = object[key];
      } else {
        attributes = {
          name: attributes.name || object.toString(),
          value: attributes.value || object,
        };
      }
    }

    attributes.name = attributes.name || key;

    if (!nodeGroup.parentElement) {
      document.body.appendChild(nodeGroup);
    }

    nodeGroup.nodes = [...nodeGroup.nodes, attributes];

    if (typeof object === "object" && typeof key === "string") {
      object[key] = attributes.value;
      objectDataMap.set(attributes.name, {
        object,
        key,
      });
    }
  }

  static get style() {
    return nodeGroup.style;
  }
}
