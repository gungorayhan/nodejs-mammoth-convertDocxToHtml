const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

async function convertDocxToHtml(inputPath, outputPath) {
    try {
        
        const result = await mammoth.convertToHtml({ path: inputPath });

        const html = result.value;

        fs.writeFileSync(outputPath, html);

        console.log(`Dönüştürme başarılı! HTML dosyası: ${outputPath}`);
    } catch (error) {
        console.error(`Dönüştürme sırasında hata oluştu: ${error.message}`);
    }
}

// Dosya yollarını belirleme
const inputPath = path.join(__dirname, '500-vocabulary.docx');  
const outputPath = path.join(__dirname, '500-vocabulary.html'); 

convertDocxToHtml(inputPath, outputPath);