const execSync = require('child_process').execSync;

const execAndCheck = (command, pattern) => {
  const output = execSync(command, { encoding: 'utf-8' }); 
  return output.includes(pattern) ? true : output;
}

const pullCommand = 'docker pull bigchaindb/bigchaindb:all-in-one';
const shaExpected = 'sha256:ea3975fef58a75501fe5ced712d324570ded374b592993362a206fe95314f1c1';
const pullResult = execAndCheck(pullCommand, shaExpected);

// Pulls the bigchaindb image and checks the result
if(pullResult === true){
  console.log('INFO: Image successfully pulled');
  
  const imageListCmd = 'docker images';
  const image = 'bigchaindb/bigchaindb';
  const isListed = execAndCheck(imageListCmd, image);

  // If the docker image is listed,
  if(isListed === true){
    console.log('INFO: Image found in the docker images list');

      const containerCreationCmd = `
      docker run --detach 
      --name bigchaindb 
      --publish 9984:9984 
      --publish 9985:9985 
      --publish 27017:27017 
      --publish 26657:26657 
      --volume $HOME/bigchaindb_docker/mongodb/data/db:/data/db 
      --volume $HOME/bigchaindb_docker/mongodb/data/configdb:/data/configdb 
      --volume $HOME/bigchaindb_docker/tendermint:/tendermint bigchaindb/bigchaindb:all-in-one`;
      const existsMsg = `"/bigchaindb" is already in use`;
      // Creates a container with port forwarding and volume mapping
      const alreadyExists = execAndCheck(containerCreationCmd, existsMsg);

      // If there is a conflict, then we just run the existing one.
      if(alreadyExists === true){
        console.log('INFO: Container already exists');

        const runCmd = 'docker run -d bigchaindb/bigchaindb:all-in-one'; 
        const isRunning = execSync(runCmd, { encoding: 'utf-8' });

        if(isRunning.length === 64 && !isRunning.includes(" ")){
            console.log('INFO: BigchainDB container running! Success!');
        }else{
          console.log('ERR: Cannot run container:', isRunning);
        }
      } else {
        // TODO: Add check if container is running (docker ps command)
        console.log('INFO: First run for BigchainDB container: Success!');
      }
    } else {
      console.log('ERR: Image not found locally', isListed);
    }
} else {
  console.log('ERR: Image not correctly pulled', pullResult);
}

