gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// if (ScrollTrigger.isTouch !== 1) {
    const smoother = ScrollSmoother.create({
        wrapper: '.wrapper',
        content: '.content',
        smooth: 1.7,
        effects: true
    })

    // Ждем полной инициализации ScrollSmoother
    setTimeout(() => {
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const href = e.target.getAttribute('href');
                
                // Используем нативный метод ScrollSmoother
                smoother.scrollTo(href, true, "top 0");
            }
        });
    }, 100);

    // Остальные анимации...
    gsap.fromTo('.hero-section', { opacity: 1 }, {
        opacity: 0,
        scrollTrigger: {
            trigger: '.hero-section',
            start: 'center',
            end: '1000',
            scrub: true,
        }
    })

    let itemsL = gsap.utils.toArray('.gallery__left .gallery__item')
    itemsL.forEach(item => {
        gsap.fromTo(item, { opacity: 0, x: -50 }, {
            opacity: 1, x: 0,
            scrollTrigger: {
                trigger: item,
                start: '-top 85%',
                end: 'end',
                scrub: true
            }
        })
    })

    let itemsR = gsap.utils.toArray('.gallery__right .gallery__item')
    itemsR.forEach(item => {
        gsap.fromTo(item, { opacity: 0, x: 50 }, {
            opacity: 1, x: 0,
            scrollTrigger: {
                trigger: item,
                start: '-top 85%',
                end: 'top 45%',
                scrub: 2
            }
        })
    })

    let Hero = gsap.utils.toArray('.hero')
    Hero.forEach(item => {
        gsap.fromTo(item, { opacity: 0, x: 0 }, {
            opacity: 1, x: 0,
            scrollTrigger: {
                trigger: item,
                start: '-50',
                end: '-50',
                scrub: true
            }
        })
    })

	



// Оптимизация видеофона

document.addEventListener('DOMContentLoaded', function() {
    const video = document.querySelector('.hero-video');
    const heroSection = document.querySelector('.hero-section');
    
    if (video) {
        // Проверяем мобильное устройство
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        // Настройки для мобильных устройств
        if (isMobile) {
            // Устанавливаем poster для быстрой загрузки
            video.setAttribute('poster', 'img/hero-poster.jpg');
            
            // Уменьшаем качество на мобильных для экономии трафика
            video.preload = 'metadata';
        }
        
        // Пытаемся воспроизвести видео
        const playVideo = () => {
            const playPromise = video.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Автовоспроизведение не удалось:', error);
                    
                    // Показываем фолбэк изображение
                    heroSection.classList.add('no-video');
                    
                    // Пробуем воспроизвести при клике
                    document.addEventListener('click', function tryPlay() {
                        video.play().then(() => {
                            heroSection.classList.remove('no-video');
                        });
                        document.removeEventListener('click', tryPlay);
                    }, { once: true });
                });
            }
        };
        
        // Ждем загрузки метаданных видео
        video.addEventListener('loadedmetadata', function() {
            // Проверяем поддержку видеоформата
            if (video.readyState >= 1) {
                playVideo();
            }
        });
        
        // Пауза при скрытии вкладки
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                video.pause();
            } else {
                video.play().catch(e => console.log('Не удалось возобновить:', e));
            }
        });
        
        // Управление воспроизведением при скролле (опционально)
        let videoPausedByScroll = false;
        
        const handleScroll = () => {
            const rect = heroSection.getBoundingClientRect();
            const isInView = rect.bottom > 0 && rect.top < window.innerHeight;
            
            if (!isInView && !video.paused) {
                video.pause();
                videoPausedByScroll = true;
            } else if (isInView && videoPausedByScroll && video.paused) {
                video.play().catch(e => console.log('Не удалось возобновить:', e));
                videoPausedByScroll = false;
            }
        };
        
        // Раскомментируйте если нужно останавливать видео при скролле
        // window.addEventListener('scroll', handleScroll);
    }
});

// Обнаружение поддержки видео
function supportsVideo() {
    const elem = document.createElement('video');
    return !!elem.canPlayType;
}

if (!supportsVideo()) {
    document.querySelector('.hero-section').classList.add('no-video');
}


// }
