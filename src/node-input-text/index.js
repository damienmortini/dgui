customElements.define('graph-node-input-text', class NodeInputTextElement extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' }).innerHTML = `
      <style>
        :host {
          display: block;
          background: var(--node-background);
          width: 100px;
          resize: horizontal;
        }

        graph-node {
          width: 100%;
          height: 100%;
        }

        graph-input-text {
          width: 100%;
          height: 100%;
        }
      </style>
      <graph-node name="Text Value">
        <graph-input-text></graph-input-text>
      </graph-node>
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
