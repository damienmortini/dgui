import InputButtonElement from '../node_modules/@damienmortini/elements/src/input-button/index.js';
import InputCheckboxElement from '../node_modules/@damienmortini/elements/src/input-checkbox/index.js';
import InputPad2DElement from '../node_modules/@damienmortini/elements/src/input-pad2d/index.js';
import InputColorElement from '../node_modules/@damienmortini/elements/src/input-color/index.js';
import InputNumberElement from '../node_modules/@damienmortini/elements/src/input-number/index.js';
import InputRangeElement from '../node_modules/@damienmortini/elements/src/input-range/index.js';
import InputSelectElement from '../node_modules/@damienmortini/elements/src/input-select/index.js';
import InputTextElement from '../node_modules/@damienmortini/elements/src/input-text/index.js';
import LinkElement from '../node_modules/@damienmortini/elements/src/link/index.js';
import NodeElement from '../node_modules/@damienmortini/elements/src/node/index.js';
import ViewportElement from '../node_modules/@damienmortini/elements/src/viewport/index.js';

for (const [name, constructor] of new Map([
  ['graph-input-button', InputButtonElement],
  ['graph-input-checkbox', InputCheckboxElement],
  ['graph-input-pad2d', InputPad2DElement],
  ['graph-input-color', InputColorElement],
  ['graph-input-number', InputNumberElement],
  ['graph-input-range', InputRangeElement],
  ['graph-input-select', InputSelectElement],
  ['graph-input-text', InputTextElement],
  ['graph-link', LinkElement],
  ['graph-node', NodeElement],
  ['graph-viewport', ViewportElement],
])) {
  if (!customElements.get(name)) {
    customElements.define(name, constructor);
  }
}

export default class GraphElement extends HTMLElement {
  constructor() {
    super();

    this._keyDownTimeMap = new Map();

    this._opacity = 1;

    if (localStorage.getItem('opacity') !== null) {
      this.opacity = Number(localStorage.getItem('opacity'));
    }
    if (localStorage.getItem('disabled') !== null) {
      this.disabled = localStorage.getItem('disabled') === 'true';
    }

    this._onKeyUpBinded = this._onKeyUp.bind(this);
    this._onKeyDownBinded = this._onKeyDown.bind(this);

    this.attachShadow({ mode: 'open' }).innerHTML = `
      <style>
        :host {
          display: block;
        }

        :host([hidden]) {
          visibility: hidden;
        }

        :host([disabled]) {
          pointer-events: none;
        }

        graph-node {
          border: solid 1px rgba(0, 0, 0, .1);
          background: rgba(255, 255, 255, .9);
          resize: horizontal;
          box-sizing: border-box; 
        }

        graph-viewport {
          position: absolute;
          width: 100%;
          height: 100%;
        }
      </style>
      <graph-viewport></graph-viewport>
    `;

    this._currentViewport = this.shadowRoot.querySelector('graph-viewport');

    this._currentViewport.preventManipulation = (event) => {
      for (const node of event.composedPath()) {
        if ('value' in node && !node.disabled) {
          return true;
        }
      }
      return false;
    };

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
        this._currentViewport.prepend(currentLink);
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
        for (const element of this._currentViewport.selectedElements) {
          element.remove();
        }
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
    localStorage.setItem('opacity', this._opacity);
    this.style.opacity = this._opacity;
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value) {
    localStorage.setItem('disabled', String(!!value));
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  connectedCallback() {
    this._currentViewport.innerHTML = localStorage.getItem("state") || `
      <div style="width: 300px; height: 300px; background: red; resize: both;">
        <div style="width: 200px; height: 100px; background: green; overflow: auto;">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tenetur atque, quibusdam ducimus sapiente, impedit illo sint voluptatem eligendi pariatur sed suscipit accusamus voluptatibus qui? Reprehenderit veritatis natus nulla. Beatae, molestias.
        </div>
      </div>

      <graph-node name="Test" style="width:300px;">
        <graph-input-button name="Button" onclick="this.value = Math.random()">Click here</graph-input-button>
        <graph-input-checkbox name="Checkbox"></graph-input-checkbox>
        <graph-input-color name="Color"></graph-input-color>
        <graph-input-number name="Number"></graph-input-number>
        <graph-input-range name="Range"></graph-input-range>
        <graph-input-select name="Select" options="[1, 2, 3]" value="2"></graph-input-select>
        <graph-input-text name="Text"></graph-input-text>
      </graph-node>

      <!-- <graph-node name="Input node" style="left:100px; top:100px; width:200px">
        <input type="text" name="input" style="width: 100%; box-sizing: border-box;">
      </graph-node>
      <graph-node name="Input node" style="left:200px; top:200px; width:200px">
        <input type="text" name="input" style="width: 100%; box-sizing: border-box;">
      </graph-node>
      <graph-node name="Input node" style="left:300px; top:300px; width:200px">
        <input type="text" name="input" style="width: 100%; box-sizing: border-box;">
      </graph-node> -->

      <graph-node name="Output node"
        oninput="this.querySelector('#result').value = this.querySelector('#source').value + ' World!'"
        style="transform: translate(350px, 200px); width:250px">
        <input type="text" id="source" name="output" style="width: 100%; box-sizing: border-box;">
        <input type="text" id="result" disabled style="width: 100%; box-sizing: border-box;">
      </graph-node>

      <graph-node name="Input node" style="transform: translate(500px, 50px); width:250px">
        <input type="text" name="input" style="width: 100%; box-sizing: border-box;">
      </graph-node>

      <graph-node name="Third node" style="transform: translate(100px, 400px); width:250px">
        <input type="text" style="width: 100%; box-sizing: border-box;">
      </graph-node>

      <graph-node name="Fourth node"
        oninput="this.querySelector('#tata').value = this.querySelector('#toto').value + '_yoyo'"
        style="transform: translate(200px, 500px); width:250px">
        <input type="text" id="toto" style="width: 100%; box-sizing: border-box;">
        <input type="text" id="tata" disabled style="width: 100%; box-sizing: border-box;">
      </graph-node>
    `;

    requestAnimationFrame(() => {
      this._currentViewport.centerView();
    });

    window.addEventListener('keydown', this._onKeyDownBinded);
    window.addEventListener('keyup', this._onKeyUpBinded);
    window.addEventListener('unload', () => {
      for (const child of this._currentViewport.children) {
        const boundingRect = this._currentViewport.getElementBoundingRect(child);
        child.style.transform = `translate(${boundingRect.x}px, ${boundingRect.y}px)`;
        if (boundingRect.width) {
          child.style.width = `${boundingRect.width}px`;
        }
        if (boundingRect.height) {
          child.style.height = `${boundingRect.height}px`;
        }
      }
      localStorage.setItem("state", this._currentViewport.innerHTML);
    });
  }
}
