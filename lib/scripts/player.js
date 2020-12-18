class Player {
    #audio
    #audio_volume
    #btnPaused
    #cardPaused

    #current_src
    #currentId

    #current_playlist
    #currentPlaylistName;

    #onDrag

    #windowsPanel

    #preview_audio;
    #preview_src;
    #preview_button;
    constructor() {
        this.#currentId = 0;
        this.#audio_volume = 0.1;
        this.#currentPlaylistName = 'All songs';
        this.#onDrag = false;
        this.#windowsPanel = navigator.mediaSession;
    }
    // Public Methods
    async build() {
        var that = this;
        await this.play_from_playlist(0, 'All songs');
        this.#audio.pause();
        this.#audio.volume(this.#audio_volume);
        document.getElementById(`player_volume_slider`).value = this.#audio.volume() * 100;
        setTimeout( function () {
            that.#updateAudioData(); 
        }, 100);

        // Windows Media Session
        this.#windowsPanel.setActionHandler('play', function () {that.#audio.play()});
        this.#windowsPanel.setActionHandler('pause', function () {that.#audio.pause()});
        this.#windowsPanel.setActionHandler('previoustrack', function () {that.backward()});
        this.#windowsPanel.setActionHandler('nexttrack', function () {that.forward()});
    }
    
    async play_from_playlist(n, playlist) {
        this.#current_playlist = await request_JSON(playlist);
        this.#currentPlaylistName = playlist;
        this.#currentId = n;
        this.#player(this.#currentId);
    }

    backward() {
        if (this.#audio.seek() < 0.5 && !this.#currentId == 0) {
            this.#currentId = this.#currentId - 1;
            this.#player(this.#currentId);
            this.#updatePlaylistIcon('end');
        } else {
            this.#audio.seek(0);
        }
    }

    forward() {
        this.#currentId = (this.#currentId + 1) % Object.keys(this.#current_playlist).length;
        if(this.#currentId == 0) {
            this.#initPlayer(this.#createSongPath(this.#currentId));
        } else {
            this.#player(this.#currentId);
        }
        this.#updatePlaylistIcon('end');
    }

    play() {
        this.#player(this.#currentId);
    }

    check_drag = (value) => {
        this.#onDrag = value;
    }

    on_drag() {
        var dragged_time = Math.floor(this.#audio.duration() / 1000 * document.getElementById(`player_slider`).value);
        document.getElementById(`player_currenttime`).textContent = utils.format_seconds(dragged_time).toString();
    }

    change_time() {
        var time = Math.floor(this.#audio.duration() / 1000 * document.getElementById(`player_slider`).value);
        this.#audio.seek(time);
        document.getElementById(`player_slider`).value = 1000 * time / this.#audio.duration();
        document.getElementById(`player_currenttime`).textContent = utils.format_seconds(time);
    }

    change_volume() {
        this.#audio_volume = document.getElementById(`player_volume_slider`).value / 100;
        this.#audio.volume(this.#audio_volume);
        if (this.#preview_audio) this.#preview_audio.volume(this.#audio_volume);
    }

    async recalculateId() {
        if (this.#current_playlist) {
            var newPlaylist = await request_JSON(this.#currentPlaylistName);
            var offset = Object.keys(newPlaylist).length - Object.keys(this.#current_playlist).length;
            if (offset > 0) {
                this.#currentId = this.#currentId + offset;
                this.#current_playlist = newPlaylist;
            }
        }
    }

    play_preview(index, page) {
        var beatmap = search_results[page][index]["id"];
        var id = `play_searched_data_from_the_search_page_${beatmap}`;
        var link = `https://b.ppy.sh/preview/${beatmap}.mp3`
        this.#preview_changeIcon(0, id);
        if (this.#preview_src == link) {
            this.#preview_audio.unload();
            this.#preview_src = null;
            this.#preview_changeIcon(1, id);
        } else {
            if(this.#preview_audio) this.#preview_audio.unload();
            if (this.#audio.playing()) this.#audio.pause();
            if (this.#preview_audio) this.#preview_audio.off();
            this.#preview_src = link;
            this.#preview_audio = new Howl({
                src: [this.#preview_src],
                html5: true,
                format: ['mp3'],
                autoplay: true,
                volume: this.#audio_volume
            });
            this.#preview_changeIcon(2, id);
            this.#preview_audio.on("end", function () {
                this.#preview_audio.unload();
            });
        }
    }

    // Private Methods
    #player(id) {
        var src = this.#createSongPath(id);
        if (this.#current_src == src) {
            if (this.#audio)
                if (this.#audio.playing()) {
                    this.#audio.pause();
                } else this.#audio.play();
        } else {
            this.#initPlayer(src);
            this.#updatePlaylistIcon("end");
            this.#audio.play();
        }
    }

    #createSongPath = (id) => {
        var {BeatmapSetID, file} = this.#current_playlist[id];
        return path.join(__dirname, "../songs", BeatmapSetID, file);
    }

    #initPlayer = (src) => {
        this.#current_src = src;
        if (this.#audio) {
            this.#audio.pause();
            this.#audio.off();
        }
        this.#audio = new Howl({
            src: [this.#current_src],
            html5: true,
            volume: this.#audio_volume
        });
        this.#updateAudioData();
        var that = this;
        setInterval(function () {
            that.#updateTimer();
        }, 500);
        // Howler Events
        this.#audio.on("end", function () {
            that.forward();
            that.#updatePlaylistIcon('end');
        });

        this.#audio.on("pause", function () {
            that.#updatePlaylistIcon('pause');
        });

        this.#audio.on("play", function () {
            that.#updatePlaylistIcon('play');
            if (that.#preview_audio) that.#preview_audio.unload();
            if (that.#preview_button) that.#preview_changeIcon(1);
        });
    }

    #updateAudioData() {
        var {BeatmapSetID, artist, title} = this.#current_playlist[this.#currentId];
        var coverPath = path.join(__dirname, "../songs", BeatmapSetID, "cover.jpg").replace(/\\/g, '/');
        var cover = this.#getDataUrl(coverPath);
        document.getElementById(`player_cover`).style = `background-image: url("${coverPath}");`;
        document.getElementById(`player_artist`).textContent = artist;
        document.getElementById(`player_title`).textContent = title;
        this.#windowsPanel.metadata = new MediaMetadata({
            title: title,
            artist: artist,
            artwork: [
                { src: cover, sizes: '512x512', type: 'image/png' }
              ]
        });
    }

    #getDataUrl(src) {
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
        return canvas.toDataURL('image/jpeg');
    }

    #updatePlaylistIcon(state) {
        var newCardButton = `play_${this.#currentPlaylistName.replace(/\s+/g, '_').toLowerCase()}_${this.#currentId}`;
        var newCard = `card_${this.#currentPlaylistName.replace(/\s+/g, '_').toLowerCase()}_${this.#currentId}`;
        
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

    #preview_changeIcon(i, id) {
        // 0 = Reset old button and assign new button
        if(i == 0) {
            if (this.#preview_button) this.#preview_button.className  = "fas fa-play";
            this.#preview_button = document.getElementById(id);
        }
        // If user clicks on the pause button
        if (i == 1)  {
            this.#preview_button.className  = "fas fa-play";
            this.#preview_button = null;
        }
        // Set icon to pause
        if (i == 2) this.#preview_button.className  = "fas fa-pause";
    } 
}

module.exports = Player