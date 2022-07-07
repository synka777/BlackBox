
const driver = require('bigchaindb-driver');
require('dotenv').config()
//const {Ed25519Sha256} = require('crypto-conditions');

const host = process.env.BC_HOST;
const port = process.env.BC_PORT;

// const identity = new driver.Ed25519Keypair()
/* module.exports.keys = {
  'publicKey':'B9Y5QTx89DzKbaefD9PWFKvAdt91shhYDCjGK2oY5Mc4',
  'privateKey':'GHKczvHhvKVoqHx153MX28c9sG5QiVsGuKxCxXZgefbH'
}; */

module.exports.uri = `http://${host}:${port}/api/v1/`;
module.exports.conn = new driver.Connection(this.uri);

module.exports.createNewAsset = async (data, metadata) => {
  const {publicKey, privateKey} = this.generateKeyPair();
  const tx = this.createTx(data, metadata, publicKey);
  const signedTx = this.signTx(tx, privateKey);

  return this.postTx(signedTx);
}

module.exports.searchAssets = async (search) => {
  return this.conn.searchAssets(search);
}

module.exports.searchMetadata = async (search, limit = 50) => {
  return this.conn.searchMetadata(search, limit);/* .then(resp => {
    console.log('resp',resp);
  }).catch(err => console.log('Error caught on call',err)); */
}

module.exports.searchAssets = async (search) => {
    return this.conn.searchAssets(search);
}

module.exports.searchMetadata = async (search) => {
    return this.conn.searchMetadata(search);
}

module.exports.editArticleMetaData = async(assetId, metadata) => {
  // Retreive transactionID, stored in the asset or metadata?
  // If not, need to implement a local db to keep track of article ID / create transaction id
  // const tx = this.conn.getTransaction(txCreateAliceSimpleSigned.id);

  // The asset ID may be (should be) the same as the create transction ID that created the asset!
  const tx = this.conn.getTransaction(assetId);

  // Prepare the transaction
  const transferTx = driver.Transaction.makeTransferTransaction(
    // signedTx to transfer and output index
    [{ tx: tx, output_index: 0 }],
    [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(bob.publicKey))],
    metadata
  );

  // Fulfill the transaction with the original private key
  const txTransferSigned = driver.Transaction.signTransaction(transferTx, alice.privateKey);

  // Send the transaction to a BigchainDB node
  const result = this.conn.postTransactionCommit(txTransferSigned);

  return result; 
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
  return this.conn.postTransactionCommit(signedTransaction)
  .then(resp => resp)
  .catch(err => {
    console.log('Failure: postTransactionCommit', err);
    return err;
  });
};

