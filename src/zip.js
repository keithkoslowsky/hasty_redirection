const fs = require('fs')
const archiver = require('archiver')

module.exports.zipDir = function zipDir(zipName='', packagedDir='') {
    const output = fs.createWriteStream(zipName)
    const archive = archiver('zip')

    archive.on('error', function(err){
	throw err
    });
    
    archive.pipe(output)
    
    archive.directory(packagedDir, false)
    
    archive.finalize()    
}


