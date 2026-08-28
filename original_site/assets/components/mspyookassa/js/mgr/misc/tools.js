mspyookassa.tools.getMenu = function (actions, grid, selected) {

    var menu = [];
    var cls, icon, title, action = '';

    for (var i in actions) {
        if (!actions.hasOwnProperty(i)) {
            continue;
        }

        var a = actions[i];
        if (!a['menu']) {
            if (a == '-') {
                menu.push('-');
            }
            continue;
        } else if (/^sep/i.test(a['action'])) {
            menu.push('-');
            continue;
        }

        if (selected.length > 1) {
            if (!a['multiple']) {
                continue;
            } else if (typeof(a['multiple']) === 'string') {
                a['title'] = a['multiple'];
            }
        }

        cls = a['cls'] ? a['cls'] : '';
        icon = a['icon'] ? a['icon'] : '';
        title = a['title'] ? a['title'] : a['title'];
        action = a['action'] ? grid[a['action']] : '';

        menu.push({
            handler: action,
            text: String.format(
                '<span class="{0}"><i class="x-menu-item-icon {1}"></i>{2}</span>',
                cls, icon, title
            ),
            scope: grid
        });
    }

    return menu;
};

mspyookassa.tools.renderActions = function (value, props, row) {
    var res = [];
    var cls, icon, title, action, item = '';
    for (var i in row.data.actions) {
        if (!row.data.actions.hasOwnProperty(i)) {
            continue;
        }
        var a = row.data.actions[i];
        if (!a['button']) {
            continue;
        }

        cls = a['cls'] ? a['cls'] : '';
        icon = a['icon'] ? a['icon'] : '';
        action = a['action'] ? a['action'] : '';
        title = a['title'] ? a['title'] : '';

        item = String.format(
            '<li class="{0}"><button class="btn btn-default {1}" action="{2}" title="{3}"></button></li>',
            cls, icon, action, title
        );

        res.push(item);
    }

    return String.format(
        '<ul class="mspyookassa-row-actions">{0}</ul>',
        res.join('')
    );
};


mspyookassa.tools.handleChecked = function (checkbox) {
    var workCount = checkbox.workCount;
    if (!!!workCount) {
        workCount = 1;
    }
    var hideLabel = checkbox.hideLabel;
    if (!!!hideLabel) {
        hideLabel = false;
    }

    var checked = checkbox.getValue();
    var nextField = checkbox.nextSibling();

    for (var i = 0; i < workCount; i++) {
        if (checked) {
            nextField.show().enable();
        }
        else {
            nextField.hide().disable();
        }
        nextField.hideLabel = hideLabel;
        nextField = nextField.nextSibling();
    }
    return true;
};


mspyookassa.tools.renderReplace = function(value, replace, color) {
    if (!value) {
        return '';
    } else if (!replace) {
        return value;
    }
    if (!color) {
        return String.format('<span>{0}</span>', replace);
    }
    return String.format('<span class="mspyookassa-render-replace" style="color: #{1}">{0}</span>', replace, color);
};


mspyookassa.tools.arrayIntersect = function (array1, array2) {
    var result = array1.filter(function (n) {
        return array2.indexOf(n) !== -1;
    });

    return result;
};

mspyookassa.tools.inArray = function (needle, haystack) {
    for (key in haystack) {
        if(haystack[key] == needle) return true;
    }

    return false;
};


mspyookassa.tools.empty = function (value) {
    return (typeof(value) == 'undefined' || value == 0 || value === null || value === false || (typeof(value) == 'string' && value.replace(/\s+/g, '') == '') || (typeof(value) == 'object' && value.length == 0));
};

mspyookassa.tools.formatDate = function (string) {
    if (string && ((date = new Date(string)) !== 'Invalid Date')) {
        return date.strftime(MODx.config['ms2_date_format']);
    }
    else {
        return '';
    }
};