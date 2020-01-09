customElements.define('graph-node-input-text', class NodeInputTextElement extends HTMLElement {
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
      <graph-input-connector id="text-in"></graph-input-connector>
      <graph-input-text></graph-input-text>
      <graph-input-connector id="text-out" outputs="in"></graph-input-connector>
    `;

    this._inputText = this.shadowRoot.querySelector('graph-input-text');

    if (this.getAttribute('value')) {
      this.value = this.getAttribute('value');
    }
  }

  get value() {
    return this._inputText.value;
  }

  set value(value) {
    this._inputText.value = value;
  }
});
