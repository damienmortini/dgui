customElements.define('graph-node-javascript-windowevent', class NodeInputTextElement extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' }).innerHTML = `
      <style>
        :host {
          display: flex;
          background: var(--node-background);
          width: 200px;
          resize: horizontal;
          padding: 20px;
          align-items: center;
        }

        input {
          flex: 1;
          width: 100%;
          height: 100%;
        }
      </style>
      <graph-input-connector id="in"></graph-input-connector><input type="text"><graph-input-connector id="out"></graph-input-connector>
    `;

    this._input = this.shadowRoot.querySelector('input');

    this.id = '';

    this._input.addEventListener('input', (event) => {
      event.stopPropagation();
    });
    this._input.addEventListener('change', (event) => {
      event.stopPropagation();
      this.id = this._input.value;
    });

    this._inputConnectorIn = this.shadowRoot.querySelector('graph-input-connector#in');
    this._inputConnectorIn.addEventListener('input', () => {
      window.dispatchEvent(new CustomEvent(this.value, {
        detail: {
          value: this._inputConnectorIn.value,
        }
      }));
    });

    this._inputConnectorOut = this.shadowRoot.querySelector('graph-input-connector#out');

    if (this.getAttribute('value')) {
      this.value = this.getAttribute('value');
    }
  }

  get value() {
    return this._input.value;
  }

  set value(value) {
    this._input.value = value;
    // window.removeEventListener('')
  }
});
