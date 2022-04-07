const mongoose = require('mongoose')
const { Schema } = mongoose

const articleSchema = new Schema({
    // Data
    title: { name: String, type: String },
    date: { name: String, type: Date }, // will be added by the controller
    content: { name: String, type: String },
    /* cover: { name: String, type: String }, */ // vérifier comment recevoir des fichiers par un front-end et comment envoyer des fichiers sur IPFS via OrbitDB
    category: { name: String, type: Number }, // if an article is in trash it's defined here
    /* media: [{ // vérifier comment recevoir des fichiers par un front-end et comment envoyer des fichiers sur IPFS via OrbitDB
        title: { name: String, type: String },
        data: { name: String, type: String },
    }], */
    /* hyperlinks: [{
        displayText: { name: String, type: String },
        url: { name: String, type: Number }
    }] */

    // Metadata
    score: { name: String, type: Number },
    nsfw: { name: String, type: Boolean },
})

module.exports = mongoose.model('Article', articleSchema, 'Articles');
module.exports = articleSchema;