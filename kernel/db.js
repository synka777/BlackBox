require('dotenv').config()

const mongoose = require('mongoose');

const host = process.env.DB_HOST;
const dbname = process.env.DB_NAME;
const username = process.env.DB_USR;
const password = process.env.DB_PWD;

const uri = `mongodb+srv://${username}:${password}@${host}/${dbname}?retryWrites=true&w=majority`;

module.exports.connect = async() => {
    mongoose.Promise = global.Promise;
    mongoose.connect(uri, { useNewUrlParser : true });
    const db = mongoose.connection
    db.on('error', (error) => console.error(error))
    db.once('open', () => console.log('Connected to Database'))
        
}
