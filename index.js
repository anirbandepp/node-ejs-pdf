const express = require('express');
const app = express();
let PORT = process.env.PORT || 5000;

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static("public"));

const { createPDFPuppeteer, mainHTML, exportPuppeteerPDF, exportHTMLPDF, exportBufferPDF } = require('./controller/pdfController');

app.get("/", (req, res) => {
    res.send("I am a server, http://localhost:5000/create-user-pdf")
});

app.get("/main-html", mainHTML);
app.get("/create-pdf-puppeteer", createPDFPuppeteer);
app.get("/create-puppeteer-pdf", exportPuppeteerPDF);
app.get("/create-html-pdf", exportHTMLPDF);
app.get("/export-buffer-pdf", exportBufferPDF);

const start = async () => {
    try {
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        })
    } catch (error) {
        console.log(error);
    }
}
start();