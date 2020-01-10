customElements.define('graph-node-input-text', class NodeInputTextElement extends HTMLElement {
  static get observedAttributes() {
    return ['disabled'];
  }

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

        input  {
          width: 100%;
        }
      </style>
      <graph-input-connector id="input"></graph-input-connector>
      <graph-input-text></graph-input-text>
      <graph-input-connector id="output"></graph-input-connector>
    `;

    this._inputText = this.shadowRoot.querySelector('graph-input-text');

    this._inputText.addEventListener('input', (event) => {
      this.dispatchEvent(new event.constructor(event.type, event));
    });

    this.shadowRoot.querySelector('#input').outputs.add(this);
    this.shadowRoot.querySelector('#output').inputs.add(this);

    if (this.getAttribute('value')) {
      this.value = this.getAttribute('value');
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'disabled':
        this._inputText.disabled = this.disabled;
        break;
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value) {
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  get value() {
    return this._inputText.value;
  }

  set value(value) {
    this._inputText.value = value;
  }
});
