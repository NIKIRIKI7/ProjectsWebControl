/**
 * Модуль для обработки кнопок в секции популярных квестов
 */
export default class QuestButtons {
    constructor() {
        this.buttons = document.querySelectorAll('.popular-quest__button');
        this.initButtons();
    }

    /**
     * Инициализация обработчиков событий для кнопок
     */
    initButtons() {
        this.buttons.forEach(button => {
            // Обработчик клика
            button.addEventListener('click', (e) => {
                // Здесь может быть другая логика обработки клика
                console.log('Кнопка квеста нажата');
            });
        });
    }
} 