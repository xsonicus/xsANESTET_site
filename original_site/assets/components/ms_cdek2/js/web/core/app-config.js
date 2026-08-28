export const AppConfig = {
  modules: {
    storage: {
      path: '../modules/storage.js',
      className: 'StorageManager'
    },
    helpers: {
      path: '../modules/helpers.js',
      className: 'Helpers'
    },
    address: {
      path: '../modules/address.js',
      className: 'Address'
    },
    map: {
      path: '../modules/map.js',
      className: 'Map'
    },
    list: {
      path: '../modules/list.js',
      className: 'List'
    },
  },

  libraries: {},

  externals: {
    ms2: 'miniShop2',
    sendit: 'SendIt',
  }
};
