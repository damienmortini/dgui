import './input/GUIInputElement.js';
import './input/GUINumberInputElement.js';
import './input/GUITextInputElement.js';
import './input/GUIRangeInputElement.js';
import './input/GUICheckboxInputElement.js';
import './input/GUIButtonInputElement.js';
import './input/GUIColorInputElement.js';
import './input/GUISelectInputElement.js';

export default class GUINodeInputElement extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' }).innerHTML = `
      <style>
        :host {
          display: block; 
        }
      </style>
      <slot></slot>
    `;
  }

  toJSON() {
    return {
      name: this.name,
      label: this.label,
      inputs: this.inputs,
    };
  }
}

window.customElements.define('dgui-nodeinput', GUINodeInputElement);
