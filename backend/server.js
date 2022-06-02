const execSync = require('child_process').execSync;
const app = require('./app');
const http = require('http');
const os = require('os');

const checkRunCmd = 'docker ps';
const imgName = 'bigchaindb/bigchaindb:all-in-one';
const dockerPsOutput = execSync(checkRunCmd, { encoding: 'utf-8' });

if(!dockerPsOutput.includes(imgName)){
  console.log('ERROR: bigchaindb container not running, please run the following command first:');
  console.log('npm run setup');
  process.exit();
}

const listCmd = os.platform() === 'win32' ? 'dir' : 'ls -la';
const fileName = '.env';
const listOutput = execSync(listCmd, { encoding: 'utf-8' });

if(!listOutput.includes(fileName)){
  console.log('ERROR: The .env file is missing, please check with your team and download it first')
  process.exit();
}


const port = 9229;
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => {
  console.log('INFO: Project running - Port:', port);
  console.log('INFO: Waiting for requests!');
});