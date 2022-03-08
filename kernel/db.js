require('dotenv').config()

const mongoose = require('mongoose')

const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
// const dbname = process.env.DB_NAME
// const username = process.env.DB_USR
// const password = process.env.DB_PWD

module.exports.uri = `http://${host}:${port}/api/v1/`

/* module.exports.connect = async() => {
    mongoose.Promise = global.Promise
    mongoose.connect(uri, { useNewUrlParser : true })
    const db = mongoose.connection
    db.on('error', (error) => console.error(error))
    db.once('open', () => console.log('Connected to Database'))
} */
