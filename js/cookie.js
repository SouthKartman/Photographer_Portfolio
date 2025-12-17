 function getCookie(name) {
        return document.cookie.split('; ').find(row => row.startsWith(name + '='));
    }

    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    function acceptCookies() {
        setCookie('cookies_accepted', 'true', 365);
        hideCookie();
        // Эффект принятия
        const btn = event.target;
        btn.textContent = 'Спасибо! 🍪';
        btn.style.background = '#2cb67d';
        setTimeout(() => {
            document.getElementById('cookieMini').style.display = 'none';
        }, 1000);
    }

    function hideCookie() {
        const cookie = document.getElementById('cookieMini');
        cookie.style.opacity = '0';
        cookie.style.transform = 'translateY(50px)';
        setTimeout(() => {
            cookie.style.display = 'none';
        }, 300);
    }

    // Показываем плашку только если согласия еще нет
    setTimeout(() => {
        if (!getCookie('cookies_accepted')) {
            document.getElementById('cookieMini').classList.add('show');
        }
    }, 1000);