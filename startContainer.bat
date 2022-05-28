@ECHO OFF
docker run --detach --name bigchaindb --publish 9984:9984 --publish 9985:9985 --publish 27017:27017 --publish 26657:26657 --volume ~/bigchaindb_docker/mongodb/data/db:/data/db --volume ~/bigchaindb_docker/mongodb/data/configdb:/data/configdb --volume ~/bigchaindb_docker/tendermint:/tendermint bigchaindb/bigchaindb:all-in-one
