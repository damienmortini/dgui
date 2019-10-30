import NodeElement from '../../elements/src/node/index.js';
import InputButtonElement from '../../elements/src/input-button/index.js';
import InputCheckboxElement from '../../elements/src/input-checkbox/index.js';
import InputColorElement from '../../elements/src/input-color/index.js';
// import InputColorPickerElement from "../../elements/src/input-colorpicker/index.js";
import InputRangeElement from '../../elements/src/input-range/index.js';
import InputSelectElement from '../../elements/src/input-select/index.js';
import InputTextElement from '../../elements/src/input-text/index.js';

const customElementsMap = new Map(Object.entries({
  'graph-node': NodeElement,
  'graph-input-button': InputButtonElement,
  'graph-input-checkbox': InputCheckboxElement,
  'graph-input-color': InputColorElement,
  'graph-input-range': InputRangeElement,
  'graph-input-select': InputSelectElement,
  'graph-input-text': InputTextElement,
}));

for (const [customElementName, customElementConstructor] of customElementsMap) {
  customElements.define(customElementName, customElementConstructor);
}

let mainNode;
let hidden = false;

const tagNameResolvers = new Map([
  ['graph-input-button', (attributes) => !!attributes.onclick],
  ['graph-input-select', (attributes) => !!attributes.options],
  ['graph-input-color', (attributes) => {
    return typeof attributes.value === 'string' && ((attributes.value.length === 7 && attributes.value.startsWith('#')) || attributes.value.startsWith('rgb') || attributes.value.startsWith('hsl')) || (typeof attributes.value === 'object' && attributes.value.r !== undefined && attributes.value.g !== undefined && attributes.value.b !== undefined);
  }],
  ['graph-input-text', (attributes) => typeof attributes.value === 'string'],
  ['graph-input-range', (attributes) => typeof attributes.value === 'number'],
  ['graph-input-checkbox', (attributes) => typeof attributes.value === 'boolean'],
]);

const foldersMap = new Map();
const valuesMap = new Map(JSON.parse(new URLSearchParams(location.hash.slice(1)).get('gui')));

export default class GUI {
  static get folders() {
    return foldersMap;
  }

  static get hidden() {
    return hidden;
  }

  static set hidden(value) {
    hidden = value;
    if (mainNode) {
      mainNode.style.display = hidden ? 'none' : '';
    }
  }

  static add(options) {
    options = Object.assign({}, options);

    if (options.id === undefined && options.key !== undefined) {
      options.id = `${options.folder ? options.folder + '/' : ''}${options.key}`;
    }
    if (!options.id) {
      console.warn(`GUI: ${JSON.stringify(options)} doesn't have any id`);
    }

    const urlValue = valuesMap.get(options.id);

    if (urlValue !== undefined) {
      if (options.object) {
        options.object[options.key] = urlValue;
      }
    }

    if (!options.tagName) {
      options.tagName = 'graph-input-text';
      if (options.object) {
        options.value = options.object[options.key];
      }
      for (const [tagName, resolve] of tagNameResolvers) {
        if (resolve(options)) {
          options.tagName = tagName;
          break;
        }
      }
    }

    const { object, key, folder, reload } = options;
    delete options.object;
    delete options.key;
    delete options.folder;
    delete options.reload;

    if (!mainNode) {
      mainNode = document.createElement('graph-node');
      GUI.hidden = GUI.hidden;
      mainNode.name = 'GUI';
      mainNode.classList.add('gui');
      document.body.appendChild(mainNode);
      mainNode.insertAdjacentHTML('afterbegin', `
        <style>
          graph-node.gui {
            position: absolute;
            top: 0;
            left: 0;
            width: 250px;
            max-height: 100%;
            color: white;
            text-shadow: 0 0 3px black;
            font-family: sans-serif;
          }
          graph-node {
            background: transparent;
            border: none;
          }
          graph-node::-webkit-scrollbar { 
            background: transparent;
            width: 4px;
          }
          graph-node::-webkit-scrollbar-thumb { 
            background: rgba(1, 1, 1, .1);
          }
        </style>
      `);
    }

    let folderElement = mainNode;

    if (folder) {
      const folderNames = folder.split('/');
      let path = '';
      let parentFolderElement = mainNode;
      for (const folderName of folderNames) {
        if (path) {
          path += '/';
        }
        path += folderName;
        folderElement = foldersMap.get(path);
        if (!folderElement) {
          folderElement = document.createElement('graph-node');
          folderElement.name = folderName;
          folderElement.noConnector = true;
          folderElement.style.resize = 'none';
          const currentPath = path;
          folderElement.close = !(sessionStorage.getItem(`GUI[${currentPath}]`) === 'false');
          folderElement.addEventListener('toggle', (event) => {
            sessionStorage.setItem(`GUI[${currentPath}]`, event.target.close);
          });
          parentFolderElement.appendChild(folderElement);
          foldersMap.set(currentPath, folderElement);
        }
        parentFolderElement = folderElement;
      }
    }

    const element = document.createElement(options.tagName);
    for (const key in options) {
      if (key === 'tagName') {
        continue;
      }
      element[key] = options[key];
    }
    folderElement.appendChild(element);

    if (urlValue !== undefined) {
      element.value = urlValue;
      element.dispatchEvent(new Event('input'));
    }

    let timeout;
    element.addEventListener('input', () => {
      valuesMap.set(options.id, element.value);
      if (object) {
        object[key] = element.value;
      }

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const urlSearchParams = new URLSearchParams(location.hash.slice(1));
        urlSearchParams.set('gui', JSON.stringify([...valuesMap]));
        location.hash = urlSearchParams.toString();
        if (reload) {
          window.location.reload();
        }
      }, 100);
    });

    return element;
  }
}
