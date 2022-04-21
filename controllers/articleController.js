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
	//metadata.type = utils.translateMetadata('article', 'type');
	return await bcDB.createNewAsset(data, metadata).then(resp => {
		// Si la requête vers bigchainDB s'exécute correctement il n'y a pas de code de retour
		// donc on en ajoute un manuellement
		resp.status = resp.status === undefined ? '200 OK' : resp.status;
		resp.status = utils.parseStatus(resp.status);
		return resp;
	})
}

module.exports.searchArticle = async function(search){
	console.log('in searchArticle', search);
	//let assetResults = [];
	let metadataResults = [];
	// TODO: use a correct return format with formatresponse

	// if req.body has a property 'category', trigger a search on this category
	if(search.category && search.category !== ('' || undefined)){
		console.log('category provided');
		const catSrchPattern = utils.translateMetadata(search.category, 'category');
		bcDB.searchMetadata(catSrchPattern).then(results => {
			results.map(result => {
				if(!search.nsfw){
					// only add to results when both the query & the current asset
					// don't include a nsfw flag
					if(!result.nsfw){
						// ensures the result is a strict match
						if(utils.matches(result.metadata.category, catSrchPattern)){
							result.metadata.category = utils.translateMetadata(result.metadata.category, 'category');
							result.metadata.nsfw = utils.translateMetadata(result.metadata.nsfw, 'nsfw');
							metadataResults.push(result)
						}
					}
				}else{ // else just add everyting that strictly matches the search
					if(utils.matches(result.metadata.category, catSrchPattern)){
						result.metadata.category = utils.translateMetadata(result.metadata.category, 'category');
						result.metadata.nsfw = utils.translateMetadata(result.metadata.nsfw, 'nsfw');
						metadataResults.push(result);
					}
				}
			})
			//console.log(metadataResults)
		})/* .catch(err => console.log('Somthing bad happened in BCDB call', err)) */;
	} else {
		let tempMetadata = [];
		const trashSrchPattern = utils.translateMetadata('trash', 'category');
		const nsfwFlag = search.nsfw === false || search.nsfw === undefined ? false : true;
		// if nsfw is not true, search metadata with the nsfw 'true' pattern
		const nsfwSrchPattern = utils.translateMetadata(`${nsfwFlag}`, 'nsfw');
		if(!nsfwFlag){
			bcDB.searchMetadata(nsfwSrchPattern).then(metadataList => {
        // TODO: add data management instruction here
        const nsfwTruePattern = utils.translateMetadata('true','nsfw');
				metadataList.map(result => {
          if(!utils.matches(result.metadata.nsfw, nsfwTruePattern)){
            result.metadata.category = utils.translateMetadata(result.metadata.category, 'category');
						result.metadata.nsfw = utils.translateMetadata(result.metadata.nsfw, 'nsfw');
            tempMetadata.push(result);
          }
        });
			})
		} else {
			// else, search for all data as we won't return only NSFW results.
      // we still pass on "nsfw == false" as we want the safe content to be displayed first
			tempMetadata = await bcDB.searchMetadata(nsfwSrchPattern).then(metadataList => {
        // and we won't use the strict matching here as we also want NSFW results to be in the result list.
        // TODO: add data management instruction here
				return  metadataList.map(result => {
          result.metadata.category = utils.translateMetadata(result.metadata.category, 'category');
          result.metadata.nsfw = utils.translateMetadata(result.metadata.nsfw, 'nsfw');
          return result;
        });
			})
		}
		// only keep articles that don't have 'trash' as category
		metadataResults = tempMetadata.map(result => {
			if(result.metadata.category !== trashSrchPattern){ return result; }
		});
	}
  const assetResults = metadataResults.map(async mdResult => {
      return await bcDB.searchAssets(mdResult.id).then(asset => {
        // if the request body includes a search keyword,  
        if(search.keyword && search.keyword !== ('' || undefined)){
          // only returns the asset if it includes the search
          console.log('keyword!', search.keyword)
          if(asset.filter(asset => {
            console.log('evaluating', asset.data);
            // THIS STUFF DONT WORK!!!! WORK ON THIS & WE'LL JUST HAVE TO RETURN THE RESULT!!1!1!!!1!!!
            return Object.keys(asset.data).map(property => {
              console.log('zn', property)
              return asset[property].includes(search.keyword)
            })
          })){
            asset = asset[0];
            asset.metadata = mdResult.metadata;
            return asset;
          }
        } else {
          // else if no keyword, just return the asset
          asset = asset[0];
          asset.metadata = mdResult.metadata;
          return asset;
        }
      });
    })
  
  console.log('tryin', await Promise.all(assetResults));
	// initiate multiple searches by ID to get the asset corresponding to the metadata we've already got
	// TODO: switch from actual search to local filtering

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

