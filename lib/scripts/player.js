// Global Variables
{
    // Local Variables
    let audio;
    let preview_audio;

    let buttonPaused;
    let cardPaused;
    let currentSongPath;
    let currentId = 0;
    let currentPlaylist;
    let currentPlaylistName = "All songs";
    let onDrag = false;
    let audioVolume = 0.1;
    let windowsPanel = navigator.mediaSession;


    // On start of the program load the latest songs from all songs playlist.
    window.onload = async function() {
        await play_from_playlist(0, "All songs");
            audio.pause();
            audio.volume(audioVolume);
            document.getElementById(`player_volume_slider`).value = audio.volume() * 100;

        // Cover image not shows correctly on app start up 
        // So updating the metadata forces it to redraw the cover image
        setTimeout(function () {
            updateAudioData();
        }, 100);


    };

    windowsPanel.setActionHandler('play', function() { audio.play() });
    windowsPanel.setActionHandler('pause', function() { audio.pause() });
    windowsPanel.setActionHandler('previoustrack', function() { player_backward(); });
    windowsPanel.setActionHandler('nexttrack', function() { player_forward(); });
    
    // Local Functions
    let player = (id) => {
        var songPath = createSongPath(id);
        // Check if song is the same so when u click it it pauses or plays
        if (currentSongPath == songPath) {
            if (audio.playing()) {
                audio.pause();
            } else {
                audio.play();
            }
        } else {
            initPlayer(songPath);
            updatePlaylistIcon("end");
            audio.play();
        }
    }

    let createSongPath = (id) => {
        return path.join(__dirname, "songs", currentPlaylist[id]["BeatmapSetID"], currentPlaylist[id]["file"]);
    }

    let initPlayer = (songPath) => {
        currentSongPath = songPath;
        if(audio) audio.pause();
        if(audio) audio.off();
        audio = new Howl({
            src: [songPath],
            html5: true,
            volume: audioVolume
        });
        updateAudioData();
        setInterval(function () {
            updateTimer();
        }, 500);

        // Howler Events
        audio.on("end", function () {
            player_forward();
            updatePlaylistIcon('end');
        });

        audio.on("pause", function () {
            updatePlaylistIcon('pause');
        });

        audio.on("play", function () {
            updatePlaylistIcon('play');
        });
    }

    let updateTimer = () => {
        if (!onDrag){
            document.getElementById(`player_current_time`).textContent = format_seconds(audio.seek());
            if (audio.duration() !== 0) {
                document.getElementById(`player_slider`).value = 1000 * audio.seek() / audio.duration();
            }
        }
        document.getElementById(`player_total_time`).textContent = format_seconds(audio.duration());
    }

    let updateAudioData = async () => {
        var coverPath = path.join(__dirname, "songs", currentPlaylist[currentId]["BeatmapSetID"], "cover.jpg").replace(/\\/g, '/');
        document.getElementById(`player_cover`).style = `background-image: url("${coverPath}");`;
        document.getElementById(`player_artist_name`).textContent = currentPlaylist[currentId]['artist'];
        document.getElementById(`player_title_name`).textContent = currentPlaylist[currentId]['title'];
        var cover = getDataUrl(coverPath);
        windowsPanel.metadata = new MediaMetadata({
            title: currentPlaylist[currentId]['title'],
            artist: currentPlaylist[currentId]['artist'],
            artwork: [
                { src: cover, sizes: '512x512', type: 'image/png' }
              ]
        });
    }

    let getDataUrl = (src) => {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        let img = document.createElement('IMG');
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

    // Global functions
    var play_from_playlist = async (n, playlist) => {
        currentPlaylist = await request_JSON(playlist);
        currentPlaylistName = playlist;
        currentId = n;
        player(currentId);
    }

    var player_play = () => {
        player(currentId);
    }

    var check_drag = (value) => {
        onDrag = value;
    }

    var on_drag = () => {
        var dragged_time = Math.floor(audio.duration() / 1000 * document.getElementById(`player_slider`).value);
        document.getElementById(`player_current_time`).textContent = format_seconds(dragged_time);
    }

    var change_time = () => {
        time = Math.floor(audio.duration() / 1000 * document.getElementById(`player_slider`).value);
        audio.seek(time);
        document.getElementById(`player_slider`).value = 1000 * time / audio.duration();
        document.getElementById(`player_current_time`).textContent = format_seconds(time);
    }

    var change_volume = () => {
        audioVolume = document.getElementById(`player_volume_slider`).value / 100;
        console.log(audioVolume)
        audio.volume(audioVolume);
        if (preview_audio) preview_audio.volume(audioVolume);
    }

    var player_backward = () => {
        if (audio.seek() < 0.5 && !currentId == 0) {
            currentId = currentId - 1;
            player(currentId);
            updatePlaylistIcon('end');
        } else {
            audio.seek(0);
        }
    }

    var player_forward = () => {
        currentId = (currentId + 1) % Object.keys(currentPlaylist).length;
        if(currentId == 0) {
            initPlayer(createSongPath(currentId));
        } else {
            player(currentId);
        }
        updatePlaylistIcon('end');
    }

    var recalculateId = async () => {
        if (currentPlaylist) {
            var newPlaylist = await request_JSON(currentPlaylistName);
            var offset = Object.keys(newPlaylist).length - Object.keys(currentPlaylist).length;
            if (offset > 0) {
                currentId = currentId + offset;
                currentPlaylist = newPlaylist;
            }
        }
    }

    var updatePlaylistIcon = (state) => {
        var newCardButton = `play_${currentPlaylistName.replace(/\s+/g, '_').toLowerCase()}_${currentId}`;
        var newCard = `card_${currentPlaylistName.replace(/\s+/g, '_').toLowerCase()}_${currentId}`;
        
        if(state == "end") {
            try { document.getElementById(buttonPaused).className = "fas fa-play"; } catch(err) {}
            try { document.getElementById(cardPaused).className = "play_list_card"; } catch(err) {}
        }

        buttonPaused = newCardButton;
        cardPaused = newCard;
        try { document.getElementById(cardPaused).className = "play_list_card playlist_playing"; } catch(err) {}

        if (state == undefined) {
            state = (audio.playing() ? 'play' : 'pause');
        }

        if(state == 'pause') {
            try { document.getElementById(buttonPaused).className = "fas fa-play"; } catch(err) {}
            document.getElementById(`player_playbutton`).className = "fas fa-play";
        }

        if (state == "play") {
            try { document.getElementById(buttonPaused).className = "fas fa-pause"; } catch(err) {}
            document.getElementById(`player_playbutton`).className = "fas fa-pause";
        }
    }

    // format seconds to HH:MM:SS / MM:SS
    var format_seconds = (totalSeconds) => {
        hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        minutes = Math.floor(totalSeconds / 60);
        seconds = Math.floor(totalSeconds % 60);

        if (hours < 10) { hours = "0" + hours }
        if (minutes < 10) { minutes = "0" + minutes }
        if (seconds < 10) { seconds = "0" + seconds }

        if (isNaN(hours)) { hours = "00" }
        if (isNaN(minutes)) { minutes = "00" }
        if (isNaN(seconds)) { seconds = "00" }

        if (hours == 00){
            return (`${minutes}:${seconds}`)
        } else {
            return (`${hours}:${minutes}:${seconds}`)
        }
    }

    let preview_src;
    var play_preview = (index, page) => {
        if (preview_src == `https://b.ppy.sh/preview/${search_results[page][index]["id"]}.mp3`) {
            if (preview_audio.playing()) preview_audio.pause();
            else preview_audio.play();

            if (audio.playing()) audio.pause();
        } else {
            if(preview_audio) preview_audio.unload();
            preview_src = `https://b.ppy.sh/preview/${search_results[page][index]["id"]}.mp3`

            if (audio.playing()) audio.pause();

            if (preview_audio) preview_audio.off();
            preview_audio = new Howl({
                src: [preview_src],
                html5: true,
                format: ['mp3'],
                autoplay: true,
                volume: audioVolume
            })
            
            preview_audio.on("end", function () {
                preview_audio.unload();
            });
        }
    }
}

