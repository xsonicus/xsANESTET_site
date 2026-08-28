mspyookassaPaymentCreate = function () {
    MODx.Ajax.request({
        url: mspyookassa.config.connectorUrl,
        params: {
            action: 'mgr/payment/create',
            order: data.id || 0,
        },
        listeners: {
            success: {
                fn: function (r) {
                    var record = r.data;

                    var w = Ext.getCmp('mspyookassa-window-payment');
                    if (w) {
                        w.hide().getEl().remove();
                    }
                    w = MODx.load({
                        xtype: 'mspyookassa-payment-window',
                        payment: 'create',
                        record: record,
                        self: this,
                    });
                    w.reset();
                    w.setValues(record);
                    w.show();

                }, scope: this
            },
            failure: {
                fn: function (r) {
                    if (r.message) {
                        MODx.msg.alert(_('error'), r.message);
                    }
                }, scope: this
            },
        }
    });
};


mspyookassaPaymentGet = function () {
    MODx.Ajax.request({
        url: mspyookassa.config.connectorUrl,
        params: {
            action: 'mgr/payment/get',
            order: data.id || 0,
        },
        listeners: {
            success: {
                fn: function (r) {
                    var record = r.data;

                    var w = Ext.getCmp('mspyookassa-window-payment');
                    if (w) {
                        w.hide().getEl().remove();
                    }
                    w = MODx.load({
                        xtype: 'mspyookassa-payment-window',
                        payment: 'get',
                        record: record,
                        self: this,
                    });
                    w.reset();
                    w.setValues(record);
                    w.show();
                }, scope: this
            },
            failure: {
                fn: function (r) {
                    if (r.message) {
                        MODx.msg.alert(_('error'), r.message);
                    }
                }, scope: this
            },
        }
    });
};

mspyookassaPaymentAccept = function (btn) {
    Ext.MessageBox.confirm(
        _('mspyookassa_payment_accept'),
        _('mspyookassa_payment_action_accept'),
        function (val) {
            if (val === 'yes') {

                if (btn) {
                    btn.setDisabled(true);
                }

                Ext.getCmp('minishop2-grid-orders').getEl().mask(_('loading'), 'x-mask-loading');

                MODx.Ajax.request({
                    url: mspyookassa.config.connectorUrl,
                    params: {
                        action: 'mgr/payment/accept',
                        order: data.id || 0,
                    },
                    listeners: {
                        success: {
                            fn: function (r) {

                                var w = Ext.getCmp('mspyookassa-window-payment');
                                if (w) {
                                    w.hide().getEl().remove();
                                }
                                Ext.getCmp('minishop2-grid-orders').getStore().reload();
                                Ext.getCmp('minishop2-grid-orders').getEl().unmask();
                            }, scope: this
                        },
                        failure: {
                            fn: function (r) {
                                if (r.message) {
                                    MODx.msg.alert(_('error'), r.message);
                                }
                                Ext.getCmp('minishop2-grid-orders').getEl().unmask();
                            }, scope: this
                        },
                    }
                });
            }
        },
        this
    );
};


mspyookassaPaymentReject = function (btn) {
    Ext.MessageBox.confirm(
        _('mspyookassa_payment_reject'),
        _('mspyookassa_payment_action_reject'),
        function (val) {
            if (val === 'yes') {

                if (btn) {
                    btn.setDisabled(true);
                }

                Ext.getCmp('minishop2-grid-orders').getEl().mask(_('loading'), 'x-mask-loading');

                MODx.Ajax.request({
                    url: mspyookassa.config.connectorUrl,
                    params: {
                        action: 'mgr/payment/reject',
                        order: data.id || 0,
                    },
                    listeners: {
                        success: {
                            fn: function (r) {

                                var w = Ext.getCmp('mspyookassa-window-payment');
                                if (w) {
                                    w.hide().getEl().remove();
                                }
                                Ext.getCmp('minishop2-grid-orders').getStore().reload();
                                Ext.getCmp('minishop2-grid-orders').getEl().unmask();
                            }, scope: this
                        },
                        failure: {
                            fn: function (r) {
                                if (r.message) {
                                    MODx.msg.alert(_('error'), r.message);
                                }
                                Ext.getCmp('minishop2-grid-orders').getEl().unmask();
                            }, scope: this
                        },
                    }
                });
            }
        },
        this
    );
};

mspyookassaFormatDate = function (string) {
    if (string && ((date = new Date(string)) !== 'Invalid Date')) {
        return date.strftime(MODx.config['mspyookassa_date_format'] || "%d.%m.%y %H:%M");
    }
    else {
        return '';
    }
};

Ext.override(miniShop2.grid.Orders, {

    initComponent: function () {
        miniShop2.grid.Orders.superclass.initComponent.call(this);
        this.mspyookassa = mspyookassa;
    },

    getMenu: function (grid, rowIndex) {
        miniShop2.grid.Orders.superclass.getMenu.call(this, grid, rowIndex);

        var ids = this._getSelectedIds();
        data = grid.getStore().getAt(rowIndex).data;
        selected = grid.getSelectionModel().getSelections();
        if (selected.length > 1 || !(selected = selected[0])) {
            return;
        }
        if (parseInt(selected['id']) === parseInt(data['id'])) {
            data = selected['json'];
        }

        var mspyookassa = this.mspyookassa;
        if (data['payment_id'] && !mspyookassa.tools.inArray(data['payment_id'], mspyookassa.config.miniShop2.payment.ids)) {
            return;
        }

        MODx.Ajax.request({
            url: mspyookassa.config.connectorUrl,
            params: {
                action: 'mgr/order/action',
                id: data.id || 0,
            },
            listeners: {
                success: {
                    fn: function (r) {
                        var menu = [];
                        if (r.data && r.data.actions) {
                            menu = mspyookassa.tools.getMenu(r.data.actions, this, ids);
                        }
                        if (menu.length) {
                            this.menu.add(menu);
                        }
                    }, scope: this
                },
            }
        });
    },

    mspyookassaPaymentCreate: function () {
        return mspyookassaPaymentCreate();
    },

    mspyookassaPaymentGet: function () {
        return mspyookassaPaymentGet();
    },

    mspyookassaPaymentAccept: function () {
        return mspyookassaPaymentAccept();
    },

    mspyookassaPaymentReject: function () {
        return mspyookassaPaymentReject();
    },

});


mspyookassa.window.Payment = function (config) {
    config = config || {};

    Ext.applyIf(config, {
        id: 'mspyookassa-window-payment',
        title: _('mspyookassa_payment'),
        width: 600,
        autoHeight: true,
        fields: this.getFields(config),
        buttons: this.getButtons(config),
        bodyCssClass: 'mspyookassa-window',
    });
    mspyookassa.window.Payment.superclass.constructor.call(this, config);
    this.on('hide', function () {
        var w = this;
        window.setTimeout(function () {
            w.close();
        }, 200);
    });

    this.on('afterrender', function () {
        var record = config.record ? config.record : {};
        var object = record.object ? record.object : {};
        if (object && object.metadata && parseInt(object.metadata.test)) {
            var tmp= _('mspyookassa_payment_test');
            this.setTitle(this.title + ' <span style="color: brown" ext:qtip="'+tmp+'" ext:qclass="mspyookassa-qtip">' + _('mspyookassa_test') + '</span>');
        }
    });
};
Ext.extend(mspyookassa.window.Payment, MODx.Window, {

    getFields: function (config) {
        return [{
            xtype: 'hidden',
            name: 'order'
        }, {
            xtype: 'displayfield',
            name: 'object_html',
            style: 'white-space: pre-line;',
            anchor: '100%',
            height: 300,
            hideLabel: true,
        }];
    },

    getButtons: function (config) {
        var buttons = tooltip = [];
        var record = config.record ? config.record : {};
        var object = record.object ? record.object : {};
        var payment = config.payment ? config.payment : '';

        switch (payment) {
            case 'create':
                tooltip = [_('mspyookassa_pay')];
                if (object['confirmation'] && (confirmation_url = object['confirmation']['confirmation_url'])) {
                    tooltip.push(confirmation_url);
                }

                if (object['confirmation']) {
                    buttons.push({
                        text: _('mspyookassa_pay'),
                        tooltip: tooltip.join('<br>'),
                        style: 'background-color: #32AB9A;color: #fff;',
                        scope: this,
                        handler: function () {
                            if (object && object.confirmation && object.confirmation.confirmation_url) {
                                window.open(object.confirmation.confirmation_url);
                            }
                            return false;
                        },
                    });
                }

                break;
            case 'get':
                tooltip = [_('mspyookassa_payment_accept')];
                if (object['expires_at'] && (expires_at = mspyookassaFormatDate(object['expires_at']))) {
                    tooltip.push(_('mspyookassa_expires') + ': ' + expires_at);
                }

                buttons.push({
                    text: _('mspyookassa_accept'),
                    tooltip: tooltip.join('<br>'),
                    //cls: 'primary-button',
                    style: 'background-color: #32AB9A;color: #fff;',
                    disabled: object.status === 'waiting_for_capture' ? false : true,
                    scope: this,
                    handler: function (btn) {
                        return mspyookassaPaymentAccept(btn);
                    },
                });

                tooltip = [_('mspyookassa_payment_reject')];
                if (object['expires_at'] && (expires_at = mspyookassaFormatDate(object['expires_at']))) {
                    tooltip.push(_('mspyookassa_expires') + ': ' + expires_at);
                }

                buttons.push({
                    text: _('mspyookassa_reject'),
                    tooltip: tooltip.join('<br>'),
                    style: 'background-color: #e86b6b;color: #fff;',
                    disabled: object.status === 'waiting_for_capture' ? false : true,
                    scope: this,
                    handler: function (btn) {
                        return mspyookassaPaymentReject(btn);
                    },
                });
                break;
        }

        buttons.push({
            text: config.cancelBtnText || _('cancel'),
            scope: this,
            handler: function () {
                config.closeAction !== 'close' ? this.hide() : this.close();
            }
        });

        return buttons;
    },

    getListeners: function (config) {
        return Ext.applyIf(config.listeners || {}, {});
    },

    loadDropZones: function () {

    }

});
Ext.reg('mspyookassa-payment-window', mspyookassa.window.Payment);