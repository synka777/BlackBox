const express = require("express")
const router = express.Router()
const utils = require('../kernel/utils')
require('dotenv').config();
const { success, error } = require("../kernel/formatResponse");
const voteController = require('../controllers/voteController');

router.get('/', (req, res) => {
  res.write('Ce fichier répertorie les routes permettant de modifier les articles via un système de votes')
  res.write(`
    Pour tester l'API, utiliser Postman, Insomnia ou autre moyen
    permettant d'inclure un body avec les requetes HTTP.
  `)
  res.send()
})

router.post('/', async (req, res) => {
  const token = req.cookies.token;
  try {
    const payload = utils.verifyToken(res, token);
    if (payload.status) {
      res.end();
      return payload.status;
    }
  } catch (e) {
    return res.status(401).end();
  }

  await voteController.processVotes(req.body).then(resp => {
    const response = resp.status['error']
    ? error(resp.message, resp.status)
    : success('Successful', resp.status, resp.id);
    if(resp.metadata){
      response.metadata = resp.metadata;
    }
    res.status(response.code);
    res.write(JSON.stringify(response));
  }).catch(err => {
    res.status(500);
    res.write(JSON.stringify(err));
  })

  res.send();
});

module.exports = router