export class StorageManager {
  /**
   * @param container
   */
  constructor(container) {
    this.container = container;
    this.dbName = container.appName;
    this.version = 1;
    this.db = null;
    this.stores = new Map(); // Кэш хранилищ
  }

  /** Инициализирует базу данных и хранилища */
  async init(storesConfig = []) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        storesConfig.forEach(({ name, keyPath = 'id', indexes = [] }) => {
          if (!db.objectStoreNames.contains(name)) {
            const store = db.createObjectStore(name, { keyPath });
            indexes.forEach(({ name, keyPath, options }) => {
              store.createIndex(name, keyPath, options);
            });
          }
        });
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject(`IndexedDB error: ${event.target.error}`);
      };
    });
  }

  /** Возвращает экземпляр хранилища */
  getStore(storeName) {
    if (!this.stores.has(storeName)) {
      this.stores.set(storeName, new Storage(this, storeName));
    }
    return this.stores.get(storeName);
  }

  /** Закрывает соединение с базой */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.stores.clear();
    }
  }
}

class Storage {
  /**
   * @param {StorageManager} dbManager
   * @param {string} storeName
   */
  constructor(dbManager, storeName) {
    this.dbManager = dbManager;
    this.storeName = storeName;
  }

  /** Добавляет или обновляет данные */
  async set(key, value, ttl) {
    const db = await this._ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const record = {
        ...(typeof key === 'object' ? key : { id: key }),
        data: value,
        ...(ttl ? { expiry: Date.now() + ttl } : {})
      };

      const request = store.put(record);

      request.onsuccess = () => resolve(record.id || key);
      request.onerror = () => reject(request.error);
    });
  }

  /** Получает данные по ключу */
  async get(key) {
    const db = await this._ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }

        if (result.expiry && result.expiry < Date.now()) {
          this.delete(key);
          resolve(null);
        } else {
          resolve(result.data || result);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /** Удаляет данные по ключу */
  async delete(key) {
    const db = await this._ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  /** Очищает просроченные записи */
  async clearExpired() {
    const db = await this._ensureDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);

      if (store.indexNames.contains('expiry')) {
        const index = store.index('expiry');
        const range = IDBKeyRange.upperBound(Date.now());
        index.openCursor(range).onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };
      } else {
        resolve();
      }
    });
  }

  /** Полностью очищает хранилище */
  async clearAll() {
    const db = await this._ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /** Вспомогательный метод для проверки соединения */
  async _ensureDB() {
    if (!this.dbManager.db) {
      await this.dbManager.init();
    }
    return this.dbManager.db;
  }
}
