/**
 * Модуль бургер-меню
 * Отвечает за функциональность мобильного меню
 */

export default class BurgerMenu {
    constructor({
        burgerSelector = '.header__burger-button',
        navSelector = '.header__nav',
        menuLinkSelector = '.header__menu-link'
    } = {}) {
        this.burgerButton = document.querySelector(burgerSelector);
        this.nav = document.querySelector(navSelector);
        this.body = document.body;
        this.menuLinks = document.querySelectorAll(menuLinkSelector);
        
        if (this.burgerButton && this.nav) {
            this.init();
        }
    }
    
    /**
     * Инициализация бургер-меню
     */
    init() {
        this.bindEvents();
    }
    
    /**
     * Привязка обработчиков событий
     */
    bindEvents() {
        // Обработчик клика по кнопке бургера
        this.burgerButton.addEventListener('click', this.toggleMenu.bind(this));
        
        // Закрытие меню при клике на ссылку
        this.menuLinks.forEach(link => {
            link.addEventListener('click', this.closeMenu.bind(this));
        });
        
        // Закрытие меню при клике вне меню
        document.addEventListener('click', this.handleOutsideClick.bind(this));
    }
    
    /**
     * Переключение состояния меню
     * @param {Event} event - Событие клика
     */
    toggleMenu(event) {
        event.stopPropagation();
        this.burgerButton.classList.toggle('active');
        this.nav.classList.toggle('active');
        this.body.classList.toggle('no-scroll');
    }
    
    /**
     * Закрытие меню
     */
    closeMenu() {
        this.burgerButton.classList.remove('active');
        this.nav.classList.remove('active');
        this.body.classList.remove('no-scroll');
    }
    
    /**
     * Обработка клика вне меню
     * @param {Event} event - Событие клика
     */
    handleOutsideClick(event) {
        const isClickInsideNav = this.nav.contains(event.target);
        const isClickOnBurger = this.burgerButton.contains(event.target);
        
        if (this.nav.classList.contains('active') && !isClickInsideNav && !isClickOnBurger) {
            this.closeMenu();
        }
    }
} 