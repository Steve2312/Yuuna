const { ipcMain } = require("electron");

class Player {    
    constructor() {
        this.audio_volume = 0.1;
        this.currentPlaylistName = 'Library';
        this.windowsPanel = navigator.mediaSession;
        this.onDrag = false;
        this.on_shuffle = false;
        this.built = false;
    }

    clear_player() {
        this.audio.unload();
    }

    // Public Methods
    async build() {
        this.current_playlist = await request_JSON(this.currentPlaylistName);
        if (this.current_playlist.length > 0) {
            this.built = true;
            this.player(this.current_playlist[0], this.currentPlaylistName);
            this.audio.pause();
            this.audio.volume(this.audio_volume);
            document.getElementById(`player_volume_slider`).value = this.audio.volume() * 100;
            setTimeout(() => this.updateAudioData(),500);
        }
        var that = this;
        // Windows Media Session
        this.windowsPanel.setActionHandler('play', function () {that.audio.play()});
        this.windowsPanel.setActionHandler('pause', function () {that.audio.pause()});
        this.windowsPanel.setActionHandler('previoustrack', function () {that.backward()});
        this.windowsPanel.setActionHandler('nexttrack', function () {that.forward()});
    }
    
    async play_from_playlist(beatmap_id, playlist_name) {
        this.currentPlaylistName = playlist_name;
        this.current_playlist = await request_JSON(playlist_name);
        var playlist = this.on_shuffle ? this.shuffled_playlist : this.current_playlist;
        for (var x = 0; x < playlist.length; x++) {
            if (playlist[x].BeatmapID == beatmap_id) {
                this.player(playlist[x], playlist_name);
            }
        }
        if (this.on_shuffle) {
            this.shuffle_playlist();
        }
    }

    backward() {
        var playlist = this.on_shuffle ? this.shuffled_playlist : this.current_playlist;
        for(var i = 0; i < playlist.length; i++) {
            if (playlist[i].BeatmapID == this.current.BeatmapID) {
                if (this.audio.seek() < 0.5 && !i == 0) {
                    this.player(playlist[i-1], this.currentPlaylistName);
                    this.updatePlaylistIcon('end');
                } else {
                    this.audio.seek(0);
                }
                break;
            }
        }
    }

    forward() {
        var playlist = this.on_shuffle ? this.shuffled_playlist : this.current_playlist;
        for(var i = 0; i < playlist.length; i++) {
            if (playlist[i].BeatmapID == this.current.BeatmapID) {
                var id = (i + 1) % playlist.length;
                if (id == 0) {
                    if (this.on_repeat) {
                        this.initPlayer(this.current_playlist[id]);
                        this.play();
                    } else {
                        this.initPlayer(this.current_playlist[id]);
                        if (this.on_shuffle) {
                            this.shuffle_playlist();
                        }
                    }
                } else {
                    this.player(playlist[id], this.currentPlaylistName);
                }
                break;
            }
        }
        this.updatePlaylistIcon('end');
    }

    // if any changes to the playlist where made
    async updatePlaylist() {
        if (this.current_playlist) {
            this.current_playlist = await request_JSON(this.currentPlaylistName);
        }
        if (this.on_shuffle) {
            // Update the shuffle playlist for
            // 1. Removed songs in the main_playlists
            // 2. Update shuffle playlists so that it contains the new songs

            // 1. Removed songs in the main_playlists
            console.time("Time to update the playlist(forloop): ");
            for (var y=0;y<this.shuffled_playlist.length;y++) {
                var exists = false;
                for (var x=0;x<this.current_playlist.length;x++) {
                    // This means that the song in the shuffle playlists exists in the current_playlists
                    if (this.shuffled_playlist[y].BeatmapID == this.current_playlist[x].BeatmapID) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) {
                    this.shuffled_playlist.splice(y, 1);
                }
            }
            // 2. Update shuffle playlists so that it contains the new songs
            for (var x=0;x<this.current_playlist.length;x++) {
                var exists = false;
                for (var y=0;y<this.shuffled_playlist.length;y++) {
                    // This means that the song in the current_playlists playlists exists in the shuffle
                    if (this.current_playlist[x].BeatmapID == this.shuffled_playlist[y].BeatmapID) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) {
                    this.shuffled_playlist.push(this.current_playlist[x]);
                }
            }
            console.timeEnd("Time to update the playlist(forloop): ");

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
        var that = this;
        if (LOADED_PAGE == "playlist_page") {
            setTimeout(function () {
                playlist_page.Libraryload_Playlist(that.currentPlaylistName);
            }, 500);
        }
    }

    shuffle() {
        this.on_shuffle = this.on_shuffle ? false : true;
        this.shuffled_playlist = [];
        if (this.on_shuffle) {
            document.getElementById("shuffle").classList.add("player_controls_button_extra_active");
            this.shuffle_playlist();
        }
        else {
            document.getElementById("shuffle").classList.remove("player_controls_button_extra_active");
        }
    }

    repeat() {
        this.on_repeat = this.on_repeat ? false : true;
        var DOM_repeat = document.getElementById("repeat");
        if (this.on_repeat) {
            DOM_repeat.classList.add("player_controls_button_extra_active");
        }
        else {
            DOM_repeat.classList.remove("player_controls_button_extra_active");
        }
    }

    shuffle_playlist() {
        // create a randomized playlist
        this.shuffled_playlist = Array.from(this.current_playlist).sort(() => Math.random() - 0.5);

        // find index of current playing song and move it to the first index
        for (var i = 0; i < this.shuffled_playlist.length; i++) {
            if (this.current.BeatmapID == this.shuffled_playlist[i].BeatmapID) {
                this.shuffled_playlist.unshift(this.shuffled_playlist[i]);
                this.shuffled_playlist.splice(i+1, 1);
            }
        }
    }

    play() {
        this.player(this.current, this.currentPlaylistName);
    }

    check_drag(value) {
        this.onDrag = value;
    }

    on_drag() {
        var dragged_time = Math.floor(this.audio.duration() / 1000 * document.getElementById(`player_slider`).value);
        document.getElementById(`player_currenttime`).textContent = utils.format_seconds(dragged_time).toString();
    }

    change_time() {
        var wasPlaying = this.audio.playing();
        var time = Math.floor(this.audio.duration() / 1000 * document.getElementById(`player_slider`).value);
        this.audio.seek(time);
        document.getElementById(`player_slider`).value = 1000 * time / this.audio.duration();
        document.getElementById(`player_currenttime`).textContent = utils.format_seconds(time);
        if (wasPlaying) {
            this.setRPC('playing');
        }
    }

    change_volume() {
        this.audio_volume = document.getElementById(`player_volume_slider`).value / 100;
        if (this.audio) {
            this.audio.volume(this.audio_volume);
        }
        if (this.preview_audio) {
            this.preview_audio.volume(this.audio_volume);
        }
    }

    play_preview(index, page) {
        var beatmap = search_page.get_search_results()[page][index]["id"];
        var id = `play_preview_${beatmap}`;
        var link = `https://b.ppy.sh/preview/${beatmap}.mp3`;
        this.preview_changeIcon(0, id);
        if (this.preview_src == link) {
            this.preview_audio.unload();
            this.preview_src = null;
            this.preview_changeIcon(1, id);
        } else {
            if(this.preview_audio) {
                this.preview_audio.unload();
            }
            if (this.audio && this.audio.playing()) {
                this.audio.pause();
            }
            if (this.preview_audio) {
                this.preview_audio.off();
            }
            this.preview_src = link;
            this.preview_audio = new Howl({
                src: [this.preview_src],
                html5: true,
                format: ['mp3'],
                autoplay: true,
                volume: this.audio_volume
            });
            var that = this;
            this.preview_changeIcon(2, id);
            this.preview_audio.on("end", function () {
                that.preview_audio.unload();
                that.preview_src = null;
                that.preview_changeIcon(1, id);
            });
        }
    }

    player(data, playlist) {
        // This will cause the player to be paused
        if (this.current && this.current.BeatmapID == data.BeatmapID && this.currentPlaylistName == playlist) {
            if (this.audio) {
                if (this.audio.playing()) {
                    this.audio.pause();
                } else this.audio.play();
            }
        } else {
            this.initPlayer(data);
            this.updatePlaylistIcon("end");
            this.audio.play();
        }
    }

    createSongPath(BeatmapSetID, BeatmapID, file) {
        return path.join(appDataSongs, BeatmapSetID, BeatmapID, file);
    }

    initPlayer(data) {
        this.current = data;
        if (this.audio) {
            this.clear_player();
            this.audio.pause();
            this.audio.off();
        }
        this.audio = new Howl({
            src: [this.createSongPath(data.BeatmapSetID, data.BeatmapID, data.file)],
            html5: true,
            volume: this.audio_volume
        });
        this.updateAudioData();
        var that = this;
        setTimeout(function () {
            that.updateAudioData();
        });
        setInterval(function () {
            that.updateTimer();
        }, 500);
        // Howler Events
        this.audio.on("end", function () {
            that.forward();
            that.updatePlaylistIcon('end');
        });

        this.audio.on("pause", function () {
            that.updatePlaylistIcon('pause');
            that.setRPC('paused');
        });

        this.audio.on("play", function () {
            that.updatePlaylistIcon('play');
            if (that.preview_audio) {
                that.preview_audio.unload();
            }
            if (that.preview_button) {
                that.preview_changeIcon(1, null);
            }
            that.preview_src = null;
            that.setRPC('playing');
        });
    }

    async updateAudioData() {
        var {BeatmapSetID, BeatmapID, artist, title} = this.current;
        this.setRPC('paused');
        var coverPath = path.join(appDataSongs, BeatmapSetID, BeatmapID, "cover.jpg").replace(/\\/g, '/');
        document.getElementById(`player_cover`).style = `background-image: url("${coverPath}");`;
        document.getElementById(`player_artist`).textContent = artist;
        document.getElementById(`player_title`).textContent = title;
        var that = this;
        this.getDataUrl(coverPath).then(function (cover) {
            that.windowsPanel.metadata = new MediaMetadata({
                title: title,
                artist: artist,
                artwork: [
                    { src: cover, sizes: '512x512', type: 'image/jpg' }
                  ]
            });
        });
    }

    getDataUrl(src) {
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

    // current beatmap
    updatePlaylistIcon(state) {
        if(state == "end") {
            var DOM_playlist_icon = document.getElementById(this.playlist_icon);
            var DOM_playlist_card = document.getElementById(this.playlist_card);

            if (DOM_playlist_icon) DOM_playlist_icon.className = "fas fa-play";
            if (DOM_playlist_card) DOM_playlist_card.className = "play_list_card";
        }

        this.playlist_icon = `play_${this.currentPlaylistName.replace(/\s+/g, '_').toLowerCase()}_${this.current.BeatmapID}`;
        this.playlist_card = `card_${this.currentPlaylistName.replace(/\s+/g, '_').toLowerCase()}_${this.current.BeatmapID}`;

        var DOM_playlist_icon = document.getElementById(this.playlist_icon);
        var DOM_playlist_card = document.getElementById(this.playlist_card);
        if(DOM_playlist_card) DOM_playlist_card.className = "play_list_card playlist_playing";

        if (state == undefined) {
            state = (this.audio.playing() ? 'play' : 'pause');
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

    updateTimer() {
        if (!this.onDrag){
            document.getElementById(`player_currenttime`).textContent = utils.format_seconds(this.audio.seek());
            if (this.audio.duration() != 0) {
                document.getElementById(`player_slider`).value = 1000 * this.audio.seek() / this.audio.duration();
            }
        }
        document.getElementById(`player_totaltime`).textContent = utils.format_seconds(this.audio.duration());
    }

    setRPC(state) {
        var {BeatmapSetID, artist, title} = this.current;
        if(state == "playing") {
            var ed = new Date();
            var endTime = ed.setSeconds(ed.getSeconds() + this.audio.duration() - this.audio.seek());
            ipcRenderer.send('updateRPC', ["playing", title, artist, this.currentPlaylistName, BeatmapSetID, endTime]);
        }
        if (state == "paused") {
            ipcRenderer.send('updateRPC', ["paused"]);
        }
    }   

    preview_changeIcon(i, id) {
        var DOM_preview_button = document.getElementById(this.preview_button);
        // Reset the preview icon to the play icon and assign a new button
        if(i == 0) {
            if (this.preview_button && DOM_preview_button) DOM_preview_button.className  = "fas fa-play";
            this.preview_button = id;
        }
        // If user clicks on the pause button or preview ends
        if (i == 1)  {
            if (DOM_preview_button) DOM_preview_button.className  = "fas fa-play";
            this.preview_button = null;
        }
        // Set icon to pause
        if (i == 2) { 
            if (DOM_preview_button) DOM_preview_button.className  = "fas fa-pause";
        }
    }
}

module.exports = new Player();