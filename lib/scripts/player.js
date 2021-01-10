const Player = function() {
    // Preview Audio Object Local Variables
    let preview_audio = null;
    let preview_src = null;
    let preview_button = null;

    // Audio Object Local Variables
    let audio = null;
    let audio_volume = 0.1;
    let duration_interval = null;
    // Info of the current song playing and in which playlist
    let current = null;
    let current_playlist = null;
    let currentPlaylistName = 'Library';

    // Handles the Windows Media Buttons
    let windowsPanel = navigator.mediaSession;

    // Variable for is the timeline is being dragged
    let onDrag = false;

    // Options to set the playlist on shuffle and the shuffled playlist
    let on_shuffle = false;
    let shuffled_playlist = null;

    // Has the player been initialized?
    let initialized = false;

    // Id of the DOM element of which the audio is playing
    let playlist_icon = null;
    let playlist_card = null;

    // Is the playlist on repeat?
    let on_repeat = false;

    // Public
    Player.prototype.getPlaying = function() {
        return audio.playing();
    }

    Player.prototype.getCurrent = function() {
        return current;
    }

    Player.prototype.getInitialized = function() {
        return initialized;
    }
    
    Player.prototype.clear_player = function() {
        clearInterval(duration_interval);
        if (audio) {
            audio.pause();
            audio.off();
            audio.unload();
            audio = null;
        }
    }

    Player.prototype.build = async function() {
        current_playlist = await parse_json.playlist(currentPlaylistName);

        if (current_playlist.length > 0) {
            initialized = true;

            this.player(current_playlist[0], currentPlaylistName);

            audio.pause();
            audio.volume(audio_volume);

            document.getElementById(`player_volume_slider`).value = audio.volume() * 100;

            setTimeout(() => this.updateAudioData(), 500);
        }

        // Windows Media Session
        windowsPanel.setActionHandler('play', () => audio.play());
        windowsPanel.setActionHandler('pause', () => audio.pause());
        windowsPanel.setActionHandler('previoustrack', () => this.backward());
        windowsPanel.setActionHandler('nexttrack', () => this.forward());
    }

    Player.prototype.play_from_playlist = async function(beatmap_id, playlist_name) {
        currentPlaylistName = playlist_name;

        current_playlist = await parse_json.playlist(playlist_name);

        var playlist = on_shuffle ? shuffled_playlist : current_playlist;

        if (playlist) playlist = current_playlist;

        for (var x = 0; x < playlist.length; x++) {
            if (playlist[x].BeatmapID == beatmap_id) {
                this.player(playlist[x], playlist_name);

                if (on_shuffle) {
                    this.shuffle_playlist();
                }
            }
        }
    }

    Player.prototype.backward = function() {
        if (current && current_playlist || shuffled_playlist) {
            var playlist = on_shuffle ? shuffled_playlist : current_playlist;
            for(var i = 0; i < playlist.length; i++) {
                if (playlist[i].BeatmapID == current.BeatmapID) {
                    if (audio.seek() < 0.5 && !i == 0) {
                        this.player(playlist[i-1], currentPlaylistName);
                        this.updatePlaylistIcon('end');
                    } else {
                        audio.seek(0);
                    }
                    break;
                }
            }
        }
    }

    Player.prototype.forward = function () {
        if (current && current_playlist || shuffled_playlist) {
            var playlist = on_shuffle ? shuffled_playlist : current_playlist;
            for(var i = 0; i < playlist.length; i++) {
                if (playlist[i].BeatmapID == current.BeatmapID) {
                    var id = (i + 1) % playlist.length;
                    if (id == 0) {
                        this.initPlayer(current_playlist[id]);
                        if (on_repeat) {
                            this.play();
                        } else {
                            if (on_shuffle) {
                                this.shuffle_playlist();
                            }
                        }
                    } else {
                        this.player(playlist[id], currentPlaylistName);
                    }
                    break;
                }
            }
            this.updatePlaylistIcon('end');
        }
    }

    // if any changes to the playlist where made
    Player.prototype.updatePlaylist = async function() {
        console.time("Update playlist");
        if (current_playlist) {
            current_playlist = await parse_json.playlist(currentPlaylistName);
        }
        if (on_shuffle) {
            // Update the shuffle playlist for
            // 1. Removed songs in the main_playlists
            // 2. Update shuffle playlists so that it contains the new songs

            // 1. Removed songs in the main_playlists
            for (var y = 0; y < shuffled_playlist.length; y++) {
                var exists = false;
                for (var x = 0; x < current_playlist.length; x++) {
                    // This means that the song in the shuffle playlists exists in the current_playlists
                    if (shuffled_playlist[y].BeatmapID == current_playlist[x].BeatmapID) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) {
                    shuffled_playlist.splice(y, 1);
                }
            }
            // 2. Update shuffle playlists so that it contains the new songs
            for (var x = 0; x < current_playlist.length; x++) {
                var exists = false;
                for (var y = 0; y < shuffled_playlist.length; y++) {
                    // This means that the song in the current_playlists playlists exists in the shuffle
                    if (current_playlist[x].BeatmapID == shuffled_playlist[y].BeatmapID) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) {
                    shuffled_playlist.push(current_playlist[x]);
                }
            }

            // console.time("Time to update the playlist(map): ");
            // let result_shuffle = this.shuffled_playlist.map(({ BeatmapID }) => BeatmapID);
            // let result_current = this.current_playlist.map(({ BeatmapID }) => BeatmapID);
            // var difference_shuffle = result_shuffle.filter(x => result_current.indexOf(x) === -1);
            // var difference_current = result_current.filter(x => result_shuffle.indexOf(x) === -1);

            // for (var i=0;i<difference_current.length;i++) {
            //     var index = result_current.findIndex(difference_current[i]);
            //     this.shuffled_playlist.push(this.current_playlist[index]);
            // }

            // for (var i=0;i<difference_shuffle.length;i++) {
            //     var index = result_current.findIndex(difference_shuffle[i]);
            //     this.shuffled_playlist.splice(index, 1);
            // }
            // console.timeEnd("Time to update the playlist(map): ");
        }
        if (LOADED_PAGE == "library_page") {
            setTimeout(() => playlist_page.Libraryload_Playlist("Library"), 500);
        }
        console.timeEnd("Update playlist");
    }

    Player.prototype.shuffle = function() {
        on_shuffle = on_shuffle ? false : true;
        shuffled_playlist = [];
        if (on_shuffle) {
            document.getElementById("shuffle").classList.add("player_controls_button_extra_active");
            this.shuffle_playlist();
        }
        else {
            document.getElementById("shuffle").classList.remove("player_controls_button_extra_active");
        }
    }

    Player.prototype.repeat = function() {
        on_repeat = on_repeat ? false : true;
        var DOM_repeat = document.getElementById("repeat");
        if (on_repeat) {
            DOM_repeat.classList.add("player_controls_button_extra_active");
        }
        else {
            DOM_repeat.classList.remove("player_controls_button_extra_active");
        }
    }

    Player.prototype.shuffle_playlist = function() {
        if (current_playlist) {
            // create a randomized playlist
            shuffled_playlist = Array.from(current_playlist).sort(() => Math.random() - 0.5);

            // find index of current playing song and move it to the first index
            for (var i = 0; i < shuffled_playlist.length; i++) {
                if (current.BeatmapID == shuffled_playlist[i].BeatmapID) {
                    shuffled_playlist.unshift(shuffled_playlist[i]);
                    shuffled_playlist.splice(i+1, 1);
                }
            }
        }
    }

    Player.prototype.play = function() {
        if (current && currentPlaylistName) {
            this.player(current, currentPlaylistName);
        }
    }

    Player.prototype.check_drag = function(value) {
        onDrag = value;
    }

    Player.prototype.on_drag = function() {
        if (audio) {
            var dragged_time = Math.floor(audio.duration() / 1000 * document.getElementById(`player_slider`).value);
            document.getElementById(`player_currenttime`).textContent = utils.format_seconds(dragged_time).toString();
        }
    }

    Player.prototype.change_time = function() {
        if (audio) {
            var wasPlaying = audio.playing();
            var time = Math.floor(audio.duration() / 1000 * document.getElementById(`player_slider`).value);
            audio.seek(time);
            document.getElementById(`player_slider`).value = 1000 * time / audio.duration();
            document.getElementById(`player_currenttime`).textContent = utils.format_seconds(time);
            if (wasPlaying) {
                this.setRPC('playing');
            }
        }
    }

    Player.prototype.change_volume = function() {
        audio_volume = document.getElementById(`player_volume_slider`).value / 100;
        if (audio) {
            audio.volume(audio_volume);
        }
        if (preview_audio) {
            preview_audio.volume(audio_volume);
        }
    }

    Player.prototype.play_preview = function(index, page) {
        var beatmap = search_page.get_search_results()[page][index]["id"];
        var id = `play_preview_${beatmap}`;
        var link = `https://b.ppy.sh/preview/${beatmap}.mp3`;
        this.preview_changeIcon(0, id);
        if (preview_src == link) {
            preview_audio.unload();
            preview_src = null;
            this.preview_changeIcon(1, id);
        } else {
            if(preview_audio) {
                preview_audio.unload();
            }
            if (audio && audio.playing()) {
                audio.pause();
            }
            if (preview_audio) {
                preview_audio.off();
            }

            preview_src = link;

            preview_audio = new Howl({
                src: [preview_src],
                html5: true,
                format: ['mp3'],
                autoplay: true,
                volume: audio_volume
            });

            this.preview_changeIcon(2, id);

            preview_audio.on("end", () => {
                preview_audio.unload();
                preview_src = null;
                this.preview_changeIcon(1, id);
            });
        }
    }

    Player.prototype.player = function(data, playlist) {
        // This will cause the player to be paused
        if (current && current.BeatmapID == data.BeatmapID && currentPlaylistName == playlist) {
            if (audio) {
                if (audio.playing()) {
                    audio.pause();
                } else {
                    audio.play();
                }
            }
        } else {
            this.initPlayer(data);
            this.updatePlaylistIcon("end");
            audio.play();
        }
    }

    Player.prototype.createSongPath = function(BeatmapSetID, BeatmapID, file) {
        return path.join(appDataSongs, BeatmapSetID, BeatmapID, file);
    }

    Player.prototype.initPlayer = function(data) {
        current = data;
        if (audio) {
            this.clear_player();
        }
        audio = new Howl({
            src: [this.createSongPath(data.BeatmapSetID, data.BeatmapID, data.file)],
            html5: true,
            volume: audio_volume
        });
        this.updateAudioData();
        setTimeout(() => this.updateAudioData());
        duration_interval = setInterval(() => this.updateTimer(), 500);
        // Howler Events
        audio.on("end", () => {
            this.forward();
            this.updatePlaylistIcon('end');
        });

        audio.on("pause", () => {
            this.updatePlaylistIcon('pause');
            this.setRPC('paused');
        });

        audio.on("play", () => {
            this.updatePlaylistIcon('play');
            if (preview_audio) {
                preview_audio.unload();
            }
            if (preview_button) {
                this.preview_changeIcon(1, null);
            }
            preview_src = null;
            this.setRPC('playing');
        });
    }

    Player.prototype.updateAudioData = async function() {
        var {BeatmapSetID, BeatmapID, artist, title} = current;
        this.setRPC('paused');
        var coverPath = path.join(appDataSongs, BeatmapSetID, BeatmapID, "cover.jpg").replace(/\\/g, '/');
        document.getElementById(`player_cover`).style = `background-image: url("${coverPath}");`;
        document.getElementById(`player_artist`).textContent = artist;
        document.getElementById(`player_title`).textContent = title;
        this.getDataUrl(coverPath).then((cover) => {
            windowsPanel.metadata = new MediaMetadata({
                title: title,
                artist: artist,
                artwork: [
                    { src: cover, sizes: '512x512', type: 'image/jpg' }
                  ]
            });
        });
    }

    Player.prototype.unload = function() {
        this.clear_player();
        this.setRPC('paused');

        var DOM_playlist_icon = document.getElementById(playlist_icon);
        var DOM_playlist_card = document.getElementById(playlist_card);
        var DOM_player_playbutton = document.getElementById(`player_playbutton`);
        if (DOM_playlist_icon) DOM_playlist_icon.className = "fas fa-play";
        if (DOM_playlist_card) DOM_playlist_card.className = "play_list_card";
        if (DOM_player_playbutton) DOM_player_playbutton.className = "fas fa-play";

        current = null;
        currentPlaylistName = null;
        current_playlist = null;
        document.getElementById(`player_cover`).style = null;
        document.getElementById(`player_artist`).textContent = null;
        document.getElementById(`player_title`).textContent = null;

        if (duration_interval) clearInterval(duration_interval);
        document.getElementById(`player_totaltime`).textContent = "00:00";
        document.getElementById(`player_currenttime`).textContent = "00:00";
        document.getElementById(`player_slider`).value = 0;
        windowsPanel.metadata = null;
    }

    Player.prototype.getDataUrl = function(src) {
        return new Promise( (resolve) => {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var img = document.createElement('IMG');
            // Create canvas
            img.src = src;
            // Set width and height
            canvas.width = 160;
            canvas.height = 160;
            // Draw the image
            ctx.fillStyle = 'white';
            ctx.rect(0, 0, 160, 160);
            ctx.fill();
            ctx.drawImage(img, 0, 20);
            resolve(canvas.toDataURL('image/jpg'));
        });
    }

    Player.prototype.updatePlaylistIcon = function(state) {
        if (audio) {
            if(state == "end") {
                var DOM_playlist_icon = document.getElementById(playlist_icon);
                var DOM_playlist_card = document.getElementById(playlist_card);

                if (DOM_playlist_icon) DOM_playlist_icon.className = "fas fa-play";
                if (DOM_playlist_card) DOM_playlist_card.className = "play_list_card";
            }

            playlist_icon = `play_${currentPlaylistName.replace(/\s+/g, '_').toLowerCase()}_${current.BeatmapID}`;
            playlist_card = `card_${currentPlaylistName.replace(/\s+/g, '_').toLowerCase()}_${current.BeatmapID}`;
            

            var DOM_playlist_icon = document.getElementById(playlist_icon);
            var DOM_playlist_card = document.getElementById(playlist_card);
            if(DOM_playlist_card) DOM_playlist_card.className = "play_list_card playlist_playing";

            if (state == undefined) {
                state = (audio.playing() ? 'play' : 'pause');
            }

            if(state == 'pause') {
                if (DOM_playlist_icon) DOM_playlist_icon.className = "fas fa-play";
                document.getElementById(`player_playbutton`).className = "fas fa-play";
            }

            if (state == "play") {
                if (DOM_playlist_icon) DOM_playlist_icon.className = "fas fa-pause";
                document.getElementById(`player_playbutton`).className = "fas fa-pause";
            }
        }
    }

    Player.prototype.updateTimer = function() {
        if (!onDrag){
            document.getElementById(`player_currenttime`).textContent = utils.format_seconds(audio.seek());
            if (audio.duration() != 0) {
                document.getElementById(`player_slider`).value = 1000 * audio.seek() / audio.duration();
            }
        }
        document.getElementById(`player_totaltime`).textContent = utils.format_seconds(audio.duration());
    }

    Player.prototype.setRPC = function(state) {
        if(state == "playing") {
            var {BeatmapSetID, artist, title} = current;
            var ed = new Date();
            var endTime = ed.setSeconds(ed.getSeconds() + audio.duration() - audio.seek());
            ipcRenderer.send('updateRPC', ["playing", title, artist, currentPlaylistName, BeatmapSetID, endTime]);
        }
        if (state == "paused") {
            ipcRenderer.send('updateRPC', ["paused"]);
        }
    }

    Player.prototype.preview_changeIcon = function(i, id) {
        var DOM_preview_button = document.getElementById(preview_button);
        // Reset the preview icon to the play icon and assign a new button
        if(i == 0) {
            if (preview_button && DOM_preview_button) DOM_preview_button.className  = "fas fa-play";
            preview_button = id;
        }
        // If user clicks on the pause button or preview ends
        if (i == 1)  {
            if (DOM_preview_button) DOM_preview_button.className  = "fas fa-play";
            preview_button = null;
        }
        // Set icon to pause
        if (i == 2) { 
            if (DOM_preview_button) DOM_preview_button.className  = "fas fa-pause";
        }
    }
}

module.exports = new Player();