const users = require("../models/usersModel");
const path = require('path');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const pdf = require('html-pdf');
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

const exportUserPDF = (req, res) => {

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
            if (err) throw err;

            const filePath = path.resolve(__dirname, `../${fileUniqueName}`);

            fs.readFile(filePath, (err, file) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send("could not download file");
                }

                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment;filename=${fileUniqueName}`);

                res.send(file);
            });

        });

    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    mainHTML,
    createPDFPuppeteer,
    exportUserPDF
};