const express = require('express');
const app = express();
let PORT = process.env.PORT || 5000;

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static("public"));

const puppeteerRoutes = require("./routes/puppeteer");

app.get("/", (req, res) => {
    res.send("I am a server, http://localhost:5000/create-user-pdf")
});

//Routes of the APP
app.use("/puppeteer", puppeteerRoutes);

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