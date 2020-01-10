import InputButtonElement from '../node_modules/@damienmortini/elements/src/input-button/index.js';
import InputCheckboxElement from '../node_modules/@damienmortini/elements/src/input-checkbox/index.js';
import InputPad2DElement from '../node_modules/@damienmortini/elements/src/input-pad2d/index.js';
import InputColorElement from '../node_modules/@damienmortini/elements/src/input-color/index.js';
import InputNumberElement from '../node_modules/@damienmortini/elements/src/input-number/index.js';
import InputRangeElement from '../node_modules/@damienmortini/elements/src/input-range/index.js';
import InputSelectElement from '../node_modules/@damienmortini/elements/src/input-select/index.js';
import InputTextElement from '../node_modules/@damienmortini/elements/src/input-text/index.js';
import InputConnectorLinkableElement from '../node_modules/@damienmortini/elements/src/input-connector-linkable/index.js';
import LinkElement from '../node_modules/@damienmortini/elements/src/link/index.js';
import NodeElement from './node/index.js';
import ViewportElement from '../node_modules/@damienmortini/elements/src/viewport/index.js';
import MenuElement from '../node_modules/@damienmortini/elements/src/menu/index.js';

for (const [name, constructor] of new Map([
  ['graph-input-button', InputButtonElement],
  ['graph-input-checkbox', InputCheckboxElement],
  ['graph-input-pad2d', InputPad2DElement],
  ['graph-input-color', InputColorElement],
  ['graph-input-number', InputNumberElement],
  ['graph-input-range', InputRangeElement],
  ['graph-input-select', InputSelectElement],
  ['graph-input-text', InputTextElement],
  ['graph-input-connector', InputConnectorLinkableElement],
  ['graph-link', LinkElement],
  ['graph-menu', MenuElement],
  ['graph-node', NodeElement],
  ['graph-viewport', ViewportElement],
])) {
  if (!customElements.get(name)) {
    customElements.define(name, constructor);
  }
}

export default class GraphElement extends HTMLElement {
  static get nodeList() {
    return [

    ];
  }
  constructor() {
    super();

    this._keyDownTimeMap = new Map();

    this._opacity = 1;

    if (localStorage.getItem('graph-opacity') !== null) {
      this.opacity = Number(localStorage.getItem('graph-opacity'));
    }
    if (localStorage.getItem('graph-disabled') !== null) {
      this.disabled = localStorage.getItem('graph-disabled') === 'true';
    }

    this._onKeyUpBinded = this._onKeyUp.bind(this);
    this._onKeyDownBinded = this._onKeyDown.bind(this);

    this.attachShadow({ mode: 'open' }).innerHTML = `
      <style>
      
        :host {
          --node-background: white;
          display: block;
        }

        :host([hidden]) {
          visibility: hidden;
        }

        :host([disabled]) {
          pointer-events: none;
        }

        graph-viewport {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 0;
        }

        ::slotted(*) {
          font-family: sans-serif;
          position: absolute;
          background: white;
          border-radius: 4px;
        }

        graph-menu {
          position: absolute;
          background: var(--node-background);
          left: 25%;
          top: 25%;
          width: calc(50%);
          height: calc(50%);
        }

        #menu-overlay {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 1;
          will-change: visibility;
        }

        #menu-overlay[hidden] {
          visibility: hidden;
        }
      </style>
      <div id="menu-overlay" hidden>
        <graph-menu></graph-menu>
      </div>
      <graph-viewport></graph-viewport>
      <slot></slot>
    `;

    this._viewport = this.shadowRoot.querySelector('graph-viewport');
    this._addMenu = this.shadowRoot.querySelector('graph-menu');
    this._menuOverlay = this.shadowRoot.querySelector('#menu-overlay');

    this._addMenu.options = [{
      textContent: 'yes',
      onclick: () => {
        this._addMenu.hidden = true;
        this.insertAdjacentHTML('beforeend', '<graph-node-input-text></graph-node-input-text>');
        this.insertAdjacentHTML('beforeend', '<graph-node-javascript-windowevent></graph-node-javascript-windowevent>');
      }
    },
    {
      textContent: 'coucou',
    },
    {
      textContent: 'coucou2',
    }];

    let currentLink;
    const onLink = (event) => {
      if (currentLink) {
        if (event.detail.input && event.detail.output) {
          currentLink.input = event.detail.input;
          currentLink.output = event.detail.output;
        } else {
          currentLink.remove();
        }
        currentLink = null;
      } else {
        currentLink = document.createElement('graph-link');
        this.prepend(currentLink);
        currentLink.input = event.detail.input;
        currentLink.addEventListener('click', (event) => {
          event.currentTarget.input.outputs.delete(event.currentTarget.output);
          event.currentTarget.remove();
        });
        if (event.detail.output) {
          currentLink.output = event.detail.output;
          currentLink = null;
        }
      }
    };
    this.addEventListener('link', onLink);

    this._slotUID = 0;
    this._slotElementMap = new Map();
    this._elementSlotMap = new Map();

    // Mutation Observer
    const mutationCallback = (mutationsList) => {
      for (const mutation of mutationsList) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) {
            continue;
          }
          node.slot = '';
          const slot = document.createElement('slot');
          slot.name = `graph-editor-slot-${this._slotUID}`;
          node.slot = slot.name;
          this._viewport.appendChild(slot);
          this._slotUID++;
          this._elementSlotMap.set(node, slot);
          this._slotElementMap.set(slot, node);
        }
        for (const node of mutation.removedNodes) {
          if (!(node instanceof HTMLElement)) {
            continue;
          }
          const slot = this._elementSlotMap.get(node);
          this._elementSlotMap.delete(node);
          this._slotElementMap.delete(slot);
          slot.remove();
        }
      }
    };
    mutationCallback([{
      addedNodes: this.children,
      removedNodes: [],
    }]);
    const observer = new MutationObserver(mutationCallback);
    observer.observe(this, { childList: true });
  }

  _updateConnections() {
    const connectors = new Set();
    const findConnectors = (element) => {
      if (element.tagName === 'GRAPH-INPUT-CONNECTOR') {
        connectors.add(element);
      }
      for (const child of element.children) {
        findConnectors(child);
      }
      if (element.shadowRoot) {
        findConnectors(element.shadowRoot);
      }
    }
    findConnectors(this);

    const traverseAndConnect = (element) => {
      if (element instanceof HTMLElement && element.getAttribute('connect')) {
        const connectionPaths = element.getAttribute('connect').split(',');

        for (let connectionPath of connectionPaths) {
          connectionPath = connectionPath.replace(/\s+/g, ' ').trim();
          if (!connectionPath) {
            continue;
          }
          const paths = connectionPath.split(' ');
          const inputPath = paths.length > 1 ? paths[0] : '';
          const outputPath = paths.length > 1 ? paths[1] : paths[0];

          const inputConnectors = new Set();
          const outputConnectors = new Set();

          let input = element;
          for (const id of inputPath.split('/')) {
            if (!id) {
              continue;
            }
            let newInput = input.querySelector(`#${id}`);
            if (!newInput && input.shadowRoot) {
              newInput = input.shadowRoot.querySelector(`#${id}`);
            }
            input = newInput;
          }
          for (const connector of connectors) {
            if (connector.inputs.has(input)) {
              inputConnectors.add(connector);
            }
          }

          let output = this;
          for (const id of outputPath.split('/')) {
            if (!id) {
              continue;
            }
            let newOutput = output.querySelector(`#${id}`);
            if (!newOutput && output.shadowRoot) {
              newOutput = output.shadowRoot.querySelector(`#${id}`);
            }
            output = newOutput;
          }
          for (const connector of connectors) {
            if (connector.outputs.has(output)) {
              outputConnectors.add(connector);
            }
          }

          for (const inputConnector of inputConnectors) {
            for (const outputConnector of outputConnectors) {
              inputConnector.outputs.add(outputConnector);
            }
          }
        }
      }
      for (const child of element.children) {
        traverseAndConnect(child);
      }
      if (element.shadowRoot) {
        traverseAndConnect(element.shadowRoot);
      }
    }
    for (const child of this.children) {
      traverseAndConnect(child);
    }
  }

  _onKeyDown(event) {
    if (this._keyDownTimeMap.get(event.key)) {
      return;
    }

    const target = event.composedPath()[0];
    if (
      target.isContentEditable ||
      target instanceof HTMLInputElement && ['text', 'number', 'password', 'search', 'number', 'range', 'email', 'url', 'tel'].includes(target.type) ||
      target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    this._keyDownTimeMap.set(event.key.toLowerCase(), performance.now());

    if (event.key.toLowerCase() === 'h') {
      this.hidden = !this.hidden;
    } else if (event.key.toLowerCase() === 'd') {
      this.disabled = !this.disabled;
    }
  }

  _onKeyUp(event) {
    const target = event.composedPath()[0];
    if (
      target.isContentEditable ||
      target instanceof HTMLInputElement && ['text', 'number', 'password', 'search', 'number', 'range', 'email', 'url', 'tel'].includes(target.type) ||
      target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    if (event.key === 'Delete') {
      for (const element of this._viewport.selectedElements) {
        this._slotElementMap.get(element).remove();
      }
    } else if (event.key === ' ') {
      this._menuOverlay.hidden = !this._menuOverlay.hidden;
    } else if (event.key.toLowerCase() === 'h' && performance.now() - this._keyDownTimeMap.get(event.key) > 200) {
      this.hidden = !this.hidden;
    } else if (event.key.toLowerCase() === 'd' && performance.now() - this._keyDownTimeMap.get(event.key) > 200) {
      this.disabled = !this.disabled;
    } else if (event.key.toLowerCase() === 'o') {
      let opacity = this.opacity - .25;
      this.opacity = !opacity ? 1 : opacity;
    }
    this._keyDownTimeMap.delete(event.key.toLowerCase());
  }

  get opacity() {
    return this._opacity;
  }

  set opacity(value) {
    this._opacity = value;
    localStorage.setItem('graph-opacity', this._opacity);
    this.style.opacity = this._opacity;
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value) {
    localStorage.setItem('graph-disabled', String(!!value));
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  // add(elementData) {
  //   if (!(elementData instanceof Array)) {
  //     elementData = [elementData];
  //   }

  //   const addElementDataTo = (elementData, container) => {
  //     for (const data of elementData) {
  //       if (typeof data === 'string') {
  //         const element = document.createElement('div');
  //         element.textContent = data;
  //         container.appendChild(element);
  //       } else {
  //         const dataCopy = { ...data };
  //         const element = document.createElement(dataCopy.tagName || 'div');
  //         delete dataCopy.tagName;
  //         if (dataCopy.style) {
  //           for (const [key, value] of Object.entries(dataCopy.style)) {
  //             element.style[key] = value;
  //           }
  //           delete dataCopy.style;
  //         }
  //         if (dataCopy.children) {
  //           addElementDataTo(dataCopy.children, element);
  //           delete dataCopy.children;
  //         }
  //         for (const [key, value] of Object.entries(dataCopy)) {
  //           element[key] = value;
  //         }
  //         container.appendChild(element);
  //       }
  //     }
  //   }

  //   addElementDataTo(elementData, this);
  // }

  connectedCallback() {
    // if (localStorage.getItem("graph-data")) {
    //   this.insertAdjacentHTML('afterbegin', localStorage.getItem("graph-data"));
    // }


    this._updateConnections();

    requestAnimationFrame(() => {
      this._viewport.centerView();
    });

    window.addEventListener('keydown', this._onKeyDownBinded);
    window.addEventListener('keyup', this._onKeyUpBinded);

    window.addEventListener('unload', () => {
      const children = this.querySelectorAll('*');
      for (const child of children) {
        if ('value' in child && child.value !== undefined && !child.disabled) {
          child.setAttribute('value', typeof child.value === 'string' ? child.value : JSON.stringify(child.value));
        }
      }

      for (const child of this.children) {
        const boundingRect = this._viewport.getElementRect(this._elementSlotMap.get(child));
        if (boundingRect.y) {
          child.style.top = `${boundingRect.y}px`;
        }
        if (boundingRect.x) {
          child.style.left = `${boundingRect.x}px`;
        }
        if (boundingRect.width) {
          child.style.width = `${boundingRect.width}px`;
        }
        if (boundingRect.height) {
          child.style.height = `${boundingRect.height}px`;
        }
      }
      // localStorage.setItem("graph-data", this.innerHTML);
    });
  }

  disconnectedCallback() {
    window.removeEventListener('keydown', this._onKeyDownBinded);
    window.removeEventListener('keyup', this._onKeyUpBinded);
  }

  // toJSON() {
  //   const data = [];
  //   for (const child of this._viewport.children) {
  //     if (child.toJSON) {
  //       data.push(child.toJSON())
  //     }
  //   }
  //   return data;
  // }
}
