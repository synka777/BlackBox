const express = require("express")
const router = express.Router()
const utils = require('../kernel/utils')
require('dotenv').config();

router.get('/', (req, res) => {
  res.write('Ce fichier répertorie les routes permettant de modifier les articles via un système de votes')
  res.write(`
    Pour tester l'API, utiliser Postman, Insomnia ou autre moyen
    permettant d'inclure un body avec les requetes HTTP.
  `)
  res.send()
})

router.post('/vote/redefine', async (req, res) => {
  const token = req.cookies.token;
  try {
    const payload = utils.verifyToken(res, token);
    if (payload.status) {
      res.end();
      return payload.status;
    }
  } catch (e) {
    return res.status(401).end();
  }
  await articleController.updateArticle(metadata).then(resp => {
    // Si la réponse est une erreur, on formatte la réponse en erreur. Sinon, success
    const response = resp.status['error']
    ? error(resp.message, resp.status.code)
    : success('Successful', resp.status.code, resp.id);
    res.status(response.code);
    res.write(JSON.stringify(response));
  })/* .catch(err => {
    res.status(500);
    res.write(JSON.stringify(err));
  }) */
  
  res.send();
});

router.post('/vote/report', async (req, res) => {
  const token = req.cookies.token;
  try {
    const payload = utils.verifyToken(res, token);
    if (payload.status) {
      res.end();
      return payload.status;
    }
  } catch (e) {
    return res.status(401).end();
  }
  await articleController.updateArticle(metadata).then(resp => {
    // Si la réponse est une erreur, on formatte la réponse en erreur. Sinon, success
    const response = resp.status['error']
    ? error(resp.message, resp.status.code)
    : success('Successful', resp.status.code, resp.id);
    res.status(response.code);
    res.write(JSON.stringify(response));
  })/* .catch(err => {
    res.status(500);
    res.write(JSON.stringify(err));
  }) */
  
  res.send();
});


router.post('/vote/trash', async (req, res) => {
  const token = req.cookies.token;
  try {
    const payload = utils.verifyToken(res, token);
    if (payload.status) {
      res.end();
      return payload.status;
    }
  } catch (e) {
    return res.status(401).end();
  }

  ////////////////////////////
  // STEP 1: CHECK NEW VOTES INTEGRITY
  const oldMetadata = bcDB.searchMetadata(tetherId).then(results => {
    return utils.getMostRecent(results)[0];
  })
  console.log('Old metadata', oldMetadata);
  const isForged = this.forgedVotes(metadata.votes, oldMetadata.votes);

  ////////////////////////////
  // STEP 2: EDIT METADATA
  
  const metadata = this.voteThresholdReached()


  ////////////////////////////
  // STEP 3: UPDATE THE ARTICLE

  // TODO: replace this with an actual update function from articleController
  await articleController.updateArticle(metadata).then(resp => {
    // Si la réponse est une erreur, on formatte la réponse en erreur. Sinon, success
    const response = resp.status['error']
    ? error(resp.message, resp.status.code)
    : success('Successful', resp.status.code, resp.id);
    res.status(response.code);
    res.write(JSON.stringify(response));
  })/* .catch(err => {
    res.status(500);
    res.write(JSON.stringify(err));
  }) */
  
  res.send();
});

/* {
	score: 0,
	category:'',
	nsfw:'',
	votes:{
		'categories': [{
			'Misc': 1,
			'Technology': 1
		}],
    'trash': 1
		'nsfw': 1
	}
} */
module.exports.voteThresholdReached = (oldMetadata, metadata) => {

  const catThreshold = process.env.VOTE_CAT_THRESHOLD;
  const trashThreshold = process.env.VOTE_TRASH_THRESHOLD;
  const reportThreshold = process.env.VOTE_REPORT_THRESHOLD;

  // Threshold checks
  const filteredCategories = metadata.votes.categories.filter( cat => cat >= catThreshold);

  const electedCategory = Object.getOwnPropertyNames()[0];
  const sendToTrash = metadata.votes.trash >= trashThreshold ? true : false;
  const setToNSFW = metadata.votes.nsfw >= reportThreshold ? true : false;

  // Edit metadata based on the votes
  // CHECK WITH THE OLD METADATA? YES
  if(electedCategory != (null || undefined)){
    metadata.category = electedCategory;
  }

  if(sendToTrash){

  }


  
  // metadata.nsfw = setToNSFW;

  return metadata;
}

// Will return a boolean
module.exports.forgedVotes = (prev, next) => {
  // Get article metadata with ThresholdId from DB to check if the sent metadata
  // contains non-permitted vote amounts at once. If the amounts are to high then
  // The article will be considered as forged

  // We want: only one vote at a time in the categories, compared to the old metadata

  // We want: only one vote for trash at a time

  // We want: only one vote for NSFW at a time

  // We want: any new category added to have a score limited to 1

  return false;
};

module.exports = router