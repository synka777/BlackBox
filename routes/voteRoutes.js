const express = require("express")
const router = express.Router()
const utils = require('../kernel/utils')

router.get('/', (req, res) => {
    res.write('Envoie un vote pour reporter les medias d\'un article en NSFW et les flouter')
    res.write(`
        Pour tester l'API, utiliser Postman, Insomnia ou autre moyen
        permettant d'inclure un body avec les requetes HTTP.
    `)
    res.send()
})

// voteReclassify

// voteReport

// voteTrash