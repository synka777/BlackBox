const execSync = require('child_process').execSync;
const os = require('os');

////////////////////////////
////////////// Functions

/* const execAndCheck = (command, pattern) => {
  const output = execSync(command, { encoding: 'utf-8' });
  return output.includes(pattern) ? true : output;
} */

const execAndCheck = (command, pattern) => {
  const output = execSync(command, { encoding: 'utf-8' });
  return output.includes(pattern) ? true : false;
}

const pullImage = () => {
  const pullCommand = 'docker pull bigchaindb/bigchaindb:all-in-one';
  const expectedSHA = 'sha256:ea3975fef58a75501fe5ced712d324570ded374b592993362a206fe95314f1c1';
  return execAndCheck(pullCommand, expectedSHA);
};

const imageExists = () => {
  const imageListCmd = 'docker images';
  const image = 'bigchaindb/bigchaindb';
  return execAndCheck(imageListCmd, image);
};

const containerListed = () => {
  const containerListCmd = 'docker ps -a --filter "status=exited" --filter "status=created"';
  const containerName = 'bigchaindb';
  return execAndCheck(containerListCmd, containerName);
};

const createStartContainerSuccessful = () => {
  const runCmd = os.platform() === 'win32' ? 'cmd.exe /C .\\startContainer.bat' : './startContainer.sh';
  const existsMsg = `"/bigchaindb" is already in use`;
  return execAndCheck(runCmd, existsMsg) ? false : true;
};

const startContainer = () => {
  const startCmd = 'docker start bigchaindb';
  const startOutput = execSync(startCmd, { encoding: 'utf-8' });
  return startOutput.includes('bigchaindb') ? true : false;
};

const isRunning = () => {
  const checkRunCmd = 'docker ps';
  const imgName = 'bigchaindb/bigchaindb:all-in-one';
  return execAndCheck(checkRunCmd, imgName);
};

////////////////////////////
////////////// STEP 1: docker image

let proceedToContainer = false;

if(!imageExists()){
  console.log('INFO: Image not found locally, pulling...');
  if(pullImage()){
    console.log('INFO: Image successfully pulled');
    if(imageExists()){
      console.log('INFO: Image found locally, moving to next steps');
      proceedToContainer = true;
    } else {
      console.log('ERR: A problem occured after the pull operation');
    }
  } else {
    console.log('ERR: Image not correctly pulled', pullResult);
  }
} else {
  console.log('INFO: Image found locally, moving to next steps');
  proceedToContainer = true;
}

////////////////////////////
////////////// STEP 2: docker container

if(proceedToContainer){
  if(isRunning()){
    console.log('INFO: OK - Container already running');
    console.log('Happy coding! 🚀');
  } else {
    if(containerListed()){
      console.log('INFO: Container found');
      if(startContainer()){
        console.log('INFO: Check 1/2 - Container started')
        if(isRunning()){
          console.log('INFO: Check 2/2 - BigchainDB container running: Success!');
        } else {
          console.log('ERR: Check 2/2 - Cannot run the existing container');
        }
      }
    } else {
      console.log('INFO: Container not found');
      if(createStartContainerSuccessful()){
        console.log('INFO: Check 1/2 - Container setup completed')
        if(isRunning()){
          console.log('INFO: Check 2/2 - First run for BigchainDB container: Success!');
          console.log('Happy coding! 🚀');
        } else {
          console.log('ERR: Check 2/2 - The BigchainDB container is NOT running');
        }
      } else {
        console.log('ERR: A problem occured during the container creation')
      }
    }
  }
}
