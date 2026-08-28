import {ModuleConfig} from '../core/module-config.js';

export class Base {
  constructor(container) {
    this.container = container;
    this.appName = container.appName;
    const serverConfig = window[`${this.appName}Config`] || {};
    this.config = {...ModuleConfig[this.constructor.name], ...serverConfig};
    this.events = {
      onInit: `${this.appName}:init`
    }
    this.helpers = this.container.getModule('helpers');
    this.ms2 = this.container.getExternal('ms2');
    this.sendit = this.container.getExternal('sendit');
    this.sending = this.sendit.Sending;
    this.prefixes = ['prop'];
    this.shopEvents = {};
    this.subscribe = {
      sendBefore: {
        name: 'si:send:before',
        callbackName: 'sendBeforeHandler'
      },
      responseFinish: {
        name: 'si:send:finish',
        callbackName: 'responseFinishHandler'
      }
    };
    this.init();
  }

  init() {
    this.addEventListeners();
    this.addCallbacks();
    this.setConfigParams(this.prefixes);
    this.helpers.dispatchEvent(this.events.onInit, {
      bubbles: true,
      cancelable: false,
      detail: {
        moduleName: this.constructor.name,
        object: this
      }
    });
  }


  /**
   * @returns {void}
   */
  addEventListeners() {
    if (!this.subscribe) return;
    for (let k in this.subscribe) {
      const subscribe = this.subscribe[k];
      if (!(subscribe.callbackName in this)) continue;
      if (!subscribe.name) continue;
      if(!subscribe.debounce){
        document.addEventListener(subscribe.name, this[subscribe.callbackName].bind(this));
      }else{
        document.addEventListener(subscribe.name, this.debounce((e) => {
          this[subscribe.callbackName](e);
        }, subscribe.debounce));
      }
    }
  }

  sendBeforeHandler(e){
    const {fetchOptions, headers} = e.detail;

    if(headers['X-SIPRESET'].indexOf(this.appName) === 0){
      fetchOptions.body.set('isBot', '0');
    }
  }

  /**
   * @returns {void}
   */
  addCallbacks() {
    if (!this.shopEvents || !this.ms2) return;
    for (let k in this.shopEvents) {
      const event = this.shopEvents[k];
      if (!(event.callbackName in this)) continue;
      this.ms2.Callbacks.add(event.name, k, (response) => {
        this[event.callbackName](response);
      });
    }
  }

  /**
   * @param {Array<string>} $prefixes - массив префиксов, по которым будут установлены параметры конфигурации
   * @returns {void}
   */
  setConfigParams($prefixes) {
    for (let i in $prefixes) {
      const attrName = this.config[$prefixes[i] + 'Attr'];
      if (!attrName) continue;
      this.config[$prefixes[i] + 'Selector'] = `[${this.config[$prefixes[i] + 'Attr']}]`;
      this.config[$prefixes[i] + 'Key'] = this.getDataAttrKey(this.config[$prefixes[i] + 'Attr']);
    }
  }

  /**
   * @param attrName
   * @returns {string}
   */
  getDataAttrKey(attrName) {
    const prefix = 'data-';
    if (attrName.startsWith(prefix)) {
      return attrName.slice(prefix.length).replace(/-([a-z])/g, (match, group) => group.toUpperCase());
    } else {
      return attrName;
    }
  }

  /**
   * @param presetName
   * @param formData
   * @param root
   * @returns {*}
   */
  async sendResponse(presetName, formData, root = document) {
    this.sendit.setComponentCookie('sitrusted', '1');
    return await this.sending.prepareSendParams(root, `${this.appName}_${presetName}`, formData);
  }

  /**
   * @param e
   * @returns {void}
   */
  responseFinishHandler(e) {
    const {result} = e.detail;
    if (!(result.data.handler in this)) return;
    this[result.data.handler](result);
  }

  getElements(data){
    for(let propName in data){
      this[propName] = document.querySelector(data[propName].selector);
      if(!this[propName] && data[propName].logMessage){
        console.log(data[propName].logMessage);
      }
    }
  }

  debounce(func, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    }
  }
}
