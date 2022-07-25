
const driver = require('bigchaindb-driver');
require('dotenv').config();
const shortid = require('shortid');
//const {Ed25519Sha256} = require('crypto-conditions');

const host = process.env.BC_HOST;
const port = process.env.BC_PORT;

// const identity = new driver.Ed25519Keypair()
module.exports.keys = {
  'publicKey':'B9Y5QTx89DzKbaefD9PWFKvAdt91shhYDCjGK2oY5Mc4',
  'privateKey':'GHKczvHhvKVoqHx153MX28c9sG5QiVsGuKxCxXZgefbH'
};

/* module.exports.generateKeyPair = () => {
  return new driver.Ed25519Keypair()
}; */

module.exports.uri = `http://${host}:${port}/api/v1/`;
module.exports.conn = new driver.Connection(this.uri);

module.exports.createNewAsset = async (data, metadata) => {
  //const {publicKey, privateKey} = this.generateKeyPair();
  const tetherId = shortid.generate();
  data.date = new Date();
  data.tetherId = tetherId;
  metadata.date = new Date();
  metadata.tetherId = tetherId;
  const {publicKey, privateKey} = this.keys;
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

module.exports.editArticleMetaData = async(assetId, metadata) => {
  const {publicKey, privateKey} = this.keys;

  return this.conn.getTransaction(assetId).then(transaction => {
    const transferTx = driver.Transaction.makeTransferTransaction(
      // signedTx to transfer and output index
      [{ tx: transaction, output_index: 0 }],
      [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(publicKey))],
      metadata
    );
    console.log('Transfer Tx:', transferTx);
  
    // Fulfill the transaction with the original private key
    const txTransferSigned = driver.Transaction.signTransaction(transferTx, privateKey);
    console.log('Tx transfer signed:', txTransferSigned);
    // Send the transaction to a BigchainDB node
    return this.conn.postTransactionCommit(txTransferSigned).then(result => {
      console.log('Result:', result);
      return result;
    }).catch(err => console.log('Error caught during postTransactionCommit', err));
  }).catch(err => console.log('Error caught during getTransaction', err));
}

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

