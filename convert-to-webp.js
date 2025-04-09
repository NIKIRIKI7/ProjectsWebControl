const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Функция для рекурсивного обхода директорий
function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            getAllFiles(filePath, fileList);
        } else if (file.toLowerCase().endsWith('.png') || file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

// Функция для конвертации одного изображения в WebP
async function convertToWebp(inputFile) {
    try {
        const dir = path.dirname(inputFile);
        const filename = path.basename(inputFile, path.extname(inputFile));
        const outputFile = path.join(dir, `${filename}.webp`);
        
        // Конвертация в WebP с помощью sharp
        await sharp(inputFile)
            .webp({ quality: 85 }) // Качество от 1 до 100
            .toFile(outputFile);
            
        console.log(`Сконвертировано: ${path.relative(__dirname, inputFile)} -> ${path.relative(__dirname, outputFile)}`);
        return outputFile;
    } catch (error) {
        console.error(`Ошибка при конвертации ${path.relative(__dirname, inputFile)}:`, error);
        return null;
    }
}

// Процесс конвертации всех изображений
async function processImages() {
    // Находим все PNG, JPG, JPEG файлы
    const imgBaseDir = path.join(__dirname, 'img');
    const allImageFiles = getAllFiles(imgBaseDir);
    
    console.log(`Найдено ${allImageFiles.length} изображений для конвертации`);

    // Конвертируем каждое изображение
    const results = [];
    for (const file of allImageFiles) {
        const result = await convertToWebp(file);
        if (result) results.push(result);
    }
    
    console.log(`Успешно сконвертировано ${results.length} из ${allImageFiles.length} изображений`);
}

// Запуск процесса конвертации
processImages()
    .then(() => console.log('✅ Конвертация завершена!'))
    .catch(error => console.error('❌ Ошибка при конвертации:', error)); 