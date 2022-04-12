const utils = require('../kernel/utils');
const bcDB = require('../kernel/ext/bcDB');
const articleSchema = require('../models/articleSchema');
//const mongoose = require('mongoose')

/* ce fichier va inclure les fonctions Create, Read, Update et Delete des articles qui seront créées dans IPDB.
la fonction delete ne sera pas accessible par des endpoints, elle ne sera là qu'en cas de besoin
pour gérer le contenu de la DB.*/ 

// these controller methods will need to check the data format received before doing CRUD operations

module.exports.createArticle = async function(data, metadata){
    data.date = new Date();
    // Checks if all the necessary properties are included in the request body
    if(!utils.objIsAModel({...data, ...metadata}, articleSchema, 'Article')){
        // TODO: return proper 400 error
        return {status: '400'};
    }
    // Makes metadata easily searchable before creating the asset
    metadata.category = utils.translateMetadata(metadata.category, 'category');
    metadata.nsfw = utils.translateMetadata(metadata.nsfw, 'nsfw');
    return await bcDB.createNewAsset(data, metadata).then(resp => {
        console.log(resp);
        // Si la requête vers bigchainDB s'exécute correctement il n'y a pas de code de retour
        // donc on en ajoute un manuellement
        resp.status = resp.status === undefined ? '200 OK' : resp.status;
        resp.status = utils.parseStatus(resp.status);
        return resp;
    })
}

module.exports.searchArticle = async function(search){
    console.log('in searchArticle', search)
    /* let typeFound = false;
    let filteredResults = false;
    let error = false; */
    let assetResults = [];
    // TODO: use a correct return format with formatresponse
    if(!search.type || search.type === (undefined || null || '')){
        return 'Error';
    }

    if(search.category && search.category !== ('' || undefined)){
        // Search metadata by category
        const catSrchPattern = utils.translateMetadata(search.category, 'category');
        bcDB.searchAssetsMetadata(catSrchPattern).then(results => {
            // TODO: use the add/strip pattern function
            // Only select articles that have the wanted category
            
            // if nsfw is false, delete nsfw articles
            return results;
        });

        // TODO: store the results in the result array in a subproperty metadata
        assetResults = assetResults;
    } else {
        const nsfwFlag = search.nsfw === false || search.nsfw === undefined ? false : true
        // if nsfw is false, search metadata with the nsfw 'true' pattern
        if(!nsfwFlag){
            const nsfwSrchPattern = utils.translateMetadata(nsfwFlag, 'nsfw');
            bcDB.searchAssetsMetadata(nsfwSrchPattern);
        } else {
            bcDB.searchAssetsMetadata();
        }
        // TODO: delete articles that have 'trash' as category

        // TODO: use the add/strip pattern function

        // TODO: store the results in the result array in a subproperty metadata
        assetResults = assetResults;
    }

    // initiate multiple searches by ID to get the asset corresponding to the metadata we've already got
    // TODO: switch from actual search to local filtering
    if(search.keyword && search.keyword !== ('' || undefined)){
        // TODO: convert to a solution more modern than a for loop?
        for(asset of assetResults){
            bcDB.searchAssets(asset.id).then(assets => {
                // first, validate if the asset is really an article and then search for the keyword
                // then append the resulting asset properties to each metadata asset
                kwResults = [...utils.validateSrchResults(assets, search.keyword, search.type)]
            });
        }
        
    } else {
        // else if no keyword, just search for the articles from the id list
        kwResults = [...bcDB.searchAssets()];
    }

    // TODO: move this to the right place to return resp to the route function
    if(validKWResults.length === 0){
        return 'Not found'
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
