const utils = require('../kernel/utils')
const bcDB = require('../kernel/ext/bcDB');
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
    let typeFound = false;
    let filteredResults = false;
    let error = false;
    let validResults = [];
    // if type does not return any result, ERROR
    // TODO: use a correct return format with formatresponse
    if(!search.type || search.type === (undefined || null || '')){
        return 'Error';
    }
    // TODO: return the response when this / callbacks will be done
    if(search.keyword && search.keyword !== ('' || undefined)){
        /* return  */bcDB.searchAssets('article').then(assets => {
            // first, we validate if the asset is really an article and
            // then we search for the keyword
            for(let asset of assets){
                // if the keyword searched by the client is a type name,
                if(search.keyword === asset.type){ 
                    // make sure it also has the keyword in at least one another property ('content' or 'title')
                    if(utils.validate(asset, search.keyword, search.type)){
                        validResults.push(asset);
                    }
                    // and if the keyword is not found in title or content, error
                } else { 
                    // TODO: check if this part is redundant or not with what is done at line 41
                    // else, just check if the keyword is found
                    if(utils.validate(asset, search.keyword, search.type)){
                        validResults.push(asset);
                    }
                }
                return validResults;
            }/* else{ this statement is irrelevant here but it will be needed later
                in this callback function
                return assets;
            } */
        })

    } else {
        // else if no keyword, just search for everything
        bcDB.searchAssets('article')
    }
    // if the search query contains a category or the nsfw flag to true,
    // we will need to trigger a metadata search
    if(
        (search.category 
        && search.category !== ('' || undefined))
        || search.nsfw
    ){
        // if category, search all assets from that category and then 
        // filter locally with the nsfw flag from the search query
        const catSPatt = utils.metadataToSearchPattern(search.category, 'category');
        bcDB.searchAssetsMetadata(catSPatt).then(resp => {
            
            return resp;
        })
        // if no category provided, just search for all metadata containing the nsfw flag to true 
        const nsfwSPatt = utils.metadataToSearchPattern(search.nsfw, 'nsfw');
        bcDB.searchAssetsMetadata(nsfwSPatt).then(resp => {

            return resp;
        })
    } else {
        // else if the content must be safe for work (meaning: nsfw flag to false or no nsfw flag at all),
        // just search for all assets that contains nsfw to 'false'
        const nsfwSPatt = utils.metadataToSearchPattern(false, 'nsfw')
        bcDB.searchAssetsMetadata(nsfwSPatt).then(resp => {

            return resp;
        })
    }
    /* could be used if we are able to make several calls be simultaneously
    while(!typeFound && !filteredResults){
    } */
    // TODO: move this to the right place to return resp to the route function
    if(validResults.length === 0){
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
