const import_file = function() {

    import_file.prototype.import = function() {
        let file = document.createElement("input");
        file.setAttribute("type", "file");
        file.setAttribute("accept", ".osz");
        file.click();
        file.oninput = async () => {
            let fileList = file.files;
            let name = fileList[0].name.slice(0, -4);
            let dest = appDataTemp + "\\" + fileList[0].name.slice(0, -4) + ".zip";
            await copyFile(fileList[0].path, dest);
            extract_downloaded_file(name);
        }
    }

    let copyFile = (src, dest) => {
        return new Promise(resolve => {
            fs.copyFile(src, dest, (err) => {
                if (err) {
                    throw err;
                }
                return resolve()
            });
        });
    }
}

module.exports = new import_file();