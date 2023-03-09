const fs = require('fs').promises;
const path = require('path');
const {format} = require('date-fns');

const fileName = path.join(__dirname, '../Logs', 'error.log');

const logEvent = async function (msg) {
    const date = `${format(new Date(), 'dd-MM-yyyy\tHH:mm:ss')}`;
    const contentLog = `${date} ---- ${msg}\n`;

    try {
        fs.appendFile(fileName, contentLog);

    }catch (err) {
        console.log(err);
    }
}

module.exports = logEvent;
