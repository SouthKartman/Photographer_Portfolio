
        // Код для работы слайдера
        document.addEventListener('DOMContentLoaded', function() {
            const sliderTrack = document.querySelector('.rogat-slider__track');
            const slides = document.querySelectorAll('.rogat-slider__slide');
            const prevButton = document.querySelector('.rogat-slider__nav-button--prev');
            const nextButton = document.querySelector('.rogat-slider__nav-button--next');
            
            let currentSlide = 0;
            const slidesToShow = getSlidesToShow();
            
            // Функция для определения количества отображаемых слайдов
            function getSlidesToShow() {
                if (window.innerWidth < 576) return 1;
                if (window.innerWidth < 992) return 2;
                return 3;
            }
            
            // Функция для обновления позиции слайдера
            function updateSlider() {
                const slideWidth = slides[0].offsetWidth;
                sliderTrack.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
                
                // Обновляем состояние кнопок
                prevButton.disabled = currentSlide === 0;
                nextButton.disabled = currentSlide >= slides.length - slidesToShow;
            }
            
            // Обработчики для кнопок навигации
            prevButton.addEventListener('click', function() {
                if (currentSlide > 0) {
                    currentSlide--;
                    updateSlider();
                }
            });
            
            nextButton.addEventListener('click', function() {
                if (currentSlide < slides.length - slidesToShow) {
                    currentSlide++;
                    updateSlider();
                }
            });
            
            // Обработчик изменения размера окна
            window.addEventListener('resize', function() {
                const newSlidesToShow = getSlidesToShow();
                if (newSlidesToShow !== slidesToShow) {
                    currentSlide = 0;
                    updateSlider();
                }
            });
            
            // Инициализация слайдера
            updateSlider();
        });


        // slider 2


        class PortraitSlider {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.slides = this.container.querySelectorAll('.ps-slide');
        this.dots = this.container.querySelectorAll('.ps-nav-dot');
        this.prevBtn = this.container.querySelector('.ps-prev');
        this.nextBtn = this.container.querySelector('.ps-next');
        this.currentSlide = 0;
        this.autoPlayInterval = null;
        
        this.init();
    }
    
    init() {
        // Инициализация событий
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Навигация по точкам
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Автоплей
        this.startAutoPlay();
        
        // Пауза при наведении
        this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.container.addEventListener('mouseleave', () => this.startAutoPlay());
        
        // Свайпы для мобильных устройств
        this.enableSwipe();
    }
    
    goToSlide(index) {
        // Скрываем текущий слайд
        this.slides[this.currentSlide].classList.remove('ps-active');
        this.dots[this.currentSlide].classList.remove('ps-active');
        
        // Обновляем текущий слайд
        this.currentSlide = index;
        
        // Показываем новый слайд
        this.slides[this.currentSlide].classList.add('ps-active');
        this.dots[this.currentSlide].classList.add('ps-active');
    }
    
    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }
    
    prevSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prevIndex);
    }
    
    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 5000); // Смена каждые 5 секунд
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    
    enableSwipe() {
        let startX = 0;
        let endX = 0;
        
        this.container.addEventListener('touchstart', (e) => {
            startX = e.changedTouches[0].screenX;
        });
        
        this.container.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].screenX;
            this.handleSwipe(startX, endX);
        });
    }
    
    handleSwipe(startX, endX) {
        const diff = startX - endX;
        const swipeThreshold = 50;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextSlide(); // Свайп влево
            } else {
                this.prevSlide(); // Свайп вправо
            }
        }
    }
}

// Инициализация слайдера при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    new PortraitSlider('psSlider');
});