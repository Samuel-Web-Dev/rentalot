const fs = require('fs')
const path = require('path')

const deleteFromFile = (filePath) => {
    fs.unlink(path.join(__dirname, '..', filePath), (err, data) => {
        if(err) {
            console.log(err)
        }
    })
}


module.exports = deleteFromFile