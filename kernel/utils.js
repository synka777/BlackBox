const driver = require('bigchaindb-driver');
const jwt = require('jsonwebtoken');
const {uri} = require('../kernel/db');
const {Ed25519Sha256} = require('crypto-conditions');
const res = require('express/lib/response');
// const baseController = require('../controllers/baseController')

// const identity = new driver.Ed25519Keypair()
module.exports.jwtKey = 'my_secret_key';

/* module.exports.keys = {
  'publicKey':'B9Y5QTx89DzKbaefD9PWFKvAdt91shhYDCjGK2oY5Mc4',
  'privateKey':'GHKczvHhvKVoqHx153MX28c9sG5QiVsGuKxCxXZgefbH'
}; */

// Token
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


// Transactions

module.exports.createNewAsset = async (data, metadata) => {
  const {publicKey, privateKey} = this.generateKeyPair();
  const tx = this.createTx(data, metadata, publicKey);
  const signedTx = this.signTx(tx, privateKey);

  return this.postTx(signedTx);
}

module.exports.generateKeyPair = () => {
  return new driver.Ed25519Keypair()
};

module.exports.createTx = (data, metadata, publicKey) => {
  const output = driver.Transaction.makeOutput(
    driver.Transaction.makeEd25519Condition(publicKey)
  );
  return driver.Transaction.makeCreateTransaction(
      data,
      metadata,
      //output,
      [output],
      publicKey,
  );
};

module.exports.signTx = (transaction, privateKey) => {
  return driver.Transaction.signTransaction(transaction, privateKey);
};

module.exports.postTx = async (signedTransaction) => {
  const conn = new driver.Connection('http://localhost:9984/api/v1/');
  //const retrievedTx = await conn.postTransactionSync(signedTransaction);
  return conn.postTransactionCommit(signedTransaction)
  .then(resp => resp)
  .catch(err => {
    console.log('Failure: postTransactionCommit', err);
    return err;
  });
};

// Misc
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

/* Non utilisé, laissé à titre d'exemple pour montrer syntaxes possibles lorsque l'on
a besoin d'utiliser des controllers et appliquer des traitements suite au résultat obtenu */
/* module.exports.accessGranted = async(token, resourceType) => {
	const decodedToken = jwt.verify(token, this.jwtKey)
	const userReq = { username: decodedToken.username }
	if(decodedToken.username == this.defaultAdmin.admUsername){
		return "W"
	}
	let roleRequest // Récupération de l'utilisateur par username
	await baseController.readDocuments(userReq, 'User', ['password','__v']).then(resp => {
		if(resp.status==200 && resp.data.roleId!=''){ roleRequest = { _id: resp.data[0].roleId }}
	})
	let permissionsId // Récupération du rôle associé à l'utilisateur par son ID
	await baseController.readDocuments(roleRequest, 'Role', ['name','__v']).then(resp => {
		if(resp.status==200){
			resp.data[0].permissionsId.filter((permId)=>{ permissionsId = { _id: permId }})
		}
	})
	return await baseController.readDocuments(permissionsId, 'Permission', ['resourceName','accessRight','__v']).then(resp => {
		// Si le rôle comporte une permission All (Permission donnant accès à toute ressource), on return la valeur
		if(resp.status == 200 && resp.data[0].resourceName == "All"){
			return resp.data[0].accessRight
		}// Sinon si pas de permission all, voir si la permission donne accès à la ressource
		if(resp.status == 200 && resp.data[0].resourceName == resourceType){
			return resp.data[0].accessRight
		}
	})
} */
