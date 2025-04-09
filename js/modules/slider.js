/**
 * Модуль слайдера
 * Отвечает за функциональность слайдера на главной странице
 */

export default class Slider {
    constructor(sliderSelector = '.slider') {
        this.sliderSelector = sliderSelector;
        this.slider = null;
        this.slides = null;
        this.prevButton = null;
        this.nextButton = null;
        this.indicators = null;
        this.track = null;
        
        this.currentSlide = 0;
        this.isAnimating = false;
        this.autoplayInterval = null;
        this.animationDuration = 500; // ms
        
        console.log('Slider constructor initialized');
        this.init();
    }
    
    /**
     * Инициализация слайдера
     */
    init() {
        this.slider = document.querySelector(this.sliderSelector);
        if (!this.slider) {
            console.error('Slider не найден на странице');
            return;
        }
        
        this.slides = this.slider.querySelectorAll('.slider__slide');
        this.prevButton = this.slider.querySelector('.slider__arrow--prev');
        this.nextButton = this.slider.querySelector('.slider__arrow--next');
        this.indicators = this.slider.querySelectorAll('.slider__indicator');
        this.track = this.slider.querySelector('.slider__track');
        
        // Если слайдов нет, выходим
        if (!this.slides.length) {
            console.error('Слайды не найдены');
            return;
        }
        
        console.log('Найдено слайдов:', this.slides.length);
        console.log('Кнопка Prev:', this.prevButton ? 'Найдена' : 'Не найдена');
        console.log('Кнопка Next:', this.nextButton ? 'Найдена' : 'Не найдена');
        console.log('Индикаторы:', this.indicators.length, 'шт.');
        
        // Настройка начального состояния
        this.setupSlider();
        
        // Привязка обработчиков событий
        this.bindEvents();
        
        // Запуск автоматического переключения
        this.startAutoplay();
    }
    
    /**
     * Настройка начального состояния слайдера
     */
    setupSlider() {
        // Убеждаемся, что контейнер имеет overflow: hidden
        const container = this.slider.querySelector('.slider__container');
        if (container) {
            container.style.overflow = 'hidden';
        }
        
        // Устанавливаем трек как flex-контейнер
        this.track.style.display = 'flex';
        this.track.style.transition = `transform ${this.animationDuration}ms ease`;
        
        // Устанавливаем ширину track равной количеству слайдов * 100%
        this.track.style.width = `${this.slides.length * 100}%`;
        
        // Устанавливаем ширину каждому слайду равную 100% / количество слайдов
        this.slides.forEach(slide => {
            slide.style.width = `${100 / this.slides.length}%`;
        });
        
        // Устанавливаем начальное положение слайдера (первый слайд)
        this.currentSlide = 0;
        this.updateSliderPosition();
        
        // Устанавливаем первый индикатор как активный
        if (this.indicators.length > 0) {
            this.indicators.forEach((indicator, index) => {
                if (index === 0) {
                    indicator.classList.add('slider__indicator--active');
                    indicator.classList.add('active');
                } else {
                    indicator.classList.remove('slider__indicator--active');
                    indicator.classList.remove('active');
                }
            });
        }
        
        console.log('Слайдер настроен');
    }
    
    /**
     * Привязка обработчиков событий
     */
    bindEvents() {
        // Используем обычные функции вместо стрелочных для корректной работы this
        const self = this;
        
        // Обработчик клика по кнопке "Предыдущий слайд"
        if (this.prevButton) {
            this.prevButton.addEventListener('click', function(event) {
                event.preventDefault();
                console.log('Клик по кнопке Prev');
                self.goToPrevSlide();
            });
        }
        
        // Обработчик клика по кнопке "Следующий слайд"
        if (this.nextButton) {
            this.nextButton.addEventListener('click', function(event) {
                event.preventDefault();
                console.log('Клик по кнопке Next');
                self.goToNextSlide();
            });
        }
        
        // Добавляем обработчики для индикаторов
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', function(event) {
                event.preventDefault();
                console.log('Клик по индикатору', index);
                if (self.isAnimating || self.currentSlide === index) return;
                self.goToSlide(index);
            });
        });
        
        // При наведении на слайдер останавливаем автопрокрутку
        this.slider.addEventListener('mouseenter', function() {
            self.stopAutoplay();
        });
        
        this.slider.addEventListener('mouseleave', function() {
            self.startAutoplay();
        });
        
        console.log('Обработчики событий привязаны');
    }
    
    /**
     * Переход к предыдущему слайду
     */
    goToPrevSlide() {
        if (this.isAnimating) {
            console.log('Анимация в процессе, переключение отменено');
            return;
        }
        
        let targetSlide = this.currentSlide - 1;
        if (targetSlide < 0) {
            targetSlide = this.slides.length - 1;
        }
        
        console.log('Переключение на предыдущий слайд:', targetSlide);
        this.goToSlide(targetSlide);
    }
    
    /**
     * Переход к следующему слайду
     */
    goToNextSlide() {
        if (this.isAnimating) {
            console.log('Анимация в процессе, переключение отменено');
            return;
        }
        
        let targetSlide = this.currentSlide + 1;
        if (targetSlide >= this.slides.length) {
            targetSlide = 0;
        }
        
        console.log('Переключение на следующий слайд:', targetSlide);
        this.goToSlide(targetSlide);
    }
    
    /**
     * Переход к указанному слайду
     * @param {number} index - Индекс слайда
     */
    goToSlide(index) {
        if (this.isAnimating || index === this.currentSlide) {
            console.log('Переключение отменено: isAnimating=', this.isAnimating, 'currentSlide=', this.currentSlide, 'targetSlide=', index);
            return;
        }
        
        this.isAnimating = true;
        console.log('Переключение на слайд', index);
        
        // Обновляем активный индикатор
        this.indicators.forEach((indicator, i) => {
            if (i === index) {
                indicator.classList.add('slider__indicator--active');
                indicator.classList.add('active'); // Для обратной совместимости
            } else {
                indicator.classList.remove('slider__indicator--active');
                indicator.classList.remove('active'); // Для обратной совместимости
            }
        });
        
        // Обновляем текущий слайд
        this.currentSlide = index;
        
        // Обновляем положение слайдера
        this.updateSliderPosition();
        
        // Снимаем блокировку анимации после завершения
        setTimeout(() => {
            this.isAnimating = false;
            console.log('Анимация завершена');
        }, this.animationDuration);
    }
    
    /**
     * Обновление положения слайдера
     */
    updateSliderPosition() {
        const offset = -this.currentSlide * (100 / this.slides.length);
        console.log('Обновление позиции слайдера:', offset + '%');
        this.track.style.transform = `translateX(${offset}%)`;
    }
    
    /**
     * Запуск автоматического переключения слайдов
     */
    startAutoplay() {
        if (this.autoplayInterval) return;
        
        console.log('Запуск автопрокрутки');
        this.autoplayInterval = setInterval(() => {
            this.goToNextSlide();
        }, 5000); // Переключение каждые 5 секунд
    }
    
    /**
     * Остановка автоматического переключения слайдов
     */
    stopAutoplay() {
        if (!this.autoplayInterval) return;
        
        console.log('Остановка автопрокрутки');
        clearInterval(this.autoplayInterval);
        this.autoplayInterval = null;
    }
} 