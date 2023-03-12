const redis = require("redis");

// const client = redis.createClient({
//   socket: {
//     host: "redis-18022.c292.ap-southeast-1-1.ec2.cloud.redislabs.com",
//     port: "18022",
//   },
//   password: 'Jbo14aXB23QslJFRbEeq9KK6VY324TNa'
// });

const client = redis.createClient('')
function connect() {
  client.connect();

  client.on("error", (err) => console.log("Redis Client Error", err));

  client.on("connect", (err) => {
    console.log("Redis connected");
  });

  client.on("ready", (err) => {
    console.log("Redis Ready");
  });
}

module.exports = { connect, client };
