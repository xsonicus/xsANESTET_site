VersionX.grid.ResourcesWidget = function(config) {
    config = config || {};
    Ext.applyIf(config, {
        id: 'versionx-grid-resources-widget',
        baseParams: {
            action: 'mgr/objects/getlist',
            class: 'modResource',
        },
        tbar: [],
        columns: this.getColumns(),
        listeners: {
            afterrender: this.onAfterRender,
            scope: this
        },
        actionsColumnWidth: 10,
        paging: false,
        pageSize: 10,
    });
    VersionX.grid.ResourcesWidget.superclass.constructor.call(this,config);
};
Ext.extend(VersionX.grid.ResourcesWidget, VersionX.grid.Objects, {
    getColumns: function() {
        let columns = this.superclass().getColumns(),
            newColumns = [];

        columns.forEach(function(column) {
            if (['id','time_end','name','username'].includes(column.dataIndex)) {
                newColumns.push(column);
            }
        });

        return newColumns;
    },
    getMenu: function() {
        var m = [];
        m.push({
            text: _('versionx.widget.resources.update'),
            handler: this.updateResource
        });
        m.push({
            text: _('versionx.objects.view_details'),
            handler: this.viewDetails
        });
        return m;
    },
    updateResource: function() {
        window.location = '?a=resource/update&id=' + this.menu.record.principal
    },
    // Workaround to resize the grid when in a dashboard widget
    onAfterRender: function() {
    var cnt = Ext.getCmp('modx-content')
        // Dashboard widget "parent" (renderTo)
        ,parent = Ext.get('versionx-widget-resource-div');

    if (cnt && parent) {
        cnt.on('afterlayout', function(elem, layout) {
            this.setWidth(parent.getWidth());
        }, this);
    }
}
});
Ext.reg('versionx-grid-resources-widget', VersionX.grid.ResourcesWidget);