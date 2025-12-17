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

// ============================================================================
// МОДУЛЬ ИНТЕРАКТИВНОЙ ГАЛЕРЕИ - Универсальная версия
// ============================================================================

(function() {
    'use strict';
    
    // ============================================================================
    // 1. КОНФИГУРАЦИЯ И КОНСТАНТЫ
    // ============================================================================
    
    const CONFIG = {
        // Пороги для определения свайпа
        SWIPE: {
            PREVIEW_THRESHOLD: 30,
            ACTION_THRESHOLD: 50,
        },
        
        // Тайминги анимаций
        TIMING: {
            MODAL_OPEN: 300,
            MODAL_CLOSE: 300,
            IMAGE_TRANSITION: 400,
            HINT_HIDE_DELAY: 5000,
            INDICATOR_SHOW_TIME: 2000,
        },
        
        // Настройки GSAP
        GSAP: {
            EASING: "back.out(1.7)",
            INDICATOR_DELAY: 1,
        },
        
        // Селекторы для сбора изображений
        SELECTORS: {
            GALLERY_IMAGES: '.gallery__item img',
            ALL_CLICKABLE_IMAGES: 'img[data-gallery]',
            DEFAULT_SELECTOR: 'img'
        }
    };
    
    // ============================================================================
    // 2. ОПРЕДЕЛЕНИЕ ПЕРЕМЕННЫХ СОСТОЯНИЯ
    // ============================================================================
    
    let currentImageIndex = 0;
    let imageCollection = [];
    
    const swipeState = {
        startX: 0,
        endX: 0,
        isActive: false,
    };
    
    // ============================================================================
    // 3. DOM-СЕЛЕКТОРЫ
    // ============================================================================
    
    const DOM = {
        galleryModule: document.getElementById('galleryModule'),
        thumbnailsContainer: document.getElementById('thumbnailsContainer'),
        
        modalOverlay: document.getElementById('modalOverlay'),
        modalContent: document.getElementById('modalContent'),
        modalImage: document.getElementById('modalImage'),
        
        imageTitle: document.getElementById('imageTitle'),
        imageAuthor: document.getElementById('imageAuthor'),
        imageCounter: document.getElementById('imageCounter'),
        
        closeModalBtn: document.getElementById('closeModal'),
        prevBtn: document.getElementById('prevBtn'),
        nextBtn: document.getElementById('nextBtn'),
        
        touchHint: document.getElementById('touchHint'),
        swipeIndicator: document.getElementById('swipeIndicator'),
    };
    
    // ============================================================================
    // 4. КЛАСС ГАЛЕРЕИ (основная логика)
    // ============================================================================
    
    class GalleryManager {
        constructor() {
            this.currentIndex = 0;
            this.isModalOpen = false;
            this.images = [];
        }
        
        /**
         * Инициализирует галерею, собирая все изображения на странице
         */
        init() {
            this.collectAllImages();
            
            if (DOM.thumbnailsContainer) {
                this.createThumbnails();
            }
            
            if (DOM.swipeIndicator) {
                this.createSwipeIndicators();
            }
            
            this.setupEventListeners();
            this.setupImageClickHandlers();
            
            if (DOM.touchHint) {
                this.hideTouchHintAfterDelay();
            }
        }
        
        /**
         * Собирает все изображения со страницы для галереи
         */
        collectAllImages() {
            this.images = [];
            
            // Пробуем разные селекторы для сбора изображений
            let imageElements = [];
            
            // 1. Специальный селектор для галереи
            if (document.querySelector(CONFIG.SELECTORS.GALLERY_IMAGES)) {
                imageElements = document.querySelectorAll(CONFIG.SELECTORS.GALLERY_IMAGES);
            }
            // 2. Изображения с data-атрибутом
            else if (document.querySelector(CONFIG.SELECTORS.ALL_CLICKABLE_IMAGES)) {
                imageElements = document.querySelectorAll(CONFIG.SELECTORS.ALL_CLICKABLE_IMAGES);
            }
            // 3. Все изображения на странице (можно настроить более специфично)
            else {
                imageElements = document.querySelectorAll(CONFIG.SELECTORS.DEFAULT_SELECTOR);
            }
            
            // Фильтруем изображения и создаем массив данных
            imageElements.forEach((img, index) => {
                // Пропускаем изображения без src
                if (!img.src) return;
                
                // Пропускаем слишком маленькие изображения (возможно, иконки)
                if (img.width < 50 && img.height < 50) return;
                
                this.images.push({
                    id: index + 1,
                    title: img.alt || `Изображение ${index + 1}`,
                    author: img.dataset.author || 'SocialBeach',
                    url: img.src,
                    element: img
                });
            });
            
            // Сохраняем в глобальную переменную для обратной совместимости
            imageCollection = this.images;
        }
        
        /**
         * Создает миниатюры для всех изображений
         */
        createThumbnails() {
            if (!DOM.thumbnailsContainer) return;
            
            DOM.thumbnailsContainer.innerHTML = '';
            
            this.images.forEach((image, index) => {
                const thumbnail = this.createThumbnailElement(image, index);
                DOM.thumbnailsContainer.appendChild(thumbnail);
            });
        }
        
        /**
         * Создает элемент миниатюры
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
         * Создает индикаторы свайпа
         */
        createSwipeIndicators() {
            if (!DOM.swipeIndicator) return;
            
            DOM.swipeIndicator.innerHTML = '';
            
            this.images.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.className = 'swipe-dot';
                dot.dataset.index = index;
                dot.setAttribute('aria-label', `Перейти к изображению ${index + 1}`);
                DOM.swipeIndicator.appendChild(dot);
            });
        }
        
        /**
         * Настраивает обработчики кликов для всех изображений на странице
         */
        setupImageClickHandlers() {
            // Обрабатываем все изображения на странице
            document.querySelectorAll('img').forEach((img, index) => {
                // Добавляем data-атрибут для идентификации
                img.dataset.galleryIndex = index;
                
                // Обработчик клика
                img.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Находим индекс этого изображения в нашей коллекции
                    const clickedIndex = Array.from(this.images).findIndex(
                        imageData => imageData.element === img || imageData.url === img.src
                    );
                    
                    if (clickedIndex !== -1) {
                        this.openModal(clickedIndex);
                    } else {
                        // Если изображения нет в коллекции, добавляем его
                        const newImage = {
                            id: this.images.length + 1,
                            title: img.alt || `Изображение ${this.images.length + 1}`,
                            author: img.dataset.author || 'SocialBeach',
                            url: img.src,
                            element: img
                        };
                        
                        this.images.push(newImage);
                        this.openModal(this.images.length - 1);
                    }
                });
            });
        }
        
        /**
         * Открывает модальное окно с выбранным изображением
         */
        openModal(index) {
            if (index < 0 || index >= this.images.length) {
                console.warn(`Индекс ${index} выходит за пределы массива изображений`);
                return;
            }
            
            this.currentIndex = index;
            this.isModalOpen = true;
            
            this.updateModalContent();
            this.showModal();
            this.setupModalEventListeners();
            this.updateSwipeIndicators();
            
            document.addEventListener('keydown', this.handleKeyDown.bind(this));
            
            if (document.body) {
                document.body.style.overflow = 'hidden';
            }
        }
        
        /**
         * Закрывает модальное окно
         */
        closeModal() {
            this.isModalOpen = false;
            
            this.hideModal();
            
            document.removeEventListener('keydown', this.handleKeyDown.bind(this));
            
            if (document.body) {
                document.body.style.overflow = '';
            }
        }
        
        /**
         * Обновляет содержимое модального окна
         */
        updateModalContent() {
            if (!this.images[this.currentIndex]) return;
            
            const currentImage = this.images[this.currentIndex];
            
            // Анимация смены изображения
            if (DOM.modalImage) {
                DOM.modalImage.classList.add('photo-exit');
                
                setTimeout(() => {
                    DOM.modalImage.src = currentImage.url;
                    DOM.modalImage.alt = currentImage.title;
                    
                    if (DOM.imageTitle) DOM.imageTitle.textContent = currentImage.title;
                    if (DOM.imageAuthor) DOM.imageAuthor.textContent = currentImage.author;
                    if (DOM.imageCounter) {
                        DOM.imageCounter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
                    }
                    
                    DOM.modalImage.classList.remove('photo-exit');
                    DOM.modalImage.classList.add('photo-enter');
                    
                    setTimeout(() => {
                        DOM.modalImage.classList.remove('photo-enter');
                    }, 500);
                    
                }, CONFIG.TIMING.IMAGE_TRANSITION);
            }
        }
        
        /**
         * Переходит к предыдущему изображению
         */
        prevImage() {
            if (this.images.length === 0) return;
            
            this.currentIndex = this.currentIndex > 0 
                ? this.currentIndex - 1 
                : this.images.length - 1;
            
            this.updateModalContent();
            this.updateSwipeIndicators();
        }
        
        /**
         * Переходит к следующему изображению
         */
        nextImage() {
            if (this.images.length === 0) return;
            
            this.currentIndex = this.currentIndex < this.images.length - 1 
                ? this.currentIndex + 1 
                : 0;
            
            this.updateModalContent();
            this.updateSwipeIndicators();
        }
        
        /**
         * Обновляет индикаторы свайпа
         */
        updateSwipeIndicators() {
            if (!DOM.swipeIndicator) return;
            
            const dots = DOM.swipeIndicator.querySelectorAll('.swipe-dot');
            
            dots.forEach((dot, index) => {
                if (index === this.currentIndex) {
                    dot.classList.add('active');
                    dot.setAttribute('aria-current', 'true');
                } else {
                    dot.classList.remove('active');
                    dot.removeAttribute('aria-current');
                }
            });
            
            this.showSwipeIndicatorsTemporarily();
        }
        
        /**
         * Обработчик нажатий клавиш
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
            }
        }
        
        /**
         * Настраивает обработчики событий
         */
        setupEventListeners() {
            if (DOM.closeModalBtn) {
                DOM.closeModalBtn.addEventListener('click', () => this.closeModal());
            }
            
            if (DOM.prevBtn) {
                DOM.prevBtn.addEventListener('click', () => this.prevImage());
            }
            
            if (DOM.nextBtn) {
                DOM.nextBtn.addEventListener('click', () => this.nextImage());
            }
            
            if (DOM.modalOverlay) {
                DOM.modalOverlay.addEventListener('click', (event) => {
                    if (event.target === DOM.modalOverlay) {
                        this.closeModal();
                    }
                });
            }
        }
        
        /**
         * Настраивает обработчики свайпа
         */
        setupModalEventListeners() {
            if (!DOM.modalContent) return;
            
            const swipeHandlers = {
                start: this.handleSwipeStart.bind(this),
                move: this.handleSwipeMove.bind(this),
                end: this.handleSwipeEnd.bind(this),
                cancel: () => { swipeState.isActive = false; }
            };
            
            // Touch события
            DOM.modalContent.addEventListener('touchstart', swipeHandlers.start, { passive: true });
            DOM.modalContent.addEventListener('touchmove', swipeHandlers.move, { passive: true });
            DOM.modalContent.addEventListener('touchend', swipeHandlers.end);
            
            // Mouse события
            DOM.modalContent.addEventListener('mousedown', swipeHandlers.start);
            DOM.modalContent.addEventListener('mousemove', swipeHandlers.move);
            DOM.modalContent.addEventListener('mouseup', swipeHandlers.end);
            DOM.modalContent.addEventListener('mouseleave', swipeHandlers.cancel);
        }
        
        /**
         * Обработчики свайпа
         */
        handleSwipeStart(event) {
            swipeState.startX = this.getEventX(event);
            swipeState.isActive = true;
        }
        
        handleSwipeMove(event) {
            if (!swipeState.isActive || !DOM.modalImage) return;
            
            swipeState.endX = this.getEventX(event);
            const diff = swipeState.startX - swipeState.endX;
            
            if (Math.abs(diff) > CONFIG.SWIPE.PREVIEW_THRESHOLD) {
                DOM.modalImage.style.transform = `translateX(${-diff / 20}px)`;
            }
        }
        
        handleSwipeEnd(event) {
            if (!swipeState.isActive || !DOM.modalImage) return;
            
            swipeState.endX = this.getEventX(event);
            const diff = swipeState.startX - swipeState.endX;
            
            DOM.modalImage.style.transform = 'translateX(0)';
            
            if (Math.abs(diff) > CONFIG.SWIPE.ACTION_THRESHOLD) {
                if (diff > 0) {
                    this.nextImage();
                } else {
                    this.prevImage();
                }
            }
            
            swipeState.isActive = false;
        }
        
        getEventX(event) {
            return event.changedTouches 
                ? event.changedTouches[0].screenX 
                : event.clientX;
        }
        
        showModal() {
            if (!DOM.modalOverlay) return;
            
            DOM.modalOverlay.style.display = 'block';
            
            // Простая анимация появления
            setTimeout(() => {
                DOM.modalOverlay.style.opacity = '1';
                if (DOM.modalContent) {
                    DOM.modalContent.style.opacity = '1';
                }
            }, 10);
        }
        
        hideModal() {
            if (!DOM.modalOverlay) return;
            
            DOM.modalOverlay.style.opacity = '0';
            if (DOM.modalContent) {
                DOM.modalContent.style.opacity = '0';
            }
            
            setTimeout(() => {
                DOM.modalOverlay.style.display = 'none';
            }, CONFIG.TIMING.MODAL_CLOSE);
        }
        
        showSwipeIndicatorsTemporarily() {
            if (!DOM.swipeIndicator) return;
            
            DOM.swipeIndicator.style.opacity = '1';
            
            setTimeout(() => {
                DOM.swipeIndicator.style.opacity = '0';
            }, CONFIG.TIMING.INDICATOR_SHOW_TIME);
        }
        
        hideTouchHintAfterDelay() {
            if (!DOM.touchHint) return;
            
            setTimeout(() => {
                DOM.touchHint.style.opacity = '0';
            }, CONFIG.TIMING.HINT_HIDE_DELAY);
        }
        
        /**
         * Добавляет изображение в галерею динамически
         */
        addImage(url, title = '', author = '') {
            const newImage = {
                id: this.images.length + 1,
                title: title || `Изображение ${this.images.length + 1}`,
                author: author || 'SocialBeach',
                url: url
            };
            
            this.images.push(newImage);
            return this.images.length - 1;
        }
        
        /**
         * Обновляет коллекцию изображений
         */
        refreshImages() {
            this.collectAllImages();
            
            if (DOM.thumbnailsContainer) {
                this.createThumbnails();
            }
            
            if (DOM.swipeIndicator) {
                this.createSwipeIndicators();
            }
        }
    }
    
    // ============================================================================
    // 5. ИНИЦИАЛИЗАЦИЯ И ПУБЛИЧНЫЙ API
    // ============================================================================
    
    function initializeGallery() {
        const gallery = new GalleryManager();
        gallery.init();
        
        // Публичный API
        window.GalleryModule = {
            init: () => {
                gallery.init();
                return gallery;
            },
            
            open: (index) => gallery.openModal(index),
            
            openByImage: (imageElement) => {
                // Находим изображение по элементу
                const index = Array.from(gallery.images).findIndex(
                    img => img.element === imageElement || img.url === imageElement.src
                );
                if (index !== -1) {
                    gallery.openModal(index);
                }
            },
            
            close: () => gallery.closeModal(),
            
            next: () => gallery.nextImage(),
            
            prev: () => gallery.prevImage(),
            
            addImage: (url, title, author) => gallery.addImage(url, title, author),
            
            refresh: () => gallery.refreshImages(),
            
            getCurrentIndex: () => gallery.currentIndex,
            
            getTotalImages: () => gallery.images.length,
            
            getImages: () => gallery.images,
            
            isOpen: () => gallery.isModalOpen,
        };
        
        // Делаем галерею доступной для изображений
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG' && !e.target.closest('.photo-thumb')) {
                e.preventDefault();
                
                const img = e.target;
                const index = Array.from(gallery.images).findIndex(
                    imageData => imageData.element === img || imageData.url === img.src
                );
                
                if (index !== -1) {
                    gallery.openModal(index);
                } else {
                    // Если изображение еще не в галерее, добавляем его
                    const newIndex = gallery.addImage(img.src, img.alt);
                    gallery.openModal(newIndex);
                }
            }
        });
    }
    
    // ============================================================================
    // 6. УТИЛИТЫ
    // ============================================================================
    
    function waitForDOMAndInit() {
        if (document.readyState !== 'loading') {
            initializeGallery();
        } else {
            document.addEventListener('DOMContentLoaded', initializeGallery);
        }
    }
    
    // Автоматическая инициализация
    waitForDOMAndInit();
    
})();