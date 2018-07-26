import "../misc/DraggableElement.js";
import "../misc/ZoomableElement.js";

export default class GUIBoardElement extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: block;
          height: 100%;
        }
        
        dgui-zoomable, dgui-draggable {
          position: absolute;
          left: 0;
          top: 0;
          will-change: transform;
        }

        dgui-draggable:hover {
          outline: none;
        }
        
        dgui-zoomable {
          width: 100%;
          height: 100%;
        }
      </style>
      <dgui-zoomable>
        <dgui-draggable draggable="true" data-deep-drag-factor="true" data-handle="this.getRootNode().host">
          <slot></slot>
        </dgui-draggable>
      </dgui-zoomable>
    `;

    const zoomable = this.shadowRoot.querySelector("dgui-zoomable");
    const draggable = this.shadowRoot.querySelector("dgui-draggable");

    zoomable.addEventListener("zoom", () => {
      draggable.dragFactor = 1 / zoomable.zoom;
    });
  }
}

window.customElements.define("dgui-board", GUIBoardElement);
