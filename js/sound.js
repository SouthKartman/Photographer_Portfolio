// Audio

let soundButton = document.querySelector('.soundbutton'),
    audio = document.querySelector('.audio'),
    scrollThreshold = 200, // Порог скролла в пикселях
    lastScrollTop = 0,
    hasScrolledThreshold = false;

// Функция для скрытия/показа кнопки звука
function toggleSoundButtonVisibility() {
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Проверяем, проскроллили ли мы больше 200px
    if (currentScrollTop > scrollThreshold && !hasScrolledThreshold) {
        hasScrolledThreshold = true;
        soundButton.style.opacity = '0';
        soundButton.style.visibility = 'hidden';
        soundButton.style.pointerEvents = 'none';
        soundButton.classList.add('hidden-by-scroll');
    } 
    // Показываем кнопку при возврате вверх
    else if (currentScrollTop <= scrollThreshold && hasScrolledThreshold) {
        hasScrolledThreshold = false;
        soundButton.style.opacity = '1';
        soundButton.style.visibility = 'visible';
        soundButton.style.pointerEvents = 'auto';
        soundButton.classList.remove('hidden-by-scroll');
    }
    
    lastScrollTop = currentScrollTop;
}

// Инициализация
if (soundButton && audio) {
    // Обработчик клика
    soundButton.addEventListener('click', e => {
        soundButton.classList.toggle('paused');
        audio.paused ? audio.play() : audio.pause();
        
        // При клике временно показываем кнопку
        soundButton.classList.add('user-interacted');
        setTimeout(() => {
            soundButton.classList.remove('user-interacted');
        }, 3000); // Показываем 3 секунды после взаимодействия
    });

    // Обработчик скролла с троттлингом для производительности
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                toggleSoundButtonVisibility();
                scrollTimeout = null;
            }, 50); // Проверяем каждые 50мс при скролле
        }
    });

    // Проверяем начальную позицию скролла
    window.addEventListener('load', () => {
        setTimeout(toggleSoundButtonVisibility, 100);
    });

    // Фокус/блюр окна
    window.onfocus = function() {
        if (soundButton.classList.contains('paused')) {
            audio.pause();
        } else {
            audio.play();
        }
    }

    window.onblur = function() {
        audio.pause();
    }
    
    // Инициализация при загрузке
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(toggleSoundButtonVisibility, 100);
    });
}
