class playlist_page {
    #page_playlist

    async Libraryload_Playlist(playlist_name) {
        this.#page_playlist = await request_JSON(playlist_name);
        try { document.getElementsByClassName("list_songs_wrapper")[0].remove() } catch (err) {}
        this.#load(this.#page_playlist, playlist_name);
    }

    async #load(page_Playlist, playlist_name) {
        var playlist_length = page_Playlist.length;
        // var playlistName = encodeURI(playlist_name.toString().toLowerCase());

        try { document.getElementById("playlist_page").append(this.#library(playlist_name, playlist_length)); } catch (err) {}
        for(var i = 0; i < playlist_length; i++) {
            var {title, artist, file, source, length, BeatmapSetID, BeatmapID} = page_Playlist[i];
            source = source ? source : " - ";
            var song_folder = path.join(appDataSongs, BeatmapSetID, BeatmapID);
            var song_path = path.join(song_folder, file);
    
            var duration = utils.format_seconds(length);
            var created = await this.#data_added(song_folder);
    
            var cover = path.join(song_folder, "cover.jpg").replace(/\\/g, '/');
            var card = this.#playlist_card(cover, title, artist, duration, source, created, playlist_name, BeatmapSetID, BeatmapID);
            try { document.getElementById("list_playlist_songs").append(card); } catch (err) {}
        }
        // If the library is empty tell them to visit the search page
        if (playlist_length == 0) {
            document.getElementById("list_playlist_songs").innerHTML +=  `<div style="margin: 10px 0px;width: 100%; justify-content: center; display:flex;justify-content: center;"><p style="text-align: center; width: 50%; font-family: NotoBold;margin: 0px 10px;font-size: 10px;color: var(--subject_color);"> This playlist contains no songs. Songs can be downloaded via the "Search" page or can be manually added to any playlist by clicking 3 dots and selecting "Add to playlist". </p></div>`;
        }
        try { document.getElementById("list_playlist_songs").style.display = null; } catch (err) {}
        try { player.updatePlaylistIcon(); } catch (err) {}
    }

    #data_added(song_folder) {
        return new Promise(resolve => {
            fs.stat(song_folder, (error, stats) => { resolve(stats.birthtime.toLocaleDateString()); });
        });
    }

    #playlist_card(cover, title, artist, duration, source, created, playlist_name, beatmap_set_id, beatmap_id) {
        // <div class="card">
        var div_card = document.createElement("DIV");
        div_card.setAttribute("class", "play_list_card");
        div_card.setAttribute("id", `card_${playlist_name.replace(/\s+/g, '_').toLowerCase()}_${beatmap_id}`);
    
        // <div class="cover" style="background-image:url('${cover}')"></div>
        var div_cover = document.createElement("DIV");
        div_cover.setAttribute("class", "play_list_cover");
        div_cover.setAttribute("style", `background-image: url("${cover}");`);
        div_card.append(div_cover);
    
        var cm_titles = ['TITLE', 'ARTIST', 'DURATION', 'SOURCE', 'DATE'];
        var cm_values = [title, artist, duration, source, created];
    
        // <div class="card_flex">
        var div_cf = document.createElement("DIV");
        div_cf.setAttribute("class", "play_list_card_flex");
    
        // Create card meta
        for (var x = 0;x< cm_values.length; x++) {
            // <div class="card_metadata">
            var div_cm = document.createElement("DIV");
            div_cm.setAttribute("class", "play_list_card_metadata");
    
            // <div class="metadata_child">
            var div_mc = document.createElement("DIV");
            div_mc.setAttribute("class", "metadata_child");
    
            // TITLE
            var p_title = document.createElement("P");
            p_title.setAttribute("class", "title");
            p_title.textContent = cm_titles[x];
    
            // VALUE
            var p_value = document.createElement("P");
            p_value.setAttribute("class", "value");
            p_value.textContent = cm_values[x];
    
            div_mc.append(p_title);
            div_mc.append(p_value);
            div_cm.append(div_mc);
            div_cf.append(div_cm);
        }
    
        div_card.append(div_cf);
    
        // MORE
        var div_more = document.createElement("DIV");
        div_more.setAttribute("class", "play_list_options");
        div_more.setAttribute("onclick", `playlist_page.show_options("${playlist_name}", "${beatmap_set_id}", "${beatmap_id}")`);
    
        var p_more = document.createElement("P");
        p_more.setAttribute("class", "options_button");
    
        var span_more = document.createElement("SPAN");
    
        var i_more = document.createElement("I");
        i_more.setAttribute("class", `fas fa-ellipsis-h`);
    
        span_more.append(i_more);
        p_more.append(span_more);
        div_more.append(p_more);
        div_card.append(div_more);
    
        // PLAY BUTTON
        var p_pb = document.createElement("P");
        p_pb.setAttribute("class", "play_list_play_button");
    
        var span_pb = document.createElement("SPAN");
        span_pb.setAttribute("onclick", `player.play_from_playlist(${beatmap_id}, '${playlist_name}')`);
    
        var i_pb = document.createElement("I");
        i_pb.setAttribute("id", `play_${playlist_name.replace(/\s+/g, '_').toLowerCase()}_${beatmap_id}`);
        i_pb.setAttribute("class", `fas fa-play`);
    
        span_pb.append(i_pb);
        p_pb.append(span_pb);
        div_cover.append(p_pb);
        return div_card;
    }

    #library(playlist_name, page_playlist_length){
        // <div class="list_songs_wrapper">
        var div_lsw = document.createElement("DIV");
        div_lsw.setAttribute("class", "list_songs_wrapper");
    
        // <div style="width: 100%; height: 10px;"></div>
        var div_spacer = document.createElement("DIV");
        div_spacer.setAttribute("style", "width: 100%; height: 10px;");
    
        // <div class="playlist_label">
        var div_pl = document.createElement("DIV");
        div_pl.setAttribute("class", "playlist_label");
    
    
        var p_playlist = document.createElement("P");
        p_playlist.textContent = `Playlist: ${playlist_name}`;
        p_playlist.setAttribute("class", "playlist_label_text")
    
        var p_playlist_length = document.createElement("P");
        p_playlist_length.textContent = `Total songs: ${page_playlist_length}`;
        p_playlist_length.setAttribute("class", "playlist_label_text")
    
        // <div id="list_playlist_songs" class="list_songs">
        var div_lps = document.createElement("DIV");
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

    #toolbox(playlist_uuid, beatmap_set_id, beatmap_id) {
        var osu_link = "https://osu.ppy.sh/beatmapsets/" + beatmap_set_id;
        var beatconnect_link = "https://beatconnect.io/b/" + beatmap_set_id;

        // All DOM elements
        var playlist_toolbox = document.createElement("DIV");
        playlist_toolbox.setAttribute("id", "playlist_toolbox");
        playlist_toolbox.setAttribute("class", "playlist_toolbox");

        var add_to_playlist = document.createElement("SPAN");
        var view_osu = document.createElement("SPAN");
        var download_beatconnect = document.createElement("SPAN");
        var delete_song = document.createElement("SPAN");
        
        // Give all DOM element a value
        add_to_playlist.textContent = "Add to playlist";
        view_osu.textContent = "View on osu! website";
        download_beatconnect.textContent = "Download from map from Beatconnect";
        delete_song.textContent = "Delete Song";

        //Give all DOM onclick function
        add_to_playlist.setAttribute("onclick", "toolbox.add_to_playlist()");
        view_osu.setAttribute("onclick", `toolbox.open_link("${osu_link}")`);
        download_beatconnect.setAttribute("onclick", `toolbox.add_to_playlist("${beatconnect_link}")`);
        delete_song.setAttribute("onclick", "toolbox.delete_song()");

        // Append all to div
        playlist_toolbox.append(add_to_playlist);
        playlist_toolbox.append(view_osu);
        playlist_toolbox.append(download_beatconnect);
        playlist_toolbox.append(delete_song);

        // If the song is not in Library
        if (playlist_uuid != "Library") {
            var remove_from_playlist = document.createElement("SPAN");
            remove_from_playlist.textContent = "Remove from playlist";
            remove_from_playlist.setAttribute("onclick", "toolbox.remove_from_playlist()");
            playlist_toolbox.append(remove_from_playlist);
        }

        return playlist_toolbox;
    }

    show_options(playlist_uuid, beatmap_set_id, beatmap_id) {
        var that = this;
        function display_tooltip(e) {
            document.getElementById("toolbox").append(that.#toolbox(playlist_uuid, beatmap_set_id, beatmap_id));
            document.getElementById("playlist_toolbox").style.top = e.clientY + "px";
            document.getElementById("playlist_toolbox").style.left = e.clientX + "px";
        }
    
        function remove_onclick() {
            window.addEventListener('resize', remove_onclick);
            window.removeEventListener('click', remove_onclick);
            document.getElementById("playlist_toolbox").remove();
            document.getElementsByTagName("BODY")[0].style.pointerEvents = null;
        }
    
        window.addEventListener("click", display_tooltip);
    
        setTimeout(function () {
            window.removeEventListener("click", display_tooltip);
            window.addEventListener('click', remove_onclick);
            window.addEventListener('resize', remove_onclick);
            document.getElementsByTagName("BODY")[0].style.pointerEvents = "none";
        }, 1);
    }
}

module.exports = new playlist_page();