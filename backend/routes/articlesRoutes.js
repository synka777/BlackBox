const express = require("express")
const router = express.Router()
const utils = require('../kernel/utils')

router.get('/', (req, res) => {
    res.write('Envoie une requête pour rechercher des articles avec ou sans filtres de recherche')
    res.write(`
        Pour tester l'API, utiliser Postman, Insomnia ou autre moyen
        permettant d'inclure un body avec les requetes HTTP.
    `)
    res.send()
})


router.get('/read', async(req, res) => {
    const token = req.cookies.token
    try{
        const payload = utils.verifyToken(res, token)
        if(payload.status){ 
            res.end()
            return payload.status 
        }
    }catch(e){
        return res.status(401).end()
    }
    res.write(JSON.stringify({ title: 'The big sad' }))
    res.status(200)
    res.send()
    /* baseController.readDocuments(req.body, resource, ['_id','__v']).then(resp => {
        if(resp.statusMessage){ res.statusMessage = resp.statusMessage }
        if(resp.data){(res.write(JSON.stringify(resp.data)))}
        res.status(Number(resp.status))
        res.send()
    }) */
})

module.exports = router