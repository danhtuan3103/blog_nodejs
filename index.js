const {app, server} = require('./app');
const port = process.env.PORT || 4000;
const path = require('path');

// const fileName = path.join(__dirname, '../src/api/v1/Logs', 'error.log');


server.listen(port, () => {
    console.log('listening on port ' + port);
})


