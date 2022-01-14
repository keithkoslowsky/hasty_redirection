'use strict'

const fs = require('fs').promises
const zip = require('./zip')

const provider = process.env.PROVIDER

async function compile(lines='', config={}, packagedDir='') {    
    const sourceRaw = await fs.readFile('./src/aws/index.js')
    const source = sourceRaw.toString()
    
    let map = {}
    for (let idx = 0; idx < lines.length; idx++) {
	const line = lines[idx].replace(/\r\n|\n|\r/, '').split('|')
	const path = '/' + (line[0] || '').trim()
	const redirectUrl = (line[1] || '').trim()
	const statusCode = (line[2]
			    || config.default_status_code
			    || '301').trim()

	map[path] = {
	    ...(redirectUrl && { redirect: redirectUrl }),
	    ...(statusCode && { code: statusCode }),
	}
    }

    try {
	const exists = await fs.access(packagedDir)
    } catch(e) {
	if (e.code === 'ENOENT') {
	    await fs.mkdir(packagedDir)
	}
    }


    return await fs.writeFile(
	packagedDir + '/index.js',
	source.replace(
	    'const map = {}',
	    'const map = ' + JSON.stringify(map)
	)
    )
}

async function compileAWS(lines='', config={}) {
    const packagedDir = './compiled/aws/packaged'
    
    await compile(lines, config, packagedDir)
    zip.zipDir('HastyRedirection.zip', packagedDir)
}

(async () => {
    const newLine = /\r\n|\n|\r/
    
    let config = {}
    try {
	const getConfig = await fs.readFile('./config/settings.txt');
	const lines = getConfig.toString().split(newLine)
	for (let idx = 0; idx < lines.length; idx++) {
	    const keyVal = lines[idx].match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
	    if (keyVal) {
		config[keyVal[1]] = keyVal[2]
		    .replace(newLine, '')
		    .replace(/^["|']/, '')
		    .trim()
	    }
	}
    } catch(e) {}

    let redirects = []
    try {
	const redirectsAsRaw = await fs.readFile('./config/redirects.csv')
	redirects = redirectsAsRaw.toString().split(newLine)

	if (provider === 'AWS') {
	    await compileAWS(redirects, config)
	} else {
	    console.log('*** No provider set ***')
	}
    } catch(e) {}    
})()



