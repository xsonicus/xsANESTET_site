(function ($) {
    "use strict";

    var msFavoritesConfig = {
        service: 'msfavorites',
        version: document.head.querySelector('meta[name="msfavorites:version"]').content,
        ctx: document.head.querySelector('meta[name="msfavorites:ctx"]').content,
        actionUrl: document.head.querySelector('meta[name="msfavorites:actionUrl"]').content
    };

    var indexOf = [].indexOf || function (item) {
        for (var i = 0, l = this.length; i < l; i++) {
            if (i in this && this[i] === item) return i;
        }
        return -1;
    };
    var hasProp = {}.hasOwnProperty;
    var slice = [].slice;

    var bind = function (fn, me) {
        return function () {
            return fn.apply(me, arguments);
        };
    };

    var camelize = function (str) {
        return str.replace(/(-|\.)(\w)/g, function (match, symbol) {
            return symbol.toUpperCase();
        });
    };
    var uncamelize = function (str) {
        return str.replace(/[A-Z]/g, function (symbol, index) {
            return (index == 0 ? '' : '-') + symbol.toLowerCase();
        });
    };

    var setOptions = function ($node, ns, options) {
        var prefix, msfavorites;

        if (typeof ns == 'undefined') {
            ns = $.fn.msfavorites.defaults.ns;
        }

        prefix = camelize(ns);
        msfavorites = $node.data('msFavorites');

        $.each(options, function (index, value) {
            $node.data(prefix + '-' + index, value);
        });

        if (msfavorites) {
            switch (prefix) {
                case 'data':
                    msfavorites.data = $.extend(true, msfavorites.data, options);
                    break;
                case 'options':
                    msfavorites.options = $.extend(true, msfavorites.options, options);
                    break;
            }
        }

        return options;
    };

    var getOptions = function ($node, ns) {
        var prefix, options;

        if (typeof ns == 'undefined') {
            ns = $.fn.msfavorites.defaults.ns;
        }

        prefix = camelize(ns);
        options = $node.data(prefix) || {};

        $.each($node.data(), function (index, value) {
            if (index.indexOf(prefix) === 0) {
                var key = uncamelize(index.replace(prefix, ''));
                if (key.length > 0) {
                    options[key] = value;
                }
            }
        });

        return options;
    };

    var newGuid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    var inArray = function (needle, haystack) {
        for (var key in haystack) {
            if (haystack[key] == needle) return true;
        }

        return false;
    };


    var runAction = function (action, bind) {
        if (typeof action == 'function') {
            return action.apply(bind, Array.prototype.slice.call(arguments, 2));
        } else if (typeof action == 'object') {
            for (var i in action) {
                if (action.hasOwnProperty(i)) {
                    var response = action[i].apply(bind, Array.prototype.slice.call(arguments, 2));
                    if (response === false) {
                        return false;
                    }
                }
            }
        }
        return true;
    };

    var Module, moduleKeywords, msFavorites;
    moduleKeywords = ['extended', 'included'];

    Module = (function () {
        function Module() {
        }

        Module.extend = function (obj) {
            var key, ref, value;
            for (key in obj) {
                value = obj[key];
                if (indexOf.call(moduleKeywords, key) < 0) {
                    this[key] = value;
                }
            }
            if ((ref = obj.extended) != null) {
                ref.apply(this);
            }
            return this;
        };

        Module.include = function (obj) {
            var key, ref, value;
            for (key in obj) {
                value = obj[key];
                if (indexOf.call(moduleKeywords, key) < 0) {
                    this.prototype[key] = value;
                }
            }
            if ((ref = obj.included) != null) {
                ref.apply(this);
            }
            return this;
        };

        return Module;

    })();

    msFavorites = function (element, options) {

        this.defaults = $.fn.msfavorites.defaults;
        this.selectors = $.fn.msfavorites.selectors;

        this.$body = $('body');
        this.$element = $(element);
        this.$parent = this.$element.closest(this.selectors.parent);
        if (this.$parent.length < 1) {
            this.$parent = $('body');
        }


        this.options = $.extend(true, {},
            getOptions(this.$parent),
            options
        );

        this.data = $.extend(true, {
                service: msFavoritesConfig.service,
                ctx: msFavoritesConfig.ctx,
                list: 'default',
                type: 'resource'
            },
            getOptions(this.$parent, 'data'),
            getOptions(this.$element, 'data')
        );


        if (!this.data.list) {
            this.data.list = 'default';
        }
        if (!this.data.type) {
            this.data.type = 'resource';
        }

        this.cacheKey = this.data.list + '.' + this.data.type;

    };

    msFavorites.prototype = {
        constructor: msFavorites,

        init: function () {
            this.processSuccess = bind(this.processSuccess, this);
            this.processFailure = bind(this.processFailure, this);
            this.processAction = bind(this.processAction, this);
            //this.getFavoritesList = bind(this.getFavoritesList, this);
            //this.setFavoritesList = bind(this.setFavoritesList, this);
            this.addMethodAction = bind(this.addMethodAction, this);
            this.removeMethodAction = bind(this.removeMethodAction, this);
        },

        getStorage: function (cacheKey) {
            var storage = this.$body.data('msFavoritesStorage') || {};

            if (cacheKey != null) {
                return storage[cacheKey] ? storage[cacheKey] : null;
            } else {
                return storage;
            }
        },

        setStorage: function (cacheKey, cacheData) {
            var storage = this.$body.data('msFavoritesStorage') || {};

            if (cacheKey != null) {
                storage[cacheKey] = cacheData;
            } else {
                storage = cacheData;
            }
            this.$body.data('msFavoritesStorage', storage);
        },

        loadFavorites: function (again) {
            var load = [];

            $($.fn.msfavorites.selectors.main).each(function (idx, el) {
                var $el = $(el), _id = $el.data('data-id') || '', _list = $el.data('data-list') || 'default',
                    _type = $el.data('data-type') || 'resource', _key = $el.data('data-key') || '';

                // для старого вызова где указан "id" вместо "key"
                if (!_key && !!_id) {
                    _key = _id;
                }

                // выставляем ветке вниз значения по умоланию
                $.each($el.find($.fn.msfavorites.selectors.total).not('[data-data-list]'), (function (_this) {
                    return function () {
                        var $this = $(this);
                        $this.data('data-list', _list);
                        $this.attr('data-data-list', _list);
                    };
                })(this));
                $.each($el.find($.fn.msfavorites.selectors.total).not('[data-data-type]'), (function (_this) {
                    return function () {
                        var $this = $(this);
                        $this.data('data-type', _type);
                        $this.attr('data-data-type', _type);
                    };
                })(this));

                $.each($el.find($.fn.msfavorites.selectors.totalUser).not('[data-data-list]'), (function (_this) {
                    return function () {
                        var $this = $(this);
                        $this.data('data-list', _list);
                        $this.attr('data-data-list', _list);
                    };
                })(this));
                $.each($el.find($.fn.msfavorites.selectors.totalUser).not('[data-data-type]'), (function (_this) {
                    return function () {
                        var $this = $(this);
                        $this.data('data-type', _type);
                        $this.attr('data-data-type', _type);
                    };
                })(this));

                if (_key) {
                    $.each($el.find($.fn.msfavorites.selectors.totalUser).not('[data-data-key]'), (function (_this) {
                        return function () {
                            var $this = $(this);
                            $this.data('data-key', _key);
                            $this.attr('data-data-key', _key);
                        };
                    })(this));
                }


                $el.data('data-key', _key);
                $el.attr('data-data-key', _key);
                $el.data('data-list', _list);
                $el.attr('data-data-list', _list);
                $el.data('data-type', _type);
                $el.attr('data-data-type', _type);


                load[_list + '|' + _type] = {
                    'list': _list,
                    'type': _type
                };
            });


            // выставляем значения по умоланию для необработанных элементов
            $.each($(document).find($.fn.msfavorites.selectors.total).not('[data-data-type]'), (function (_this) {
                return function () {
                    var $this = $(this);
                    $this.data('data-type', 'resource');
                    $this.attr('data-data-type', 'resource');
                };
            })(this));
            $.each($(document).find($.fn.msfavorites.selectors.totalAll).not('[data-data-type]'), (function (_this) {
                return function () {
                    var $this = $(this);
                    $this.data('data-type', 'resource');
                    $this.attr('data-data-type', 'resource');
                };
            })(this));


            var i, key, data, method = 'get';
            for (i in load) {
                if (!load.hasOwnProperty(i)) {
                    continue;
                }

                key = load[i]['list'] + '|' + load[i]['type'];

                if (!again && (data = this.getStorage(key))) {
                    this.updateFavorites(data, method);
                } else {

                    data = $.extend(true, {service: msFavoritesConfig.service, ctx: msFavoritesConfig.ctx}, {
                        action: 'favorites/multiple',
                        method: method,
                        list: load[i]['list'],
                        type: load[i]['type']
                    });

                    $.ajax({
                        url: msFavoritesConfig.actionUrl,
                        type: 'get',
                        dataType: 'json',
                        cache: false,
                        data: data,
                    }).done((function (_this) {
                        return function (r) {
                            key = r.data.meta.list + '|' + r.data.meta.type;
                            _this.processSuccess(r, data);
                            _this.setStorage(key, r.data);
                            _this.updateFavorites(r.data, method);
                        };
                    })(this)).fail((function (_this) {
                        return function (r) {
                            key = r.data.meta.list + '|' + r.data.meta.type;
                            _this.processFailure(r, data);
                            _this.setStorage(key, r.data);
                        };
                    })(this));
                }

            }
        },

        updateFavorites: function (data, method, request) {
            data = data || {};

            var result = data.result || {};
            var meta = data.meta || {};
            var keys = result.keys || {};
            var users = result.users || {};

            var $wrapper, $favorites, $total, $totalAll, $totalUser;

            $wrapper = this.$parent.parent();
            $favorites = $($.fn.msfavorites.selectors.main);
            $total = $($.fn.msfavorites.selectors.total);
            $totalAll = $($.fn.msfavorites.selectors.totalAll);
            $totalUser = $($.fn.msfavorites.selectors.totalUser);


            // set voted
            if (true) {
                $.each($favorites.not(this.defaults.cls.load), (function (_this) {
                    return function () {
                        var $this = $(this), _list = $this.data('data-list'), _type = $this.data('data-type'),
                            _key = $this.data('data-key');

                        if (meta.list == _list && meta.type == _type) {
                            if (keys[_key]) {
                                $this.addClass(_this.defaults.cls.load).addClass(_this.defaults.cls.voted);
                            } else {
                                $this.addClass(_this.defaults.cls.load).removeClass(_this.defaults.cls.voted);
                            }
                        }
                    };
                })(this));
            }

            // set total
            if (true) {
                $.each($total, (function (_this) {
                    return function () {
                        var $this = $(this), _list = $this.data('data-list'), _type = $this.data('data-type');

                        if (meta.list === _list && meta.type === _type) {
                            $this.addClass(_this.defaults.cls.load);
                            /* fix wow.min.js:2 Uncaught TypeError: a.getElementsByClassName is not a function */
                            setTimeout(function () {
                                $this.text(meta.total);
                                $this.attr('data-value', meta.total);
                            }, 200);
                        }
                    };
                })(this));
            }

            // set totalAll
            if (true) {
                $.each($totalAll, (function (_this) {
                    return function () {
                        var $this = $(this), _list = $this.data('data-list'), _type = $this.data('data-type');

                        if (meta.list === _list && meta.type === _type) {
                            $this.addClass(_this.defaults.cls.load);
                            if (!$this.hasClass(_this.defaults.cls.visible)) {
                                if (meta.total < 1) {
                                    $this.hide();
                                } else {
                                    $this.show();
                                }
                            }
                        }


                    };
                })(this));
            }

            // set totalUser
            if (true) {
                $.each($totalUser, (function (_this) {
                    return function () {
                        var $this = $(this), _list = $this.data('data-list'), _type = $this.data('data-type'),
                            _key = $this.data('data-key');

                        if (meta.list === _list && meta.type === _type) {
                            $this.addClass(_this.defaults.cls.load);
                            var count = users[_key] || 0;
                            setTimeout(function () {
                                $this.text(count);
                                $this.attr('data-value', count);
                            }, 200);

                        }
                    };
                })(this));
            }

            switch (true) {
                // remove favorite
                case this.options.mode === 'list' && method === 'remove':
                    this.$parent.remove();
                    // reload page
                    if ($wrapper.find(this.selectors.parent).length < 1) {
                        location.reload();
                    }
                    break;
                // clear favorite
                case method === 'clear':
                    var $this, list;
                    $this = this.$element;
                    list = $this.data('data-list');
                    // reload page
                    if (list && data.meta.list && !data.result.keys.length) {
                        this.$parent.remove();
                        location.reload();
                    }
                    break;
                // clear favorite
                case method === 'share':
                    if (result.link && data.props && data.props.reload == '1') {
                        document.location.href = result.link;
                    }
                    break;

            }

            //$favorites.not(this.defaults.cls.load).addClass(this.defaults.cls.load);
        },

        processAction: function () {
            var e, method, data;

            if (this.$element.hasClass(this.defaults.cls.action)) {
                method = this.data.method;
            } else if (this.$element.hasClass(this.defaults.cls.voted)) {
                method = 'remove';
            } else {
                method = 'add';
            }

            data = $.extend(true, this.data, {
                action: 'favorites/multiple',
                method: method
            });

            e = $.Event($.fn.msfavorites.PROCESS_ACTION);
            this.$element.trigger(e, [data]);
            if (e.isDefaultPrevented()) {
                return;
            }

            this.$element.removeClass(this.defaults.cls.load).removeClass(this.defaults.cls.voted);

            $.ajax({
                url: msFavoritesConfig.actionUrl,
                type: 'post',
                dataType: 'json',
                cache: false,
                data: data,
            }).done((function (_this) {
                return function (r) {
                    r.data.meta = r.data.meta || {};
                    var key = (r.data.meta.list || '') + '|' + (r.data.meta.type || '');

                    _this.processSuccess(r, data);
                    _this.setStorage(key, r.data);
                    _this.updateFavorites(r.data, method);
                };
            })(this)).fail((function (_this) {
                return function (r) {
                    _this.processFailure(r, data);
                };
            })(this));
        },

        processSuccess: function (r, data) {
            var e, message;

            e = $.Event($.fn.msfavorites.PROCESS_SUCCESS);
            this.$element.trigger(e, [r, data]);
            if (e.isDefaultPrevented()) {
                return;
            }

            if (!r.success) {
                message = r.message;
                if (!message) {
                    message = 'error unknown';
                }

                console.log(message);
            }

            runAction($.fn.msfavorites.methodActions['success'], this, r);

            return true;
        },

        processFailure: function (r, data) {
            var e, message;

            e = $.Event($.fn.msfavorites.PROCESS_FAILURE);
            this.$element.trigger(e, [r, data]);
            if (e.isDefaultPrevented()) {
                return;
            }

            message = r.responseJSON;
            if (!message) {
                message = 'error unknown';
            }

            console.log(message);

            runAction($.fn.msfavorites.methodActions['failure'], this, r.responseJSON);

            return false;
        },

        addMethodAction: function (path, name, func) {
            if (typeof func != 'function') {
                return false;
            }
            if (!$.fn.msfavorites.methodActions[path]) {
                $.fn.msfavorites.methodActions[path] = {};
            }
            $.fn.msfavorites.methodActions[path][name] = func;

            return true;
        },

        removeMethodAction: function (path, name) {
            if (!$.fn.msfavorites.methodActions[path]) {
                $.fn.msfavorites.methodActions[path] = {};
            }

            delete $.fn.msfavorites.methodActions[path][name];

            return true;
        },

    };


    $.fn.msfavorites = function () {
        var args, option;
        option = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];

        return this.each(function () {
            var $this, $parent, msfavorites, options;

            $this = $(this);
            msfavorites = $this.data('msFavorites');
            if (!msfavorites) {

                $parent = $this.closest($.fn.msfavorites.selectors.parent);
                if ($parent.length < 1) {
                    $parent = $('body');
                }

                options = $.extend(true, {},
                    getOptions($parent),
                    getOptions($this)
                );


                switch (options['mode']) {
                    default:
                        msfavorites = new msFavorites(this, options);
                        break;
                }

                if (msfavorites) {
                    $this.data('msFavorites', msfavorites);
                    msfavorites.init();
                }

            }

            if (typeof option === 'string') {
                return msfavorites[option].apply(msfavorites, args);
            }
        })
    };


    /* event constants */
    $.fn.msfavorites.CONTENT_CHANGE = 'msfavorites:content-change.msfavorites';
    $.fn.msfavorites.PROCESS_SUCCESS = 'msfavorites:process-success.msfavorites';
    $.fn.msfavorites.PROCESS_FAILURE = 'msfavorites:process-failure.msfavorites';
    $.fn.msfavorites.PROCESS_ACTION = 'msfavorites:process-action.msfavorites';


    $.fn.msfavorites.defaults = {
        ns: 'msfavorites',
        cls: {
            load: 'load',
            voted: 'voted',
            visible: 'visible',
            action: 'msfavorites-action',
            animation: 'msfavorites-animation'
        },
        timeout: 300,
    };


    $.fn.msfavorites.selectors = {
        main: '.' + $.fn.msfavorites.defaults.ns,
        /*count: '.' + $.fn.msfavorites.defaults.ns + '-count',*/
        total: '.' + $.fn.msfavorites.defaults.ns + '-total',
        totalAll: '.' + $.fn.msfavorites.defaults.ns + '-total-all',
        totalUser: '.' + $.fn.msfavorites.defaults.ns + '-total-user',
        parent: '.' + $.fn.msfavorites.defaults.ns + '-parent',
        actionClick: '[data-click]',
        actionFormSubmit: '[data-formsubmit]',
        actionFormChange: '[data-formchange]',
    };


    $.fn.msfavorites.methodActions = {
        success: {
            'animation': function (r) {
                if (this.data && this.data.method && this.data.method === 'add') {
                    if (this.options && this.options.animation) {
                        var $total;

                        if (($total = $($.fn.msfavorites.selectors.totalAll).filter('[data-msfavorites-animation]').filter('[data-data-list="' + this.data.list + '"]')) && $total.length) {

                            var position = {start: this.$element.offset(), end: $total.offset()};
                            $('<img/>', {src: this.options.animation, class: this.defaults.cls.animation})
                                .css({
                                    'position': 'absolute',
                                    'z-index': '9999',
                                    'background-size': 'cover',
                                    top: position.start.top || 0,
                                    left: position.start.left || 0,
                                })
                                .appendTo('body')
                                .animate({
                                    top: position.end.top || 0,
                                    left: position.end.left || 0,
                                    opacity: 'toggle'
                                }, 1000, function () {
                                    $(this).remove();
                                });
                        }
                    }
                }
            }
        },
        failure: {
            'set.cls.load': function (r) {
                if (this.$element && this.defaults.cls) {
                    this.$element.addClass(this.defaults.cls.load);
                }
            },
            'miniShop2.Message.initialize': function (r) {
                if (typeof miniShop2 === 'object') {
                    miniShop2.Message.initialize();
                    if (r && !!r.message) {
                        miniShop2.Message.error(r.message);
                    }
                }
            },
        },
    };


    /** click */
    $(document).on('click', $.fn.msfavorites.selectors.main + $.fn.msfavorites.selectors.actionClick, function (e) {
        var $this = $(this);
        if ($this.is('a')) {
            e.preventDefault();
        }

        /** если страница не успела прогрузиться */
        if (!$this.hasClass($.fn.msfavorites.defaults.cls.load)) {
            return;
        }

        if ($this.is('form')) {
            var options = {};
            $.map($this.serializeArray() || [], function (n, i) {
                options[n['name']] = n['value'];
            });
            setOptions($this, 'data', options);
        }
        $this.msfavorites('processAction');
    });

    /* form submit */
    $(document).on('submit', $.fn.msfavorites.selectors.main + $.fn.msfavorites.selectors.actionFormSubmit, function (e) {
        var $this = $(this), options = {};
        e.preventDefault();

        $.map($this.serializeArray() || [], function (n, i) {
            options[n['name']] = n['value'];
        });
        setOptions($this, 'data', options);
        $this.msfavorites('processAction');
    });

    /* form change */
    $(document).on('change', $.fn.msfavorites.selectors.main + $.fn.msfavorites.selectors.actionFormChange, function (e) {
        var $this = $(this), options = {};
        e.preventDefault();

        $.map($this.serializeArray() || [], function (n, i) {
            options[n['name']] = n['value'];
        });
        setOptions($this, 'data', options);
        $this.msfavorites('processAction');
    });


    var timerId = 0;
    $(document).on($.fn.msfavorites.CONTENT_CHANGE, function (e, html) {
        if (html && typeof html === 'string' && html.match(new RegExp($.fn.msfavorites.defaults))) {
            $($.fn.msfavorites.selectors.main).msfavorites();
            if (timerId) {
                clearTimeout(timerId);
            }
            timerId = setTimeout(function () {
                timerId = 0;
                $('body').msfavorites('loadFavorites');
            }, 500);
        }
    });


    /*
    Fix https://modx.pro/components/12260#comment-140396

    $(window).on('load', function () {
        $('body').msfavorites('loadFavorites', true);
        $($.fn.msfavorites.selectors.main).msfavorites();

        $('body').on('DOMNodeInserted', function (event) {
            var html;
            if (event.target && (html = event.target.innerHTML) && typeof html === 'string' && html.match(new RegExp($.fn.msfavorites.defaults))) {
                $(document).trigger($.fn.msfavorites.CONTENT_CHANGE, jQuery.merge([html], arguments));
            }
        });
    });*/

    $(window).on('load', function () {
        $('body').msfavorites('loadFavorites', true);
        $($.fn.msfavorites.selectors.main).msfavorites();
        var observer = new MutationObserver(function (mutationsList) {
            for (var i = 0; i < mutationsList.length; i++) {
                var mutation = mutationsList[i];
                var target = mutation.target;
                if (mutation.type === 'childList' && target && target.innerHTML) {
                    var html = target.innerHTML;
                    if (typeof html === 'string' && html.match(new RegExp($.fn.msfavorites.defaults))) {
                        $(document).trigger($.fn.msfavorites.CONTENT_CHANGE, jQuery.merge([html], arguments));
                    }
                }
            }
        });
        observer.observe($('body')[0], {childList: true, subtree: true});
    });

    window.msFavorites = new msFavorites(null, msFavoritesConfig.options);

}(window.jQuery));


/* event example */
/*$(document).ready(function () {
 if (typeof msFavorites != 'undefined' && typeof miniShop2 != 'undefined') {
 msFavorites.addMethodAction('success', 'name_action', function(r){
 miniShop2.Message.initialize();

 var self = this;
 if (self.data && self.data.method == 'add') {
 miniShop2.Message.success('add');
 }
 if (self.data && self.data.method == 'remove') {
 miniShop2.Message.info('remove');
 }
 });
 }
 });*/

/* event example */
/*
 $(document).on('msfavorites:process-action.msfavorites', function (e, data) {
 console.log(data);

 });*/

/*(function ($) {
       jQuery.fn.originalHtml = jQuery.fn.html;
       jQuery.fn.html = function () {
           var currentHtml = this.originalHtml();
           if (arguments.length && jQuery.fn.originalHtml) {
               jQuery.fn.originalHtml.apply(this, arguments);
               this.trigger($.fn.msfavorites.CONTENT_CHANGE, jQuery.merge([currentHtml], arguments));
               return this;
           } else {
               return currentHtml;
           }
       };

       jQuery.fn.originalAppend = jQuery.fn.append;
       jQuery.fn.append = function () {
           var currentAppend = this.originalAppend();
           if (arguments.length && jQuery.fn.originalAppend) {
               jQuery.fn.originalAppend.apply(this, arguments);
               this.trigger($.fn.msfavorites.CONTENT_CHANGE, jQuery.merge([currentAppend.html()], arguments));
               return this;
           } else {
               return currentAppend;
           }
       };
   })(jQuery);*/
