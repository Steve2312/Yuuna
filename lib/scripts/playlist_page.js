var page_Playlist;

// Load specific Playlist
async function Libraryload_Playlist(playlist_name){
    page_Playlist = await request_JSON(playlist_name);
    try { document.getElementsByClassName("list_songs_wrapper")[0].remove() } catch (err) {}
    load(page_Playlist, playlist_name);
}

async function load(page_Playlist, playlist_name){
    page_playlist_length = page_Playlist.length;
    playlistName = encodeURI(playlist_name.toString().toLowerCase())

    try { document.getElementById("playlist_page").append(library(playlist_name, page_playlist_length)); } catch (err) {}
    
    for(i = 0; i < page_playlist_length; i++) {

        title = page_Playlist[i]['title'];
        artist = page_Playlist[i]['artist'];
        file = page_Playlist[i]['file'];
        beatmapset_id = page_Playlist[i]['BeatmapSetID'];
        beatmap_id = page_Playlist[i]['BeatmapID'];

        if (page_Playlist[i]['source'] == ""){
            source = " - ";
        }
        else {
            source = page_Playlist[i]['source'];
        }

        song_folder = path.join(appDataSongs, beatmapset_id, beatmap_id);
        song_path = path.join(song_folder, file);

        duration = utils.format_seconds(page_Playlist[i]['length']);

        created = await data_added(song_folder);

        cover = path.join(song_folder, "cover.jpg");
        cover = cover.replace(/\\/g, '/');
        card = playlist_card(cover, title, artist, duration, source, created, playlist_name, playlist_name, beatmap_id);
        try { document.getElementById("list_playlist_songs").append(card); } catch (err) {}
    }

    // If the library is empty tell them to visit the search page
    if (page_playlist_length == 0) {
        document.getElementById("list_playlist_songs").innerHTML +=  `<div style="margin: 10px 0px;width: 100%; justify-content: center; display:flex;justify-content: center;"><p style="text-align: center; width: 50%; font-family: NotoBold;margin: 0px 10px;font-size: 10px;color: var(--subject_color);"> This playlist contains no songs. Songs can be downloaded via the "Search" page or can be manually added to any playlist by clicking 3 dots and selecting "Add to playlist". </p></div>`;
    }

    try { document.getElementById("list_playlist_songs").style.display = 'flex'; } catch (err) {}
    try { player.updatePlaylistIcon(); } catch (err) {}
}

function data_added(song_folder) {
    return new Promise(resolve => {
        fs.stat(song_folder, (error, stats) => { resolve(stats.birthtime.toLocaleDateString()); });
    });
}

function playlist_card(cover, title, artist, duration, source, created, playlist_name, playlist_name, id) {
    // <div class="card">
    let div_card = document.createElement("DIV");
    div_card.setAttribute("class", "play_list_card");
    div_card.setAttribute("id", `card_${playlist_name.replace(/\s+/g, '_').toLowerCase()}_${id}`);

    // <div class="cover" style="background-image:url('${cover}')"></div>
    let div_cover = document.createElement("DIV");
    div_cover.setAttribute("class", "play_list_cover");
    div_cover.setAttribute("style", `background-image: url("${cover}");`);
    div_card.append(div_cover);

    cm_titles = ['TITLE', 'ARTIST', 'DURATION', 'SOURCE', 'DATE'];
    cm_values = [title, artist, duration, source, created];

    // <div class="card_flex">
    let div_cf = document.createElement("DIV");
    div_cf.setAttribute("class", "play_list_card_flex");

    // Create card meta
    for (x = 0;x< cm_values.length; x++) {
        // <div class="card_metadata">
        let div_cm = document.createElement("DIV");
        div_cm.setAttribute("class", "play_list_card_metadata");

        // <div class="metadata_child">
        let div_mc = document.createElement("DIV");
        div_mc.setAttribute("class", "metadata_child");

        // TITLE
        let p_title = document.createElement("P");
        p_title.setAttribute("class", "title");
        p_title.textContent = cm_titles[x];

        // VALUE
        let p_value = document.createElement("P");
        p_value.setAttribute("class", "value");
        p_value.textContent = cm_values[x];

        div_mc.append(p_title);
        div_mc.append(p_value);
        div_cm.append(div_mc);
        div_cf.append(div_cm);
    }

    div_card.append(div_cf);

    // MORE
    let div_more = document.createElement("DIV");
    div_more.setAttribute("class", "play_list_options");
    div_more.setAttribute("onclick", `show_options(${id})`);

    let p_more = document.createElement("P");
    p_more.setAttribute("class", "options_button");

    let span_more = document.createElement("SPAN");

    let i_more = document.createElement("I");
    i_more.setAttribute("class", `fas fa-ellipsis-h`);

    span_more.append(i_more);
    p_more.append(span_more);
    div_more.append(p_more);
    div_card.append(div_more);

    // PLAY BUTTON
    let p_pb = document.createElement("P");
    p_pb.setAttribute("class", "play_list_play_button");

    let span_pb = document.createElement("SPAN");
    span_pb.setAttribute("onclick", `player.play_from_playlist(${id}, '${playlist_name}')`);

    let i_pb = document.createElement("I");
    i_pb.setAttribute("id", `play_${playlist_name.replace(/\s+/g, '_').toLowerCase()}_${id}`);
    i_pb.setAttribute("class", `fas fa-play`);

    span_pb.append(i_pb);
    p_pb.append(span_pb);
    div_cover.append(p_pb);
    return div_card;
}

function library(playlist_name, page_playlist_length){
    // <div class="list_songs_wrapper">
    let div_lsw = document.createElement("DIV");
    div_lsw.setAttribute("class", "list_songs_wrapper");

    // <div style="width: 100%; height: 10px;"></div>
    let div_spacer = document.createElement("DIV");
    div_spacer.setAttribute("style", "width: 100%; height: 10px;");

    // <div class="playlist_label">
    let div_pl = document.createElement("DIV");
    div_pl.setAttribute("class", "playlist_label");


    let p_playlist = document.createElement("P");
    p_playlist.textContent = `Playlist: ${playlist_name}`;
    p_playlist.setAttribute("class", "playlist_label_text")

    let p_playlist_length = document.createElement("P");
    p_playlist_length.textContent = `Total songs: ${page_playlist_length}`;
    p_playlist_length.setAttribute("class", "playlist_label_text")

    // <div id="list_playlist_songs" class="list_songs">
    let div_lps = document.createElement("DIV");
    div_lps.setAttribute("id", "list_playlist_songs");
    div_lps.setAttribute("class", "list_songs");
    div_lps.setAttribute("style", "display: none;");

    div_pl.append(p_playlist);
    div_pl.append(p_playlist_length);

    div_lsw.append(div_spacer);
    div_lsw.append(div_pl);
    div_lsw.append(div_lps);

    return div_lsw;
}

function show_options(id) {
    function getClickPosition(e) {
        document.getElementById("tooltip_body").innerHTML +=
        `
        <div class="playlist_options" id="playlist_options">
            <span>Add to playlist</span>
            <span>View on osu!website</span>
            <span>Download from beatconnect</span>
            <span>Delete Song</span>
            <span>Remove from playlist</span>
        </div>
        `;
        document.getElementById("playlist_options").style.top = e.clientY + "px";
        document.getElementById("playlist_options").style.left = e.clientX + "px";
    }

    function eventListener() {
        window.removeEventListener('click', eventListener);
        document.getElementById("playlist_options").remove();
        document.getElementsByTagName("BODY")[0].style.pointerEvents = null;
    }

    window.addEventListener("click", getClickPosition);

    setTimeout(function () {
        window.removeEventListener("click", getClickPosition);
        window.addEventListener('click', eventListener);
        document.getElementsByTagName("BODY")[0].style.pointerEvents = "none";
    }, 1);
}