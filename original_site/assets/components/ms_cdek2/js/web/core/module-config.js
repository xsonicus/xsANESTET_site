export const ModuleConfig = {
  Base: {
    productAttr: 'data-ymec-product',
    propAttr: 'data-ymec-prop',
    linkAttr: 'data-ymec-link',
  },
  Address: {
    fieldNames: {
      index: 'postal_code',
      country: 'country',
      region: 'region_with_type',
      city: 'city',
      street: 'street',
      building: 'house',
      text_address: 'unrestricted_value'
    },
    suggestFieldAttr: 'data-mscdek-suggest-field',
    suggestListAttr: 'data-mscdek-suggest-list',
    suggestItemAttr: 'data-mscdek-suggest-item',
    countrySelector: '[name="country"]',
    hideClass: 'hide',
    userLocationStorageKey: 'mscdek_user_location'
  },
  List: {
    listAttr: 'data-mscdek-list',
    statusAttr: 'data-mscdek-status',
    mapAttr: 'data-mscdek-map',
    codeAttr: 'data-mscdek-code',
    pointSelector: '[name="point"]',
    indexSelector: '[name="index"]',
    hideClass: 'hide',
    userLocationStorageKey: 'mscdek_user_location'
  },
  Map: {
    mapAttr: 'data-mscdek-map',
    pointSelector: '[name="point"]',
    pointValueFieldName: 'address',
    hideClass: 'hide',
    markerClass: 'mscdek-pin',
    clusterClass: 'mscdek-cluster',
    clusterInnerHtml: '<div class="mscdek-cluster-inner"><span class="mscdek-cluster-count">${count}</span></div>',
    chosenClass: 'chosen',
    codeKey: 'mscdekCode',
    markerImgParams: {
      width: 18,
      height: 24,
      src: 'assets/components/ms_cdek2/img/marker.png'
    }
  }
};
