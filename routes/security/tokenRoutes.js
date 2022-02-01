const express = require("express");
const router = express.Router()
const baseController = require("../../controllers/baseController");
const utils = require('../../kernel/utils.js')

const jwt = require('jsonwebtoken')
const jwtExpirySeconds = 9000

router.post('/login', (req, res) => {
    const { admUsername, admPasswd} = utils.defaultAdmin;
    const { username, password} = req.body;
    if(username == admUsername && password == admPasswd){
        const token = jwt.sign({ username }, utils.jwtKey, {
            algorithm: 'HS256',
            expiresIn: jwtExpirySeconds
        })
        res.cookie('token', token, { maxAge: jwtExpirySeconds * 1000 })
        res.end()
    }else{
        baseController.readDocuments(req.body, 'User', ['_id','__v']).then(resp => {
            if(resp.status!=200){res.status(401).end()}
            const username = req.body.username
            // Créée un nouveau token avec le nom d'utilisateur dans le payload avec expiration après 300s
            // ajouter le role utilisateur dans le payload quand les roles seront créés
            const token = jwt.sign({ username }, utils.jwtKey, {
                algorithm: 'HS256',
                expiresIn: jwtExpirySeconds
            })
            // on renvoie le token en tant que cookie
            res.cookie('token', token, { maxAge: jwtExpirySeconds * 1000 })
            res.end()
        })
    }
})

router.post('/refresh', (req, res) => {
    const token = req.cookies.token
    if (!token) return res.status(401).end()
    const payload = utils.verifyToken(res, utils.jwtKey, token)
    if(payload.status){ 
        res.end()
        return payload.status 
    }

    // Un nouveau token ne sera délivré que si l'ancien token va expirer dans les 30 secondes
    // qui suivent. Dans le cas contraire la demande est rejetée avec un statut bad request
    // const nowUnixSeconds = Math.round(Number(new Date()) / 1000)
    // if (payload.exp - nowUnixSeconds > 30) return res.status(400).end()

    const newToken = jwt.sign({ username: payload.username }, utils.jwtKey, {
        algorithm: 'HS256',
        expiresIn: jwtExpirySeconds
    })

    res.cookie('token', newToken, { maxAge: jwtExpirySeconds * 1000 })
    res.end()
})

module.exports = router