const toolbox = function() {
    toolbox.prototype.add_to_playlist = function(uuid, beatmapid, beatmapsetid) {
        playlist.add("bcc6f359-0c51-458a-b26e-bd215a84e3a4", beatmapid, beatmapsetid);
    }

    toolbox.prototype.open_link = function(url) {
        shell.openExternal(url);
    }

    toolbox.prototype.delete_song = function(beatmap_set_id, beatmap_id, index, playlist_name) {
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
                if (current.BeatmapID == beatmap_id || current.index == index) {

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
                if (!wasPlaying) player.pause();
            }
        }

        var beatmap_folder = path.join(appDataSongs, beatmap_set_id);
        var song_folder = path.join(beatmap_folder, beatmap_id);

        // Remove the song folder
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

        // remove from all playlist
        

        var id = index == "null" ? beatmap_id : index;
        playlist_page.remove_card(id, playlist_name);

        // Delete all duplicates from deleted song 
        if (index !== "null") {
            var playlists = playlist.get(playlist_name)["songs"];
            for (var x = 0; x < playlists.length; x++) {
                console.log(playlists[x])
                if (playlists[x].BeatmapID == beatmap_id && playlists[x].BeatmapSetID == beatmap_set_id) {
                    playlist_page.remove_card(playlists[x].index, playlist_name);
                }
            }
        }
        
    }
    
    toolbox.prototype.delete_song_set = function() {
        
    }

    toolbox.prototype.remove_from_playlist = function(playlist_uuid, index) {
        // Was the player playing anything?
        if (player.getCurrent()) {
            // is the player playing the song in that is about the get removed?
            if (player.getCurrentPlaylistName() == playlist_uuid && player.getCurrent()["index"] == index) {
                // forward it
                var wasPlaying = player.getPlaying();
                console.log(wasPlaying)
                player.clear_player();
                player.forward();
                // if still playing the same 
                current = player.getCurrent()
                if (current.index == index) {
                    player.unload();
                }

                if (!wasPlaying) player.pause();
            }
        }

        playlist.remove(playlist_uuid, index);
        playlist_page.remove_card(index, playlist_uuid);
    }
}

module.exports = new toolbox();