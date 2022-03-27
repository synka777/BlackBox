const utils = require('../kernel/utils')
const bcDB = require('../kernel/ext/bcDB')
//const mongoose = require('mongoose')

/* ce fichier va inclure les fonctions Create, Read, Update et Delete des articles qui seront créées dans IPDB.
la fonction delete ne sera pas accessible par des endpoints, elle ne sera là qu'en cas de besoin
pour gérer le contenu de la DB.*/ 

// these controller methods will need to check the data format received before doing CRUD operations

module.exports.createArticle = async function(data, metadata){
    return await bcDB.createNewAsset(data, metadata).then(resp => {
        // Si la requête vers bigchainDB s'exécute correctement il n'y a pas de code de retour
        // donc on en ajoute un manuellement
        resp.status = resp.status === undefined ? '200 OK' : resp.status;
        resp.status = utils.parseStatus(resp.status);
        return resp;   
    })
}

// IPDB: Opérations CRUD
