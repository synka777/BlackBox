const utils = require('../kernel/utils');
const bcDB = require('../kernel/ext/bcDB');
const articleSchema = require('../models/articleSchema');
//const mongoose = require('mongoose')

/* ce fichier va inclure les fonctions Create, Read, et Update des articles qui seront créées dans IPDB.
la fonction delete ne sera pas accessible par des endpoints, elle ne sera là qu'en cas de besoin
pour gérer le contenu de la DB.*/ 

// these controller methods will need to check the data format received before doing CRUD operations

module.exports.createArticle = async function(data, metadata){
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
	let metadataResults = [];
	// if req.body has a property 'category', trigger a search on this category
	if(search.category && search.category !== ('' || undefined)){
    
    ////////////////////////////
    // SEARCH CATEGORY
		
    const catSrchPattern = utils.translateMetadata(search.category, 'category');
		bcDB.searchMetadata(catSrchPattern).then(results => {
      console.log('DEBUG Metadata:', results);
			results.map(result => {
				if(!search.nsfw){

          ////////////////////////////
          // SEARCH CATEGORY: ONLY SFW ARTICLES

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

          ////////////////////////////
          // SEARCH CATEGORY: NSFW ARTICLES INCLUDED

					if(utils.matches(result.metadata.category, catSrchPattern)){
						result.metadata.category = utils.translateMetadata(result.metadata.category, 'category');
						result.metadata.nsfw = utils.translateMetadata(result.metadata.nsfw, 'nsfw');
						metadataResults.push(result);
					}
				}
			})
		})/* .catch(err => console.log('Somthing bad happened in BCDB call', err)) */;
	} else {

    ////////////////////////////
    // SEARCH ALL CATEGORIES

		let tempMetadata = [];
		const trashSrchPattern = utils.translateMetadata('trash', 'category');
		const nsfwFlag = search.nsfw === false || search.nsfw === undefined ? false : true;
		// if nsfw is not true, search metadata with the nsfw 'true' pattern
		const nsfwSrchPattern = utils.translateMetadata(`${nsfwFlag}`, 'nsfw');
		if(nsfwFlag == false){

      ////////////////////////////
      // ALL CATEGORIES: ONLY SFW ARTICLES
			
      tempMetadata = await bcDB.searchMetadata(nsfwSrchPattern).then(metadataList => {
        console.log('DEBUG Metadata:', metadataList);
        const nsfwTruePattern = utils.translateMetadata('true','nsfw');
				if(metadataList && metadataList.length !== 0){
          mapEntries = [];
          metadataList.map(result => {
            if(!utils.matches(result.metadata.nsfw, nsfwTruePattern)){
              result.metadata.category = utils.translateMetadata(result.metadata.category, 'category');
              result.metadata.nsfw = utils.translateMetadata(result.metadata.nsfw, 'nsfw');
              mapEntries.push(result);
            }
          });
          return mapEntries;
        }
			})
		} else {

      ////////////////////////////
      // ALL CATEGORIES: NSFW ARTICLES INCLUDED

			// else, search for all data as we won't return only NSFW results.
      // we still pass on "nsfw == false" as we want the safe content to be displayed first
			tempMetadata = await bcDB.searchMetadata(nsfwSrchPattern).then(metadataList => {
        console.log('DEBUG Metadata:', metadataList);
        // and we won't use the strict matching here as we also want NSFW results to be in the result list.
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

  ////////////////////////////
  // TETHER EACH METADATA WITH IT'S ASSET

  const assetResults = metadataResults.map(async mdResult => {
    return await bcDB.searchAssets(mdResult.id).then(asset => {
      console.log('DEBUG Asset:', asset);
      // if the request body includes a search keyword,  
      if(search.keyword && search.keyword !== ('' || undefined)){
        // only returns the asset if it includes the search
        let isSearchResult = false;
        asset.filter(asset => {
          Object.keys(asset.data).map(property => {
            if(asset.data[property].includes(search.keyword)){
              isSearchResult = true;
            }
          });
          if(isSearchResult){
            //asset = asset[0];
            asset.metadata = mdResult.metadata;
            return asset;
          }
        })
        // This return have to be here to return the asset out of the map
        if(isSearchResult){
          asset = asset[0];
          return { 
            id: asset.id,
            data: asset.data, 
            metadata: asset.metadata
          }; 
        }
      } else { // TODO: refactor this property ordering in a function
        // else if no keyword, just return the asset
        asset = asset[0];
        asset.metadata = mdResult.metadata;
        return { 
          id:asset.id,
          data: asset.data, 
          metadata: asset.metadata
        };
      }
    });
  })
  // Purging undefined entries from the results
  // TODO: find a proper way to handle that in a callback directly
  const results = (await Promise.all(assetResults)).filter(entry => {
    if(entry !== undefined){
      return entry;
    }
  })
  return { status: 200, results};
}

// This function will update the score without using any voting mechanism
module.exports.updateScore = async function(assetId, actions){
  // Search by tetherId and only keep the most recent result, or 
  // keep searching with assetId
  bcDB.searchMetadata(assetId).then(results => {
    // Replace this with a function that gets the most recent result from a list
    // const mdRes = results[0];
    const mdRes = utils.getMostRecent(results);
    mdRes.metadata['date'] = new Date();
    if(!(actions['upvote'] && actions['downvote'])){
      if(actions['upvote'] || actions['downvote']){
        let i = 0
        if(actions['upvote']){
          mdRes.metadata['score'] = mdRes.metadata['score'] ? ++mdRes.metadata['score'] : ++i
        }
        if(actions['downvote']){
          mdRes.metadata['score'] = mdRes.metadata['score'] ? --mdRes.metadata['score'] : --i
        }
        console.log('Attempting to update article with', mdRes);
        bcDB.editArticleMetaData(assetId, mdRes.metadata).then(postTransactionCommitMD => {
          // See how to return this info to the client
          return postTransactionCommitMD.id;
          /* Not really useful if I just want to return the new metadata id
          bcDB.conn.getTransaction(test.id).then(test2 => {
            console.log('Can I get a tx with this new ID?', test2);
          }) */
          
        });
      } else {
        // return no action found
      }
    } else {
      // Return 400 or 422 in this case
      // return 
      console.log('Ambiguous instructions - cannot upvote and downvote at the same time');
    }
  });



  
}