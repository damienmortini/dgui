/**
 * Connector element used to link input elements together
 * @attribute data-inputs
 * @attribute data-outputs
 * @example <dnod-connector
 *    data-inputs="[document.getElementById('input1'), document.getElementById('input2')]"
 *    data-outputs="[document.getElementById('output1'), document.getElementById('output2')]"
 * ></dnod-connector>
 */
class ConnectorElement extends HTMLElement {
  /**
   * Observed Attributes
   * @private
   * @member {Array.<String>}
   */
  static get observedAttributes() {
    return ["data-inputs", "data-outputs"];
  }

  /**
   * @abstract
   */
  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: inline-block;
          cursor: pointer;
        }
        input {
          cursor: pointer;
          display: inline-block;
          margin: 5px;
        }
      </style>
      <input type="radio" disabled>
      <slot></slot>
    `;

    this._radio = this.shadowRoot.querySelector("input");

    this._onInputChangeBinded = this._onInputChange.bind(this);

    this._inputElementInputs = new Set();
    this._connectorElementInputs = new Set();

    this._inputElementOutputs = new Set();
    this._connectorElementOutputs = new Set();

    const self = this;

    this._inputs = new class extends Set {
      add(value) {
        if (this.has(value)) {
          return this;
        }
        super.add(value);
        if (value instanceof ConnectorElement) {
          self._connectorElementInputs.add(value);
          value.outputs.add(self);
          self._value = value._value;
        } else {
          self._inputElementInputs.add(value);
          self._value = value.value;
          value.addEventListener("input", self._onInputChangeBinded);
        }
        self._updateConnectedStatus();
        return this;
      }
      delete(value) {
        const returnValue = super.delete(value);
        value.removeEventListener("input", self._onInputChangeBinded);
        if (value instanceof ConnectorElement) {
          self._connectorElementInputs.delete(value);
          value.outputs.delete(self);
        } else {
          self._inputElementInputs.delete(value);
        }
        self._updateConnectedStatus();
        return returnValue;
      }
    };

    this._outputs = new class extends Set {
      add(value) {
        if (this.has(value)) {
          return this;
        }
        super.add(value);
        if (value instanceof ConnectorElement) {
          self._connectorElementOutputs.add(value);
          value._value = self._value;
          value.inputs.add(self);
        } else {
          self._inputElementOutputs.add(value);
          if (self._value !== undefined) {
            value.value = self._value;
          }
          value.dispatchEvent(new Event("input", {
            bubbles: true,
          }));
          value.dispatchEvent(new Event("change", {
            bubbles: true,
          }));
        }
        self._updateConnectedStatus();
        return this;
      }
      delete(value) {
        const returnValue = super.delete(value);
        self._connectorElementOutputs.delete(value);
        self._inputElementOutputs.delete(value);
        value.inputs.delete(self);
        self._updateConnectedStatus();
        return returnValue;
      }
    };
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }

    name = name.replace("data-", "");

    const array = new Function(`return ${newValue}`).apply(this);
    for (const value of array) {
      this[name].add(value);
    }
  }

  _onInputChange(event) {
    this._value = event.target.value;
  }

  _updateConnectedStatus() {
    this._connected = !!this._connectorElementInputs.size || !!this._connectorElementOutputs.size;
  }

  /**
   * Value setter
   * @private
   */
  get _value() {
    return this.__value;
  }

  set _value(value) {
    this.__value = value;
    for (const output of this.outputs) {
      if (output instanceof ConnectorElement) {
        output._value = value;
      } else {
        output.value = value;
        output.dispatchEvent(new Event("input", {
          bubbles: true,
        }));
        output.dispatchEvent(new Event("change", {
          bubbles: true,
        }));
      }
    }
  }

  get _connected() {
    return this._radio.checked;
  }

  set _connected(value) {
    this._radio.checked = value;
    for (const output of this._inputElementOutputs) {
      output.disabled = value;
    }
  }

  /**
   * Inputs
   * @member {HTMLInputElement[]}
   */
  get inputs() {
    return this._inputs;
  }

  /**
   * Outputs
   * @member {Array.<(HTMLInputElement|ConnectorElement)>}
   */
  get outputs() {
    return this._outputs;
  }
}

window.customElements.define("dnod-connector", ConnectorElement);

export default ConnectorElement;
