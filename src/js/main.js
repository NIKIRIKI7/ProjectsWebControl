/**
 * Главный файл JavaScript
 * Инициализирует все компоненты сайта
 */

// Используем динамический импорт для повышения совместимости
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('DOM загружен, начинаем инициализацию компонентов');
        
        // Динамический импорт модулей
        const [sliderModule, burgerModule, questButtonsModule] = await Promise.all([
            import('./components/slider.js'),
            import('./components/burger-menu.js'),
            import('./components/quest-buttons.js')
        ]);
        
        // Получаем классы из модулей
        const Slider = sliderModule.default;
        const BurgerMenu = burgerModule.default;
        const QuestButtons = questButtonsModule.default;
        
        console.log('Модули успешно загружены');
        
        // Инициализация бургер-меню
        new BurgerMenu();
        
        // Инициализация слайдера
        new Slider();
        
        // Инициализация кнопок квестов
        new QuestButtons();
        
        console.log('Компоненты инициализированы');
    } catch (error) {
        console.error('Ошибка при инициализации компонентов:', error);
    }
});
