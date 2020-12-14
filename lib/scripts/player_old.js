// Global Variables
{
    // Local Variables
    let audio = document.createElement("AUDIO");
    let buttonPaused;
    let cardPaused;
    let currentSongPath;
    let currentId = 0;
    let currentPlaylist;
    let currentPlaylistName = "All songs";
    let onDrag = false;
    let audioVolume = 0.1;

    let mediaSession = navigator.mediaSession;

    window.onload = async function() {
        audio.volume = audioVolume;
        document.getElementById(`player_volume_slider`).value = audio.volume * 100;
        currentPlaylist = await request_JSON("All songs");
        initPlayer(path.join(__dirname, "songs", currentPlaylist[currentId]["BeatmapSetID"], currentPlaylist[currentId]["file"]));
        mediaSession.metadata = new MediaMetadata({
            title: currentPlaylist[currentId]['title'],
            artist: currentPlaylist[currentId]['artist'],
            artwork: [
                { src: getDataUrl(path.join(__dirname, "songs", currentPlaylist[currentId]["BeatmapSetID"], "cover.jpg").replace(/\\/g, '/')), sizes: '512x512', type: 'image/png' }
              ]
        });
    };

    mediaSession.setActionHandler('play', function() { player(currentId); });
    mediaSession.setActionHandler('pause', function() { player(currentId); });
    mediaSession.setActionHandler('previoustrack', function() { player_backward(); });
    mediaSession.setActionHandler('nexttrack', function() { player_forward(); });

    audio.onended = function() {
        if(currentPlaylist[currentId + 1]) {
            currentId = currentId + 1;
            initPlayer(path.join(__dirname, "songs", currentPlaylist[currentId]["BeatmapSetID"], currentPlaylist[currentId]["file"]));
            audio.play();
        } else {
            currentId = 0;
            initPlayer(path.join(__dirname, "songs", currentPlaylist[currentId]["BeatmapSetID"], currentPlaylist[currentId]["file"]));
            updatePlaylistIcon();
        }
    };

    audio.onpause = function() {
        document.getElementById(`player_playbutton`).className = "fas fa-play";
        navigator.mediaSession.playbackState = "paused";
        updatePlaylistIcon();
    }

    audio.onplaying = function() {
        document.getElementById(`player_playbutton`).className = "fas fa-pause";
        navigator.mediaSession.playbackState = "playing";
        updatePlaylistIcon();
    }

    // Local Functions
    let player = (id) => {
        var songPath = path.join(__dirname, "songs", currentPlaylist[currentId]["BeatmapSetID"], currentPlaylist[currentId]["file"]);
        if (currentSongPath == songPath) {
            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
            }
        } else {
            initPlayer(songPath);
            audio.play();
        }
    }

    let initPlayer = (songPath) => {
        audio.src = songPath;
        currentSongPath = songPath;
        updateAudioData();
        setInterval(function () {
            updateTimer();
        }, 500);
    }

    let updateAudioData = () => {
        var coverPath = path.join(__dirname, "songs", currentPlaylist[currentId]["BeatmapSetID"], "cover.jpg").replace(/\\/g, '/');
        document.getElementById(`player_cover`).style = `background-image: url("${coverPath}");`;
        document.getElementById(`player_artist_name`).textContent = currentPlaylist[currentId]['artist'];
        document.getElementById(`player_title_name`).textContent = currentPlaylist[currentId]['title'];
        if (mediaSession.metadata){
            mediaSession.metadata.title = currentPlaylist[currentId]['title'];
            mediaSession.metadata.artist = currentPlaylist[currentId]['artist'];
            mediaSession.metadata.artwork = [{ src: getDataUrl(coverPath), sizes: '512x512', type: 'image/png' }]
        }
    }
    
    let getDataUrl = (src) => {
        var img = document.createElement("IMG");
        img.src = src;
        // Create canvas
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        // Set width and height
        canvas.width = 128;
        canvas.height = 128;
        // Draw the image
        ctx.fillStyle = 'white';
        ctx.rect(0, 0, 128, 128);
        ctx.fill();
        ctx.drawImage(img, 24, 34);
        return canvas.toDataURL('image/jpeg');
    }


    let updateTimer = () => {
        if (!onDrag){
            document.getElementById(`player_current_time`).textContent = format_seconds(audio.currentTime);
            document.getElementById(`player_slider`).value = 1000 * audio.currentTime / audio.duration;
        }

        document.getElementById(`player_total_time`).textContent = format_seconds(audio.duration);
    }

    // Global functions

    var player_play = () => {
        player(currentId);
    }

    var play_from_playlist = async (n, playlist) => {
        currentPlaylist = await request_JSON(playlist);
        currentPlaylistName = playlist;
        currentId = n;
        player(currentId);
    }

    var check_drag = (value) => {
        onDrag = value;
    }
    
    var on_drag = () => {
        var dragged_time = Math.floor(audio.duration / 1000 * document.getElementById(`player_slider`).value);
        document.getElementById(`player_current_time`).textContent = format_seconds(dragged_time);
    }

    var change_volume = () => {
        volume = document.getElementById(`player_volume_slider`).value / 100;
        audio.volume = volume;
    }

    var change_time = () => {
        time = Math.floor(audio.duration / 1000 * document.getElementById(`player_slider`).value);
        audio.currentTime = time;
        document.getElementById(`player_slider`).value = 1000 * time / audio.duration;
        document.getElementById(`player_current_time`).innerHTML = format_seconds(time);
    }

    var updatePlaylistIcon = () => {
        var card_button = `play_${currentPlaylistName.replace(/\s+/g, '_').toLowerCase()}_${currentId}`;
        var card = `card_${currentPlaylistName.replace(/\s+/g, '_').toLowerCase()}_${currentId}`;

        if (audio.paused && !audio.ended) {
            try { document.getElementById(buttonPaused).className = "fas fa-play"; } catch(err) {}
        } else {
            try { document.getElementById(buttonPaused).className = "fas fa-pause"; } catch(err) {}
        }

        try { document.getElementById(buttonPaused).className = "fas fa-play"; } catch(err) {}
        try { document.getElementById(cardPaused).className = "play_list_card"; } catch(err) {}

        buttonPaused = card_button;
        cardPaused = card;

        if (!audio.paused) {
            try { document.getElementById(buttonPaused).className = "fas fa-pause"; } catch(err) {}
        }

        try { document.getElementById(cardPaused).className = "play_list_card playlist_playing"; } catch(err) {}
    }

    var player_backward = () => {
        if (audio.currentTime < 0.5 && !currentId == 0) {
            currentId = currentId - 1;
            player(currentId);
        } else {
            audio.currentTime = 0;
        }
    }

    var player_forward = () => {
        if(currentId + 1 == Object.keys(currentPlaylist).length) {
            currentId = 0;
            initPlayer(path.join(__dirname, "songs", currentPlaylist[currentId]["BeatmapSetID"], currentPlaylist[currentId]["file"]));
            updatePlaylistIcon();
            document.getElementById(`player_playbutton`).className = "fas fa-play";
        } else {
            currentId = currentId + 1;
            player(currentId);
        }
    }

    var recalculateId = async () => {
        var newPlaylist = await request_JSON(currentPlaylistName);
        var offset = Object.keys(newPlaylist).length - Object.keys(currentPlaylist).length
        currentId = currentId + offset;
        currentPlaylist = newPlaylist;
    }
}

// format seconds to HH:MM:SS / MM:SS
function format_seconds(totalSeconds) {
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