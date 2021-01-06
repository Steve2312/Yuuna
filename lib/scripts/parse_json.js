// Temporary JSON reader
function request_JSON(name) {
    return new Promise(async resolve => {
        var all_songs_playlist = []
        if (name == 'Library') {
            var songs_directory = appDataSongs;
            // all_songs = await songs_in_dir(songs_directory);
            var all_sets = await songs_in_dir_sort_time(songs_directory);
            for (var x in all_sets) {
                var all_beatmaps = await songs_in_dir_sort_time(path.join(appDataSongs, all_sets[x]));
                for (var y in all_beatmaps) {
                    var hbk_path = path.join(songs_directory, all_sets[x], all_beatmaps[y], "metadata.hbk");
                    var hbk_data = await read_hbk(hbk_path);
                    all_songs_playlist.push(hbk_data);
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
            if (files) {
                files = files.map(function (fileName) {
                    return {
                        name: fileName,
                        time: fs.statSync(sdir + '/' + fileName).birthtime.getTime()
                    };
                }).sort(function (a, b) {
                    return b.time - a.time;
                }).map(function (v) {
                    return v.name;
                });
                resolve(files);
            } else resolve([]);
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