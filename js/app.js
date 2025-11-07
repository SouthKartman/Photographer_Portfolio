gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

if (ScrollTrigger.isTouch !== 1) {
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
                start: '-750',
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
                start: '-750',
                end: 'top',
                scrub: true
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

	
}


