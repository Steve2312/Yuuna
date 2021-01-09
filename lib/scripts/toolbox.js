const toolbox = function() {
    toolbox.prototype.add_to_playlist = function() {

    }

    toolbox.prototype.open_link = function(url) {
        shell.openExternal(url);
    }

    toolbox.prototype.delete_song = function(beatmap_set_id, beatmap_id) {
        if (player.getCurrent().BeatmapID == beatmap_id) {
            player.clear_player();
            player.forward();
            //if its still the same clear the playlist
        }

        var beatmap_folder = path.join(appDataSongs, beatmap_set_id);
        var song_folder = path.join(beatmap_folder, beatmap_id);

        //Remove the song folder
        fs.rmdir(song_folder, { recursive: true }, async function (){
            // Check if the beatmap folder is empty
            function folder_content(src) {
                return new Promise(resolve => {
                    fs.readdir(src, (err, files) => {
                        resolve(files);
                    });
                });
            }
            var directory = await folder_content(path.join(appDataSongs, beatmap_set_id));
            if (directory.length == 0) {
                fs.rmdir(beatmap_folder, { recursive: true }, function (){ 
                    player.updatePlaylist(); 
                });
            } else {
                player.updatePlaylist();
            }
        });

    }
    
    toolbox.prototype.delete_song_set = function() {
        
    }

    toolbox.prototype.remove_from_playlist = function() {

    }
}

module.exports = new toolbox();