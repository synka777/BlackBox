const utils = require('../kernel/utils')
const bcDB = require('../kernel/ext/bcDB');
const { type } = require('express/lib/response');
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

module.exports.searchArticle = async function(search){
    console.log('in searchArticle', search)
    // check if input contains data type
    // OOOOWWWWWW YEEEEAAAAAAAHHHHHHHHHHHHHH
    let typeFound = false;
    let filteredResults = false;
    let error = false;
    //if type does not return any result, ERROR
    // TODO: use a correct return format with formatresponse
    if(!search.type || search.type === (undefined || null || '')){
        return 'Error';
    }
    bcDB.searchAssets(search.type).then(assets => {
        let validResults = [];
        if(search.keyword && search.keyword !== ('' || undefined)){
            for(let asset of assets){
                // if the keyword searched by the client is a type name
                if(search.keyword === asset.type){
                        if(utils.validate(asset, search.keyword, search.type)){
                            console.log('mkay 1');
                            validResults.push(asset);
                        }else{
                            console.log('nurp 1');
                        };
                    // and if the keyword is not found in title or content, error
                }else{
                    if(utils.validate(asset, search.keyword, search.type)){
                        console.log('mkay 2');
                        validResults.push(asset);
                    }
                }
            }
            if(validResults.length === 0){
                return 'Not found'
            }
            return validResults;
        }else{
            return assets;
        }

        // process response using parsestatus
        // check if the matched string is from the properties we want
        //return resp;
    })
    bcDB.searchAssets(search.type).then(resp => {
        // process response using parsestatus
        // check if the matched string is from the properties we want
        return resp;
    })
    if(search.category){
        bcDB.searchAssetsMetadata(search.type).then(resp => {
            // process response using parsestatus
            // check if the matched string is from the properties we want
            return resp;
        })
    }
    while(!typeFound && !filteredResults){

    }
}

module.exports.getArticleById = async function(search){
    // check if input contains article ID
    return await bcDB.searchAssets(search).then(resp => {
        // process response using parsestatus
        // check if the matched string is from the property we want
        return resp;
    })
}

// TODO: Manage update operations on bigchainDB articles

// IPDB: Opérations CRUD
