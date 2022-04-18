const fs = require('fs');

const deleteFolder = (path) => {
    let files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach( file => {
            let curPath = `${path}/${file}`;
            if(fs.statSync(curPath).isDirectory()) {
                deleteFolder(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

const deleteFile = (path) => {
    fs.unlinkSync(path);
}

const getSize = (path) => {
    const stats = fs.statSync(path);
    return (stats.size / 1024) / 1024;
}

module.exports = {
    deleteFolder,
    deleteFile,
    getSize
}