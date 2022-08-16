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
  console.log();
	metadata.nsfw = typeof(metadata.nsfw) === 'string'
  ? utils.translateMetadata(metadata.nsfw, 'nsfw')
  : utils.translateMetadata(JSON.stringify(metadata.nsfw), 'nsfw');
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

  ////////////////////////////
  // STEP 1: WORK WITH METADATA

	// if req.body has a property 'category', trigger a search on this category
	if(search.category && search.category !== ('' || undefined)){

    ////////////////////////////
    // SEARCH CATEGORY

    const catSrchPattern = utils.translateMetadata(search.category, 'category');
		await bcDB.searchMetadata(catSrchPattern).then(results => {
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

    search.category = '';
		let tempMetadata = [];
		const trashSrchPattern = utils.translateMetadata('trash', 'category');
		const nsfwFlag = search.nsfw === false || search.nsfw === undefined ? false : true;
		// if nsfw is not true, search metadata with the nsfw 'true' pattern
		const nsfwSrchPattern = utils.translateMetadata(`${nsfwFlag}`, 'nsfw');
		if(nsfwFlag == false){

      ////////////////////////////
      // ALL CATEGORIES: ONLY SFW ARTICLES

      tempMetadata = await bcDB.searchMetadata(nsfwSrchPattern).then(metadataList => {
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
  // STEP 1.5: GET LATEST METADATA
  
  const tetherIds = metadataResults.map(mdResult => mdResult.metadata.tetherId);
  const uniqueTetherIds = [...new Set(tetherIds)];
  
  // Get all metadata from previous filters, with a given tetherId
  const tetheredMd = await Promise.all(uniqueTetherIds.map(async tetherId => {
    const allMetadataForAsset = metadataResults.filter(mdResult => mdResult.metadata.tetherId === tetherId);
    const assumedLatest = utils.getMostRecent(allMetadataForAsset);

    // Makes sure that newer metadata doesn't exist with other parameters for the given asset
    return bcDB.searchMetadata(tetherId).then(tetherIdResults => {
      const latestMetadata = utils.getMostRecent(tetherIdResults);
      latestMetadata.metadata.category = utils.translateMetadata(latestMetadata.metadata.category, 'category'); 
      latestMetadata.metadata.nsfw = utils.translateMetadata(latestMetadata.metadata.nsfw, 'nsfw');

      // If the metadata are actually up-to-date, keep it for further processing
      if(latestMetadata.metadata.date === assumedLatest.metadata.date ){
        const orig = utils.getOG(tetherIdResults);
        return { orig, latest: assumedLatest };
      }
      // Else if the metadata is actually not up-to-date
      if(latestMetadata.metadata.date > assumedLatest.metadata.date){
        // Check if the actual up-to-date metadata still matches the user query
        let categoryChanged = false;
        let nsfwStateChanged = false;
        Object.getOwnPropertyNames(search).map(prop => {
          if(prop === 'category'
          && (search[prop] !== '')
          && search[prop] !== latestMetadata.metadata[prop]){
            categoryChanged = true;
          }
          if(prop === 'nsfw'
          && search[prop] !== latestMetadata.metadata[prop]){
            nsfwStateChanged = true;
          }
        });
        // If the actual up-to-date metadata still has the same criterias as the search query,
        // we keep it instead of the metadata that hasn't been updated.
        if(!categoryChanged && !nsfwStateChanged){
          const orig = utils.getOG(allMetadataForAsset);
          return { orig, latest: latestMetadata };
        } else {
          return;
        }
      }
    });
  }));

  ////////////////////////////
  // STEP 2: WORK WITH DATA

  // Will tether the data with its metadata
  const assetResults = await Promise.all(tetheredMd.map(async mdObj => {
    if(!mdObj){ return; }
    return await bcDB.searchAssets(mdObj.orig.id).then(asset => {
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
            asset.metadata = mdObj.latest.metadata;
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
        asset.metadata = mdObj.latest.metadata;
        return { 
          id:asset.id,
          data: asset.data, 
          metadata: asset.metadata
        };
      }
    });
  }));

  // Purging undefined entries from the results
  // TODO: find a proper way to handle that in a callback directly
  const results = assetResults.filter(entry => {
    if(entry !== undefined){
      return entry;
    }
  });
  if(results.length === 0){ return { status: 404 }; }
  return { status: 200, results };
}

// This function will update the score without using any voting mechanism
module.exports.updateScore = async function(tetherId, actions){
  // Search by tetherId and only keep the most recent result.
  // We can't search for the assetId as the bigchainDB TRANSFER generates a new metadata ID
  // that doesn't match anything. The tetherId is there to link assett and metadata,
  // but it also allows us to search for all metadata for a given asset.
  return bcDB.searchMetadata(tetherId).then(results => {
    // if nothing is found with the given tetherId, return status 404
    if(results.length === 0){
      return { status: 404 };
    }

    const latestMd = utils.getMostRecent(results);
    latestMd.metadata['date'] = new Date();

    if(!(actions['upvote'] && actions['downvote'])){
      if(actions['upvote'] || actions['downvote']){
        let i = 0
        if(actions['upvote']){
          latestMd.metadata['score'] = latestMd.metadata['score'] ? ++latestMd.metadata['score'] : ++i
        }
        if(actions['downvote']){
          latestMd.metadata['score'] = latestMd.metadata['score'] ? --latestMd.metadata['score'] : --i
        }

        return bcDB.editArticleMetaData(latestMd.id, latestMd.metadata).then(postTransactionCommitMD => {
          console.log('Updated score for article', tetherId+':', postTransactionCommitMD.metadata.score);
          if(postTransactionCommitMD.metadata){
            return { status: 200, score: postTransactionCommitMD.metadata.score};
          } else {
            return;
          }
        });
      } else {
        // return no action found
        return { status: 400 };
      }
    } else {
      // Return 400 or 422 in this case
      return { status: 400/*,  message: 'Cannot upvote and downvote at the same time' */ };
    }
  });
}

module.exports.updateArticle = async (id, metadata) => {
    return bcDB.editArticleMetaData(id, metadata).then(postTransactionCommitMD => {
    // TODO: Handle errors from bcDB func here
    console.log('Updated metadata for article', metadata.tetherId+':', postTransactionCommitMD.metadata);
    return postTransactionCommitMD.metadata;    
  });
}