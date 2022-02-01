const app = require('./app')
const http = require('http')


var port = 3000
app.set('port', port)


var server = http.createServer(app);
server.listen(port)