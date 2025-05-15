/**
 * Модуль для работы с модальным окном
 */
export default class Modal {
    /**
     * Инициализирует модальное окно
     * @param {string} modalId - ID модального окна
     */
    constructor(modalId = 'quest-modal') {
        this.modal = document.getElementById(modalId);
        if (!this.modal) {
            console.error(`Модальное окно с ID ${modalId} не найдено`);
            return;
        }
        
        this.closeBtn = this.modal.querySelector('.quest-modal__close');
        this.form = this.modal.querySelector('.quest-modal__form');
        
        this.init();
    }
    
    /**
     * Инициализация обработчиков событий
     */
    init() {
        // Закрытие модального окна по клику на крестик
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', this.close.bind(this));
        }
        
        // Закрытие модального окна по клику на фон (вне модального окна)
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // Обработка отправки формы
        if (this.form) {
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
        }
        
        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });
    }
    
    /**
     * Открывает модальное окно
     * @param {Object} questInfo - Информация о квесте (опционально)
     */
    open(questInfo = null) {
        // Удаляем сообщение об успешной отправке, если оно существует
        this.removeSuccessMessage();
        
        // Если переданы данные о квесте, можно добавить их в скрытое поле формы
        if (questInfo && this.form) {
            let questIdInput = this.form.querySelector('input[name="questId"]');
            if (!questIdInput) {
                questIdInput = document.createElement('input');
                questIdInput.type = 'hidden';
                questIdInput.name = 'questId';
                this.form.appendChild(questIdInput);
            }
            questIdInput.value = questInfo.id || '';
            
            // Можно установить название квеста в заголовке
            const title = this.modal.querySelector('.quest-modal__title');
            if (title && questInfo.title) {
                title.textContent = `Записаться на квест "${questInfo.title}"`;
            }
        }
        
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Блокируем прокрутку body
    }
    
    /**
     * Закрывает модальное окно
     */
    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = ''; // Возвращаем прокрутку
        
        // Опционально: сброс формы
        if (this.form) {
            this.form.reset();
        }
        
        // Удаляем сообщение об успешной отправке для следующего использования
        this.removeSuccessMessage();
    }
    
    /**
     * Удаляет сообщение об успешной отправке
     */
    removeSuccessMessage() {
        const successMessage = this.modal.querySelector('.quest-modal__success');
        if (successMessage) {
            successMessage.remove();
        }
    }
    
    /**
     * Обработчик отправки формы
     * @param {Event} e - Событие отправки формы
     */
    handleSubmit(e) {
        e.preventDefault();
        
        // Собираем данные формы
        const formData = new FormData(this.form);
        const formDataObj = {};
        
        formData.forEach((value, key) => {
            formDataObj[key] = value;
        });
        
        // Получаем текущую дату и время для записи
        formDataObj.submitted = new Date().toISOString();
        
        // Сохраняем данные в JSON-файл на сервере
        this.saveBooking(formDataObj);
    }
    
    /**
     * Сохраняет бронирование в JSON-файл на сервере
     * @param {Object} bookingData - Данные бронирования
     */
    async saveBooking(bookingData) {
        try {
            // Создаем индикатор загрузки
            const loadingIndicator = this.createLoadingIndicator();
            this.modal.querySelector('.quest-modal__content').appendChild(loadingIndicator);
            
            let saveResult;
            
            // Сохраняем данные через JavaScript-модуль
            if (window.bookingsStorage) {
                console.log('Сохраняем данные через JavaScript-модуль');
                saveResult = await window.bookingsStorage.addBooking(bookingData);
            } else {
                // Если JavaScript-модуль недоступен, используем локальное сохранение
                console.log('JavaScript-модуль недоступен, используем локальное сохранение');
                saveResult = this.saveToLocalStorage(bookingData);
            }
            
            // Удаляем индикатор загрузки
            loadingIndicator.remove();
            
            // Показываем уведомление об успешной отправке
            this.showSuccessMessage();
            
            // Закрываем модальное окно через 2 секунды
            setTimeout(() => {
                this.close();
            }, 2000);
            
        } catch (error) {
            console.error('Ошибка при отправке данных:', error);
            this.showErrorMessage('Произошла ошибка при отправке данных. Попробуйте еще раз.');
        }
    }
    
    /**
     * Сохраняет данные в localStorage
     * @param {Object} bookingData - Данные бронирования
     * @returns {Object} - Результат операции
     */
    saveToLocalStorage(bookingData) {
        try {
            // Получаем текущие бронирования из localStorage
            let bookings = [];
            const savedBookings = localStorage.getItem('questBookings');
            
            if (savedBookings) {
                bookings = JSON.parse(savedBookings);
            }
            
            // Добавляем ID и временную метку
            bookingData.id = this.generateUniqueId();
            bookingData.timestamp = new Date().toISOString();
            
            // Добавляем новое бронирование
            bookings.push(bookingData);
            
            // Сохраняем обновленный список бронирований
            localStorage.setItem('questBookings', JSON.stringify(bookings));
            console.log('Данные успешно сохранены в localStorage:', bookingData);
            
            // Также экспортируем данные в JSON-файл
            this.exportToJsonFile(bookings);
            
            return {
                success: true,
                message: 'Booking saved successfully',
                data: bookingData
            };
        } catch (error) {
            console.error('Ошибка при сохранении данных в localStorage:', error);
            return {
                success: false,
                message: 'Failed to save booking',
                error: error.message
            };
        }
    }
    
    /**
     * Генерирует уникальный идентификатор
     * @returns {string} - Уникальный ID
     */
    generateUniqueId() {
        return 'quest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Экспортирует данные в JSON-файл для скачивания
     * @param {Array} bookings - Массив с данными бронирований
     */
    exportToJsonFile(bookings) {
        try {
            // Создаем объект Blob с JSON-данными
            const jsonData = JSON.stringify(bookings, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            
            // Создаем ссылку для скачивания и симулируем клик
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'quest_bookings.json';
            
            // Добавляем ссылку на страницу и эмулируем клик (для скачивания файла)
            document.body.appendChild(link);
            link.click();
            
            // Удаляем ссылку
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
        } catch (error) {
            console.error('Ошибка при экспорте данных в JSON-файл:', error);
        }
    }
    
    /**
     * Создает индикатор загрузки
     * @returns {HTMLElement} - Элемент индикатора загрузки
     */
    createLoadingIndicator() {
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'quest-modal__loading';
        loadingIndicator.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(34, 30, 31, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10;
        `;
        
        // Анимация загрузки
        const spinner = document.createElement('div');
        spinner.style.cssText = `
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid #C22033;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
        `;
        
        // Добавляем стиль анимации
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        loadingIndicator.appendChild(spinner);
        return loadingIndicator;
    }
    
    /**
     * Показывает сообщение об ошибке
     * @param {string} message - Текст сообщения об ошибке
     */
    showErrorMessage(message) {
        // Проверяем, существует ли уже сообщение об ошибке
        let errorMessage = this.modal.querySelector('.quest-modal__error');
        
        if (!errorMessage) {
            // Создаем элемент сообщения
            errorMessage = document.createElement('div');
            errorMessage.className = 'quest-modal__error';
            errorMessage.style.cssText = `
                position: absolute;
                bottom: 20px;
                left: 20px;
                right: 20px;
                background-color: rgba(220, 53, 69, 0.9);
                color: #fff;
                padding: 15px;
                border-radius: 5px;
                font-family: 'Lato', sans-serif;
                font-size: 14px;
                text-align: center;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
                z-index: 10;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            errorMessage.textContent = message;
            
            // Добавляем кнопку закрытия
            const closeBtn = document.createElement('button');
            closeBtn.textContent = '×';
            closeBtn.style.cssText = `
                position: absolute;
                top: 5px;
                right: 10px;
                background: none;
                border: none;
                color: #fff;
                font-size: 20px;
                line-height: 1;
                cursor: pointer;
            `;
            
            closeBtn.addEventListener('click', () => {
                errorMessage.remove();
            });
            
            errorMessage.appendChild(closeBtn);
            
            // Автоматическое скрытие сообщения через 5 секунд
            setTimeout(() => {
                errorMessage.remove();
            }, 5000);
            
            // Добавляем сообщение в модальное окно
            this.modal.querySelector('.quest-modal__content').appendChild(errorMessage);
        } else {
            // Обновляем текст сообщения
            errorMessage.textContent = message;
        }
        
        // Показываем сообщение с анимацией
        setTimeout(() => {
            errorMessage.style.opacity = '1';
        }, 100);
    }
    
    /**
     * Показывает сообщение об успешной отправке
     */
    showSuccessMessage() {
        // Проверяем, существует ли уже сообщение об успехе
        let successMessage = this.modal.querySelector('.quest-modal__success');
        
        if (!successMessage) {
            // Создаем элемент сообщения
            successMessage = document.createElement('div');
            successMessage.className = 'quest-modal__success';
            successMessage.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(34, 30, 31, 0.97);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                color: #fff;
                z-index: 10;
                padding: 20px;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            // Добавляем иконку успеха
            const icon = document.createElement('div');
            icon.innerHTML = `
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18457 2.99721 7.13633 4.39828 5.49707C5.79935 3.85781 7.69279 2.71538 9.79619 2.24015C11.8996 1.76491 14.1003 1.98234 16.07 2.86" stroke="#C22033" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M22 4L12 14.01L9 11.01" stroke="#C22033" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
            
            // Создаем текст сообщения
            const text = document.createElement('p');
            text.textContent = 'Заявка успешно отправлена!';
            text.style.cssText = `
                font-family: 'Unbounded', sans-serif;
                font-size: 20px;
                margin-top: 20px;
                text-align: center;
            `;
            
            // Добавляем подтекст
            const subtext = document.createElement('p');
            subtext.textContent = 'Мы свяжемся с вами в ближайшее время';
            subtext.style.cssText = `
                font-family: 'Lato', sans-serif;
                font-size: 16px;
                margin-top: 10px;
                text-align: center;
                color: #E0E0E0;
            `;
            
            // Добавляем элементы в сообщение
            successMessage.appendChild(icon);
            successMessage.appendChild(text);
            successMessage.appendChild(subtext);
            
            // Добавляем сообщение в модальное окно
            this.modal.querySelector('.quest-modal__content').appendChild(successMessage);
        }
        
        // Показываем сообщение с анимацией
        setTimeout(() => {
            successMessage.style.opacity = '1';
        }, 100);
    }
} 