const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

async function convertDocxToHtml(inputPath, outputPath) {
    try {
        
        const result = await mammoth.convertToHtml({ path: inputPath });

        const value = result.value;

      let  html = `
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <title>Dönüştürülmüş Belge</title>
        </head>
        <body>
            ${value}

            <script>
        // Metin seçimini tespit eden fonksiyon
        function getSelectedText() {
            let selectedText = "";
            if (window.getSelection) {
                selectedText = window.getSelection().toString();
            } else if (document.selection && document.selection.type != "Control") {
                selectedText = document.selection.createRange().text;
            }
            return selectedText;
        }

            // Seçimi okuyan fonksiyon
            function speakText(text) {
                voices = speechSynthesis.getVoices();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'en-GB';  // İngilizce aksan için dil ayarı
                utterance.rate = 0.7;
                speechSynthesis.speak(utterance);
            }

            // Seçim yapıldığında metni al, kontrol et ve okut
            function logAndSpeakSelection() {
                const selectedText = getSelectedText();
                if (selectedText) {
                    console.log("Seçilen metin: ", selectedText);
                    speakText(selectedText);
                }
            }

            // mouseup ve keyup olaylarını dinle
            document.addEventListener("mouseup", logAndSpeakSelection);
            document.addEventListener("keyup", logAndSpeakSelection);
            </script>
        </body>
        </html>
        `;

        fs.writeFileSync(outputPath, html);

        console.log(`Dönüştürme başarılı! HTML dosyası: ${outputPath}`);
    } catch (error) {
        console.error(`Dönüştürme sırasında hata oluştu: ${error.message}`);
    }
}

// Dosya yollarını belirleme
const inputPath = path.join(__dirname, 'chatgpt-çeviri.docx');  
const outputPath = path.join(__dirname, 'chatgpt-çeviri.html'); 

convertDocxToHtml(inputPath, outputPath);