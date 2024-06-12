const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

const app = express();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext);
        const timestamp = Date.now();
        cb(null, `${basename}-${timestamp}${ext}`);
    }
});

const upload = multer({ storage });

app.use(express.static('public')); // `index.html` ve diğer statik dosyalar için

async function convertDocxToHtml(inputPath, outputPath, rate, language) {
    try {
        const result = await mammoth.convertToHtml({ path: inputPath });
        const value = result.value;

        let html = `
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <title>Dönüştürülmüş Belge</title>
        </head>
        <body>
            ${value}
            <script>
                function getSelectedText() {
                    let selectedText = "";
                    if (window.getSelection) {
                        selectedText = window.getSelection().toString();
                    } else if (document.selection && document.selection.type != "Control") {
                        selectedText = document.selection.createRange().text;
                    }
                    return selectedText;
                }

                function speakText(text) {
                    const voices = speechSynthesis.getVoices();
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = '${language}';
                    utterance.rate = ${rate};
                    speechSynthesis.speak(utterance);
                }

                function logAndSpeakSelection() {
                    const selectedText = getSelectedText();
                    if (selectedText) {
                        console.log("Selected text: ", selectedText);
                        speakText(selectedText);
                    }
                }

                document.addEventListener("mouseup", logAndSpeakSelection);
                document.addEventListener("keyup", logAndSpeakSelection);
            </script>
        </body>
        </html>
        `;

        fs.writeFileSync(outputPath, html);

        console.log(`Conversion successful! HTML file: ${outputPath}`);
    } catch (error) {
        console.error(`Error during conversion: ${error.message}`);
    }
}

app.post('/convert', upload.single('file'), async (req, res) => {
    const { file } = req;
    const { rate, language } = req.body;

    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    const inputPath = file.path;
    const outputPath = path.join(__dirname, 'public', `${file.filename}.html`);

    try {
        await convertDocxToHtml(inputPath, outputPath, rate, language);
        res.json({ url: `/${file.filename}.html` });
    } catch (error) {
        res.status(500).send(`Error during conversion: ${error.message}`);
    } finally {
        fs.unlink(inputPath, (err) => {
            if (err) console.error(`Error deleting uploaded file: ${err.message}`);
        });
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});