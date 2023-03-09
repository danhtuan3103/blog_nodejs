const redis = require('redis');

const client = redis.createClient('');

function connect () {
    client.connect();

    client.on('error', (err) => console.log('Redis Client Error', err));
    
    client.on('connect', (err) => {
        console.log("Redis connected");
    })
    
    client.on('ready', (err) => {
        console.log("Redis Ready");
    })
}



module.exports = {connect, client};