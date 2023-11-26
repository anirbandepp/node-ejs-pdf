const request = require('request');

const create = async (req, res, next) => {

    request
        .get('https://jsonplaceholder.typicode.com/posts', function (error, response, body) {
            return res.json(response)
        })
}

module.exports = {
    create
};