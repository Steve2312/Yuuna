const { ipcMain } = require("electron")

class Player {
    #audio
    #audio_volume

    #onDrag

    #btnPaused
    #cardPaused

    #current
    #current_playlist
    #currentPlaylistName

    #windowsPanel

    #preview_audio;
    #preview_src;
    #preview_button;

    #shuffled_playlist
    #on_shuffle

    #on_repeat

    #built
    
    constructor() {
        this.#audio_volume = 0.1;
        this.#currentPlaylistName = 'Library';
        this.#windowsPanel = navigator.mediaSession;
        this.#onDrag = false;
        this.#on_shuffle = false;
        this.#built = false;
    }

    get_current() {
        return this.#current;
    }

    clear_player() {
        console.log("unload");
        this.#audio.unload();
    }

    // Public Methods
    async build() {
        this.#current_playlist = await request_JSON(this.#currentPlaylistName);
        if (this.#current_playlist.length > 0) {
            this.#built = true;
            this.#player(this.#current_playlist[0], this.#currentPlaylistName);
            this.#audio.pause();
            this.#audio.volume(this.#audio_volume);
            document.getElementById(`player_volume_slider`).value = this.#audio.volume() * 100;
            var that = this;
            setTimeout(function () {
                that.#updateAudioData(); 
            },500);
        }

        // Windows Media Session
        this.#windowsPanel.setActionHandler('play', function () {that.#audio.play()});
        this.#windowsPanel.setActionHandler('pause', function () {that.#audio.pause()});
        this.#windowsPanel.setActionHandler('previoustrack', function () {that.backward()});
        this.#windowsPanel.setActionHandler('nexttrack', function () {that.forward()});
    }

    isBuild() {
        return this.#built;
    }
    
    async play_from_playlist(beatmap_id, playlist_name) {
        this.#currentPlaylistName = playlist_name;
        this.#current_playlist = await request_JSON(playlist_name);
        var playlist = this.#on_shuffle ? this.#shuffled_playlist : this.#current_playlist;
        for (var x = 0; x < playlist.length; x++) {
            if (playlist[x].BeatmapID == beatmap_id) {
                this.#player(playlist[x], playlist_name);
            }
        }
        if (this.#on_shuffle) this.#shuffle_playlist();
    }

    backward() {
        var playlist = this.#on_shuffle ? this.#shuffled_playlist : this.#current_playlist;
        for(var i = 0; i < playlist.length; i++) {
            if (playlist[i].BeatmapID == this.#current.BeatmapID) {
                if (this.#audio.seek() < 0.5 && !i == 0) {
                    this.#player(playlist[i-1], this.#currentPlaylistName);
                    this.updatePlaylistIcon('end');
                } else {
                    this.#audio.seek(0);
                }
                break;
          }
        }
    }

    forward() {
        var playlist = this.#on_shuffle ? this.#shuffled_playlist : this.#current_playlist;
        for(var i = 0; i < playlist.length; i++) {
            if (playlist[i].BeatmapID == this.#current.BeatmapID) {
                var id = (i + 1) % playlist.length;
                if (id == 0) {
                    if (this.#on_repeat) {
                        this.#initPlayer(this.#current_playlist[id]);
                        this.play();
                    } else {
                        this.#initPlayer(this.#current_playlist[id]);
                        if (this.#on_shuffle) this.#shuffle_playlist();
                    }
                } else {
                    this.#player(playlist[id], this.#currentPlaylistName);
                }
                break;
            }
        }
        this.updatePlaylistIcon('end');
    }

    // if any changes to the playlist where made
    async updatePlaylist() {
        console.time("Time to update the playlist: ");
        if (this.#current_playlist) this.#current_playlist = await request_JSON(this.#currentPlaylistName);
        if (this.#on_shuffle) {
            // Update the shuffle playlist for
            // 1. Removed songs in the main_playlists
            // 2. Update shuffle playlists so that it contains the new songs

            // 1. Removed songs in the main_playlists
            for (var y=0;y<this.#shuffled_playlist.length;y++) {
                var exists = false;
                for (var x=0;x<this.#current_playlist.length;x++) {
                    // This means that the song in the shuffle playlists exists in the current_playlists
                    if (this.#shuffled_playlist[y].BeatmapID == this.#current_playlist[x].BeatmapID) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) this.#shuffled_playlist.splice(y, 1);
            }
            // 2. Update shuffle playlists so that it contains the new songs
            for (var x=0;x<this.#current_playlist.length;x++) {
                var exists = false;
                for (var y=0;y<this.#shuffled_playlist.length;y++) {
                    // This means that the song in the current_playlists playlists exists in the shuffle
                    if (this.#current_playlist[x].BeatmapID == this.#shuffled_playlist[y].BeatmapID) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) this.#shuffled_playlist.push(this.#current_playlist[x]);
            }
        }
        var that = this;
        if (LOADED_PAGE == "playlist_page") {
            setTimeout(function () {
                playlist_page.Libraryload_Playlist(that.#currentPlaylistName);
            }, 500);
        }
        console.timeEnd("Time to update the playlist: ");
    }

    shuffle() {
        this.#on_shuffle = this.#on_shuffle ? false : true;
        this.#shuffled_playlist = [];
        if (this.#on_shuffle) {
            document.getElementById("shuffle").classList.add("player_controls_button_extra_active");
            this.#shuffle_playlist();
        }
        else {
            document.getElementById("shuffle").classList.remove("player_controls_button_extra_active");
        }
    }

    repeat() {
        this.#on_repeat = this.#on_repeat ? false : true;
        if (this.#on_repeat) {
            document.getElementById("repeat").classList.add("player_controls_button_extra_active");
        }
        else {
            document.getElementById("repeat").classList.remove("player_controls_button_extra_active");
        }
    }

    #shuffle_playlist() {
        // create a randomized playlist
        this.#shuffled_playlist = Array.from(this.#current_playlist).sort(() => Math.random() - 0.5);

        // for(let i = this.#shuffled_playlist.length - 1; i > 0; i--){
        //     const j = Math.floor(Math.random() * i)
        //     const temp = this.#shuffled_playlist[i];
        //     this.#shuffled_playlist[i] = this.#shuffled_playlist[j];
        //     this.#shuffled_playlist[j] = temp;
        // }

        // find index of current playing song and move it to the first index
        for (var i = 0; i < this.#shuffled_playlist.length; i++) {
            if (this.#current.BeatmapID == this.#shuffled_playlist[i].BeatmapID) {
                this.#shuffled_playlist.unshift(this.#shuffled_playlist[i]);
                this.#shuffled_playlist.splice(i+1, 1);
            }
        }
        console.log(this.#shuffled_playlist)
    }

    play() {
        this.#player(this.#current, this.#currentPlaylistName);
    }

    check_drag(value) {
        this.#onDrag = value;
    }

    on_drag() {
        var dragged_time = Math.floor(this.#audio.duration() / 1000 * document.getElementById(`player_slider`).value);
        document.getElementById(`player_currenttime`).textContent = utils.format_seconds(dragged_time).toString();
    }

    change_time() {
        var wasPlaying = this.#audio.playing();
        var time = Math.floor(this.#audio.duration() / 1000 * document.getElementById(`player_slider`).value);
        this.#audio.seek(time);
        document.getElementById(`player_slider`).value = 1000 * time / this.#audio.duration();
        document.getElementById(`player_currenttime`).textContent = utils.format_seconds(time);
        if (wasPlaying) {
            this.#setRPC('playing');
        }
    }

    change_volume() {
        this.#audio_volume = document.getElementById(`player_volume_slider`).value / 100;
        if (this.#audio) this.#audio.volume(this.#audio_volume);
        if (this.#preview_audio) this.#preview_audio.volume(this.#audio_volume);
    }

    play_preview(index, page) {
        var beatmap = search_page.get_search_results()[page][index]["id"];
        var id = `play_searched_data_from_the_search_page_${beatmap}`;
        var link = `https://b.ppy.sh/preview/${beatmap}.mp3`;
        this.#preview_changeIcon(0, id);
        if (this.#preview_src == link) {
            this.#preview_audio.unload();
            this.#preview_src = null;
            this.#preview_changeIcon(1, id);
        } else {
            if(this.#preview_audio) this.#preview_audio.unload();
            if (this.#audio && this.#audio.playing()) this.#audio.pause();
            if (this.#preview_audio) this.#preview_audio.off();
            this.#preview_src = link;
            this.#preview_audio = new Howl({
                src: [this.#preview_src],
                html5: true,
                format: ['mp3'],
                autoplay: true,
                volume: this.#audio_volume
            });
            var that = this;
            this.#preview_changeIcon(2, id);
            this.#preview_audio.on("end", function () {
                that.#preview_audio.unload();
                that.#preview_src = null;
                that.#preview_changeIcon(1, id);
            });
        }
    }

    // Private Methods
    #player(data, playlist) {
        if (this.#current && this.#current.BeatmapID == data.BeatmapID && this.#currentPlaylistName == playlist) {
            if (this.#audio)
                if (this.#audio.playing()) {
                    this.#audio.pause();
                } else this.#audio.play();
        } else {
            this.#initPlayer(data);
            this.updatePlaylistIcon("end");
            this.#audio.play();
        }
    }

    #createSongPath(BeatmapSetID, BeatmapID, file) {
        return path.join(appDataSongs, BeatmapSetID, BeatmapID, file);
    }

    #initPlayer(data) {
        this.#current = data;
        if (this.#audio) {
            this.clear_player();
            this.#audio.pause();
            this.#audio.off();
        }
        this.#audio = new Howl({
            src: [this.#createSongPath(data.BeatmapSetID, data.BeatmapID, data.file)],
            html5: true,
            volume: this.#audio_volume
        });
        this.#updateAudioData();
        var that = this;
        setTimeout(function () {
            that.#updateAudioData();
        });
        setInterval(function () {
            that.#updateTimer();
        }, 500);
        // Howler Events
        this.#audio.on("end", function () {
            that.forward();
            that.updatePlaylistIcon('end');
        });

        this.#audio.on("pause", function () {
            that.updatePlaylistIcon('pause');
            that.#setRPC('paused');
        });

        this.#audio.on("play", function () {
            that.updatePlaylistIcon('play');
            if (that.#preview_audio) that.#preview_audio.unload();
            if (that.#preview_button) that.#preview_changeIcon(1, null);
            that.#preview_src = null;
            that.#setRPC('playing');
        });
    }

    async #updateAudioData() {
        var {BeatmapSetID, BeatmapID, artist, title} = this.#current;
        this.#setRPC('paused');
        var coverPath = path.join(appDataSongs, BeatmapSetID, BeatmapID, "cover.jpg").replace(/\\/g, '/');
        document.getElementById(`player_cover`).style = `background-image: url("${coverPath}");`;
        document.getElementById(`player_artist`).textContent = artist;
        document.getElementById(`player_title`).textContent = title;
        var that = this;
        this.#getDataUrl(coverPath).then(function (cover) {
            that.#windowsPanel.metadata = new MediaMetadata({
                title: title,
                artist: artist,
                artwork: [
                    { src: cover, sizes: '512x512', type: 'image/jpg' }
                  ]
            });
        });
    }

    #getDataUrl(src) {
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
        var newCardButton = `play_${this.#currentPlaylistName.replace(/\s+/g, '_').toLowerCase()}_${this.#current.BeatmapID}`;
        var newCard = `card_${this.#currentPlaylistName.replace(/\s+/g, '_').toLowerCase()}_${this.#current.BeatmapID}`;
        
        if(state == "end") {
            try { document.getElementById(this.#btnPaused).className = "fas fa-play"; } catch(err) {}
            try { document.getElementById(this.#cardPaused).className = "play_list_card"; } catch(err) {}
        }

        this.#btnPaused = newCardButton;
        this.#cardPaused = newCard;
        try { document.getElementById(this.#cardPaused).className = "play_list_card playlist_playing"; } catch(err) {}

        if (state == undefined) {
            state = (this.#audio.playing() ? 'play' : 'pause');
        }

        if(state == 'pause') {
            try { document.getElementById(this.#btnPaused).className = "fas fa-play"; } catch(err) {}
            document.getElementById(`player_playbutton`).className = "fas fa-play";
        }

        if (state == "play") {
            try { document.getElementById(this.#btnPaused).className = "fas fa-pause"; } catch(err) {}
            document.getElementById(`player_playbutton`).className = "fas fa-pause";
        }
    }

    #updateTimer() {
        if (!this.#onDrag){
            document.getElementById(`player_currenttime`).textContent = utils.format_seconds(this.#audio.seek());
            if (this.#audio.duration() !== 0) {
                document.getElementById(`player_slider`).value = 1000 * this.#audio.seek() / this.#audio.duration();
            }
        }
        document.getElementById(`player_totaltime`).textContent = utils.format_seconds(this.#audio.duration());
    }

    // Find Index
    #setRPC(x) {
        var {BeatmapSetID, artist, title} = this.#current;
        if(x == "playing") {
            var ed = new Date();
            var endTime = ed.setSeconds(ed.getSeconds() + this.#audio.duration() - this.#audio.seek());
            ipcRenderer.send('updateRPC', ["playing", title, artist, this.#currentPlaylistName, BeatmapSetID, endTime]);
        }
        if (x == "paused") {
            ipcRenderer.send('updateRPC', ["paused", title, artist, this.#currentPlaylistName, BeatmapSetID]);
        }
    }   

    #preview_changeIcon(i, id) {
        // 0 = Reset old button and assign new button
        if(i == 0) {
            if (this.#preview_button) try { document.getElementById(this.#preview_button).className  = "fas fa-play"; } catch {};
            this.#preview_button = id;
        }
        // If user clicks on the pause button or preview ends
        if (i == 1)  {
            try { document.getElementById(this.#preview_button).className  = "fas fa-play"; } catch {};
            this.#preview_button = null;
        }
        // Set icon to pause
        if (i == 2) try { document.getElementById(this.#preview_button).className  = "fas fa-pause"; } catch {};
    } 
}

module.exports = new Player();