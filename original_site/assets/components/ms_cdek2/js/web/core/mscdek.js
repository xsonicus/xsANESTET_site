import {AppConfig} from './app-config.js';
import {DIContainer} from './di-container.js';

export class Mscdek {
  constructor() {
    this.appName = 'mscdek';
    this.container = new DIContainer(this.appName);
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    // 1. Загружаем внешние зависимости
    await this._loadExternals();

    // 2. Загружаем библиотеки
    await this._loadLibraries();

    // 3. Инициализируем модули
    await this._initModules();

    this.initialized = true;
    this.helpers = this.container.getModule('helpers');

    this.helpers.dispatchEvent(this.appName + ':initialized', {
      bubbles: true,
      cancelable: true,
      detail: {
        object: this
      }
    });
  }

  async _loadExternals() {
    const EXTERNAL_WAIT_TIMEOUT = 10000;
    const CHECK_INTERVAL = 50;

    for (const [name, globalName] of Object.entries(AppConfig.externals)) {
      if (window[globalName]) {
        this.container.registerExternal(name, window[globalName]);
        continue;
      }

      try {
        const external = await this._waitForExternal(globalName, EXTERNAL_WAIT_TIMEOUT, CHECK_INTERVAL);
        this.container.registerExternal(name, external);
      } catch (error) {
        console.warn(`External dependency ${name} (${globalName}) not found after ${EXTERNAL_WAIT_TIMEOUT}ms`);
      }
    }
  }

  /**
   * Ожидает появления внешнего сервиса в глобальной области
   * @param {string} globalName - Имя в window
   * @param {number} timeout - Максимальное время ожидания (мс)
   * @param {number} interval - Интервал проверки (мс)
   * @returns {Promise} Промис, который резолвится когда сервис появится
   */
  _waitForExternal(globalName, timeout, interval) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkInterval = setInterval(() => {
        if (window[globalName]) {
          clearInterval(checkInterval);
          resolve(window[globalName]);
          return;
        }

        if (Date.now() - startTime >= timeout) {
          clearInterval(checkInterval);
          reject(new Error(`Timeout waiting for ${globalName}`));
        }
      }, interval);

      if (window[globalName]) {
        clearInterval(checkInterval);
        resolve(window[globalName]);
      }
    });
  }

  async _loadLibraries() {
    for (const [name, libConfig] of Object.entries(AppConfig.libraries)) {
      await this._loadLibrary(name, libConfig);
    }
  }

  async _loadLibrary(name, {js, css, globalName}) {
    if (css) {
      await this._loadCss(css);
    }

    await this._loadScript(js);

    if (globalName && window[globalName]) {
      this.container.registerLibrary(name, window[globalName]);
    }
  }

  async _initModules() {
    for (const [name, moduleConfig] of Object.entries(AppConfig.modules)) {
      await this._initModule(name, moduleConfig);
    }
  }

  async _initModule(name, {path, className}) {
    try {
      const module = await import(path + window.mscdekConfig.version);
      const ModuleClass = module[className];

      if (!ModuleClass) {
        throw new Error(`Class ${className} not found in ${path}`);
      }

      const instance = new ModuleClass(this.container);
      this.container.registerModule(name, instance);
    } catch (error) {
      console.error(`Failed to initialize module ${name}:`, error);
      throw error;
    }
  }

  _loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  _loadCss(href) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }
}
