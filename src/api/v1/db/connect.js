const mongoose = require('mongoose');
require('dotenv').config();

const connect = async () => {
    try {
        console.log(process.env.MONGODB_URL)
        mongoose.set('strictQuery', true);
        await mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true , useUnifiedTopology: true});
        console.log('Connect MONGODB successfully');
    } catch (error) {
        console.log("MONGODB ERROR ::  " + error);
    }
}

module.exports = {connect}



