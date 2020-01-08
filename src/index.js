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

import './node-input-text/index.js';

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
    `;

    this._viewport = this.shadowRoot.querySelector('graph-viewport');
    this._addMenu = this.shadowRoot.querySelector('graph-menu');
    this._menuOverlay = this.shadowRoot.querySelector('#menu-overlay');

    this._addMenu.options = [{
      textContent: 'yes',
      onclick: () => {
        this._addMenu.hidden = true;
        this._appendHTML('<graph-node-input-text></graph-node-input-text>');
      }
    },
    {
      textContent: 'coucou',
    },
    {
      textContent: 'coucou2',
    }];

    // this._viewport.preventManipulation = (event) => {
    //   for (const node of event.composedPath()) {
    //     if (!(node instanceof HTMLElement)) {
    //       continue;
    //     }
    //     if (getComputedStyle(node)['touch-action'] === 'none') {
    //       console.log(node);

    //       // return true;
    //     }
    //   }
    //   return false;
    // };

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
        this._viewport.prepend(currentLink);
        currentLink.input = event.composedPath()[0];
        currentLink.addEventListener('click', (event) => {
          event.currentTarget.input.outputs.delete(event.currentTarget.output);
          event.currentTarget.remove();
        });
      }
    };
    this.addEventListener('linkstart', onLink);
    this.addEventListener('linkend', onLink);
  }

  _onKeyDown(event) {
    if (this._keyDownTimeMap.get(event.key)) {
      return;
    }

    this._keyDownTimeMap.set(event.key, performance.now());
    switch (event.key) {
      case 'h':
        this.hidden = !this.hidden;
        break;
      case 'd':
        this.disabled = !this.disabled;
        break;
    }
  }

  _onKeyUp(event) {
    switch (event.key) {
      case 'Delete':
        for (const element of this._viewport.selectedElements) {
          element.remove();
        }
        break;
      case ' ':
        this._menuOverlay.hidden = !this._menuOverlay.hidden;
        //   this._appendHTML(`
        //   <graph-node name="Test" style="width:300px;">
        //   <graph-input-button name="Button" onclick="this.value = Math.random()">Click here</graph-input-button>
        //   <graph-input-checkbox name="Checkbox"></graph-input-checkbox>
        //   <graph-input-color name="Color"></graph-input-color>
        //   <graph-input-number name="Number"></graph-input-number>
        //   <graph-input-range name="Range"></graph-input-range>
        //   <graph-input-select name="Select" options="[1, 2, 3]" value="2"></graph-input-select>
        //   <graph-input-text name="Text"></graph-input-text>
        // </graph-node>`);
        break;
      case 'h':
        if (performance.now() - this._keyDownTimeMap.get(event.key) > 200) {
          this.hidden = !this.hidden;
        };
        break;
      case 'd':
        if (performance.now() - this._keyDownTimeMap.get(event.key) > 200) {
          this.disabled = !this.disabled;
        };
        break;
      case 'o':
        let opacity = this.opacity - .25;
        this.opacity = !opacity ? 1 : opacity;
        break;
    }
    this._keyDownTimeMap.delete(event.key);
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

  _appendHTML(html) {
    this._viewport.insertAdjacentHTML('beforeend', html);
  }

  add(elementData) {
    if (!(elementData instanceof Array)) {
      elementData = [elementData];
    }

    const addElementDataTo = (elementData, container) => {
      for (const data of elementData) {
        if (typeof data === 'string') {
          const element = document.createElement('div');
          element.textContent = data;
          container.appendChild(element);
        } else {
          const dataCopy = { ...data };
          const element = document.createElement(dataCopy.tagName || 'div');
          if (container === this._viewport) {
            element.style.position = 'absolute';
          }
          delete dataCopy.tagName;
          if (dataCopy.style) {
            for (const [key, value] of Object.entries(dataCopy.style)) {
              element.style[key] = value;
            }
            delete dataCopy.style;
          }
          if (dataCopy.children) {
            addElementDataTo(dataCopy.children, element);
            delete dataCopy.children;
          }
          for (const [key, value] of Object.entries(dataCopy)) {
            element[key] = value;
          }
          container.appendChild(element);
        }
      }
    }

    addElementDataTo(elementData, this._viewport);
  }

  connectedCallback() {
    if (localStorage.getItem("graph-data")) {
      this._appendHTML(localStorage.getItem("graph-data"));
    }

    requestAnimationFrame(() => {
      this._viewport.centerView();
    });

    window.addEventListener('keydown', this._onKeyDownBinded);
    window.addEventListener('keyup', this._onKeyUpBinded);
    // window.addEventListener('click', () => {
    //   console.log(this.toJSON());
    // });
    window.addEventListener('unload', () => {
      const children = this._viewport.querySelectorAll('*');
      for (const child of children) {
        if ('value' in child && child.value !== undefined && !child.disabled) {
          child.setAttribute('value', typeof child.value === 'string' ? child.value : JSON.stringify(child.value));
        }
      }

      for (const child of this._viewport.children) {
        const boundingRect = this._viewport.getElementBoundingRect(child);
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
      localStorage.setItem("graph-data", this._viewport.innerHTML);
    });
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
