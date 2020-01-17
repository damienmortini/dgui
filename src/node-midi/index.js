customElements.define('node-midi', class NodeMidi extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' }).innerHTML = `
      <graph-node name="Midi Controller">
        <graph-input-range name="Input"></graph-input-range>
      </graph-node>
    `;
  }
});
