const mongoose = require('mongoose')
const { Schema } = mongoose

const articleSchema = new Schema({
    title: { name: String, type: String },
    date: { name: String, type: Number },
    cover: { name: String, type: String }, // vérifier comment recevoir des fichiers par un front-end et comment envoyer des fichiers sur IPFS via OrbitDB
    score: { name: String, type: Number },
    nsfw: { name: String, type: Boolean },
    trash: { name: String, type: Boolean },
    category: { name: String, type: Number },
    media: [{ // vérifier comment recevoir des fichiers par un front-end et comment envoyer des fichiers sur IPFS via OrbitDB
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