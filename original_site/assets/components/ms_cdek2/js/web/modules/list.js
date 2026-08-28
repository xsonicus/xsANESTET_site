let Base = await import(`./base.js${window.mscdekConfig.version}`);
Base = Base.Base;

export class List extends Base {
  async init() {
    if (typeof this.config.deliveriesByType.pvz.split === 'function') {
      this.config.deliveriesByType.pvz = this.config.deliveriesByType.pvz.split(',');
    }
    this.showList = true;
    this.prefixes.push('code');
    this.map = this.container.getModule('map');
    if (!this.map.mapBlock) {
      this.map = null;
    }

    this.getElements({
      indexField: {
        selector: this.config.indexSelector,
        logMessage: 'The index field is required for calculating the cost.'
      },
      listBlock: {
        selector: `[${this.config.listAttr}]`,
        logMessage: 'List block not found. The selection of PVZ from the list is not available.'
      },
      statusBlock: {
        selector: `[${this.config.statusAttr}]`,
        logMessage: 'Status block not found. Information about the delivery time will not be shown.'
      },
      cityField: {
        selector: '[name="city"]',
      },
      countryField: {
        selector: '[name="country"]',
      }
    });

    const events = {
      onListGet: `${this.appName}:list:get`,
      onGetStatus: `${this.appName}:status:get`,
      onChangePoint: `${this.appName}:point:change`,
      onErrorPoint: `${this.appName}:point:error`,
    };
    this.events = {...this.events, ...events};

    const shopEvents = {
      orderGetCost: {
        name: 'Order.getcost.response.success',
        callbackName: 'orderGetCostHandler'
      },
      orderSubmitError: {
        name: 'Order.submit.response.error',
        callbackName: 'orderSubmitErrorHandler'
      }
    };
    this.shopEvents = {...this.shopEvents, ...shopEvents};

    const subscribe = {
      change: {
        name: 'change',
        callbackName: 'changeHandler'
      }
    }
    this.subscribe = {...this.subscribe, ...subscribe};

    super.init();

    const storageManager = this.container.getModule('storage');
    await storageManager.init([
      {
        name: 'points',
        keyPath: 'postal_code',
        indexes: [
          {name: 'postal_code', keyPath: 'postal_code', unique: true}
        ]
      }
    ]);
    this.pointsStore = storageManager.getStore('points');

    if (this.indexField.value) {
      this.orderGetCostHandler().then();
    }
  }

  changeHandler(e) {
    e.target.name === 'point' && this.updateMap().then();
  }

  async updateMap() {
    if (!this.map) return;
    if (!this.listBlock) return;

    const result = await this.pointsStore.get(this.indexField.value);
    const points = result.data.points;
    const select = this.listBlock.querySelector('select');
    const mscdekCode = select[select.selectedIndex].dataset[this.config.codeKey];
    const selectedPoint = points.find(item => item.code === mscdekCode);

    this.helpers.dispatchEvent(this.events.onChangePoint, {
      bubbles: true,
      cancelable: false,
      detail: {
        mscdekCode: mscdekCode,
        selectedPoint: selectedPoint,
        result: result,
        object: this
      }
    });

    this.map.mapUpdParams = {
      center: [selectedPoint.location.longitude, selectedPoint.location.latitude],
      zoom: 16
    };
    this.map.moveMapToCoordinates();

    setTimeout(() => {
      const pointElement = document.querySelector(`#${mscdekCode}`);
      this.map.markPointOnMap(pointElement);
    }, 100);

    this.setPointInDeliveryStatus(selectedPoint);
  }

  setPointInDeliveryStatus(selectedPoint){
    const params = new FormData();
    params.append('pointData', JSON.stringify(selectedPoint));
    this.sendResponse('update_status', params)
  }

  async orderGetCostHandler() {
    this.toggleBlockVisibility(this.listBlock, false);
    this.toggleBlockVisibility(this.statusBlock, false);
    this.toggleMap();
    const checkedDelivery = document.querySelector('input[name="delivery"]:checked');
    if (this.config.deliveriesByType.pvz.includes(checkedDelivery.value) && this.indexField.value) {
      await this.getList();
    }
    this.indexField.value && this.getDeliveryStatus();
  }

  getDeliveryStatus() {
    const params = new FormData();
    params.append('postal_code', this.indexField?.value);
    params.append('handler', 'toggleStatus');
    this.sendResponse('getstatus', params)
  }

  orderSubmitErrorHandler(response) {
    if (response.data.includes('point')) {

      this.helpers.dispatchEvent(this.events.onErrorPoint, {
        bubbles: true,
        cancelable: false,
        detail: {
          response: response,
          object: this
        }
      });

      this.sendit.Notify.error(this.config.choosePVZErrorMessage);
    }
  }

  async getList() {
    await this.pointsStore.clearAll();
    const result = await this.pointsStore.get(this.indexField.value);
    if (result) {
      this.helpers.dispatchEvent(this.events.onListGet, {
        bubbles: true,
        cancelable: false,
        detail: {
          showList: this.showList,
          cache: true,
          result: result,
          object: this
        }
      });

      this.listBlock && (this.listBlock.innerHTML = result.data.html);
      this.sortAndDisplayPoints(result);
      return;
    }
    const params = new FormData();
    params.append('postal_code', this.indexField?.value);
    params.append('city', this.cityField?.value);
    params.append('country', this.countryField?.value);
    params.append('handler', 'getListHandler');
    this.sendResponse('getlist', params)
  }

  sortAndDisplayPoints(result){
    result.data.points = this.sort(result.data.points);
    this.showList && this.toggleBlockVisibility(this.listBlock, result.data.html);
    this.toggleMap(result.data.points, result.data.coordinates);
    this.pointsStore.set({postal_code: result.data.postal_code}, result);
  }

  sort(points){
    points = this.sortPoints(points);
    this.sortListOptions(points);
    return points;
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(2);
  }

  sortPoints(points) {
    let userLocation = this.getUserLocationFromStorage();
    if (!userLocation.data?.geo_lat) {
      return points;
    }
    for (let k in points) {
      const point = points[k];
      points[k]['distance'] = this.calculateDistance(point.location.latitude, point.location.longitude, userLocation.data.geo_lat, userLocation.data.geo_lon);
    }
    points.sort((a, b) => a.distance - b.distance);
    return points;
  }

  sortListOptions(points) {
    this.pointField = document.querySelector(this.config.pointSelector);
    if (!this.pointField || this.pointField.tagName !== 'SELECT') {
      return;
    }
    const options = Array.from(this.pointField.options);
    const firstOption = options.shift();

    options.sort((a, b) => {
      const indexA = points.findIndex(p => p.code === a.dataset[this.config.codeKey]);
      const indexB = points.findIndex(p => p.code === b.dataset[this.config.codeKey]);
      return indexA > indexB ? 1 : -1;
    });

    this.pointField.innerHTML = '';
    this.pointField.appendChild(firstOption);
    options.forEach(option => {
      this.pointField.appendChild(option);
    });
  }

  getUserLocationFromStorage() {
    let userLocation = localStorage.getItem(this.config.userLocationStorageKey);
    if (!userLocation) {
      return {};
    }
    return JSON.parse(userLocation);
  }

  async getListHandler(result) {
    this.helpers.dispatchEvent(this.events.onListGet, {
      bubbles: true,
      cancelable: false,
      detail: {
        showList: this.showList,
        cache: false,
        result: result,
        object: this
      }
    });

    this.sortAndDisplayPoints(result);
  }

  toggleStatus(result) {
    this.helpers.dispatchEvent(this.events.onGetStatus, {
      bubbles: true,
      cancelable: false,
      detail: {
        status: result.data,
        result: result,
        object: this
      }
    });

    if(result.data.updateCost){
      this.ms2.Order.getcost();
    }

    this.toggleBlockVisibility(this.statusBlock, result.success);
  }

  toggleBlockVisibility(block, show) {
    if (!block) return;
    block.classList[show ? 'remove' : 'add'](this.config.hideClass);
  }

  toggleMap(points, coordinates) {
    if (!this.map) return;
    if (points && coordinates) {
      this.map.show(points, coordinates);
    } else {
      this.map.hide();
    }
  }
}
