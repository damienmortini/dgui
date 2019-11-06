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

    this.attachShadow({ mode: 'open' }).innerHTML = `
      <style>
        :host {
          display: block;
          font-family: sans-serif;
        }

        graph-viewport {
          position: absolute;
          width: 100%;
          height: 100%;
        }
      </style>
      <graph-viewport>
        <slot></slot>
      </graph-viewport>
    `;

    this.shadowRoot.querySelector('graph-viewport').childrenDragAndDropExceptions.push((nodes) => {
      for (const node of nodes) {
        if ((node.nodeName === 'NODE-CONNECTOR-INPUT' || node.nodeName === 'INPUT' || node.nodeName === 'BUTTON' || node.nodeName === 'TEXTAREA') && !node.disabled) {
          return true;
        }
      }
      return false;
    });

    const currentViewport = this.shadowRoot.querySelector('graph-viewport');
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
        currentViewport.prepend(currentLink);
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
}
