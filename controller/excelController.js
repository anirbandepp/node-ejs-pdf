const User = require("../models/excelUser");
const excelJS = require("exceljs");

const create = async (req, res, next) => {

    const workbook = new excelJS.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet("My Users"); // New Worksheet

    const path = "./files";

    // Column for data in excel. key must match data key
    worksheet.columns = [
        { header: "S no.", key: "s_no", width: 10 },
        { header: "First Name", key: "fname", width: 10 },
        { header: "Last Name", key: "lname", width: 10 },
        { header: "Email Id", key: "email", width: 10 },
        { header: "Gender", key: "gender", width: 10 },
    ];

    // Looping through User data
    let counter = 1;

    User.forEach((user) => {
        user.s_no = counter;
        worksheet.addRow(user); // Add data in worksheet
        counter++;
    });

    // Making first line in excel bold
    worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
    });

    try {

        var fileName = 'srf.xlsx';

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader("Content-Disposition", "attachment; filename=" + fileName);

        workbook.xlsx.write(res).then(() => {
            res.end();
        });

    } catch (err) {
        console.log(err);
        return res.send({
            status: "error",
            message: "Something went wrong",
        });
    }
};

module.exports = {
    create
};