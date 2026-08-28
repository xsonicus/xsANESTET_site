var mspyookassa = function (config) {
    config = config || {};
    mspyookassa.superclass.constructor.call(this, config);
};
Ext.extend(mspyookassa, Ext.Component, {
    page: {}, window: {}, grid: {}, tree: {}, panel: {}, combo: {}, config: {}, view: {}, tools: {}
});
Ext.reg('mspyookassa', mspyookassa);

mspyookassa = new mspyookassa();