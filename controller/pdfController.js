const users = require("../models/usersModel");
const path = require('path');
// const puppeteer = require('puppeteer');
const pdf = require('html-pdf');
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

const exportPuppeteerPDF = async (req, res) => {

    try {

        const data = { users };

        const fileUniqueName = `users${new Date().getTime()}.pdf`;

        const filePathName = path.resolve(__dirname, '../views/htmlToPdf.ejs');

        let browser = await puppeteer.launch();
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

const exportHTMLPDF = (req, res) => {

    try {

        const data = { users };
        const filePathName = path.resolve(__dirname, '../views/htmlToPdf.ejs');

        const htmlString = fs.readFileSync(filePathName).toString();

        let options = {
            "height": "10.5in",
            "width": "9in",
            "paginationOffset": 1,
            "header": {
                "height": "25mm",
                "contents": '<div style="text-align: center;">DELIVERY CHALLAN</div>'
            },
            "footer": {
                "height": "10mm",
                "contents": {
                    first: '<div id="paginateId" style="text-align: center;">{{page}}/{{pages}}</div>',
                    2: '<div style="text-align: center;">{{page}}/{{pages}}</div>',
                    default: `<div style="text-align: center;" id="paginateId">
                        <span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>
                    </div>`,
                    last: 'Last Page'
                }
            },
        };

        const ejsData = ejs.render(htmlString, data);

        const fileUniqueName = `users${new Date().getTime()}.pdf`;

        pdf.create(ejsData, options).toFile(fileUniqueName, (err, response) => {
            if (err) console.log(err);

            console.log(response);

            return res.json({ response })
        });
    } catch (error) {
        console.log(error);
    }
};

const exportBufferPDF = (req, res) => {

    const data = { users };

    ejs.renderFile(path.join(__dirname, "../views/", "htmlToPdf.ejs"), { data: data }, (err, data) => {
        if (err) {
            res.json({ ejsErr: err });
        } else {

            let options = {
                format: 'Letter',
                directory: "/tmp",
                timeout: 540000,
                "childProcessOptions": {
                    "detached": true
                }
            };

            return new Promise(function (resolve, reject) {
                pdf.create(data, options).toBuffer(function (err, buffer) {
                    if (err) {
                        console.log(err);
                        res.json({ pdfErr: err });
                    } else {
                        console.log(buffer)
                        var pdfBuffer = new Buffer(buffer)
                        res.setHeader('Content-disposition', 'inline; filename="test.pdf"');
                        res.setHeader('Content-type', 'application/pdf');
                        res.send(pdfBuffer)
                    }
                });
            });
        }
    });
};

module.exports = {
    mainHTML,
    createPDFPuppeteer,
    exportPuppeteerPDF,
    exportHTMLPDF,
    exportBufferPDF
};