customElements.define('graph-node-midi', class NodeMidi extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' }).innerHTML = `
      <graph-node name="Midi Controller">
        <graph-input-range name="Input"></graph-input-range>
      </graph-node>
    `;

    console.log(navigator.requestMIDIAccess);

    navigator.requestMIDIAccess()
      .then(function (access) {
        const inputs = access.inputs.values();

        for (const input of inputs) {
          console.log(input);
          input.addEventListener('midimessage', (event) => {
            console.log(event.data);
          })
        }

        access.onstatechange = function (e) {
          // Print information about the (dis)connected MIDI controller
          console.log(e.port.name, e.port.manufacturer, e.port.state);
        };
      });
  }
});
