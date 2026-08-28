export class Helpers {
  constructor() {
  }

  dispatchEvent(name, options = {bubbles: true, cancelable: false}) {
    const event = new CustomEvent(name, options);
    return document.dispatchEvent(event);
  }
}
