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

    this._input.addEventListener('input', (event) => {
      event.stopPropagation();
    });
    this._input.addEventListener('change', (event) => {
      event.stopPropagation();
      // this.id = this._input.value;
    });

    this._inputConnectorIn = this.shadowRoot.querySelector('graph-input-connector#in');
    // this._inputConnectorIn.addEventListener('input', () => {
    //   window.dispatchEvent(new CustomEvent(this.eventType, {
    //     detail: {
    //       value: this._inputConnectorIn.value,
    //     }
    //   }));
    // });
    this._inputConnectorIn.outputs.add(this);

    this._inputConnectorOut = this.shadowRoot.querySelector('graph-input-connector#out');
    this._inputConnectorOut.inputs.add(this);

    if (this.getAttribute('event')) {
      this.eventType = this.getAttribute('event');
    }

    if (this.getAttribute('value')) {
      this.value = this.getAttribute('value');
    }

    window.addEventListener('load', () => {
      window.dispatchEvent(new CustomEvent(this.eventType, {
        detail: {
          value: this._inputConnectorIn.value,
        }
      }));
    }, { once: true })
  }

  get eventType() {
    return this._input.value;
  }

  set eventType(value) {
    this._input.value = value;
  }

  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value;
    window.dispatchEvent(new CustomEvent(this.eventType, {
      detail: {
        value: this._inputConnectorIn.value,
      }
    }));
  }
});
