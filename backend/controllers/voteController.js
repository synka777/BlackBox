const utils = require('../kernel/utils')
const mongoose = require('mongoose')
const bcDB = require('../kernel/ext/bcDB');
const articleController = require('../controllers/articleController');

module.exports.processVotes = async (request) => {
  // STEP 1: GET METADATA TO UPDATE
  await bcDB.searchMetadata(request.tetherId).then(results => {
    const oldMetadata = utils.getMostRecent(results);
    // STEP 2: EDIT METADATA
    const voteObject = getCurrentVotes(oldMetadata, request.votes);
    if(voteObject.updated){
      oldMetadata.votes = voteObject.votes;
      const metadataObject = getNewMetadata(oldMetadata);
      if(metadataObject.updated){
        // STEP 3: UPDATE THE ARTICLE
        return articleController.updateArticle(oldMetadata.id, metadataObject.metadata).then(resp => {
          console.log('Response',resp);
          return resp;
        });
      }
    }
  })
}

/* {
	score: 0,
	category:'',
	nsfw:'',
	votes:{
		'categories': [
      {
        'name':'Misc'
        'count': 1
      }
			{
        'name':'Technology'
        'count': 1
      }
		],
    'trash': 1
		'nsfw': 1
	}
} */
getCurrentVotes = (oldMetadata, requested) => {
  // TODO: Integrate mongoose models in this function.
  // TODO: Find a way to return properly
  const oldVotes = oldMetadata.votes ? oldMetadata.votes : {
    'categories': [], trash: 0, nsfw: 0
  };
  let updated = false;

  // Update the old votes with the requested changes
  if(requested.trash && requested.trash != oldMetadata.trash){
    ++oldVotes.trash;
    updated = true;
  }
  if(requested.nsfw && requested.nsfw != oldMetadata.nsfw){
    ++oldVotes.nsfw;
    updated = true;
  }
  if(requested.category){
    // If we have an actual category vote
    if(requested.category != ('' || null)){
      let categoryFound = false;
      // We check if it is found in the categories array.
      oldVotes.categories.map(cat => {
        // If so, we increment it's vote count by one.
        if(cat.name === requested.category){
          ++cat.count;
          categoryFound = true;
        }
      });
      // else if we didn't find it, we add it to the array with 1 of score.
      if(!categoryFound){
        oldVotes.categories.push(
          {
            'name': requested.category, // TODO: CONVERT TO PATTERN
            'count': 14 // set this back to 1 when everything will be done
          }
        )
      }
      updated = true;
    }
  }
  const votes = oldVotes;
  return {votes, updated};
}

getNewMetadata = (oldMetadata) => {
  let updated = false;
  const catThreshold = process.env.VOTE_CAT_THRESHOLD;
  const trashThreshold = process.env.VOTE_TRASH_THRESHOLD;
  const reportThreshold = process.env.VOTE_REPORT_THRESHOLD;

  // Threshold checks
  const sendToTrash = oldMetadata.votes.trash >= trashThreshold ? true : false;
  const setToNSFW = oldMetadata.votes.nsfw >= reportThreshold ? true : false;
  const electedCategory = oldMetadata.votes.categories.filter(cat => 
    cat.count >= catThreshold ? cat : undefined
  );
  const metadata = oldMetadata.metadata;
  // Edit metadata based on the votes
  if(electedCategory.length != 0){
    metadata.category = electedCategory; 
    updated = true;
  }
  if(sendToTrash){
    metadata.trash = true; // TODO: CONVERT TO PATTERN
    updated = true;
  }
  if(setToNSFW){
    metadata.nsfw = true; // TODO: CONVERT TO PATTERN
    updated = true;
  }

  return {metadata, updated};
}