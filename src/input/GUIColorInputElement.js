import GUIInputElement from "./GUIInputElement.js";

export default class GUIColorInputElement extends GUIInputElement {
  constructor() {
    super({
      type: "color",
      content: `
      <style>
        :host {
          grid-template-columns: 2fr auto 1fr auto;
        }
        input {
          box-sizing: border-box;
          width: 100%;
        }
      </style>
      <input type="text" maxlength="7" size="7">
      <input type="color">`
    });
    this._textInput = this.shadowRoot.querySelector(`input[type="text"]`);
    this._colorInput = this.shadowRoot.querySelector(`input[type="color"]`);
  }

  // _updateInputFromValue(value) {
  //   console.log(value);
    
  //   if(typeof value === "string") {
  //     this._colorInput.style.color = value;
  //     const results = /rgba?\s*\(\s*(\d*),\s*(\d*)\s*,\s*(\d*)\s*(,\s*([\.\d]*))?\s*\)/.exec(getComputedStyle(this._colorInput).getPropertyValue("color"));
  //     console.log(results);
      
  //   }
  // }

  _updateValueFromInput(input) {
    if(typeof this.value === "string") {
      this._colorInput.style.color = input.value;
      const results = /rgba?\s*\(\s*(\d*),\s*(\d*)\s*,\s*(\d*)\s*(,\s*([\.\d]*))?\s*\)/.exec(getComputedStyle(this._colorInput).getPropertyValue("color"));
      const value = `#${parseInt(results[1]).toString(16).padStart(2, "0")}${parseInt(results[2]).toString(16).padStart(2, "0")}${parseInt(results[3]).toString(16).padStart(2, "0")}`;
      this.value = value;
    }
    
    
  }

  _updateInputFromValue(value) {
    if(typeof value !== "string") {
      //temp
      return;
    }

    value = value.length === 6 ? `#${value}` : value;
    
    if(this.shadowRoot.activeElement !== this._textInput) {
      this._textInput.value = value;
    }
    this._colorInput.value = value;
  }
}

GUIInputElement.typeResolvers.set("color", (value, attributes) => {
  return typeof value === "string" && value.length === 7 && value.startsWith("#") || (value.r !== undefined && value.g !== undefined && value.b !== undefined);
});

window.customElements.define("dgui-colorinput", GUIColorInputElement);
