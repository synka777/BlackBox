const express = require("express")
const router = express.Router()
const utils = require('../kernel/utils')

router.get('/', (req, res) => {
    res.write('Envoie une requête pour créer un nouvel article')
    res.write(`
        Pour tester l'API, utiliser Postman, Insomnia ou autre moyen
        permettant d'inclure un body avec les requetes HTTP.
    `)
    res.send()
})

router.post('/create', async(req, res) => {
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
    // TODO: add orbitDB create operation and check the result here
    /* baseController.createDocument(req.body, resource, ['_id','__v'], titleAndImageSchema).then(resp => {
        if(resp.statusMessage){ res.statusMessage = resp.statusMessage }
        if(resp.data){(res.write(JSON.stringify(resp.data)))}
        res.status(Number(resp.status))
        res.send()
    }) */
})

//articleUpdateScore