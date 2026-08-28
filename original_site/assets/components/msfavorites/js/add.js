$(document).ready(function () {
    if (typeof msFavorites != 'undefined' && typeof miniShop2 != 'undefined') {
        msFavorites.addMethodAction('success', 'name_action', function (r) {
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
});


$(document).ready(function () {
    if (typeof msFavorites != 'undefined') {
        msFavorites.addMethodAction('success', 'share_action', function (r) {
            var self = this;

            if (self.data && self.data.method == 'share' && r.data.result && r.data.result.link) {
                console.log(r.data.result.link);// ссылка
            }

        });
    }
});

/*
<template id="msfavorites-list-template">
    <form class="dropdown-item m-0 keep-open"
        data-data-type="resource"
        data-data-id="0"
        data-formsubmit
        method="post">

        <label>
            <input type="checkbox"> Список 3
        </label>
    </form>
</template>
 */

$(document).ready(function() {
    $('.dropdown-msfavorites').on('hidden.bs.dropdown', function (e) {
        if (e.clickEvent.target.classList.contains('keep-open')) {
            $('.dropdown-msfavorites .dropdown-toggle').dropdown('show');
        }
    });


    /* $('.dropdown-menu').on('click', '.keep-open', function(event) {
         $('.dropdown-msfavorites .dropdown-toggle').dropdown('show');
        event.stopPropagation();

     });

     $('.dropdown-item.keep-open').on('click', function (event) {
         $('.dropdown-msfavorites .dropdown-toggle').dropdown('show');
     });*/

});

$(document).ready(function () {
    if (typeof msFavorites != 'undefined') {
        msFavorites.addMethodAction('success', 'add_list', function (r) {
            if (!r.success) {
                return;
            }

            var self = this;
            const template = document.getElementById('msfavorites-list-template');
            if (template && self.data && self.data.method == 'add') {

                var list = '-';
                if (r.data.props.list) {
                    list = r.data.props.list;
                }

                if (list !== '-' && ($el = self.$element[0]) && ($menu = $el.closest('.dropdown-menu'))) {

                    if (!$menu.querySelector(`[data-data-list="` + list + `"]`)) {

                        const $template = document.importNode(template.content, true);
                        const $form = $template.querySelector('div');

                        $form.setAttribute('data-data-list', list);
                        if ((label = $form.querySelector('.list-name'))) {
                            label.textContent = " " + list;
                        }

                        //$form.classList.add('voted');

                        $menu.insertBefore($form, $menu.querySelector('.dropdown-divider'));

                        $el.querySelector('input').value = "";
                        $el.classList.remove('voted');
                    }
                }
            }
        });
    }
});
