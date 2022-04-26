const app = require('./app')
const http = require('http')


var port = 9229
app.set('port', port)


var server = http.createServer(app)
server.listen(port, () => console.log('Running on port:', port))