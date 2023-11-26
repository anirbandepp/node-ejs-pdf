const users = require("../models/usersModel");
const calibration = require("../models/certificateModel");
const path = require('path');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const fs = require('fs');

const DeliveryChallan = async (req, res) => {

    try {

        const data = { users };

        const filePathName = path.resolve(__dirname, '../views/htmlToPdf.ejs');

        let browser = await puppeteer.launch();
        const [page] = await browser.pages();

        const html = await ejs.renderFile(filePathName, {
            data
        });
        await page.setContent(html);


        const todayDate = new Date().getTime();

        const pdfn = await page.pdf({
            path: `${path.join(__dirname, '../public/files', todayDate + ".pdf")}`,
            printBackground: true,
            format: "A4",
            displayHeaderFooter: true,
            headerTemplate: ``,
            footerTemplate: `
                <div style="border-top: solid 1px #bbb; width: 100%; font-size: 9px;
                    padding: 5px 5px 0; color: #bbb; position: relative;">
                    <div style="position: absolute; right: 50%; top: 5px;">
                        <span class="pageNumber"></span>/<span class="totalPages"></span>
                    </div>
                </div>
            `,
            margin: { bottom: '70px' },
        });

        await browser.close();
        const pdfURL = path.join(__dirname, '../public/files', todayDate + ".pdf");
        res.set({
            "Content-Type": "application/pdf",
            "Content-Length": pdfn.length
        });
        return res.sendFile(pdfURL);

        const nodemailer = require('nodemailer');

        var transporter = nodemailer.createTransport({
            name: "DeliveryChallan",
            host: "mail.iviewsense.com",
            port: 465,
            secure: true,
            auth: {
                user: "anirban@iviewsense.com",
                pass: "IDJWMmPNt#h"
            }
        });

        const info = await transporter.sendMail({
            from: "anirban@iviewsense.com",
            to: ["pathaksangita930@gmail.com"],
            subject: "Test PDF Mail Send",
            attachments: [
                {
                    filename: "DeliveryChallan.pdf",
                    content: Buffer.from(pdfn, 'utf-8')
                }
            ]
        });

        console.log(info);
        return res.json({ info });

    } catch (error) {
        console.log(error);
    }
};

const certificate = async (req, res) => {

    try {
        const EjsFilePath = path.resolve(__dirname, '../views/certificate.ejs');

        let browser = await puppeteer.launch();
        const [page] = await browser.pages();

        ejs.renderFile(EjsFilePath,
            { calibration },
            async (err, data) => {
                if (err) {
                    console.log(err);
                    return res.json({ error: err });
                } else {
                    await page.setContent(data);

                    const todayDate = new Date().getTime();

                    const pdfn = await page.pdf({
                        path: `${path.join(__dirname, '../public/certificate', todayDate + ".pdf")}`,
                        printBackground: true,
                        format: "A4",
                        displayHeaderFooter: true,
                        headerTemplate: ``,
                        footerTemplate: `
                        <div style="border-top: solid 1px #bbb; width: 100%; font-size: 9px;
                            padding: 5px 5px 0; color: #bbb; position: relative;">
                            <div style="position: absolute; right: 50%; top: 5px;">
                                <span class="pageNumber"></span>/<span class="totalPages"></span>
                            </div>
                        </div>`,
                        margin: { bottom: '70px' },
                    });

                    await browser.close();
                    const pdfURL = path.join(__dirname, '../public/certificate', todayDate + ".pdf");
                    res.set({
                        "Content-Type": "application/pdf",
                        "Content-Length": pdfn.length
                    });

                    return res.sendFile(pdfURL);
                }
            });
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    DeliveryChallan,
    certificate
};