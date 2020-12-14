// Temporary JSON reader
function request_JSON(name) {
    return new Promise(async resolve => {
        var all_songs_playlist = {}
        if (name == 'All songs') {
            var songs_directory = path.join(__dirname, "songs");
            // all_songs = await songs_in_dir(songs_directory);
            var all_songs = await songs_in_dir_sort_time(songs_directory);
            for (var x in all_songs) {
                var hbk_path = path.join(songs_directory, all_songs[x], "metadata.hbk");
                var hbk_data = await read_hbk(hbk_path);
                for (var h in hbk_data) {
                    all_songs_playlist[Object.keys(all_songs_playlist).length] = hbk_data[h];
                }
            }
            return resolve(all_songs_playlist);
        }
    });
}

function songs_in_dir(sdir) {
    return new Promise(resolve => {
        fs.readdir(sdir, (err, files) => {
            resolve(files);
        });
    });
}

function songs_in_dir_sort_time(sdir) {
    return new Promise(resolve => {
        fs.readdir(sdir, function(err, files){
            files = files.map(function (fileName) {
                return {
                    name: fileName,
                    time: fs.statSync(sdir + '/' + fileName).mtime.getTime()
                };
            }).sort(function (a, b) {
                return b.time - a.time;
            }).map(function (v) {
                return v.name;
            });

            resolve(files);
        });  
    });
}

function read_hbk(hbk_path_f) {
    return new Promise(resolve => {
        fs.readFile(hbk_path_f, 'utf-8', (err, data) => {
            return resolve(JSON.parse(data));
        });
    });
}