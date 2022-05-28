const execSync = require('child_process').execSync;
const app = require('./app');
const http = require('http');

const checkRunCmd = 'docker ps';
const imgName = 'bigchaindb/bigchaindb:all-in-one';
const output = execSync(checkRunCmd, { encoding: 'utf-8' });

if(!output.includes(imgName)){
  console.log('bigchaindb container not running, please run the following command first:');
  console.log('npm run setup');
  process.exit();
}

const port = 9229;
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => {
  console.log('Project running - Port:', port);
  console.log('Waiting for requests!');
});