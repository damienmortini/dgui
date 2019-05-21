import WebSocket from '../node_modules/@damienmortini/lib/utils/WebSocket.js';

export default class GUIDataController {
  constructor(gui) {
    this._gui = gui;

    this._onGUIChangeBinded = this.onGUIChange.bind(this);

    this._gui.addEventListener('change', this._onGUIChangeBinded);

    requestAnimationFrame(() => {
      Object.assign(this._gui, this._getURLGUIData());
    });
  }

  _getURLGUIData() {
    return JSON.parse(new URLSearchParams(location.hash).get('graph'));
  }

  onGUIChange() {
    clearTimeout(this._setTimeout);
    this._setTimeout = setTimeout(() => {
      const urlSearchParams = new URLSearchParams(location.hash);
      urlSearchParams.set('graph', JSON.stringify(this._gui));
      // location.hash = urlSearchParams.toString();
    }, 100);
  }

  get dataFileURL() {
    return this._dataFileURL;
  }

  set dataFileURL(value) {
    this._dataFileURL = value;
    if (this._webSocket) {
      this._webSocket.send(JSON.stringify({
        type: 'datafileurl',
        data: this._dataFileURL,
      }));
    }
    fetch(this._dataFileURL).then((response) => {
      if (response.status !== 404) {
        return response.json();
      }
    }).then((data) => {
      if (this._dataFileURL !== value) {
        return;
      }
      const urlGUIData = this._getURLGUIData();
      Object.assign(this._gui, data);
      Object.assign(this._gui, urlGUIData);
    });
  }

  connect({ url } = {}) {
    this._webSocket = new WebSocket(url);

    if (this.dataFileURL) {
      this._webSocket.send(JSON.stringify({
        type: 'datafileurl',
        data: this.dataFileURL,
      }));
    }

    const sendInputData = (e) => {
      this._webSocket.send(JSON.stringify({
        type: e.type,
        data: Object.assign(this._gui.toJSON(), {
          nodes: {
            [e.target.parentElement.name]: Object.assign(e.target.parentElement.toJSON(), {
              inputs: {
                [e.target.name]: e.target.toJSON(),
              },
            }),
          },
        }),
      }));
    };
    this._webSocket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'change') {
        this._gui.removeEventListener('change', sendInputData);
        Object.assign(this._gui, data.data);
        this._gui.addEventListener('change', sendInputData);
      }
    });
    this._gui.addEventListener('change', sendInputData);
    this._gui.addEventListener('save', sendInputData);
  }
}
