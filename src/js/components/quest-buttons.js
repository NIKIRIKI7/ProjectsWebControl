/**
 * Модуль для обработки кнопок в секции популярных квестов
 */
import Modal from './modal.js';

export default class QuestButtons {
    constructor() {
        // Кнопки на главной странице
        this.questButtons = document.querySelectorAll('.popular-quest__button');
        
        // Кнопки "Забронировать" на странице квеста
        this.bookButtons = document.querySelectorAll('.button--primary');
        
        // Кнопки "Отправить заявку" на карте
        this.mapButtons = document.querySelectorAll('.map-info__button');
        
        // Создание экземпляра модального окна
        this.modal = new Modal('quest-modal');
        
        this.initButtons();
    }

    /**
     * Инициализация обработчиков событий для кнопок
     */
    initButtons() {
        // Обработчики для кнопок в популярных квестах
        if (this.questButtons.length > 0) {
            this.questButtons.forEach((button, index) => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Получаем информацию о квесте из родительского элемента
                    const questItem = button.closest('.popular-quest__item');
                    const questImage = questItem.querySelector('.popular-quest__image');
                    const questInfo = {
                        id: `quest-${index + 1}`,
                        title: questImage ? questImage.alt : `Квест ${index + 1}`
                    };
                    
                    this.openModal(questInfo);
                });
            });
        }
        
        // Обработчики для кнопок "Забронировать" на странице квеста
        if (this.bookButtons.length > 0) {
            this.bookButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Получаем заголовок квеста со страницы
                    const questTitle = document.querySelector('.quest-hero__title');
                    const questInfo = {
                        id: 'current-quest',
                        title: questTitle ? questTitle.textContent : 'Квест'
                    };
                    
                    this.openModal(questInfo);
                });
            });
        }
        
        // Обработчики для кнопок на карте
        if (this.mapButtons.length > 0) {
            this.mapButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Общая информация для заявки с карты
                    const questInfo = {
                        id: 'map-request',
                        title: 'любой квест'
                    };
                    
                    this.openModal(questInfo);
                });
            });
        }
    }
    
    /**
     * Открывает модальное окно с информацией о квесте
     * @param {Object} questInfo - Информация о квесте
     */
    openModal(questInfo) {
        if (this.modal) {
            this.modal.open(questInfo);
        } else {
            console.error('Модальное окно не инициализировано');
        }
    }
} 