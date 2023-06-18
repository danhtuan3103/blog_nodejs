const redis = require("redis");
require("dotenv").config();
const client = redis.createClient({
  socket: {
    host: process.env.REDIS_URL,
    port: process.env.REDIS_PORT,
  },
  password: process.env.REDIS_PASS,
});

// const client = redis.createClient('')
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
