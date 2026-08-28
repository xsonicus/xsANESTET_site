let Base = await import(`./base.js${window.mscdekConfig.version}`);
Base = Base.Base;

export class Address extends Base {
  init() {

    this.getElements({
      suggestField: {
        selector: `[${this.config.suggestFieldAttr}]`,
        logMessage: 'Suggestion field not found. Suggestions are not available.'
      },
      suggestList: {
        selector: `[${this.config.suggestListAttr}]`,
        logMessage: 'Suggestion list block not found. There is nowhere to insert suggestions.'
      },
      countryField: {
        selector: '[name="country"]',
        logMessage: 'Country field not found. The search for locations will take place across the Russian Federation.'
      },
      indexField: {
        selector: '[name="index"]',
        logMessage: 'Index field not found. Calculation is impossible.'
      },
    });

    const events = {
      onSelectSuggestion: `${this.appName}:address:select:suggestion`,
    };
    this.events = {...this.events, ...events};

    const shopEvents = {
      orderAdd: {
        name: 'Order.add.response.success',
        callbackName: 'orderAddHandler'
      }
    };
    this.shopEvents = {...this.shopEvents, ...shopEvents};

    const subscribe = {
      input: {
        name: 'input',
        callbackName: 'inputHandler',
        debounce: 500
      },
      blur: {
        name: 'blur',
        callbackName: 'blurHandler',
        debounce: 500
      },
      click: {
        name: 'click',
        callbackName: 'clickHandler',
      },
    }
    this.subscribe = {...this.subscribe, ...subscribe};

    super.init();
  }

  inputHandler(e) {
    e.target === this.suggestField && this.getSuggestions();
  }

  blurHandler(e) {
    e.target === this.suggestField && this.toggleSuggestionList();
  }

  clickHandler(e) {
    e.target.hasAttribute(this.config.suggestItemAttr) && this.selectSuggestion(e.target.dataset.value);
  }

  orderAddHandler(response) {
    if (!response.data.hasOwnProperty('index')
      && !response.data.hasOwnProperty('country')
      && !response.data.hasOwnProperty('city')
    ) {
      return;
    }
    this.indexField && this.ms2.Order.getcost();
  }

  async getSuggestions() {
    if (this.suggestField.value.length < 3) {
      this.toggleSuggestionList();
      await this.setAddressValues({data: {}});
    }
    const params = new FormData();
    params.append('query', this.suggestField.value);
    this.addCountryInRequestParams(params);
    params.append('handler', 'getsuggestionsHandler');
    this.sendResponse('getsuggestions', params)
  }

  getsuggestionsHandler(result) {
    this.toggleSuggestionList();
    if (!result.data.suggestions) return;
    this.suggestions = result.data.suggestions;
    this.toggleSuggestionList(result.data.html);
  }

  async selectSuggestion(selectedValue) {
    this.toggleSuggestionList();
    const location = this.suggestions.find(suggestion => suggestion.value === selectedValue);
    if (!location) return;
    location.data.unrestricted_value = location.unrestricted_value;
    if (!location.data.postal_code && location.data.city) {
      location.data.postal_code = await this.getLocationIndex(location.data.city);
    }

    if (!this.helpers.dispatchEvent(this.events.onSelectSuggestion, {
      bubbles: true,
      cancelable: true,
      detail: {
        location: location,
        ymap: this.ymap,
        object: this
      }
    })) {
      return;
    }
    localStorage.setItem(this.config.userLocationStorageKey, JSON.stringify(location));
    await this.setAddressValues(location);
  }

  async getLocationIndex(city) {
    const params = new FormData();
    params.append('city', city);
    this.addCountryInRequestParams(params);
    const result = await this.sendResponse('getindex', params);
    return result.data.postal_code;
  }

  addCountryInRequestParams(params) {
    if (!this.countryField || !this.countryField.value) {
      return params;
    }
    params.append('country', this.countryField.value);
    return params;
  }

  async setAddressValues(location) {
    for (let fieldName in this.config.fieldNames) {
      const field = document.querySelector(`[name="${fieldName}"]`);
      if (!field) continue;
      let value = location.data[this.config.fieldNames[fieldName]] || '';
      if (fieldName === 'city' && !location.data[this.config.fieldNames[fieldName]]) {
        value = location.data['settlement'] || '';
      }
      if (field === this.suggestField && !value) {
        value = field.value;
      }
      field.value = value;

      this.ms2.Order.add(fieldName, field.value)
      await this.delay(400);
    }
  }

  toggleSuggestionList(html) {
    if (!this.suggestList) return;
    this.suggestList.classList[html ? 'remove' : 'add'](this.config.hideClass);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
