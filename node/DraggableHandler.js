export default class DraggableHandler {
  constructor(element, handlerElement = element) {
    this._element = element;
    this._handlerElement = handlerElement;

    this._offsetX = 0;
    this._offsetY = 0;

    this._dragStartX = 0;
    this._dragStartY = 0;

    this._preventDefaultBinded = this._preventDefault.bind(this);
  }

  _onDragStart(event) {
    event.preventDefault();
    this._handlerElement.addEventListener("click", this._preventDefaultBinded, { passive: false });
  }

  _preventDefault(event) {
    event.preventDefault();
  }

  _onPointerDown(event) {
    this._dragStartX = event.clientX;
    this._dragStartY = event.clientY;
    window.addEventListener("pointermove", this._onPointerMoveBinded = this._onPointerMoveBinded || this._onPointerMove.bind(this));
    window.addEventListener("pointerup", this._onPointerUpBinded = this._onPointerUpBinded || this._onPointerUp.bind(this));
    window.addEventListener("touchmove", this._preventDefaultBinded, { passive: false });
  }

  _onPointerMove(event) {
    this._element.style.transform = `translate(${this._offsetX + event.clientX - this._dragStartX}px, ${this._offsetY + event.clientY - this._dragStartY}px)`;
  }

  _onPointerUp(event) {
    window.removeEventListener("pointermove", this._onPointerMoveBinded);
    window.removeEventListener("pointerup", this._onPointerUpBinded);
    window.removeEventListener("touchmove", this._preventDefaultBinded);
    this._handlerElement.removeEventListener("click", this._preventDefaultBinded);
    this._offsetX += event.clientX - this._dragStartX;
    this._offsetY += event.clientY - this._dragStartY;
  }

  get enabled() {
    return this._enabled;
  }

  set enabled(value) {
    this._enabled = value;
    if (this._enabled) {
      this._handlerElement.addEventListener("pointerdown", this._onPointerDownBinded = this._onPointerDownBinded || this._onPointerDown.bind(this));
      this._element.addEventListener("dragstart", this._onDragStartBinded = this._onDragStartBinded || this._onDragStart.bind(this));
    } else {
      this._handlerElement.addEventListener("pointerdown", this._onPointerDownBinded);
      this._element.removeEventListener("dragstart", this._onDragStartBinded);
    }
  }
}
