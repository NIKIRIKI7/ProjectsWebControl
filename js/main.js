/**
 * Главный файл JavaScript
 * Инициализирует все компоненты сайта
 */

// Используем динамический импорт для повышения совместимости
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('DOM загружен, начинаем инициализацию компонентов');
        
        // Динамический импорт модулей
        const [sliderModule, burgerModule] = await Promise.all([
            import('./modules/slider.js'),
            import('./modules/burger-menu.js')
        ]);
        
        // Получаем классы из модулей
        const Slider = sliderModule.default;
        const BurgerMenu = burgerModule.default;
        
        console.log('Модули успешно загружены');
        
        // Инициализация бургер-меню
        new BurgerMenu();
        
        // Инициализация слайдера
        new Slider();
        
        console.log('Компоненты инициализированы');
    } catch (error) {
        console.error('Ошибка при инициализации компонентов:', error);
    }
});
