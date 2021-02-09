const parse_json = function() {
    parse_json.prototype.playlist = async function(playlist_name) {
        var metadata = [];
        var list_set = await this.get_beatmap_sets(appDataSongs);
        for (var i = 0; i < list_set.length; i++) {
            var list_id = await this.get_files_in_dir(path.join(appDataSongs, list_set[i]));
            for(var x = 0; x < list_id.length; x++) {
                var path_hbk = path.join(appDataSongs, list_set[i], list_id[x], "metadata.hbk");
                metadata.push(JSON.parse(await this.read_file(path_hbk)));
            }
        }

        if (playlist_name == "Library") {
            return metadata;
        } else {
            var playlist_data = [];
            var data = playlist.get(playlist_name)["songs"];
            for (var x = 0; x < data.length; x++) {
                for (var y = 0; y < metadata.length; y++) {
                    if (data[x]["BeatmapID"] == metadata[y]["BeatmapID"] && data[x]["BeatmapSetID"] == metadata[y]["BeatmapSetID"] ) {
                        var returnedTarget = Object.assign({}, metadata[y])
                        returnedTarget["index"] = `${data[x].index}`;
                        playlist_data.push(returnedTarget);
                        break;
                    }
                }
            }
            return playlist_data
        }
    }

    parse_json.prototype.get_beatmap_sets = function(src) {
        return new Promise(resolve => {
            fs.readdir(src, function(error, files) {
                if (files) {
                    files = files.map(function(fileName) { 
                        return {
                            name: fileName,
                            time: fs.statSync(src + '/' + fileName).birthtime.getTime()
                        };
                    }).sort(function(a, b) {
                        return b.time - a.time;
                    }).map(function(v) {
                        return v.name;
                    });
                    resolve(files);
                } else resolve([]);
            });
        });
    }

    parse_json.prototype.get_files_in_dir = function(src) {
        return new Promise(resolve => {
            fs.readdir(src, function(err, files) {
                if (files) {
                    resolve(files);
                } else resolve([]);
            });
        });
    }
    
    parse_json.prototype.read_file = function(src) {
        return new Promise(resolve => {
            fs.readFile(src, 'utf-8', function(err, data) {
                resolve(data);
            })
        });
    }
}

module.exports = new parse_json();