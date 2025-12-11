// Упрощенный, но эффективный скрипт проверки видео
(function() {
    'use strict';
    
    const header = document.querySelector('header');
    if (!header) return;
    
    // Объект для отслеживания состояния видео
    const videoStatus = {
        hasVideo: false,
        isPlaying: false,
        hasError: false,
        canPlay: false
    };
    
    function updateVideoStatus(video) {
        // Сбрасываем статус для этого видео
        videoStatus.hasVideo = true;
        videoStatus.hasError = !!video.error;
        videoStatus.isPlaying = !video.paused && !video.ended;
        videoStatus.canPlay = video.readyState >= 4; // HAVE_ENOUGH_DATA
        
        // Дополнительные проверки
        if (!videoStatus.hasError) {
            // Проверяем источник
            const hasSource = video.src || video.querySelector('source[src]');
            videoStatus.canPlay = videoStatus.canPlay && hasSource;
            
            // Проверяем продолжительность
            const hasDuration = video.duration > 0 && !isNaN(video.duration);
            videoStatus.canPlay = videoStatus.canPlay && hasDuration;
        }
    }
    
    function checkAllVideos() {
        const videos = document.querySelectorAll('video');
        
        // Если видео нет
        if (videos.length === 0) {
            videoStatus.hasVideo = false;
            videoStatus.isPlaying = false;
            videoStatus.canPlay = false;
            updateHeader();
            return;
        }
        
        // Сбрасываем статусы
        let anyVideoCanPlay = false;
        let anyVideoIsPlaying = false;
        
        // Проверяем каждое видео
        videos.forEach(video => {
            updateVideoStatus(video);
            
            if (videoStatus.canPlay) anyVideoCanPlay = true;
            if (videoStatus.isPlaying) anyVideoIsPlaying = true;
        });
        
        // Обновляем header на основе статуса
        updateHeader(anyVideoCanPlay || anyVideoIsPlaying);
    }
    
    function updateHeader(videoIsFunctional) {
        if (videoIsFunctional) {
            header.style.position = 'fixed';
            header.style.top = '0';
            header.style.zIndex = '0';
            console.log('Header: sticky (видео работает)');
        } else {
            header.style.position = 'static';
            console.log('Header: static (видео не работает)');
        }
    }
    
    // Основная функция проверки работоспособности видео
    function isVideoActuallyWorking(video) {
        // 1. Базовые проверки
        if (!video) return false;
        if (video.error) return false;
        if (!video.src && !video.querySelector('source[src]')) return false;
        
        // 2. Проверка состояния загрузки
        const readyState = video.readyState;
        const networkState = video.networkState;
        
        // HAVE_NOTHING = 0, HAVE_METADATA = 1, HAVE_CURRENT_DATA = 2,
        // HAVE_FUTURE_DATA = 3, HAVE_ENOUGH_DATA = 4
        if (readyState < 1) return false; // Нет даже метаданных
        
        // NETWORK_EMPTY = 0, NETWORK_IDLE = 1, NETWORK_LOADING = 2,
        // NETWORK_NO_SOURCE = 3
        if (networkState === 3) return false; // Нет источника
        
        // 3. Проверка продолжительности
        if (!video.duration || isNaN(video.duration) || video.duration === Infinity) {
            return false;
        }
        
        // 5. Если видео уже воспроизводится
        if (!video.paused || video.currentTime > 0) {
            return true;
        }
        
        // 6. Если есть достаточно данных для воспроизведения
        if (readyState >= 4) {
            return true;
        }
        
        return false;
    }
    
    // Асинхронная проверка всех видео
    async function checkVideosAsync() {
        const videos = document.querySelectorAll('video');
        const checks = [];
        
        videos.forEach(video => {
            checks.push(isVideoActuallyWorking(video));
        });
        
        // Ждем результаты всех проверок
        const results = await Promise.all(checks);
        const anyVideoWorks = results.some(result => result === true);
        
        updateHeader(anyVideoWorks);
    }
    
    // Инициализация
    document.addEventListener('DOMContentLoaded', () => {
        checkAllVideos();
        checkVideosAsync();
    });
    
    // Отслеживание событий видео
    const videoEvents = [
        'play', 'pause', 'playing', 'waiting', 'canplay',
        'canplaythrough', 'loadeddata', 'loadedmetadata',
        'error', 'emptied', 'stalled', 'suspend'
    ];
    
    function attachVideoListeners() {
        document.querySelectorAll('video').forEach(video => {
            videoEvents.forEach(event => {
                video.addEventListener(event, checkAllVideos);
            });
        });
    }
    
    // Запуск
    attachVideoListeners();
    checkAllVideos();
    
    // Отслеживание новых видео
    new MutationObserver(() => {
        attachVideoListeners();
        checkAllVideos();
        checkVideosAsync();
    }).observe(document.body, { childList: true, subtree: true });
    
})();