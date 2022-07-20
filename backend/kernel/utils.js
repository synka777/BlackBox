const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');
const { stringify } = require('nodemon/lib/utils');
//const bigchainDB = require('./ext/bcDB');
// const baseController = require('../controllers/baseController')

module.exports.jwtKey = 'my_secret_key';

  ////////////////////////////
  ////////////// Token
module.exports.verifyToken = (res, token) => {
  try {
    return jwt.verify(token, this.jwtKey);
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      return res.status(401).end();
    }
    return res.status(400).end();
  }
};

  ////////////////////////////
  ////////////// Transactions

/* module.exports.bcDB = () => {
  console.log('giving access to bcdb utils')
  return bigchainDB;
} */

  ////////////////////////////
  ////////////// Misc

module.exports.getModelProperties = (modelName, exclusions) => {
  const newModel = mongoose.model(modelName);
  const properties = [];
  newModel.schema.eachPath((property) => properties.push(property));
  return properties.filter((value) => {
    return !exclusions.includes(value) ? value : undefined;
  });
};

  // Sert à découper une string de status en code de retour HTTP avec son message associé
module.exports.parseStatus = (string) => {
  const status = { 'code': null, 'error': false, 'detail': null};
  if(!string.match('20[01]')){ status.error = true }
  status.detail = string.match('([^0-9]{3}).*')[0];
  status.code = Number(string.match('[0-9]{3}')[0]);
  if(status.detail !== null){ status.detail = status.detail.trim()}
  return status;
}

module.exports.validateSrchResults = (assets, keyword, typeName = '') => {
  const validKWResults = [];
  for(let asset of assets){
    // if the keyword searched by the client is a type name,
    if(search.keyword === asset.type){ 
        // make sure it also has the keyword in at least one another property ('content' or 'title')
        if(this.validateSrchResult(asset, keyword, typeName)){
            validKWResults.push(asset);
        }
        // and if the keyword is not found in title or content, error
    } else { 
        // else, just check if the keyword is found
        if(this.validateSrchResult(asset, keyword, typeName)){
            validKWResults.push(asset);
        }
    }
    return validKWResults;
  }
}

// checks if a search result's properties matched the search with
// an eligible property and not just with the 'type' property
/* module.exports. */validateSrchResult = (result, keyword, typeName = '') => {
  let match;
  Object.entries(result.data).forEach(
    ([key, value]) => {
      if(stringify(value).includes(keyword) && key !== typeName){ match = true }
    });
  return match;
}

// adds prefix and suffix to data to make a metadata easily searchable.
// strips prefix and suffix if the data provided already has it
module.exports.translateMetadata = (value, propertyName) => {
  const seprtr = '**';
  const nsfwSrchPattern = 'NSFW';
  const catSrchPattern = 'CAT';
  /* const typeSrchPattern = 'TYPE'; */
  let prop = propertyName;

  switch(propertyName) {
    case 'nsfw':
      prop = nsfwSrchPattern;
      break;
    case 'category':
      prop = catSrchPattern;
      break;
    /* case 'type':
      prop = typeSrchPattern;
      break; */
  }

  if(value.startsWith(`${prop}${seprtr}`) 
  && value.endsWith(`${seprtr}${prop}`)){
    return value.split(seprtr)[1];
  } 
  return `${prop}${seprtr}${value}${seprtr}${prop}`;
  
  // this method returning null can mean the properties sent in the body are not correct

}

// checks if an object matches a model
module.exports.objIsAModel = async (object, schemaObject, modelName) => {
  const model = mongoose.model(modelName, schemaObject)
  const newDocument = new model(object)
  return newDocument.constructor.modelName === modelName;
}

// checks if a result is a strict match
module.exports.matches = (property, pattern) => {
  return property === pattern ? true : false; 
}

module.exports.getMostRecent = (metadataList) => {
  return metadataList.sort(
    (prev, next) => Number(next.date) - Number(prev.date)
  )[0];
} 