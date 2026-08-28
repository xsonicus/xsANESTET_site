Ext.override(miniShop2.window.UpdatePayment, {

    mspyookassaOriginals: {
        getFields: miniShop2.window.UpdatePayment.prototype.getFields
    },

    getFields: function (config) {
        var fields = this.mspyookassaOriginals.getFields.call(this, config);

        if (!mspyookassa.tools.inArray(config.record.id, mspyookassa.config.miniShop2.payment.ids)) {
            return fields;
        }

        var tabs = this.mspyookassaGetTabs(config);
        fields.filter(function (row) {
            if (row.xtype == 'modx-tabs') {
                row.items.push(tabs);
            }
        });

        return fields;

    },

    mspyookassaGetTabs: function (config) {
        return [{
            title: _('mspyookassa_payment_add'),
            bodyStyle: 'margin: 5px 0;',
            items: [{
                layout: 'column',
                items: [{
                    columnWidth: 1,
                    layout: 'form',
                    defaults: {msgTarget: 'under', anchor: '100%'},
                    items: [{
                        xtype: 'textarea',
                        fieldLabel: _('mspyookassa_properties'),
                        msgTarget: 'under',
                        name: 'properties',
                        height: '110',
                        allowBlank: true,
                        setValue: function (value) {
                            MODx.Ajax.request({
                                url: miniShop2.config.connector_url,
                                params: {
                                    action: 'mgr/settings/payment/get',
                                    id: config.record.id
                                },
                                listeners: {
                                    success: {
                                        fn: function (response) {
                                            value = response.object.properties || {};
                                            return Ext.form.TextField.superclass.setValue.call(this, Ext.util.JSON.encode(value));
                                        },
                                        scope: this
                                    },
                                    failure: {
                                        fn: function (response) {
                                            value = {};
                                            return Ext.form.TextField.superclass.setValue.call(this, Ext.util.JSON.encode(value));
                                        },
                                        scope: this
                                    }
                                }
                            });
                        }
                    }]
                }]
            }]
        }];
    }

});