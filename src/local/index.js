'use strict'

const map = {}

require('http').createServer((req, res) => {
    const path = req.url
    
    const statusCode = map[path] ? map[path]?.code || (map[path].html ? 200 : 301) : 404
    const headers = {
	...(map[path]?.redirect && { location: map[path].redirect }),
    }
    
    try {
	res.writeHead(statusCode, headers)
	res.end()
    } catch(e) {
	console.error(e);
	res.writeHead(500, { 'Content-Type': 'text/html' })
	res.write('<p>Something went wrong</p>')
	res.end()
    }
}).listen(3000)

process.on('SIGINT', () => process.exit())
