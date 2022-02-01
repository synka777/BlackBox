const mongoose = require('mongoose')
const { Schema } = mongoose

const articleSchema = new Schema({
    title: { name: String, type: String },
    date: { name: String, type: Number },
    cover: { name: String, type: String }, // check how to send files through postman AND OrbitDB
    score: { name: String, type: Number },
    nsfw: { name: String, type: Boolean },
    trash: { name: String, type: Boolean },
    category: { name: String, type: Number },
    media: [{ // check how to send files through postman AND OrbitDB
        title: { name: String, type: String },
        data: { name: String, type: String },
    }],
    hyperlinks: [{
        displayText: { name: String, type: String },
        url: { name: String, type: Number }
    }]
})

module.exports = mongoose.model('Article', articleSchema, 'Articles')
module.exports = programElementSchema