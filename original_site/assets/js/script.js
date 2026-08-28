/* search top */

$(document).ready(function () {
    // Обработчик для кнопок открытия/закрытия
    $('.header-content__actions-search, .header-content__search').click(function (e) {
        e.stopPropagation();

        // Если кликнули именно на крестик - только закрываем
        if ($(this).hasClass('header-content__search-cross')) { 
            $('.header-content__search').removeClass('open');
        } else {
            // Для остальных кнопок - переключаем состояние
            $('.header-content__search').toggleClass('open');
        }
    });

    // Предотвращаем закрытие при клике внутри области поиска
    $('.header-content__search').click(function (e) {
        e.stopPropagation();
    });

    // Закрытие при клике вне области поиска
    $(document).click(function () {
        $('.header-content__search').removeClass('open');
    });

    // Дополнительно: закрытие по нажатию ESC
    $(document).keyup(function (e) {
        if (e.keyCode === 27) { // Escape key
            $('.header-content__search').removeClass('open');
        }
    });
});

// Функция для создания и инициализации слайдера
function createSlider(selector) {
    const wrapper = $(`${selector} .swiper-wrapper`);
    if (!wrapper) {
        console.error(`Слайдер не найден: ${selector}`);
        return null;
    }

    const config = {
        slidesPerView: 1,
        direction: 'horizontal',
        spaceBetween: 30,
        navigation: {
            nextEl: `${selector}-next`,
            prevEl: `${selector}-prev`,
        },
        breakpoints: {
            320: {
                slidesPerView: 2,
            },
            768: {
                slidesPerView: 4,
            },
        }
    };

    new Swiper(selector, config);
}

// Инициализация всех слайдеров
function initializeAllSliders() {
    createSlider('.now__slider');
    createSlider('.season__slider');
    createSlider('.interesting__slider');
    createSlider('.discount__slider');

    new Swiper('.new-product__slider', {
        navigation: {
            nextEl: '.product-slider-next',
            prevEl: '.product-slider-prev',
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            320: {
                spaceBetween: 16,
                slidesPerView: 2,
            },
            768: {
                spaceBetween: 20,
                slidesPerView: 4,
            },
        }
    });

    new Swiper('.hero-slider', {
        direction: 'horizontal',
        loop: false,
        slidesPerView: 1,
        spaceBetween: 0,

        pagination: {
            el: '.hero-slider-pagination',
            clickable: true,
        },

        breakpoints: {
            390: {
                slidesPerView: 1.02,
            },
            1024: {
                slidesPerView: 1.05,
            }
        },

        // Navigation arrows
        navigation: {
            nextEl: '.hero-slider-next',
            prevEl: '.hero-slider-prev',
        },

        // And if we need scrollbar
        scrollbar: {
            el: '.swiper-scrollbar',
        },

        watchSlidesProgress: true,
        watchSlidesVisibility: true,
        resistance: false,
        preventClicks: false,
        preventClicksPropagation: false
    });

    new Swiper('.home-partners__slider', {
        direction: 'horizontal',
        navigation: {
            nextEl: '.home-partners-slider-next',
            prevEl: '.home-partners-slider-prev',
        },
        breakpoints: {
            320: {
                spaceBetween: 12,
                slidesPerView: 3,
            },
            768: {
                spaceBetween: 12,
                slidesPerView: 4,
            },
            1024: {
                spaceBetween: 19,
                slidesPerView: 6,
            },
        }
    });

    new Swiper('.selection__slider', {
        direction: 'horizontal',
        autoHeight: true,
        navigation: {
            nextEl: '.selection-slider-next',
            prevEl: '.selection-slider-prev',
        },
        breakpoints: {
            320: {
                slidesPerView: 1,
            },
            768: {
                spaceBetween: 20,
                slidesPerView: 2.4,
            },
        },
    });

    new Swiper('.sales__slider', {
        slidesPerView: 1,
        direction: 'horizontal',
        spaceBetween: 30,
        navigation: {
            nextEl: '.sales-slider-next',
            prevEl: '.sales-slider-prev',
        },
        breakpoints: {
            640: {
                slidesPerView: 1,
            },
            768: {
                slidesPerView: 1,
            },
            1024: {
                slidesPerView: 1,
            },
        }
    });

    const gallerySlider = new Swiper(".card__slider-gallery", {
        direction: "horizontal",
        spaceBetween: 16,
        slidesPerView: 3,
        // spaceBetween: "5.16%",
        freeMode: true,
        watchSlidesProgress: true,
        mousewheel: {
            forceToAxis: true,
            releaseOnEdges: true, // Разрешает скролл страницы при достижении краев
        },

        breakpoints: {
            768: {
                direction: "vertical",
                spaceBetween: 16,
                slidesPerView: 8,
            },
        },
    });

    // Инициализация основного слайдера
    new Swiper(".card__slider", {
        direction: "horizontal",
        slidesPerView: 1,
        spaceBetween: 10,
        freeMode: true,
        mousewheel: {
            forceToAxis: true,
            releaseOnEdges: true, // Разрешает скролл страницы при достижении краев
        },

        thumbs: {
            swiper: gallerySlider,
        },
        breakpoints: {
            768: {
                direction: "vertical",
                slidesPerView: 1,
            },
        },
    });

    new Swiper(".atmosphere__slider", {
        loop: false,
        direction: "horizontal",
        spaceBetween: 8,
        slidesPerView: 2.1,
        navigation: {
            nextEl: '.atmosphere-slider-next',
            prevEl: '.atmosphere-slider-prev',
        },
        breakpoints: {
            576: {
                spaceBetween: 24,
                slidesPerView: 2.1,
            },
        },

        scrollbar: {
            el: '.atmosphere-scrollbar',
            hide: false,
            draggable: true,
            snapOnRelease: true,
            dragSize: 'auto'
        },
    });

    new Swiper(".representative__slider", {
        slidesPerView: 1.4,
        loop: false,
        direction: "horizontal",
        spaceBetween: 8,
        breakpoints: {
            576: {
                spaceBetween: 20,
                slidesPerView: 4,
            },
        },
    });
}

$(document).ready(function () {
    initializeAllSliders();
    
    // маска для телефона
    $('input[name="phone"]').inputmask({
        mask: ['+7(999)-999-99-99', '8(999)-999-99-99'],
        jitMasking: 3,
        showMaskOnHover: true,
        autoUnmask: true,
    });
    
    // корзина
    $('input[name="delivery"]').on('change', function () {
        let address_wrapper = $('.address_wrapper');
        if ($(this).val() == 1) { // Самовывоз
            address_wrapper.hide();
        } else if ($(this).val() == 2) { // Курьер По Москве
            address_wrapper.show();
            address_wrapper.find('.index_field').hide();
            address_wrapper.find('.text_address_field').show();
        } else if ($(this).val() == 3) { // CDEK до двери
            address_wrapper.show();
            address_wrapper.find('.index_field').show();
            address_wrapper.find('.text_address_field').show();
        } else if ($(this).val() == 4) { // CDEK на пункт выдачи заказа
            address_wrapper.show();
            address_wrapper.find('.index_field').show();
            address_wrapper.find('.text_address_field').hide();
        } else if ($(this).val() == 6) { // OZON на пункт выдачи заказа
            address_wrapper.show();
            address_wrapper.find('.index_field').hide();
            address_wrapper.find('.text_address_field').show();
        }
        address_wrapper.find('input[name="index"]').val('').trigger('change');
        address_wrapper.find('textarea[name="text_address"]').val('').trigger('change');
    });
    
    // подключение уведомлений для магазина
    if (typeof miniShop2 === "undefined" || typeof Notyf === "undefined") {
        console.warn("miniShop2 или Notyf не подключен!");
        return;
    } else {
        const notyf = new Notyf({
            duration: 5000,
            position: { x: "right", y: "bottom" },
            dismissible: false,
        });

        miniShop2.Message = {
            success: function (message) {
                notyf.success(message);
            },
            error: function (message) {
                notyf.error(message);
            },
            info: function (message) {
                notyf.open({ type: "info", message: message });
            },
            close: function () {
            },
        };
    }
});


/* menu burger */

$(document).ready(function () {
    $('#menuToggle').on('click', function (e) {
        e.stopPropagation();

        $(this).toggleClass('active');
        $('#dropdownMenu').toggleClass('active');

        const $menuText = $(this).find('.menu-text');
        if ($(this).hasClass('active')) {
            $menuText.text('Закрыть');
        } else {
            $menuText.text('МЕНЮ');
        }
    });

    // Закрытие меню при клике вне его области
    $(document).on('click', function (e) {
        if (!$(e.target).closest('.menu-toggle-wrapper').length) {
            $('#menuToggle').removeClass('active');
            $('#dropdownMenu').removeClass('active');
            $('#menuToggle').find('.menu-text').text('МЕНЮ');
        }
    });

    // Обработка клика по пунктам меню
    $('.menu-item').on('click', function () {
        const itemText = $(this).text();
        // alert('Вы выбрали: ' + itemText);

        // Закрываем меню после выбора
        $('#menuToggle').removeClass('active');
        $('#dropdownMenu').removeClass('active');
        $('#menuToggle').find('.menu-text').text('МЕНЮ');
    });
});

/* custom input asterisk */

$(document).ready(function () {
    const $phone = $('#phone');
    const $placeholder = $phone.next('.custom-placeholder');

    $phone.on('input focus blur', function () {
        $placeholder.css('opacity',
            $(this).val().trim() || $(this).is(':focus') ? '0' : '.5'
        );
    }).trigger('blur');
});

/* accordion */

document.addEventListener('DOMContentLoaded', function () {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', function () {
            const content = this.nextElementSibling;
            const arrow = this.querySelector('.arrow');

            // Закрываем все открытые элементы
            accordionHeaders.forEach(otherHeader => {
                if (otherHeader !== this) {
                    const otherContent = otherHeader.nextElementSibling;
                    const otherArrow = otherHeader.querySelector('.arrow');

                    otherHeader.classList.remove('active');
                    otherArrow.classList.remove('active');
                    otherContent.style.maxHeight = null;
                }
            });

            // Переключаем текущий элемент
            this.classList.toggle('active');
            arrow.classList.toggle('active');

            if (content.style.maxHeight) {
                // Закрываем
                content.style.maxHeight = null;
            } else {
                // Открываем с плавной анимацией
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
});

/* accordion questions */

$(document).ready(function () {
   $('.questions__header, .questions__cross').on('click', function () {
        $(this).parent().toggleClass('active');
    });
});

$(document).ready(function () {
    // Обработчик клика по вкладкам на главной в новинках
    $('.new-product__tabs .tab').on('click', function(){
        $('.new-product__tabs .tab').removeClass('active');
        $(this).addClass("active");
        $('.new-product__tabs-item').removeClass('active');
        $("#" + $(this).data("tab")).addClass("active");
    });
    
    // Обработчик клика по вкладкам в доставке
    $(".default-tabs-nav li").click(function () {
        // Удаляем класс active у всех вкладок и контента
        $(".default-tabs-nav li").removeClass("active");
        $(".default-tab-pane").removeClass("active");

        // Добавляем класс active текущей вкладке
        $(this).addClass("active");

        // Находим соответствующий контент и показываем его
        let tabId = $(this).data("tab");
        $("#" + tabId).addClass("active");
    });
});

/* diler map */

// jQuery код
$(document).ready(function () {
    
    // Обработчик клика на город в списке
    $('#citiesList li').on('click', function () {
        $('#citiesList li').removeClass('active');
        $(this).addClass('active');
        
        $('.partners__diler-overlay').removeClass('active');
        $('.partners__diler-overlay[data-city="' + $(this).data('city') + '"]').addClass('active');
    });

    // Обработчик кнопки "Вернуться к карте"
    $('.partners__back-btn').on('click', function () {
        $('.partners__diler-overlay').removeClass('active');
    });

    // TODO с этим НЕ работает клик по метке на карте
    // Закрытие по клику вне контента (опционально)
    /*$(document).on('click', function (e) {
        if ($(e.target).closest('.partners__diler-content').length === 0 &&
                $(e.target).closest('#citiesList li').length === 0 &&
                $('.partners__diler-overlay').hasClass('active')) {
            $('.partners__diler-overlay').removeClass('active');
        }
    });*/

    // Закрытие по ESC
    $(document).on('keyup', function (e) {
        if (e.keyCode === 27 && $('.partners__diler-overlay').hasClass('active')) {
            $('.partners__diler-overlay').removeClass('active');
        }
    });

    // Обработчик поиска городов
    $('.partners-cities__form input').on('input', function () {
        const searchText = $(this).val().toLowerCase();

        if (searchText.length > 0) {
            $('#citiesList li').each(function () {
                const cityText = $(this).text().toLowerCase();
                if (cityText.includes(searchText)) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        } else {
            $('#citiesList li').show();
        }
    });

    // Предотвращаем отправку формы поиска
    $('.partners-cities__form').on('submit', function (e) {
        e.preventDefault();
    });
    
    // яндекс карта
	function initMap() {
		if($('#map_agents').length) {
			myMap = new ymaps.Map('map_agents', {
				center: [55.755773, 37.617761],
				zoom: 0,
			});

			$('.partners__diler-list').each(function() {
			    let cityId = $(this).data('city');
			    
				// Добавляем все точки
				let coordinates = $(this).data('coordinates');
				coordinates = coordinates.split(',').map(v => parseFloat(v.trim()));
				
				let placemark = new ymaps.Placemark([coordinates[0], coordinates[1]]);
                
                // клик по метке
                placemark.events.add('click', function () {
                    $('#citiesList li').removeClass('active');
                    $('#citiesList li[data-city="' + cityId + '"]').addClass('active');
                    
                    $('.partners__diler-overlay').removeClass('active');
                    $('.partners__diler-overlay[data-city="' + cityId + '"]').addClass('active');
                });
            
                myMap.geoObjects.add(placemark);
			});

			myMap.setBounds(myMap.geoObjects.getBounds());
		}
	}
	ymaps.ready(initMap);
});

/* partners modal */

$(document).ready(function () {
    // Открытие модального окна
    $('.modal-open').click(function () {
        const modalId = $(this).data('modal');
        $(`#${modalId}`).addClass('active');
        $('body').css('overflow', 'hidden');
    });

    // Закрытие модального окна
    $('.close-modal, .modal-overlay').click(function (e) {
        if ($(e.target).hasClass('modal-overlay') || $(e.target).hasClass('close-modal')) {
            $('.modal-overlay').removeClass('active');
            $('body').css('overflow', 'auto');
        }
    });

    // Успешная отправка формы
    $(document).on('fetchit:success', function(e){
        const {form} = e.detail;
        
        if(form.id == 'dealer-form' || form.id == 'ambassador-form') {
            $('#'+form.id).hide();
            $('#'+form.id).parent().find('.success-message').fadeIn();
            
            setTimeout(function () {
                $('.modal-overlay').removeClass('active');
                $('body').css('overflow', 'auto');
                
                setTimeout(function () {
                    $('#'+form.id).show();
                    $('#'+form.id).parent().find('.success-message').hide();
                }, 500);
            }, 3000);
        }
    });
});

/* modal filter */

$(document).ready(function () {
    // Открытие модального окна
    $('.filter_form__title').on('click', function () {
        $('.filter_form__in').addClass('active');
        $('.filter-modal-overlay').addClass('active');
        $('body').css('overflow', 'hidden');
    });

    // Закрытие модального окна
    function closeModal() {
        $('.filter_form__in').removeClass('active');
        $('.filter-modal-overlay').removeClass('active');
        $('body').css('overflow', 'auto');
        // Закрываем все dropdown при закрытии модалки
        //$('.filter-group').removeClass('open');
    }

    // Закрытие по крестику
    $('.filter-modal-close').on('click', closeModal);

    // Закрытие по клику на затемненную область
    $('.filter-modal-overlay').on('click', closeModal);

    // Закрытие по ESC
    $(document).on('keydown', function (e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    $('.filter-main-btn').on('click', function (e) {
        e.stopPropagation();
        $(this).parent('.filter-group').toggleClass('open');
    });

    // Закрытие dropdown сортировки при клике вне его
    $(document).on('click', function (e) {
        if (!$(e.target).closest('.filter-dropdown').length && !$(e.target).closest('.filter-main-btn').length) {
            $('.filter_form > .filter-group').removeClass('open');
        }
    });
    
    // кастомная сортировка для каталога
    if (typeof(mSearch2) !== "undefined") {
        mSearch2.initialized = false;
        mSearch2.handleSort = function() {
            var params = this.Hash.get();
            if (params.sort) {
                let parts = params.sort.split(':');
                let key = parts.slice(0, -1).join(':'); // Всё до последнего :
                let dir = parts.at(-1); // Последний элемент
                let textSort = $('.mse2_sort a[data-sort="' + key + '"][data-dir="' + dir + '"]').html();
                $('.mse2_sort__name').html(textSort);
            }
            $(document).off('click', this.options.sort_link);
            $(document).on('click', '.mse2_sort a', function() {
        		$('.mse2_sort__name').text($(this).html())
                
                var sort = $(this).data('sort');
                sort += mse2Config.method_delimeter + $(this).data('dir');
                mse2Config.sort = (sort != mse2Config.start_sort) ? sort : '';
                var params = mSearch2.getFilters();
                delete params.page;
                console.log(params);
                mSearch2.Hash.set(params);
                location.reload();
                //mSearch2.load(params);
            });
        }
        mSearch2.initialize('body');
    }
});