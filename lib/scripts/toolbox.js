class toolbox {
    add_to_playlist() {

    }

    open_link(url) {
        shell.openExternal(url);
    }

    delete_song(beatmap_set_id, beatmap_id) {
        if (player.current.BeatmapID == beatmap_id) {
            player.clear_player();
            player.forward();
            //if its still the same clear the playlist
        }

        var beatmap_folder = path.join(appDataSongs, beatmap_set_id);
        var song_folder = path.join(beatmap_folder, beatmap_id);

        //Remove the song folder
        fs.rmdir(song_folder, { recursive: true }, async function (){
            // Check if the beatmap folder is empty
            function folder_content(dir) {
                return new Promise(resolve => {
                    fs.readdir(dir, (err, files) => {
                        resolve(files);
                    });
                });
            }
            var dir = await folder_content(path.join(appDataSongs, beatmap_set_id));
            console.log(dir)
            if (dir.length == 0) {
                fs.rmdir(beatmap_folder, { recursive: true }, function (){ 
                    player.updatePlaylist(); 
                });
            } else {
                player.updatePlaylist();
            }
        });

    }
    
    delete_song_set() {
        
    }

    remove_from_playlist() {

    }
}

module.exports = new toolbox();