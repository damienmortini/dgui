class NodeElement extends HTMLElement {
  static get observedAttributes() {
    return ["name", "enabled", "draggable", "x", "y", "width", "height"];
  }

  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: block;
          overflow: auto;
          resize: both;
        }
        
        :host([draggable]) {
          border: 1px dotted;
          position: absolute;
          background: rgba(255, 255, 255, .9);
        }

        :host([draggable]:hover) {
          border: 1px dashed;
        }

        :host([draggable]:focus-within) {
          border: 1px solid;
          z-index: 1;
        }

        details, slot {
          padding: 5px;
        }

        details summary {
          position: relative;
          padding: 5px;
          outline: none;
        }

        dgui-draggable {
          display: contents;
        }
      </style>
      <dgui-draggable draggable="false" data-target="this.getRootNode().host">
        <slot name="content">
          <details>
            <summary></summary>
            <slot></slot>
          </details>
        </slot>
      </dgui-draggable>
    `;

    this._details = this.shadowRoot.querySelector("details");

    this.open = true;
  }

  connectedCallback() {
    this.draggable = true;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }
    switch (name) {
      case "disabled":
        this.enabled = this[name] = newValue !== null;
        break;
      case "draggable":
        this.shadowRoot.querySelector("dgui-draggable").setAttribute(name, newValue);
        break;
      default:
        this[name] = newValue;
        break;
    }
  }

  set name(value) {
    this._name = value;
    this._details.querySelector("summary").textContent = this._name;
  }

  get name() {
    return this._name;
  }

  set open(value) {
    this._details.open = value;
  }

  get open() {
    return this._details.open;
  }

  get x() {
    return this._x;
  }

  set x(value) {
    this._x = parseFloat(value);
    this._updateBoundingRect();
  }

  get y() {
    return this._y;
  }

  set y(value) {
    this._y = parseFloat(value);
    this._updateBoundingRect();
  }

  get width() {
    return this._width;
  }

  set width(value) {
    this._width = parseFloat(value);
    this._updateBoundingRect();
  }

  get height() {
    return this._height;
  }

  set height(value) {
    this._height = parseFloat(value);
    this._updateBoundingRect();
  }

  _updateBoundingRect() {
    this.style.left = `${this.x}px`;
    this.style.top = `${this.y}px`;
    this.style.width = `${this.width}px`;
    this.style.height = `${this.height}px`;
  }

  toJSON() {
    return {
      name: this.name,
    };
  }
}

window.customElements.define("dgui-node", NodeElement);

var GUIConfig = {
    inputTypeMap: {
        "button": "dgui-node-input-button",
        "checkbox": "dgui-node-input-checkbox",
        "color": "dgui-node-input-color",
        "number": "dgui-node-input-number",
        "range": "dgui-node-input-range",
        "select": "dgui-node-input-select",
        "text": "dgui-node-input-text",
    },
    typeResolvers: {
        "text": (attributes) => typeof attributes.value === "string",
        "range": (attributes) => typeof attributes.value === "number",
        "checkbox": (attributes) => typeof attributes.value === "boolean",
        "button": (attributes) => typeof attributes.value === "function",
        "color": (attributes) => {
            return typeof attributes.value === "string" && ((attributes.value.length === 7 && attributes.value.startsWith("#")) || attributes.value.startsWith("rgb") || attributes.value.startsWith("hsl")) || (typeof attributes.value === "object" && attributes.value.r !== undefined && attributes.value.g !== undefined && attributes.value.b !== undefined);
        },
        "select": (attributes) => !!attributes.options,
    },
};

let draggedElement;

class DraggableElement extends HTMLElement {
  static get observedAttributes() {
    return ["draggable", "data-target", "data-handle", "data-deep-drag-factor"];
  }

  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: inline-block;
          position: relative;
          width: 20px;
          height: 20px;
        }
        
        :host(:hover) {
          outline: 1px dotted;
        }

        :host(:active) {
          cursor: grabbing;
          cursor: -webkit-grabbing;
        }
        
        slot {
          display: block;
          cursor: grab;
          cursor: -webkit-grab;
          width: 100%;
          height: 100%;
        }

        slot svg {
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
      </style>
      <slot><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path d='M7 4a1 1 0 1 1-1-1 1 1 0 0 1 1 1zm3 1a1 1 0 1 0-1-1 1 1 0 0 0 1 1zM6 7a1 1 0 1 0 1 1 1 1 0 0 0-1-1zm4 0a1 1 0 1 0 1 1 1 1 0 0 0-1-1zm-4 4a1 1 0 1 0 1 1 1 1 0 0 0-1-1zm4 0a1 1 0 1 0 1 1 1 1 0 0 0-1-1z'/></svg></slot>
    `;

    this.dragFactor = 1;

    this.deepDragFactor = false;

    this._currentDragFactor = 0;

    this._draggable = true;

    this._handle = this;
    this._target = this;

    this._offsetX = 0;
    this._offsetY = 0;

    this._dragStartX = 0;
    this._dragStartY = 0;

    this._preventDefaultBinded = this._preventDefault.bind(this);
    this._onPointerDownBinded = this._onPointerDown.bind(this);
    this._onPointerMoveBinded = this._onPointerMove.bind(this);
    this._onPointerUpBinded = this._onPointerUp.bind(this);
  }

  connectedCallback() {
    this.draggable = this.draggable;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }
    switch (name) {
      case "draggable":
        this.draggable = newValue === "true";
        break;
      case "data-target":
        this.target = eval(newValue);
        break;
      case "data-handle":
        this.handle = eval(newValue);
        break;
      case "data-deep-drag-factor":
        this.deepDragFactor = newValue === "true";
        break;
    }
  }

  get target() {
    return this._target;
  }

  set target(value) {
    this._target = value;
    this.draggable = this.draggable;
  }

  get handle() {
    return this._handle;
  }

  set handle(value) {
    this.handle.removeEventListener("pointerdown", this._onPointerDownBinded);
    this._handle = value;
    this.draggable = this.draggable;
  }

  get draggable() {
    return this._draggable;
  }

  set draggable(value) {
    this._draggable = value;

    super.draggable = value;

    this.handle.removeEventListener("pointerdown", this._onPointerDownBinded);

    if (!this.target) {
      return;
    }

    this.target.removeEventListener("dragstart", this._preventDefaultBinded);

    if (this.draggable) {
      this.handle.addEventListener("pointerdown", this._onPointerDownBinded);
      this.target.addEventListener("dragstart", this._preventDefaultBinded);
    }
  }

  _preventDefault(event) {
    event.preventDefault();
  }

  _onPointerDown(event) {
    if (draggedElement || event.button !== 0 || event.path[0].tagName === "INPUT" || event.path[0].getAttribute("draggable") === "false") {
      return;
    }

    this._currentDragFactor = this.dragFactor;

    for (const element of event.path) {
      if (element instanceof DraggableElement && element.deepDragFactor) {
        this._currentDragFactor *= element.dragFactor;
      }
    }

    draggedElement = this;

    this._dragStartX = event.clientX * this._currentDragFactor;
    this._dragStartY = event.clientY * this._currentDragFactor;
    this._offsetX = this._target.offsetLeft;
    this._offsetY = this._target.offsetTop;

    this._target.style.willChange = "transform";
    window.addEventListener("pointermove", this._onPointerMoveBinded, { passive: false });
    window.addEventListener("pointerup", this._onPointerUpBinded);
    window.addEventListener("touchmove", this._preventDefaultBinded, { passive: false });
  }

  _onPointerMove(event) {
    this.target.style.transform = `translate(${event.clientX * this._currentDragFactor - this._dragStartX}px, ${event.clientY * this._currentDragFactor - this._dragStartY}px)`;
  }

  _onPointerUp(event) {
    this._target.style.willChange = "";
    window.removeEventListener("pointermove", this._onPointerMoveBinded);
    window.removeEventListener("pointerup", this._onPointerUpBinded);
    window.removeEventListener("touchmove", this._preventDefaultBinded);
    this._target.style.left = `${this._offsetX + event.clientX * this._currentDragFactor - this._dragStartX}px`;
    this._target.style.top = `${this._offsetY + event.clientY * this._currentDragFactor - this._dragStartY}px`;
    this.target.style.transform = "";

    draggedElement = null;
  }
}

window.customElements.define("dgui-draggable", DraggableElement);

class ZoomableElement extends HTMLElement {
  static get observedAttributes() {
    return ["data-listener", "min", "max", "zoom"];
  }

  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: inline-block;
          position: relative;
          width: 20px;
          height: 20px;
        }
        
        slot {
          display: block;
          width: 100%;
          height: 100%;
        }

        slot svg {
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
      </style>
      <slot></slot>
    `;

    this._min = 0;
    this._max = Infinity;
    this._zoom = 1;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }
    switch (name) {
      case "data-listener":
        this.listener = new Function(`return ${newValue}`).apply(this);
        break;
      default:
        this[name] = parseFloat(newValue);
        break;
    }
  }

  connectedCallback() {
    this.listener = this.listener || this;
  }

  disconnectedCallback() {
    this.removeEventListener("wheel", this._onWheelBinded);
  }

  _onWheel(event) {
    this.style.transformOrigin = "50% 50%";
    this.zoom += event.wheelDeltaY * .0004;
  }

  get listener() {
    return this._listener;
  }

  set listener(value) {
    if (this._listener) {
      this._listener.removeEventListener("wheel", this._onWheelBinded);
    }
    this._listener = value;
    this._listener.addEventListener("wheel", this._onWheelBinded = this._onWheelBinded || this._onWheel.bind(this));
  }

  get zoom() {
    return this._zoom;
  }

  set zoom(value) {

    if (value === this._zoom) {
      return;
    }

    this._zoom = value;

    this._zoom = Math.min(this.max, Math.max(this.min, this._zoom));

    this.style.transform = `scale(${this._zoom})`;

    this.dispatchEvent(new Event("zoom"));
  }

  get min() {
    return this._min;
  }

  set min(value) {
    this._min = value;
    this.zoom = this.zoom;
  }

  get max() {
    return this._max;
  }

  set max(value) {
    this._max = value;
    this.zoom = this.zoom;
  }
}

window.customElements.define("dgui-zoomable", ZoomableElement);

class NodeEditor extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: block;
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
      <dgui-node-link-system data-listener="this.getRootNode().host"></dgui-node-link-system>
      <dgui-zoomable data-listener="this.getRootNode().host" min=".1" max="3">
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

    this._nodesDataMap = new Map();
  }

  get nodesData() {
    return JSON.parse(JSON.stringify([...this._nodesDataMap.values()]));
  }

  set nodesData(value) {
    this.innerHTML = "";
    for (let node of value) {
      if (!node.type) {
        for (const typeResolverKey in GUIConfig.typeResolvers) {
          node.type = GUIConfig.typeResolvers[typeResolverKey](node) ? typeResolverKey : node.type;
        }
      }

      if (!node.type && node.nodes) {
        node.type = "dgui-node-group";
      }

      let nodeElement = this._nodesDataMap.get(node.name) || document.createElement(GUIConfig.inputTypeMap[node.type] || node.type);
      this._nodesDataMap.set(node.name, nodeElement);
      Object.assign(nodeElement, node);
      this.appendChild(nodeElement);
    }
  }
}

window.customElements.define("dgui-node-editor", NodeEditor);

class Signal extends Set {
  constructor() {
    super();

    this._onceCallbacksMap = new Map();
  }

  add(value, {once = false} = {}) {
    if(once) {
      const onceCallbackWrapper = () => {
        value(...arguments);
        this.delete(value);
      };
      this._onceCallbacksMap.set(value, onceCallbackWrapper);
      super.add(onceCallbackWrapper);
    } else {
      super.add(value);
    }
  }

  delete(value) {
    super.delete(this._onceCallbacksMap.get(value) || value);
    this._onceCallbacksMap.delete(value);
  }

  dispatch(value) {
    for (let callback of this) {
      callback(value);
    }
  }
}

class Ticker extends Signal {
  constructor() {
    super();
    
    this._updateBinded = this._update.bind(this);

    this.time = window.performance.now() * .001;
    this._previousTime = this.time;
    this.deltaTime = 0;
    this.timeScale = 1;

    this._update();
  }

  _update() {
    requestAnimationFrame(this._updateBinded);

    this.time = window.performance.now() * 0.001;
    this.deltaTime = this.time - this._previousTime;
    this.timeScale = this.deltaTime / .0166666667;
    this._previousTime = this.time;

    this.dispatch();
  }
}

var Ticker$1 = new Ticker();

/**
 * Common utilities
 * @module glMatrix
 */
let ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array;

const degree = Math.PI / 180;

/**
 * 2 Dimensional Vector
 * @module vec2
 */

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */
function create() {
  let out = new ARRAY_TYPE(2);
  out[0] = 0;
  out[1] = 0;
  return out;
}

/**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the source vector
 * @returns {vec2} out
 */
function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  return out;
}

/**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */
function set(out, x, y) {
  out[0] = x;
  out[1] = y;
  return out;
}

/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  return out;
}

/**
 * Subtracts vector b from vector a
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  return out;
}

/**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec2} out
 */
function scale(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  return out;
}

/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} distance between a and b
 */
function distance(a, b) {
  var x = b[0] - a[0],
    y = b[1] - a[1];
  return Math.sqrt(x*x + y*y);
}

/**
 * Calculates the length of a vec2
 *
 * @param {vec2} a vector to calculate length of
 * @returns {Number} length of a
 */
function length(a) {
  var x = a[0],
    y = a[1];
  return Math.sqrt(x*x + y*y);
}

/**
 * Calculates the squared length of a vec2
 *
 * @param {vec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
function squaredLength (a) {
  var x = a[0],
    y = a[1];
  return x*x + y*y;
}

/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to negate
 * @returns {vec2} out
 */
function negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  return out;
}

/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to normalize
 * @returns {vec2} out
 */
function normalize(out, a) {
  var x = a[0],
    y = a[1];
  var len = x*x + y*y;
  if (len > 0) {
    //TODO: evaluate use of glm_invsqrt here?
    len = 1 / Math.sqrt(len);
    out[0] = a[0] * len;
    out[1] = a[1] * len;
  }
  return out;
}

/**
 * Calculates the dot product of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} dot product of a and b
 */
function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}

/**
 * Computes the cross product of two vec2's
 * Note that the cross product must by definition produce a 3D vector
 *
 * @param {vec3} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec3} out
 */
function cross(out, a, b) {
  var z = a[0] * b[1] - a[1] * b[0];
  out[0] = out[1] = 0;
  out[2] = z;
  return out;
}

/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec2} out
 */
function lerp(out, a, b, t) {
  var ax = a[0],
    ay = a[1];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  return out;
}

/**
 * Transforms the vec2 with a mat3
 * 3rd vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat3} m matrix to transform with
 * @returns {vec2} out
 */
function transformMat3(out, a, m) {
  var x = a[0],
    y = a[1];
  out[0] = m[0] * x + m[3] * y + m[6];
  out[1] = m[1] * x + m[4] * y + m[7];
  return out;
}

/**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec2} out
 */
function transformMat4(out, a, m) {
  let x = a[0];
  let y = a[1];
  out[0] = m[0] * x + m[4] * y + m[12];
  out[1] = m[1] * x + m[5] * y + m[13];
  return out;
}

/**
 * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
 *
 * @param {vec2} a The first vector.
 * @param {vec2} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
const forEach = (function() {
  let vec = create();

  return function(a, stride, offset, count, fn, arg) {
    let i, l;
    if(!stride) {
      stride = 2;
    }

    if(!offset) {
      offset = 0;
    }

    if(count) {
      l = Math.min((count * stride) + offset, a.length);
    } else {
      l = a.length;
    }

    for(i = offset; i < l; i += stride) {
      vec[0] = a[i]; vec[1] = a[i+1];
      fn(vec, vec, arg);
      a[i] = vec[0]; a[i+1] = vec[1];
    }

    return a;
  };
})();

class Vector2 extends Float32Array {
  static distance(vector2a, vector2b) {
    return distance(vector2a, vector2b);
  }

  constructor(array = [0, 0]) {
    super(array);
    return this;
  }

  get x() {
    return this[0];
  }

  set x(value) {
    this[0] = value;
  }

  get y() {
    return this[1];
  }

  set y(value) {
    this[1] = value;
  }

  set(x, y) {
    set(this, x, y);
    return this;
  }

  copy(vector2) {
    copy(this, vector2);
    return this;
  }

  add(vector2) {
    add(this, this, vector2);
    return this;
  }

  get size() {
    return length(this);
  }

  get squaredSize() {
    return squaredLength(this);
  }

  subtract(vector2) {
    subtract(this, this, vector2);
    return this;
  }

  negate(vector2 = this) {
    negate(this, vector2);
    return this;
  }

  cross(vector2a, vector2b) {
    cross(this, vector2a, vector2b);
    return this;
  }

  scale(value) {
    scale(this, this, value);
    return this;
  }

  normalize() {
    normalize(this, this);
  }

  dot(vector2) {
    return dot(this, vector2);
  }

  distance(vector2) {
    return Vector2.distance(this, vector2);
  }

  equals(vector2) {
    return exactEquals(this, vector2);
  }

  applyMatrix3(matrix3) {
    transformMat3(this, this, matrix3);
    return this;
  }

  applyMatrix4(matrix4) {
    transformMat4(this, this, matrix4);
    return this;
  }

  lerp(vector2, value) {
    lerp(this, this, vector2, value);
  }

  clone() {
    return new Vector2(this);
  }
}

let pointers = new Map();

class Pointer extends Vector2 {
  static get TOUCH_TYPE() {
    return "touchtype";
  }

  static get MOUSE_TYPE() {
    return "mousetype";
  }

  static get(domElement = document.body) {
    let pointer = pointers.get(domElement);
    if (!pointer) {
      pointer = new Pointer(domElement);
    }
    return pointer;
  }

  get downed() {
    return this._downed;
  }

  constructor(domElement = document.body) {
    super();

    this.domElement = domElement;

    this.type = Pointer.TOUCH_TYPE;

    this.velocity = new Vector2();
    this.dragOffset = new Vector2();

    this.centered = new Vector2();
    this.centeredFlippedY = new Vector2();
    this.normalized = new Vector2();
    this.normalizedFlippedY = new Vector2();
    this.normalizedCentered = new Vector2();
    this.normalizedCenteredFlippedY = new Vector2();

    this._downed = false;

    pointers.set(this.domElement, this);

    this.onDown = new Signal();
    this.onMove = new Signal();
    this.onUp = new Signal();
    this.onClick = new Signal();
    this.onTypeChange = new Signal();

    this._preventMouseTypeChange = false;

    this._onPointerMoveBinded = this._onPointerMove.bind(this);
    this._onPointerDownBinded = this._onPointerDown.bind(this);
    this._onPointerUpBinded = this._onPointerUp.bind(this);

    this._updateBinded = this._update.bind(this);
    this._resizeBinded = this.resize.bind(this);

    this.resize();

    this._position = new Vector2();

    this.enable();
  }

  resize() {
    this._domElementBoundingRect = this.domElement.getBoundingClientRect();
  }

  _onPointerDown(e) {
    if(e.type === "touchstart") {
      this._preventMouseTypeChange = true;
      this._changeType(Pointer.TOUCH_TYPE);
    }
    this._downed = true;
    this.dragOffset.set(0, 0);
    this.copy(this._position);
    this._onPointerEvent(e);
    this._updatePositions();
    this.onDown.dispatch(e);
  }

  _onPointerMove(e) {
    if(e.type === "mousemove") {
      if(this._preventMouseTypeChange) {
        return;
      } else {
        this._changeType(Pointer.MOUSE_TYPE);
      }
    }
    this._onPointerEvent(e);
    this.onMove.dispatch(e);
  }

  _onPointerUp(e) {
    if(!this._downed) {
      return;
    }
    this._downed = false;
    this._onPointerEvent(e);
    this._updatePositions();
    this.onUp.dispatch(e);
    if(this.dragOffset.length < 4) {
      this.onClick.dispatch(e);
    }
    clearTimeout(this._timeout);
    this._timeout = setTimeout(() => {
      this._preventMouseTypeChange = false;
    }, 2000);
  }

  _onPointerEvent(e) {
    if (!!window.TouchEvent && e instanceof window.TouchEvent) {
      if(e.type === "touchend") {
        e = e.changedTouches[0];
      } else {
        e = e.touches[0];
      }
    }
    this._position.x = e.clientX - this._domElementBoundingRect.left;
    this._position.y = e.clientY - this._domElementBoundingRect.top;
  }

  _changeType(type) {
    if(this.type === type) {
      return;
    }
    this.type = type;
    this.disable();
    this.enable();
    this.onTypeChange.dispatch(this.type);
  }

  _update() {
    if(this.x || this.y) {
      this.velocity.x = this._position.x - this.x;
      this.velocity.y = this._position.y - this.y;
      if(this.downed) {
        this.dragOffset.add(this.velocity);
      }
    }

    this._updatePositions();
  }

  _updatePositions() {
    this.x = this._position.x;
    this.y = this._position.y;

    if(!this.x && !this.y) {
      return;
    }

    this.centered.x = this.centeredFlippedY.x = this.x - this._domElementBoundingRect.width * .5;
    this.centered.y = this.centeredFlippedY.y = this.y - this._domElementBoundingRect.height * .5;
    this.centeredFlippedY.y *= -1;

    this.normalized.x = this.normalizedFlippedY.x = this.x / this._domElementBoundingRect.width;
    this.normalized.y = this.normalizedFlippedY.y = this.y / this._domElementBoundingRect.height;
    this.normalizedFlippedY.y = 1 - this.normalizedFlippedY.y;

    this.normalizedCentered.x = this.normalizedCenteredFlippedY.x = this.normalized.x * 2 - 1;
    this.normalizedCentered.y = this.normalizedCenteredFlippedY.y = this.normalized.y * 2 - 1;
    this.normalizedCenteredFlippedY.y *= -1;
  }

  enable() {
    this.disable();
    this.resize();
    if(this.type === Pointer.TOUCH_TYPE) {
      this.domElement.addEventListener("touchmove", this._onPointerMoveBinded);
      window.addEventListener("touchend", this._onPointerUpBinded);
    }
    else {
      this.domElement.addEventListener("mousedown", this._onPointerDownBinded);
      window.addEventListener("mouseup", this._onPointerUpBinded);
    }
    this.domElement.addEventListener("touchstart", this._onPointerDownBinded);
    this.domElement.addEventListener("mousemove", this._onPointerMoveBinded);
    window.addEventListener("resize", this._resizeBinded);
    Ticker$1.add(this._updateBinded = this._updateBinded || this._update.bind(this));
  }

  disable() {
    Ticker$1.delete(this._updateBinded);
    this.domElement.removeEventListener("touchstart", this._onPointerDownBinded);
    this.domElement.removeEventListener("mousedown", this._onPointerDownBinded);
    this.domElement.removeEventListener("touchmove", this._onPointerMoveBinded);
    this.domElement.removeEventListener("mousemove", this._onPointerMoveBinded);
    window.removeEventListener("touchend", this._onPointerUpBinded);
    window.removeEventListener("mouseup", this._onPointerUpBinded);
    window.removeEventListener("resize", this._resizeBinded);
  }
}

const POINTER = Pointer.get();

class NodeLinkElement extends HTMLElement {
  constructor() {
    super();

    this.in = null;
    this.out = null;

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          position: absolute;
          top: 0;
          left: 0;
          // pointer-events: none;
        }
        svg {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        #scale-marker {
          position: absolute;
          visibility: hidden;
          width: 1px;
          height: 1px;
        }
        path {
          fill: transparent;
          stroke: black;
          stroke-width: 1px;
        }
        path:hover {
          stroke-width: 2px;
          stroke: red;
        }
      </style>
      <div id="scale-marker"></div>
      <svg>
        <path/>
      </svg>
    `;

    this._svg = this.shadowRoot.querySelector("svg");
    this._path = this.shadowRoot.querySelector("path");
    this._scaleMarker = this.shadowRoot.querySelector("#scale-marker");

    this._updateBinded = this._update.bind(this);
  }

  connectedCallback() {
    Ticker$1.add(this._updateBinded);
  }

  disconnectedCallback() {
    Ticker$1.delete(this._updateBinded);
  }

  _update() {
    const rootBoundingRect = this.getBoundingClientRect();
    const scaleMarkerBoundingRect = this._scaleMarker.getBoundingClientRect();

    let pointerX = (POINTER.x - rootBoundingRect.x) / scaleMarkerBoundingRect.width;
    let pointerY = (POINTER.y - rootBoundingRect.y) / scaleMarkerBoundingRect.height;

    let inX = pointerX;
    let inY = pointerY;
    if (this.in) {
      const inBoundingRect = this.in.getBoundingClientRect();
      inX = (inBoundingRect.x + inBoundingRect.width * .5 - rootBoundingRect.x) / scaleMarkerBoundingRect.width;
      inY = (inBoundingRect.y + inBoundingRect.height * .5 - rootBoundingRect.y) / scaleMarkerBoundingRect.height;
    }

    let outX = pointerX;
    let outY = pointerY;
    if (this.out) {
      const outBoundingRect = this.out.getBoundingClientRect();
      outX = (outBoundingRect.x + outBoundingRect.width * .5 - rootBoundingRect.x) / scaleMarkerBoundingRect.width;
      outY = (outBoundingRect.y + outBoundingRect.height * .5 - rootBoundingRect.y) / scaleMarkerBoundingRect.height;
    }

    this._svg.style.transform = `translate(${Math.min(inX, outX) - 1}px, ${Math.min(inY, outY) - 1}px)`;
    this._svg.style.width = `${Math.abs(inX - outX) + 2}px`;
    this._svg.style.height = `${Math.abs(inY - outY) + 2}px`;

    if (outX > inX) {
      outX = outX - inX;
      inX = 0;
    } else {
      inX = inX - outX;
      outX = 0;
    }

    if (outY > inY) {
      outY = outY - inY;
      inY = 0;
    } else {
      inY = inY - outY;
      outY = 0;
    }

    this._path.setAttribute("d", `M${inX + 1} ${inY + 1} L ${outX + 1} ${outY + 1}`);
    // this._path.setAttribute("d", `M${inX + 1} ${inY + 1} C ${inX + (outX - inX) * .5} ${inY}, ${outX + (inX - outX) * .5} ${outY}, ${outX + 1} ${outY + 1}`);
  }
}

window.customElements.define("dgui-node-link", NodeLinkElement);

class NodeLinkSystemElement extends HTMLElement {
  static get observedAttributes() {
    return ["data-listener"];
  }

  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <slot></slot>
    `;

    this._currentLink = null;
    this._linkMap = new Map();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }
    switch (name) {
      case "data-listener":
        this.listener = eval(newValue);
        break;
    }
  }

  connectedCallback() {
    this.listener = this.listener || this;
  }

  disconnectedCallback() {
    this._removeEventListeners();
  }

  _onPointerDown(event) {
    if(event.button === 2) ;
  }

  _onNodeConnect(event) {
    this._currentLink = document.createElement("dgui-node-link");
    if (event.target.destination) {
      this._currentLink.out = event.target;
    } else {
      this._currentLink.in = event.target;
    }
    this._linkMap.set(this._currentLink.in, this._currentLink);
    this.appendChild(this._currentLink);
  }

  _onNodeConnected(event) {
    if (this._currentLink.out && this._currentLink.out !== event.target) {
      this._currentLink.in = event.target;
    }
    if (this._currentLink.in && this._currentLink.in !== event.target) {
      this._currentLink.out = event.target;
    }
  }

  _onNodeDisconnected(event) {
    const link = this._linkMap.get(event.target);
    if (link) {
      link.remove();
    }
  }

  _removeEventListeners() {
    this._listener.removeEventListener("guinodeconnect", this._onNodeConnectBinded);
    this._listener.removeEventListener("guinodeconnected", this._onNodeConnectedBinded);
    this._listener.removeEventListener("guinodedisconnected", this._onNodeDisconnectedBinded);
    this._listener.removeEventListener("pointerdown", this._onPointerDownBinded);
  }

  get listener() {
    return this._listener;
  }

  set listener(value) {
    if (this._listener) {
      this._removeEventListeners();
    }

    this._listener = value;

    this._listener.addEventListener("guinodeconnect", this._onNodeConnectBinded = this._onNodeConnectBinded || this._onNodeConnect.bind(this));
    this._listener.addEventListener("guinodeconnected", this._onNodeConnectedBinded = this._onNodeConnectedBinded || this._onNodeConnected.bind(this));
    this._listener.addEventListener("guinodedisconnected", this._onNodeDisconnectedBinded = this._onNodeDisconnectedBinded || this._onNodeDisconnected.bind(this));
    this._listener.addEventListener("pointerdown", this._onPointerDownBinded = this._onPointerDownBinded || this._onPointerDown.bind(this));
  }
}

window.customElements.define("dgui-node-link-system", NodeLinkSystemElement);

let activeConnector = null;

class NodeConnectorElement extends HTMLElement {
  static get observedAttributes() {
    return ["data-source", "data-destination"];
  }

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
          margin: 3px;
        }
      </style>
      <input type="radio" disabled>
      <slot></slot>
    `;

    this.connectedElements = new Set();

    this._radio = this.shadowRoot.querySelector("input");

    this._onSourceChangeBinded = this._onSourceChange.bind(this);
  }

  connectedCallback() {
    if (this.source) {
      this.source = this.source;
    }
    if (this.destination) {
      this.destination = this.destination;
    }
    this.addEventListener("pointerdown", this._onPointerDown);
    this.addEventListener("pointerup", this._onPointerUp);
  }

  disconnectedCallback() {
    this.removeEventListener("pointerdown", this._onPointerDown);
    this.removeEventListener("pointerup", this._onPointerUp);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }
    switch (name) {
      case "data-source":
        this.source = eval(newValue);
        break;
      case "data-destination":
        this.destination = eval(newValue);
        break;
    }
  }

  _onPointerDown() {
    if (activeConnector) {
      return;
    }
    activeConnector = this;
    this.dispatchEvent(new Event("guinodeconnect", {
      bubbles: true,
      composed: true,
    }));
    window.addEventListener("pointerup", this._onWindowPointerUpBinded = this._onWindowPointerUpBinded || this._onWindowPointerUp.bind(this));
  }

  _onPointerUp(event) {
    if (!activeConnector || activeConnector === this) {
      return;
    }
    if(activeConnector.destination) {
      this.connect(activeConnector);
    } else {
      activeConnector.connect(this);
    }
    activeConnector = null;
  }

  _onWindowPointerUp(event) {
    for (const element of event.path) {
      if (element instanceof NodeConnectorElement) {
        return;
      }
    }
    window.removeEventListener("pointerup", this._onWindowPointerUpBinded);
    if (activeConnector) {
      activeConnector.disconnect();
      activeConnector = null;
    }
  }

  connect(element) {
    if(this.connectedElements.has(element)) {
      return;
    }
    if (element instanceof NodeConnectorElement) {
      element.connected = true;
    }
    this.connectedElements.add(element);
    if (this.value !== undefined) {
      element.value = this.value;
    }
    this.connected = true;
    this.dispatchEvent(new Event("guinodeconnected", {
      bubbles: true,
      composed: true,
    }));
    element.dispatchEvent(new Event("guinodeconnected", {
      bubbles: true,
      composed: true,
    }));
  }

  disconnect(element) {
    if (element) {
      this.connectedElements.delete(element);
      element.connected = false;
      element.dispatchEvent(new Event("guinodedisconnected", {
        bubbles: true,
        composed: true,
      }));
    }
    this.connected = !!this.connectedElements.size;

    if (!this.connected) {
      this.dispatchEvent(new Event("guinodedisconnected", {
        bubbles: true,
        composed: true,
      }));
    }
  }

  _onSourceChange(event) {
    this.value = this.source.value;
  }

  get value() {
    return this._value;
  }

  set value(value) {
    if (value === this._value) {
      return;
    }
    this._value = value;

    for (const element of this.connectedElements) {
      element.value = this._value;
    }
    if (this.destination) {
      this.destination.value = this._value;
      this.destination.dispatchEvent(new Event("input", {
        bubbles: true,
      }));
      this.destination.dispatchEvent(new Event("change", {
        bubbles: true,
      }));
    }
  }

  get connected() {
    return this._radio.checked;
  }

  set connected(value) {
    if (this.destination) {
      this.destination.disabled = value;
    }
    this._radio.checked = value;
  }

  get source() {
    return this._source;
  }

  set source(value) {
    if (this._source) {
      this._source.removeEventListener("input", this._onSourceChangeBinded);
      this._source.removeEventListener("change", this._onSourceChangeBinded);
    }
    this._source = value;
    if (!this._source || !this.isConnected) {
      return;
    }
    if (this.destination) {
      this.value = this._source.value;
    }
    this._source.addEventListener("input", this._onSourceChangeBinded);
    this._source.addEventListener("change", this._onSourceChangeBinded);
  }

  get destination() {
    return this._destination;
  }

  set destination(value) {
    this._destination = value;
    if (!this.isConnected) {
      return;
    }
    if (this.value !== undefined) {
      this._destination.value = this.value;
    }
  }
}

window.customElements.define("dgui-node-connector", NodeConnectorElement);

class SelectInputNodeElement extends HTMLElement {
  static get observedAttributes() {
    return ["name", "value", "disabled"];
  }

  constructor() {
    super();

    this.type = "select";

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          width: 250px;
          display: grid;
          grid-template-columns: auto auto auto 1fr auto;
          grid-gap: 5px;
          align-items: center;
        }
        select {
          width: 100%;
          height: 100%;
        }
      </style>
      <dgui-node-connector data-destination="this.getRootNode().host"></dgui-node-connector>
      <dgui-draggable-handle data-target="this.getRootNode().host"></dgui-draggable-handle>
      <label></label>
      <select></select>
      <dgui-node-connector data-source="this.getRootNode().host"></dgui-node-connector>
    `;

    this._optionsMap = new Map();

    this._select = this.shadowRoot.querySelector("select");
    this._label = this.shadowRoot.querySelector("label");

    const onInput = (event) => {
      this.dispatchEvent(new event.constructor(event.type, event));
    };
    this.shadowRoot.addEventListener("input", onInput);
    this.shadowRoot.addEventListener("change", onInput);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "disabled":
        this[name] = newValue !== null;
        break;
      case "value":
        this[name] = this.defaultValue = newValue;
        break;
      default:
        this[name] = newValue;
        break;
    }
  }

  set options(value) {
    this._options = value instanceof Array ? value : JSON.parse(`[${value}]`);
    this._select.innerHTML = "";
    for (let option of this._options) {
      const optionElement = document.createElement("option");
      const stringifiedOption = typeof option === "object" ? JSON.stringify(option) : option.toString();
      optionElement.value = stringifiedOption;
      optionElement.text = stringifiedOption;
      optionElement.selected = option === this.value;
      this._select.add(optionElement);
      this._optionsMap.set(stringifiedOption, option);
    }
    this.value = this._value;
  }

  get options() {
    return this._options;
  }

  get value() {
    return this._optionsMap.get(this._select.value);
  }

  set value(value) {
    this._value = value;
    this._select.value = value;
  }

  get name() {
    return this._select.name;
  }

  set name(value) {
    this._label.textContent = value;
    this._select.name = value;
  }

  set disabled(value) {
    this._select.disabled = value;
  }

  get disabled() {
    return this._select.disabled;
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      value: this.value,
      options: this.options,
    };
  }
}

window.customElements.define("dgui-node-input-select", SelectInputNodeElement);

class ButtonInputNodeElement extends HTMLElement {
  static get observedAttributes() {
    return ["name", "value", "disabled"];
  }

  constructor() {
    super();

    this.type = "button";

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          width: 250px;
          display: grid;
          grid-template-columns: auto auto 1fr auto;
          grid-gap: 5px;
          align-items: center;
        }
        button {
          width: 100%;
          height: 100%;
        }
      </style>
      <dgui-node-connector data-destination="this.getRootNode().host"></dgui-node-connector>
      <dgui-draggable-handle data-target="this.getRootNode().host"></dgui-draggable-handle>
      <button>
        <slot></slot>
      </button>
      <dgui-node-connector data-source="this.getRootNode().host"></dgui-node-connector>
    `;

    this._slot = this.shadowRoot.querySelector("slot");
    this._button = this.shadowRoot.querySelector("button");

    this._button.onclick = (event) => {
      if (typeof this.value === "function") {
        this.value();
      }
      this.dispatchEvent(new event.constructor("input", event));
    };
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name in this) {
      this[name] = newValue;
    } else {
      this._button.setAttribute(name, newValue);
    }
  }

  set name(value) {
    this._slot.textContent = value;
    this._name = value;
  }

  get name() {
    return this._name;
  }

  get disabled() {
    return this._button.disabled;
  }

  set disabled(value) {
    this._button.disabled = value;
  }

  set value(value) {
    this._value = value;
    this.dispatchEvent(new Event("change", {
      bubbles: true,
    }));
  }

  get value() {
    return this._value;
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      value: this.value,
    };
  }
}

window.customElements.define("dgui-node-input-button", ButtonInputNodeElement);
//# sourceMappingURL=index.js.map
