document.addEventListener('DOMContentLoaded', function() {
            const faqItems = document.querySelectorAll('.faq-item');
            
            // Анимация появления элементов при загрузке
            gsap.to('.faq-item', {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power2.out'
            });
            
            // Функция для открытия FAQ
            function openFAQ(item) {
                const answer = item.querySelector('.faq-answer');
                const answerContent = item.querySelector('.faq-answer-content');
                const icon = item.querySelector('.faq-icon');
                
                const tl = gsap.timeline();
                
                tl.to(answer, {
                    height: 'auto',
                    duration: 0.4,
                    ease: 'power2.inOut'
                })
                .to(answerContent, {
                    opacity: 1,
                    y: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                }, '-=0.2')
                .to(icon, {
                    rotation: 45,
                    duration: 0.3,
                    ease: 'power2.inOut'
                }, '-=0.3');
                
                item.classList.add('active');
            }
            
            // Функция для закрытия FAQ
            function closeFAQ(item) {
                const answer = item.querySelector('.faq-answer');
                const answerContent = item.querySelector('.faq-answer-content');
                const icon = item.querySelector('.faq-icon');
                
                const tl = gsap.timeline();
                
                tl.to(answerContent, {
                    opacity: 0,
                    y: -10,
                    duration: 0.2
                })
                .to(answer, {
                    height: 0,
                    duration: 0.3,
                    ease: 'power2.inOut'
                }, '-=0.1')
                .to(icon, {
                    rotation: 0,
                    duration: 0.2
                }, '-=0.2');
                
                item.classList.remove('active');
            }
            
            // Обработчик кликов
            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question');
                
                question.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');
                    
                    // Закрываем все остальные открытые элементы
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item && otherItem.classList.contains('active')) {
                            closeFAQ(otherItem);
                        }
                    });
                    
                    // Открываем или закрываем текущий элемент
                    if (!isActive) {
                        openFAQ(item);
                    } else {
                        closeFAQ(item);
                    }
                });
            });
        });