
const driver = require('bigchaindb-driver');
require('dotenv').config()
//const {Ed25519Sha256} = require('crypto-conditions');

const host = process.env.DB_HOST;
const port = process.env.DB_PORT;

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

module.exports.readAssets = async (search) => {
    return this.conn.searchAssets(search);
}

module.exports.readAssetsMetadata = async (search) => {
    return this.conn.searchMetadata(search);
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

