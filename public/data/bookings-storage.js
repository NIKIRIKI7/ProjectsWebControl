/**
 * Модуль для сохранения и загрузки данных бронирований
 * Используется как альтернатива PHP-решению
 */

class BookingsStorage {
    constructor() {
        this.storageKey = 'questBookings';
    }

    /**
     * Добавляет новое бронирование
     * @param {Object} bookingData - Данные бронирования
     * @returns {Promise<Object>} - Результат операции
     */
    async addBooking(bookingData) {
        try {
            // Получаем текущие бронирования
            const bookings = this.getBookings();
            
            // Добавляем ID и временную метку
            bookingData.id = this.generateUniqueId();
            bookingData.timestamp = new Date().toISOString();
            
            // Добавляем новое бронирование
            bookings.push(bookingData);
            
            // Сохраняем обновленный список бронирований
            this.saveBookings(bookings);
            
            // Возвращаем результат в формате, совместимом с ответом сервера
            return {
                success: true,
                message: 'Booking saved successfully',
                data: bookingData
            };
        } catch (error) {
            console.error('Ошибка при сохранении бронирования:', error);
            return {
                success: false,
                message: 'Failed to save booking',
                error: error.message
            };
        }
    }
    
    /**
     * Получает все бронирования
     * @returns {Array} - Массив бронирований
     */
    getBookings() {
        try {
            const savedBookings = localStorage.getItem(this.storageKey);
            return savedBookings ? JSON.parse(savedBookings) : [];
        } catch (error) {
            console.error('Ошибка при получении бронирований:', error);
            return [];
        }
    }
    
    /**
     * Сохраняет бронирования в localStorage
     * @param {Array} bookings - Массив бронирований для сохранения
     */
    saveBookings(bookings) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(bookings));
            
            // Также сохраняем в виде загружаемого файла
            this.exportToJsonFile(bookings);
            
            return true;
        } catch (error) {
            console.error('Ошибка при сохранении бронирований:', error);
            return false;
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
            
            // Создаем объект URL для скачивания
            window.bookingsDataUrl = URL.createObjectURL(blob);
            
            // Отправляем событие для уведомления о готовности скачивания
            const event = new CustomEvent('bookingsDataReady', { 
                detail: { 
                    url: window.bookingsDataUrl,
                    count: bookings.length
                } 
            });
            document.dispatchEvent(event);
            
            return window.bookingsDataUrl;
        } catch (error) {
            console.error('Ошибка при экспорте данных в JSON-файл:', error);
            return null;
        }
    }
    
    /**
     * Создает и загружает JSON-файл с данными бронирований
     */
    downloadJsonFile() {
        try {
            if (window.bookingsDataUrl) {
                // Создаем ссылку для скачивания
                const link = document.createElement('a');
                link.href = window.bookingsDataUrl;
                link.download = 'quest_bookings.json';
                
                // Добавляем ссылку в DOM и имитируем клик
                document.body.appendChild(link);
                link.click();
                
                // Удаляем ссылку
                setTimeout(() => {
                    document.body.removeChild(link);
                }, 100);
                
                return true;
            } else {
                // Если URL еще не создан, создаем заново
                const bookings = this.getBookings();
                this.exportToJsonFile(bookings);
                setTimeout(() => this.downloadJsonFile(), 100);
            }
        } catch (error) {
            console.error('Ошибка при скачивании JSON-файла:', error);
            return false;
        }
    }
}

// Экспортируем экземпляр класса
window.bookingsStorage = new BookingsStorage(); 