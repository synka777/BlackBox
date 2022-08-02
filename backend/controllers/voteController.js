const utils = require('../kernel/utils')
const mongoose = require('mongoose')
const bcDB = require('../kernel/ext/bcDB');
const articleController = require('../controllers/articleController');

module.exports.processVotes = async (request) => {
  // STEP 1: GET METADATA TO UPDATE
  await bcDB.searchMetadata(request.tetherId).then(results => {
    // TODO: return 404 if the results array is empty
    const oldMd = utils.getMostRecent(results);
    // STEP 2: EDIT METADATA
    const voteObject = getCurrentVotes(oldMd, request.votes);
    if(voteObject.updated){
      oldMd.metadata.votes = voteObject.votes;
      const metadata = getNewMetadata(oldMd);
      // STEP 3: UPDATE THE ARTICLE
      return articleController.updateArticle(oldMd.id, metadata).then(resp => {
        // TODO: return something to validate the operation
        console.log('Response',resp);
        return resp;
      });
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
getCurrentVotes = (oldMd, requested) => {
  // TODO: Integrate mongoose models in this function.
  // TODO: Find a way to return properly
  const oldVotes = oldMd.metadata.votes ? oldMd.metadata.votes : {
    'categories': [], trash: 0, nsfw: 0
  };
  let updated = false;
  // Update the old votes with the requested changes
  if(requested.trash && requested.trash != oldMd.metadata.trash){
    ++oldVotes.trash;
    updated = true;
  }
  if(requested.nsfw && requested.nsfw != oldMd.metadata.nsfw){
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
        if(cat.name === utils.translateMetadata(requested.category, 'category')){
          ++cat.count;
          categoryFound = true;
        }
      });
      // else if we didn't find it, we add it to the array with 1 of score.
      if(!categoryFound){
        const catNamePattern = utils.translateMetadata(requested.category, 'category');
        oldVotes.categories.push(
          {
            'name': catNamePattern, // TODO: CONVERT TO PATTERN
            'count': 1 // set this back to 1 when everything will be done
          }
        );
      }
      updated = true;
    }
  }
  const votes = oldVotes;
  return {votes, updated};
}

getNewMetadata = (oldMd) => {

  const catThreshold = process.env.VOTE_CAT_THRESHOLD;
  const trashThreshold = process.env.VOTE_TRASH_THRESHOLD;
  const reportThreshold = process.env.VOTE_REPORT_THRESHOLD;

  // Threshold checks
  const sendToTrash = oldMd.metadata.votes.trash >= trashThreshold ? true : false;
  const setToNSFW = oldMd.metadata.votes.nsfw >= reportThreshold ? true : false;
  const electedCategory = oldMd.metadata.votes.categories.filter(cat => 
    cat.count >= catThreshold
  );

  const metadata = oldMd.metadata;
  // Edit metadata based on the votes
  if(electedCategory.length != 0){
    metadata.category = electedCategory[0].name;
    metadata.votes.categories = [];
  }
  if(sendToTrash){
    metadata.category = utils.translateMetadata('trash', 'category');
    metadata.votes.categories = [];
    metadata.votes.trash = 0;
  }
  if(setToNSFW){
    metadata.nsfw = true; // TODO: CONVERT TO PATTERN
  }

  metadata.date = new Date();

  return metadata;
}