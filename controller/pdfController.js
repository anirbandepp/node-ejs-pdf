const users = require("../models/usersModel");
const path = require('path');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const fs = require('fs');

const mainHTML = async (req, res) => {
    let filePath = path.join(__dirname, '../public/' + "challan.html");
    res.sendFile(filePath);
};

const createPDFPuppeteer = async (req, res, next) => {

    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.goto(`http://localhost:5000/main-html`, {
            waitUntil: "networkidle2"
        });

        await page.setViewport({ width: 1680, height: 1050 });

        const todayDate = new Date().getTime();

        const pdfn = await page.pdf({
            path: `${path.join(__dirname, '../public/files', todayDate + ".pdf")}`,
            printBackground: true,
            format: "A4"
        });

        await browser.close();

        const pdfURL = path.join(__dirname, '../public/files', todayDate + ".pdf");

        res.set({
            "Content-Type": "application/pdf",
            "Content-Length": pdfn.length
        });

        res.sendFile(pdfURL);

        // res.download(pdfURL, function (err) {
        //     if (err) {
        //         throw new Error(err);
        //     }
        // });

    } catch (error) {
        console.log(error);
        res.json({ error });
    }
};

const exportUserPDF = async (req, res) => {

    try {

        const data = { users };

        const fileUniqueName = `users${new Date().getTime()}.pdf`;

        const filePathName = path.resolve(__dirname, '../views/htmlToPdf.ejs');

        const htmlString = fs.readFileSync(filePathName).toString();

        let browser = await puppeteer.launch({ headless: "new" });
        const [page] = await browser.pages();

        const html = await ejs.renderFile(filePathName, {
            data
        });
        await page.setContent(html);

        const pdf = await page.pdf({
            path: `generate-pdf/${fileUniqueName}`,
            format: "A4"
        });

        const nodemailer = require('nodemailer');

        var transporter = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            // secure: true,
            auth: {
                user: "631a07952c0a3a",
                pass: "8bc03ff401deb1"
            }
        });

        const info = await transporter.sendMail({
            from: '<sender@example.com>',
            to: ["anirbankreative22@gmail.com", "pathaksangita930@gmail.com"],
            subject: "Test PDF Mail Send",
            attachments: [
                {
                    filename: fileUniqueName,
                    content: Buffer.from(pdf, 'utf-8')
                }
            ]
        });

        return res.json({ fileUniqueName, info });

    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    mainHTML,
    createPDFPuppeteer,
    exportUserPDF
};