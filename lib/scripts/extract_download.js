// Global Variables

{
    // Local Variables

    // Local Functions
    let get_temp_path = () => {
        return appDataTemp;
    }

    let extract_zip = async (src, dest) => {
        try {
            await extract(src, { dir: dest })
            fs.unlink(src, (err) => { if (err) { console.error(err) }});
        } catch (err) {
        // handle any errors
        }
    }

    let list_filename = (src) => {
        return new Promise(resolve => {
            fs.readdir(src, (err, files) => {
                if (err) {
                    throw err;
                }
                return resolve(files)
            });
        });
    }

    let read_osu_File = (src) => {
        return new Promise(resolve => {
            fs.readFile(src, 'utf-8', (err, data) => {
                if (err) {
                    throw err;
                }
                return resolve(data.toString())
            });
        });
    }

    let beatmap_metadata = (filenames, extract_path) => {
        var metadata = {};
        return new Promise(async function (resolve) {
            for(var i = 0; i < filenames.length; i++) {
                // Read the file contents.
                var file_content = '';
                if (filenames[i].slice(-4) == ".osu") {
                    file_content = await read_osu_File(path.join(extract_path, filenames[i]));
                    file_content = file_content.split("\r\n").filter( function (el) { return el !== ""; })

                    var metadata_object = {};
                    var audio_duplicate = false;
                    var audio_file = '';
                    var placeholder;

                    for(var y = 0; y < file_content.length; y++) {
                        placeholder = file_content[y].split(":");
                        if (placeholder.length > 1) {
                            if(placeholder[0] == "AudioFilename") {
                                audio_file = file_content[y].slice(15);

                                // Is Audio already in metadata?
                                for (z in metadata) {
                                    if (metadata[z]["file"] == audio_file){
                                        audio_duplicate = true;
                                        break;
                                    }
                                }
                                if(!audio_duplicate) {
                                    metadata_object["file"] = audio_file;
                                    metadata_object["length"] = await get_duration(path.join(extract_path, audio_file));
                                } else {
                                    break;
                                }
                            }
                            if(placeholder[0] == "Title") {
                                metadata_object["title"] = file_content[y].slice(6);
                            }
                            if(placeholder[0] == "TitleUnicode") {
                                metadata_object["title_original_language"] = file_content[y].slice(13);
                            }
                            if(placeholder[0] == "Artist") {
                                metadata_object["artist"] = file_content[y].slice(7);
                            }
                            if(placeholder[0] == "ArtistUnicode") {
                                metadata_object["artist_original_language"] = file_content[y].slice(14);
                            }
                            if(placeholder[0] == "Source") {
                                metadata_object["source"] = file_content[y].slice(7);
                            }
                            if(placeholder[0] == "BeatmapID") {
                                metadata_object["BeatmapID"] = file_content[y].slice(10);
                            }
                            if(placeholder[0] == "BeatmapSetID") {
                                metadata_object["BeatmapSetID"] = file_content[y].slice(13);
                                break;
                            }
                        }
                    }
                    if(!audio_duplicate) {
                        metadata[Object.keys(metadata).length] = metadata_object;
                    }
                }
            }
            resolve(metadata);
        });
    }

    let get_duration = (song_path) => {
        return new Promise(resolve => {
            var audio = document.createElement('audio');
            audio.src = song_path;
            audio.addEventListener('loadedmetadata', function(){
                var duration = audio.duration;
                audio.remove();
                return resolve(duration);
            }, false);
        });
    }

    let copyFiles = (metadata, temp_path) => {
        return new Promise(async function (resolve) {
            for (x in metadata) {
                // Create song folder if there is none
                if (!fs.existsSync(path.join(appDataSongs))) {
                    fs.mkdirSync(path.join(appDataSongs));
                }
                
                var move_dest = path.join(appDataSongs, metadata[x]["BeatmapSetID"])
                if (!fs.existsSync(move_dest)) {
                    fs.mkdirSync(move_dest);
                }
                // Write Metadata file
                fs.writeFile(path.join(move_dest, "metadata.hbk"), JSON.stringify(metadata), 'utf8', function (err) {if (err) {return console.log(err);}});
                fs.copyFile(path.join(temp_path, metadata[x]["file"]), path.join(move_dest, metadata[x]["file"]), (err) => {if (err) throw err;});
                // Download beatmaop cover
                request(`https://b.ppy.sh/thumb/${metadata[x]["BeatmapSetID"]}l.jpg`).pipe(fs.createWriteStream(path.join(move_dest, "cover.jpg")));
            }    
            return resolve("0");
        });
    }

    // Global functions

    var extract_downloaded_file = async (beatmap_id) => {
        var temp_file = path.join(get_temp_path(), `${beatmap_id}.zip`);
        var extract_path = path.join(get_temp_path(), beatmap_id.toString());
        await extract_zip(temp_file, extract_path);
        var filenames = await list_filename(extract_path);
        await copyFiles(await beatmap_metadata(filenames, extract_path), extract_path);
        player.updatePlaylist();
        if (!player.isBuild()) player.build();
    }
}
