const player = require("./player");

const toolbox = function() {
    toolbox.prototype.add_to_playlist = function() {

    }

    toolbox.prototype.open_link = function(url) {
        shell.openExternal(url);
    }

    toolbox.prototype.delete_song = function(beatmap_set_id, beatmap_id) {
        // Was the player playing anything?
        if (player.getCurrent()) {
            var current = player.getCurrent();
            if (current.BeatmapID == beatmap_id) {
                var wasPlaying = player.getPlaying();
                player.clear_player();
                player.forward();

                // if its still the same clear the player
                // After the forwards if the song is still the same
                // This would mean that there is only 1 song in the playlists

                // Need to update to the current data after we forwarded the in the playlist
                current = player.getCurrent();
                if (current.BeatmapID == beatmap_id) {

                    // Yet this isnt always the case if there are duplicates in the playlist.
                    // Maybe we could check the currentPlaylists and if the length is equal to 1
                    // Unload
                    if (current.length == 1) {
                        player.unload();
                    }
                    // If the length of the currentPlaylist is greater than 1
                    // Init a forloop and find the index of the current song that was originally playing before delete.
                    // When found keep forwarding until the beatmap != current.BeatmapID
                    if (current.length > 1) {

                        // For now putting unload function since i haven't implemented custom playlists yet.
                        player.unload();
                    }
                }

                // Maybe dont play if it wasnt playing...
                if (!wasPlaying) player.play();
            }
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
        playlist_page.remove_card(beatmap_id);
    }
    
    toolbox.prototype.delete_song_set = function() {
        
    }

    toolbox.prototype.remove_from_playlist = function() {

    }
}

module.exports = new toolbox();