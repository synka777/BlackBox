const mongoose = require('mongoose')
const { Schema } = mongoose

const voteSchema = new Schema({
    id: { name: String, type: String },
    votes: [{ // vérifier comment recevoir des fichiers par un front-end et comment envoyer des fichiers sur IPFS via OrbitDB
        type: { name: String, type: String }, // peut être un nom de catégorie, "trash", ou bien nsfw
        score: { name: String, type: String },
        threshold: { name: String, type: Number },
        completed: { name: String, type: Boolean }
    }]
})

module.exports = mongoose.model('Vote', articleSchema, 'Votes')
module.exports = programElementSchema