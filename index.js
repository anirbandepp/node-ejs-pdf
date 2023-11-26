const express = require('express');
const app = express();
let PORT = process.env.PORT || 5000;

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static("public"));

const puppeteerRoutes = require("./routes/puppeteer");
const excelRoutes = require("./routes/excel");
const requestRoutes = require("./routes/request");

app.get("/", (req, res) => {
    res.sendFile(__dirname + './index.html');
});

//Routes of the APP
app.use("/puppeteer", puppeteerRoutes);
app.use("/exceljs", excelRoutes);
app.use("/request", requestRoutes);

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