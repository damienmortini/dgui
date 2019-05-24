let editor;

const objectDataMap = new Map();

const nodesData = [];

import "../src/index.js";

export default class JavascriptProxy {
  static add({
    object,
    key,
    id,
  }) {
    if (!graph) {
      
    }
    const input = graph.querySelector(`#${id}`);
    if (input) {
      input.value = object[key];
      input.addEventListener("input", () => {

      });
    }
  }
}

// export default class Graph {
//   static add({
//     object,
//     key,
//     type = "auto",
//     path = "",
//   }) {
//     if()

//     attributes = (key ? (typeof key === "string" ? attributes : key) : object);
//     if (typeof attributes !== "object" || !("value" in attributes || "type" in attributes)) {
//       if (typeof object === "object" && typeof key === "string") {
//         attributes.value = object[key];
//       } else {
//         attributes = {
//           name: attributes.name || object.toString(),
//           value: attributes.value || object,
//         };
//       }
//     }

//     attributes.name = attributes.name || key;

//     nodesData = [...nodesData, attributes];

//     if (editor) {
//       editor.nodesData = nodesData;
//     }

//     if (typeof object === "object" && typeof key === "string") {
//       object[key] = attributes.value;
//       objectDataMap.set(attributes.name, {
//         object,
//         key,
//       });
//     }
//   }

//   static set editor(value) {
//     editor = value;

//     editor.nodesData = nodesData;

//     editor.addEventListener("input", (event) => {
//       const objectData = objectDataMap.get(event.target.name);
//       if (objectData) {
//         objectData.object[objectData.key] = event.target.value;
//       }
//     });
//   }

//   static get style() {
//     return editor.style;
//   }
// }
