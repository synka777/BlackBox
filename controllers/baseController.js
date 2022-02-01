const utils = require('../kernel/utils')
const mongoose = require('mongoose')

/* Ce fichier sert à effectuer des opérations CRUD basiques pour n'importe quel modèle. */

/* CREATE, USAGE:
    Ex syntaxe avec partenaires:
    {
        "name": "CGI",
        "logo": "https: //upload.wikimedia.org/wikipedia/commons/thumb/3/32/CGI_logo.svg/1200px-CGI_logo.svg.png"
    }
    */
module.exports.createDocument = async function(body, modelName, exclusions, schemaObject){
    if(Object.keys(body).length==0){
        return {"status":400}
    }
    const requiredProperties = utils.getModelProperties(modelName, exclusions)
    try {
        // Créée un modèle
        const model = mongoose.model(modelName, schemaObject)
        const newDocument = new model(body)
        
        // Si un document existe déjà avec ce nom, erreur
        if(await model.findOne(body).exec()) throw TypeError

        /* Puis on check si les propriétés d'objets requises pour sauvegarder le modèle
        sont bien présentes et non vides */
        const validatedProps = requiredProperties.filter((prop)=>{{
            if(utils.getModelProperties(modelName, exclusions).includes(prop)){
                return newDocument[prop]==undefined||newDocument[prop]=='' ? false : true
            }
        }})
        // S'il n'y a pas assez de propriétés validées pour que l'opération d'écriture soit validée, erreur
        if(validatedProps.length!=requiredProperties.length){
            return {"status":400, "statusMessage":"Invalid or empty property"}
        }else{
            const response = await newDocument.save()
            return {"status":201, "data":response}
        }
    } catch(err) {
        if(err.name=='TypeError'){
            return {"status":409, "statusMessage":"Conflict : A document may already exist by that name"}
        }else{
            console.log(err)
            return {"status":500, "data":err.name}
        }
    }
}

/* READ, USAGE:
    - Pas de body: Renvoie une liste de documents au complet sans condition d'affichage
    - Body avec plusieurs documents dans la même requête:
    {
        "filters": [
            {
                "name": "Lego"
            },
            {
                "name": "CGI"
            }
        ]
    }
    - Body avec requête un seul partenaire dans une seule requête:
    {"name": "CGI"}

    PROTIP1: La recherche partielle est possible, exemple avec une recherche simple:
    { "name": { "$regex": "a" } }

    PROTIP2: La recherche SIMPLE (sans la propriété 'filters') peut être limitée pour ne pas faire 
    de requêtes trop lourdes sur un type de document avec l'utilisation des propriétés "skip" et "limit".
    Exemple avec une page devant contenir les 10 premiers résultats:
    {"name": "CGI","skip": "0","limit": 10}
    Exemple 2, deuxième page des 10 résultats suivants:
    {"name": "CGI","skip": 10,"limit": 10}
*/
module.exports.readDocuments = async function(body, modelName, exclusions){
    const requiredProperties = ['skip','limit'].concat(utils.getModelProperties(modelName, exclusions))
    const propertiesProvided = Object.getOwnPropertyNames(body)
    const documentModel = mongoose.model(modelName)
    const data = []
    const skip = body.skip?Number(body.skip):0
    const limit = body.limit?Number(body.limit):0
    if(body.filters){
        // Recherche avec body et requêtes multiples
        for(let filter of body.filters){
            const propertiesProvidedInFilter = Object.getOwnPropertyNames(filter)
                // On check si des propriétés incorrectes ont été fournies
                if(Object.keys(body).length!=0){
                    if(requiredProperties.filter((prop)=>{return propertiesProvidedInFilter.includes(prop)}).length==0){
                        return {"status":400, "statusMessage":"Unknown property"}
                    }
                }
            try {
                await documentModel.find(filter).exec().then(results => {
                    for(let result of results){
                        data.push(result)
                    }
                })
                return {"status":200, "data":data}
            } catch(err) {
                console.log(err)
                return {"status":400, "data":err.name}
            }
        }
    }
    // On check si des propriétés incorrectes ont été fournies
    if(Object.keys(body).length!=0){
        if(requiredProperties.filter((prop)=>{return propertiesProvided.includes(prop)}).length==0){
            return {"status":400, "statusMessage":"Unknown property"}
        }
    }
    // Requête unique ou sans body
    const filter = body ? body : undefined
    try {
        await documentModel.find(filter).skip(skip).limit(limit).exec().then(documents => {
            for(let document of documents) data.push(document)
        })
        if(data!=''){
            return {"status":200, "data":data}
        }else{
            return {"status":404}
        }
    } catch(err) {
        console.log(err)
        if(err.name=='TypeError'){
            return {"status":500, "statusMessage":"Not found"}
        }
        return {"status":500, "data":err.name}
    }
}

/* UPDATE, USAGE:
    Ex syntaxe avec partenaires:
    {
        "filter": {
            "name": "CGI"
        },
        "replace": {
            "name": "CEGEHI"
        }
    }
*/
module.exports.updateDocument = async function(body, modelName){
    const documentModel = mongoose.model(modelName)
    let response = {}
    if(Object.keys(body).length == 0) {
        return {"status":400, "error":"Body required"}
    }
    if(body.filter && body.replace){
        try {
            if(Object.values(body.filter).every(value=> { if(value==''){ return true } })){
                throw SyntaxError
            }
            if(Object.values(body.replace).every(value=> { if(value==''){ return true } })){
                throw SyntaxError
            }
            // On vérifie si un objet n'existe pas déjà avec les informations données en entrée
            await documentModel.find(body.replace).exec().then(document => {if(document!=''){throw Error}})
            await documentModel.find(body.filter).exec().then(document => {
                if(!document[0]._id) throw TypeError
                response = documentModel.findByIdAndUpdate(document[0]._id, body.replace).then(response => {
                    if(response!=null){
                        return {"status":200, "data":response}
                    }
                    throw TypeError
                })  
            })
            return response
        } catch(err) {
            console.log(err)
            if(err.name=='TypeError'){
                return {"status":404}
            }
            if(err.name=='Error'){
                return {"status":409, "data":"Conflict : A document may already exist by that name"}
            }
            if(err.name=='SyntaxError'){
                return {"status":500, "data":"Empty values are not allowed"}
            }
            return {"status":500, "data":err.name}
        }
    }
    return {"status":400, "statusMessage":"Body required"}
}

/* DELETE, USAGE:
    Ex syntaxe avec partenaires:
    {"name": "Saint-Gobain"}
*/
module.exports.deleteDocument = async function(body, modelName, exclusions){
    if(Object.keys(body).length == 0){
        return {"status":400, "statusMessage":"Body required"}
    } 
    const requiredProperties = ['skip','limit'].concat(utils.getModelProperties(modelName, exclusions))
    const propertiesProvided = Object.getOwnPropertyNames(body)
    if(requiredProperties.filter((prop)=>{return propertiesProvided.includes(prop)}).length==0){
        return {"status":400, "statusMessage":"Unknown property"}
    }
    const response = []
    try {
        return !(await searchAndDestroy(body, modelName)) ? {"status":200, "statusMessage":"Deleted"} : undefined
    } catch(err) {
        console.log(err)
        if(err.name=='TypeError'){
            return {"status":404, "statusMessage":"Not found"}
        }
        return {"status":500, "data":err.name}
    }   
}

async function searchAndDestroy(filter, modelName) {
    const documentModel = mongoose.model(modelName)
    await documentModel.find(filter).exec().then(document => {
        return documentModel.findByIdAndDelete(document[0]._id)
    })
}

