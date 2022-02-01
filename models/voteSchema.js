const mongoose = require('mongoose')
const { Schema } = mongoose

const voteSchema = new Schema({
    id: { name: String, type: String },
    votes: [{ // check how to send files through postman AND OrbitDB
        type: { name: String, type: String }, // peut être un nom de catégorie, "trash", ou bien nsfw
        score: { name: String, type: String },
        threshold: { name: String, type: Number },
        completed: { name: String, type: Boolean }
    }]
})

module.exports = mongoose.model('Vote', articleSchema, 'Votes')
module.exports = programElementSchema