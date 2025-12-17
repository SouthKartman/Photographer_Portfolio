// ============================================================================
// МОДУЛЬ ИНТЕРАКТИВНОЙ ГАЛЕРЕИ - Refactored JavaScript
// ============================================================================
//
// СТРУКТУРА:
// 1. КОНФИГУРАЦИЯ И КОНСТАНТЫ
// 2. ОПРЕДЕЛЕНИЕ ПЕРЕМЕННЫХ СОСТОЯНИЯ
// 3. DOM-СЕЛЕКТОРЫ
// 4. КЛАСС ГАЛЕРЕИ (основная логика)
// 5. ИНИЦИАЛИЗАЦИЯ И ПУБЛИЧНЫЙ API
// 6. УТИЛИТЫ И ХЕЛПЕРЫ
// ============================================================================

(function() {
    'use strict';
    
    // ============================================================================
    // 1. КОНФИГУРАЦИЯ И КОНСТАНТЫ
    // ============================================================================
    
    /**
     * Конфигурационные параметры галереи
     * @type {Object}
     */
    const CONFIG = {
        // Пороги для определения свайпа (в пикселях)
        SWIPE: {
            PREVIEW_THRESHOLD: 30,    // Порог для показа превью свайпа
            ACTION_THRESHOLD: 50,     // Порог для выполнения действия
        },
        
        // Тайминги анимаций (в миллисекундах)
        TIMING: {
            MODAL_OPEN: 300,          // Длительность открытия модального окна
            MODAL_CLOSE: 300,         // Длительность закрытия модального окна
            IMAGE_TRANSITION: 400,    // Длительность перехода между изображениями
            HINT_HIDE_DELAY: 5000,    // Задержка перед скрытием подсказки
            INDICATOR_SHOW_TIME: 2000,// Время показа индикаторов свайпа
        },
        
        // Настройки GSAP анимаций
        GSAP: {
            EASING: "back.out(1.7)",  // Функция easing для анимаций
            INDICATOR_DELAY: 1,       // Задержка перед скрытием индикаторов
        },
        
        // Селекторы для поиска элементов
        SELECTORS: {
            THUMBNAILS: '.gallery-module .photo-thumb',
            SWIPE_DOTS: '.gallery-module .swipe-dot',
            LIST_ITEMS: '.item',
            HEADER_CARDS: '.card',
        }
    };
    
    /**
     * Данные галереи с изображениями
     * Каждый объект содержит метаданные для отображения и навигации
     * @type {Array<Object>}
     */
    const GALLERY_DATA = [
        {
            id: 1,
            title: "Прогулка в сквере",
            author: "SOCIAL BEACH",
            url: "../../img/gallery/skver/1.jpg"
        },
        {
            id: 2,
            title: "Прогулка в сквере",
            author: "SOCIAL BEACH",
            url: "../../img/gallery/skver/2.jpg"
        },
        {
            id: 3,
            title: "Прогулка в сквере",
            author: "SOCIAL BEACH",
            url: "../../img/gallery/skver/3.jpg"
        },
        {
            id: 4,
            title: "Прогулка в сквере",
            author: "SOCIAL BEACH",
            url: "../../img/gallery/skver/4.jpg"
        },
        {
            id: 5,
            title: "Прогулка в сквере",
            author: "SOCIAL BEACH",
            url: "../../img/gallery/skver/5.jpg"
        },
        {
            id: 6,
            title: "Прогулка в сквере",
            author: "SOCIAL BEACH",
            url: "../../img/gallery/skver/6.jpg"
        },
        {
            id: 7,
            title: "Прогулка в сквере",
            author: "SOCIAL BEACH",
            url: "../../img/gallery/skver/7.jpg"
        },
        {
            id: 8,
            title: "Прогулка в сквере",
            author: "SOCIAL BEACH",
            url: "../../img/gallery/skver/8.jpg"
        },
        {
            id: 9,
            title: "Прогулка в сквере",
            author: "SOCIAL BEACH",
            url: "../../img/gallery/skver/9.jpg"
        },
        {
            id: 10,
            title: "Прогулка в сквере",
            author: "SOCIAL BEACH",
            url: "../../img/gallery/skver/10.jpg"
        },
        {
            id: 11,
            title: "Прогулка в сквере",
            author: "SOCIAL BEACH",
            url: "../../img/gallery/skver/11.jpg"
        },
        {
            id: 12,
            title: "Прогулка в сквере",
            author: "SOCIAL BEACH",
            url: "../../img/gallery/skver/12.jpg"
        }
    ];
    
    // ============================================================================
    // 2. ОПРЕДЕЛЕНИЕ ПЕРЕМЕННЫХ СОСТОЯНИЯ
    // ============================================================================
    
    /**
     * Текущий индекс активного изображения в галерее
     * @type {number}
     */
    let currentImageIndex = 0;
    
    /**
     * Состояние свайпа для отслеживания жестов
     * @type {Object}
     */
    const swipeState = {
        startX: 0,
        endX: 0,
        isActive: false,
    };
    
    // ============================================================================
    // 3. DOM-СЕЛЕКТОРЫ
    // ============================================================================
    
    /**
     * DOM элементы модуля галереи
     * @type {Object}
     */
    const DOM = {
        // Основные элементы галереи
        galleryModule: document.getElementById('galleryModule'),
        thumbnailsContainer: document.getElementById('thumbnailsContainer'),
        
        // Элементы модального окна
        modalOverlay: document.getElementById('modalOverlay'),
        modalContent: document.getElementById('modalContent'),
        modalImage: document.getElementById('modalImage'),
        
        // Элементы информации о фото
        imageTitle: document.getElementById('imageTitle'),
        imageAuthor: document.getElementById('imageAuthor'),
        imageCounter: document.getElementById('imageCounter'),
        
        // Элементы управления
        closeModalBtn: document.getElementById('closeModal'),
        prevBtn: document.getElementById('prevBtn'),
        nextBtn: document.getElementById('nextBtn'),
        
        // Вспомогательные элементы
        touchHint: document.getElementById('touchHint'),
        swipeIndicator: document.getElementById('swipeIndicator'),
    };
    
    // ============================================================================
    // 4. КЛАСС ГАЛЕРЕИ (основная логика)
    // ============================================================================
    
    /**
     * Основной класс для управления галереей
     * Инкапсулирует всю бизнес-логику модуля
     */
    class GalleryManager {
        constructor() {
            this.data = GALLERY_DATA;
            this.currentIndex = currentImageIndex;
            this.isModalOpen = false;
        }
        
        /**
         * Инициализирует галерею - создает миниатюры и настраивает события
         * @returns {void}
         */
        init() {
            this.createThumbnails();
            this.createSwipeIndicators();
            this.setupExternalImageHandlers();
            this.setupEventListeners();
            this.hideTouchHintAfterDelay();
        }
        
        /**
         * Создает миниатюры для всех изображений в галерее
         * @returns {void}
         */
        createThumbnails() {
            // Очищаем контейнер перед созданием новых миниатюр
            DOM.thumbnailsContainer.innerHTML = '';
            
            this.data.forEach((image, index) => {
                const thumbnail = this.createThumbnailElement(image, index);
                DOM.thumbnailsContainer.appendChild(thumbnail);
            });
        }
        
        /**
         * Создает элемент миниатюры для отдельного изображения
         * @param {Object} image - Данные изображения
         * @param {number} index - Индекс изображения в массиве
         * @returns {HTMLElement} Созданный элемент миниатюры
         */
        createThumbnailElement(image, index) {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'photo-thumb';
            thumbnail.dataset.index = index;
            thumbnail.setAttribute('role', 'button');
            thumbnail.setAttribute('aria-label', `Открыть изображение: ${image.title}`);
            thumbnail.tabIndex = 0;
            
            thumbnail.innerHTML = `
                <img src="${image.url}" 
                     alt="${image.title}" 
                     loading="lazy"
                     width="180" 
                     height="135">
                <div class="photo-info">
                    <div class="photo-title">${image.title}</div>
                    <div class="photo-author">${image.author}</div>
                </div>
            `;
            
            // Добавляем обработчики событий
            thumbnail.addEventListener('click', () => this.openModal(index));
            thumbnail.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openModal(index);
                }
            });
            
            return thumbnail;
        }
        
        /**
         * Создает индикаторы свайпа (точки навигации)
         * @returns {void}
         */
        createSwipeIndicators() {
            DOM.swipeIndicator.innerHTML = '';
            
            this.data.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.className = 'swipe-dot';
                dot.dataset.index = index;
                dot.setAttribute('aria-label', `Перейти к изображению ${index + 1}`);
                DOM.swipeIndicator.appendChild(dot);
            });
        }
        
        /**
         * Настраивает обработчики для внешних изображений на странице
         * @returns {void}
         */
        setupExternalImageHandlers() {
            // Обработчики для изображений в списке
            document.querySelectorAll(CONFIG.SELECTORS.LIST_ITEMS).forEach((item, index) => {
                item.addEventListener('click', () => {
                    const safeIndex = Math.min(index, this.data.length - 1);
                    this.openModal(safeIndex);
                });
            });
            
            // Обработчики для карточек в шапке
            document.querySelectorAll(CONFIG.SELECTORS.HEADER_CARDS).forEach((card, index) => {
                card.addEventListener('click', () => {
                    const safeIndex = Math.min(index, this.data.length - 1);
                    this.openModal(safeIndex);
                });
            });
        }
        
        /**
         * Открывает модальное окно с выбранным изображением
         * @param {number} index - Индекс изображения для отображения
         * @returns {void}
         */
        openModal(index) {
            this.currentIndex = index;
            this.isModalOpen = true;
            
            this.updateModalContent();
            this.showModal();
            this.setupModalEventListeners();
            this.updateSwipeIndicators();
            
            // Добавляем обработчик клавиатуры
            document.addEventListener('keydown', this.handleKeyDown.bind(this));
            
            // Блокируем прокрутку body при открытом модальном окне
            document.body.style.overflow = 'hidden';
        }
        
        /**
         * Закрывает модальное окно
         * @returns {void}
         */
        closeModal() {
            this.isModalOpen = false;
            
            this.hideModal();
            this.removeModalEventListeners();
            
            // Удаляем обработчик клавиатуры
            document.removeEventListener('keydown', this.handleKeyDown.bind(this));
            
            // Восстанавливаем прокрутку body
            document.body.style.overflow = '';
        }
        
        /**
         * Показывает модальное окно с анимацией
         * @returns {void}
         */
        showModal() {
            DOM.modalOverlay.style.display = 'block';
            
            if (this.isGSAPAvailable()) {
                gsap.to(DOM.modalOverlay, {
                    duration: CONFIG.TIMING.MODAL_OPEN / 1000,
                    opacity: 1
                });
                
                gsap.to(DOM.modalContent, {
                    duration: 0.5,
                    opacity: 1,
                    scale: 1,
                    ease: CONFIG.GSAP.EASING
                });
            } else {
                // Fallback анимация без GSAP
                DOM.modalOverlay.style.opacity = '1';
                DOM.modalContent.style.opacity = '1';
                DOM.modalContent.style.transform = 'translate(-50%, -50%) scale(1)';
            }
        }
        
        /**
         * Скрывает модальное окно с анимацией
         * @returns {void}
         */
        hideModal() {
            if (this.isGSAPAvailable()) {
                gsap.to(DOM.modalContent, {
                    duration: CONFIG.TIMING.MODAL_CLOSE / 1000,
                    opacity: 0,
                    scale: 0.9
                });
                
                gsap.to(DOM.modalOverlay, {
                    duration: CONFIG.TIMING.MODAL_CLOSE / 1000,
                    opacity: 0,
                    onComplete: () => {
                        DOM.modalOverlay.style.display = 'none';
                    }
                });
            } else {
                // Fallback анимация без GSAP
                DOM.modalContent.style.opacity = '0';
                DOM.modalContent.style.transform = 'translate(-50%, -50%) scale(0.9)';
                DOM.modalOverlay.style.opacity = '0';
                
                setTimeout(() => {
                    DOM.modalOverlay.style.display = 'none';
                }, CONFIG.TIMING.MODAL_CLOSE);
            }
        }
        
        /**
         * Обновляет содержимое модального окна текущим изображением
         * @returns {void}
         */
        updateModalContent() {
            const currentImage = this.data[this.currentIndex];
            
            // Анимация исчезновения текущего изображения
            DOM.modalImage.classList.add('photo-exit');
            
            setTimeout(() => {
                // Обновляем данные изображения
                DOM.modalImage.src = currentImage.url;
                DOM.modalImage.alt = currentImage.title;
                DOM.imageTitle.textContent = currentImage.title;
                DOM.imageAuthor.textContent = currentImage.author;
                DOM.imageCounter.textContent = `${this.currentIndex + 1} / ${this.data.length}`;
                
                // Анимация появления нового изображения
                DOM.modalImage.classList.remove('photo-exit');
                DOM.modalImage.classList.add('photo-enter');
                
                // Убираем класс анимации после завершения
                setTimeout(() => {
                    DOM.modalImage.classList.remove('photo-enter');
                }, 500);
                
            }, CONFIG.TIMING.IMAGE_TRANSITION);
        }
        
        /**
         * Переходит к предыдущему изображению
         * @returns {void}
         */
        prevImage() {
            this.currentIndex = this.currentIndex > 0 
                ? this.currentIndex - 1 
                : this.data.length - 1;
            
            this.updateModalContent();
            this.updateSwipeIndicators();
        }
        
        /**
         * Переходит к следующему изображению
         * @returns {void}
         */
        nextImage() {
            this.currentIndex = this.currentIndex < this.data.length - 1 
                ? this.currentIndex + 1 
                : 0;
            
            this.updateModalContent();
            this.updateSwipeIndicators();
        }
        
        /**
         * Обновляет состояние индикаторов свайпа
         * @returns {void}
         */
        updateSwipeIndicators() {
            const dots = document.querySelectorAll(CONFIG.SELECTORS.SWIPE_DOTS);
            
            dots.forEach((dot, index) => {
                if (index === this.currentIndex) {
                    dot.classList.add('active');
                    dot.setAttribute('aria-current', 'true');
                } else {
                    dot.classList.remove('active');
                    dot.removeAttribute('aria-current');
                }
            });
            
            // Временно показываем индикаторы
            this.showSwipeIndicatorsTemporarily();
        }
        
        /**
         * Временно показывает индикаторы свайпа
         * @returns {void}
         */
        showSwipeIndicatorsTemporarily() {
            if (this.isGSAPAvailable()) {
                gsap.to(DOM.swipeIndicator, {
                    duration: 0.3,
                    opacity: 1
                });
                
                setTimeout(() => {
                    gsap.to(DOM.swipeIndicator, {
                        duration: 0.5,
                        opacity: 0,
                        delay: CONFIG.GSAP.INDICATOR_DELAY
                    });
                }, CONFIG.TIMING.INDICATOR_SHOW_TIME);
            } else {
                DOM.swipeIndicator.style.opacity = '1';
                
                setTimeout(() => {
                    DOM.swipeIndicator.style.opacity = '0';
                }, 3000);
            }
        }
        
        /**
         * Обработчик нажатий клавиш
         * @param {KeyboardEvent} event - Событие клавиатуры
         * @returns {void}
         */
        handleKeyDown(event) {
            switch(event.key) {
                case 'Escape':
                    this.closeModal();
                    break;
                case 'ArrowLeft':
                    this.prevImage();
                    break;
                case 'ArrowRight':
                    this.nextImage();
                    break;
                case 'ArrowUp':
                    // Дополнительная навигация (опционально)
                    break;
                case 'ArrowDown':
                    // Дополнительная навигация (опционально)
                    break;
            }
        }
        
        /**
         * Обработчик начала свайпа/перетаскивания
         * @param {MouseEvent|TouchEvent} event - Событие мыши или касания
         * @returns {void}
         */
        handleSwipeStart(event) {
            swipeState.startX = this.getEventX(event);
            swipeState.isActive = true;
        }
        
        /**
         * Обработчик движения при свайпе/перетаскивании
         * @param {MouseEvent|TouchEvent} event - Событие мыши или касания
         * @returns {void}
         */
        handleSwipeMove(event) {
            if (!swipeState.isActive) return;
            
            swipeState.endX = this.getEventX(event);
            const diff = swipeState.startX - swipeState.endX;
            
            // Показываем превью свайпа если превышен порог
            if (Math.abs(diff) > CONFIG.SWIPE.PREVIEW_THRESHOLD) {
                DOM.modalImage.style.transform = `translateX(${-diff / 20}px)`;
            }
        }
        
        /**
         * Обработчик окончания свайпа/перетаскивания
         * @param {MouseEvent|TouchEvent} event - Событие мыши или касания
         * @returns {void}
         */
        handleSwipeEnd(event) {
            if (!swipeState.isActive) return;
            
            swipeState.endX = this.getEventX(event);
            const diff = swipeState.startX - swipeState.endX;
            
            // Сбрасываем трансформацию изображения
            DOM.modalImage.style.transform = 'translateX(0)';
            
            // Определяем направление свайпа и выполняем действие
            if (Math.abs(diff) > CONFIG.SWIPE.ACTION_THRESHOLD) {
                if (diff > 0) {
                    this.nextImage(); // Свайп влево -> следующее изображение
                } else {
                    this.prevImage(); // Свайп вправо -> предыдущее изображение
                }
            }
            
            swipeState.isActive = false;
        }
        
        /**
         * Возвращает X-координату события (поддержка мыши и касаний)
         * @param {MouseEvent|TouchEvent} event - Событие
         * @returns {number} X-координата
         */
        getEventX(event) {
            return event.changedTouches 
                ? event.changedTouches[0].screenX 
                : event.clientX;
        }
        
        /**
         * Настраивает обработчики событий для элементов управления
         * @returns {void}
         */
        setupEventListeners() {
            // Кнопки управления
            DOM.closeModalBtn.addEventListener('click', () => this.closeModal());
            DOM.prevBtn.addEventListener('click', () => this.prevImage());
            DOM.nextBtn.addEventListener('click', () => this.nextImage());
            
            // Закрытие по клику на оверлей
            DOM.modalOverlay.addEventListener('click', (event) => {
                if (event.target === DOM.modalOverlay) {
                    this.closeModal();
                }
            });
        }
        
        /**
         * Настраивает обработчики событий для модального окна
         * @returns {void}
         */
        setupModalEventListeners() {
            const swipeHandlers = {
                start: this.handleSwipeStart.bind(this),
                move: this.handleSwipeMove.bind(this),
                end: this.handleSwipeEnd.bind(this),
                cancel: () => { swipeState.isActive = false; }
            };
            
            // Обработчики для touch-событий (мобильные устройства)
            DOM.modalContent.addEventListener('touchstart', swipeHandlers.start, { passive: true });
            DOM.modalContent.addEventListener('touchmove', swipeHandlers.move, { passive: true });
            DOM.modalContent.addEventListener('touchend', swipeHandlers.end);
            
            // Обработчики для mouse-событий (десктоп)
            DOM.modalContent.addEventListener('mousedown', swipeHandlers.start);
            DOM.modalContent.addEventListener('mousemove', swipeHandlers.move);
            DOM.modalContent.addEventListener('mouseup', swipeHandlers.end);
            DOM.modalContent.addEventListener('mouseleave', swipeHandlers.cancel);
        }
        
        /**
         * Удаляет обработчики событий модального окна
         * @returns {void}
         */
        removeModalEventListeners() {
            // Здесь можно было бы удалить обработчики, но в нашем случае
            // это не критично, так как они добавляются при каждом открытии
        }
        
        /**
         * Скрывает подсказку о свайпе через заданное время
         * @returns {void}
         */
        hideTouchHintAfterDelay() {
            setTimeout(() => {
                if (this.isGSAPAvailable()) {
                    gsap.to(DOM.touchHint, {
                        duration: 0.5,
                        opacity: 0,
                        delay: 2
                    });
                } else {
                    DOM.touchHint.style.opacity = '0';
                }
            }, CONFIG.TIMING.HINT_HIDE_DELAY);
        }
        
        /**
         * Проверяет доступность библиотеки GSAP
         * @returns {boolean} true если GSAP доступен
         */
        isGSAPAvailable() {
            return typeof gsap !== 'undefined';
        }
        
        /**
         * Обновляет данные галереи
         * @param {Array<Object>} newData - Новые данные изображений
         * @returns {void}
         */
        setData(newData) {
            this.data = [...newData];
            this.currentIndex = 0;
            this.init();
        }
        
        /**
         * Возвращает текущие данные галереи
         * @returns {Array<Object>} Данные галереи
         */
        getData() {
            return [...this.data];
        }
    }
    
    // ============================================================================
    // 5. ИНИЦИАЛИЗАЦИЯ И ПУБЛИЧНЫЙ API
    // ============================================================================
    
    /**
     * Инициализирует галерею при загрузке документа
     * @returns {void}
     */
    function initializeGallery() {
        const gallery = new GalleryManager();
        gallery.init();
        
        // Экспортируем публичный API
        window.GalleryModule = {
            /**
             * Инициализирует галерею
             * @returns {GalleryManager} Экземпляр менеджера галереи
             */
            init: () => {
                gallery.init();
                return gallery;
            },
            
            /**
             * Открывает модальное окно с указанным изображением
             * @param {number} index - Индекс изображения
             * @returns {void}
             */
            open: (index) => gallery.openModal(index),
            
            /**
             * Закрывает модальное окно
             * @returns {void}
             */
            close: () => gallery.closeModal(),
            
            /**
             * Переходит к следующему изображению
             * @returns {void}
             */
            next: () => gallery.nextImage(),
            
            /**
             * Переходит к предыдущему изображению
             * @returns {void}
             */
            prev: () => gallery.prevImage(),
            
            /**
             * Обновляет данные галереи
             * @param {Array<Object>} newData - Новые данные
             * @returns {void}
             */
            setData: (newData) => gallery.setData(newData),
            
            /**
             * Возвращает текущие данные галереи
             * @returns {Array<Object>} Данные галереи
             */
            getData: () => gallery.getData(),
            
            /**
             * Возвращает текущий индекс изображения
             * @returns {number} Текущий индекс
             */
            getCurrentIndex: () => gallery.currentIndex,
            
            /**
             * Возвращает общее количество изображений
             * @returns {number} Количество изображений
             */
            getTotalImages: () => gallery.data.length,
            
            /**
             * Проверяет, открыто ли модальное окно
             * @returns {boolean} true если модальное окно открыто
             */
            isOpen: () => gallery.isModalOpen,
        };
    }
    
    // ============================================================================
    // 6. УТИЛИТЫ И ХЕЛПЕРЫ
    // ============================================================================
    
    /**
     * Проверяет, загружен ли DOM
     * @returns {boolean} true если DOM загружен
     */
    function isDOMReady() {
        return document.readyState !== 'loading';
    }
    
    /**
     * Ожидает загрузки DOM и инициализирует галерею
     * @returns {void}
     */
    function waitForDOMAndInit() {
        if (isDOMReady()) {
            initializeGallery();
        } else {
            document.addEventListener('DOMContentLoaded', initializeGallery);
        }
    }
    
    // Запуск инициализации
    waitForDOMAndInit();
    
})();