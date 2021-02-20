const playlist = function() {
    let list_playlists = null;
    let tasks = []
    let processing = false;
    if (!fs.existsSync(appDataPlaylists)) {
        fs.mkdirSync(appDataPlaylists);
    }

    playlist.prototype.create_update_album_cover = async function() {
        document.getElementById("create_playlist_cover").style.backgroundImage = `url(${await this.getDataUrl(document.getElementById("create_playlist_image").files[0]["path"].replace(/\\/g, '/'))})`
    }

    playlist.prototype.submit = async function() {
        let name = document.getElementById("create_playlist_name").value;
        let description = document.getElementById("create_playlist_description").value;
        let cover = document.getElementById("create_playlist_cover").style.backgroundImage;
        cover = cover ? cover.slice(5, cover.length - 2) : "data:image/jpeg;base64,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"

        if (!name) {
            document.getElementById("create_playlist_name").style.border = "2px solid var(--accent_color)"
        } else {
            tasks.push({name, description, cover, type: "create"})
            this.taskmanager()
            document.getElementById("create_playlist").remove();
        }
    }

    playlist.prototype.getDataUrl = function(src) {
        return new Promise( (resolve, reject) => {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var img = document.createElement('IMG');
            // Create canvas
            img.src = src;
            // Set width and height
            canvas.width = 500;
            canvas.height = 500;
            // Draw the image
            img.addEventListener("load", () => {
                sx = 0
                sy = (img.height - img.width) / 2
                sWidth = img.width
                sHeight = img.width

                if (img.height < img.width) {
                    sx = (img.width - img.height) / 2
                    sy = 0
                    sWidth = img.height
                    sHeight = img.height
                }

                dx = 0
                dy = 0
                dWidth = canvas.width
                dHeight = canvas.height
                ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
                resolve(canvas.toDataURL("image/jpeg"));
            })

            img.onerror = function error() {
                reject("Failed to load image")
            }
        });
    }

    playlist.prototype.getAllPlaylistUUID = async function() {
        return (await parse_json.get_files_in_dir(appDataPlaylists)).filter(filename => filename.split('.').pop() == "json").map((filename) => filename.split('.')[0])
    }

    playlist.prototype.get = function(uuid) {
        if (list_playlists.map((item) => item["uuid"]).includes(uuid)) {
            return list_playlists.filter((item) => item["uuid"] == uuid)[0];
        }
    }

    playlist.prototype.getuuid = async function () {
        let used_uuidv4 = await this.getAllPlaylistUUID();

        let new_uuidv4 = utils.uuidv4();
        while (used_uuidv4.includes(new_uuidv4)) {
            new_uuidv4 = utils.uuidv4();
        }

        return new_uuidv4
    }

    playlist.prototype.create_playlist_DOM = function() {
        var DIV_cp = document.createElement("DIV");
        DIV_cp.setAttribute("class", "create_playlist")
        DIV_cp.setAttribute("id", "create_playlist")

        var DIV_cp_header = document.createElement("DIV");
        DIV_cp_header.setAttribute("class", "create_playlist_header")
        var H2_cp_header = document.createElement("H2");
        H2_cp_header.textContent = "Create Playlist";
        DIV_cp_header.append(H2_cp_header);

        var DIV_cp_body = document.createElement("DIV");
        DIV_cp_body.setAttribute("class", "create_playlist_body")

        var DIV_cp_image = document.createElement("DIV");
        DIV_cp_image.setAttribute("class", "create_playlist_image")
        DIV_cp_image.setAttribute("id", "create_playlist_cover")
        var INPUT_cp_image = document.createElement("INPUT");
        INPUT_cp_image.setAttribute("type", "file");
        INPUT_cp_image.setAttribute("accept", "image/*");
        INPUT_cp_image.setAttribute("id", "create_playlist_image");
        INPUT_cp_image.setAttribute("oninput", "playlist.create_update_album_cover()");
        DIV_cp_image.append(INPUT_cp_image);

        var DIV_cp_textbox = document.createElement("DIV");
        DIV_cp_textbox.setAttribute("class", "create_playlist_textbox");
        var H4_TITLE_cp_textbox = document.createElement("H4");
        var H4_DESC_cp_textbox = document.createElement("H4");
        H4_TITLE_cp_textbox.textContent = "Playlist name";
        H4_DESC_cp_textbox.textContent = "Description";
        var INPUT_cp_textbox = document.createElement("INPUT");
        INPUT_cp_textbox.setAttribute("id", "create_playlist_name");
        INPUT_cp_textbox.setAttribute("placeholder", "Enter playlist name here");
        INPUT_cp_textbox.setAttribute("type", "text");
        var TEXTAREA_cp_textbox = document.createElement("TEXTAREA");
        TEXTAREA_cp_textbox.setAttribute("id", "create_playlist_description");
        TEXTAREA_cp_textbox.setAttribute("placeholder", "Enter description here");
        TEXTAREA_cp_textbox.setAttribute("type", "text");
        DIV_cp_textbox.append(H4_TITLE_cp_textbox);
        DIV_cp_textbox.append(INPUT_cp_textbox);
        DIV_cp_textbox.append(H4_DESC_cp_textbox);
        DIV_cp_textbox.append(TEXTAREA_cp_textbox);

        DIV_cp_body.append(DIV_cp_image);
        DIV_cp_body.append(DIV_cp_textbox);


        var DIV_cp_footer = document.createElement("DIV");
        DIV_cp_footer.setAttribute("class", "create_playlist_footer");
        var SPAN_cp_footer = document.createElement("SPAN");
        SPAN_cp_footer.setAttribute("class", "create_playlist_save_button");
        SPAN_cp_footer.setAttribute("onclick", "playlist.submit()");
        SPAN_cp_footer.textContent = "Save playlist";
        DIV_cp_footer.append(SPAN_cp_footer);

        DIV_cp.append(DIV_cp_header);
        DIV_cp.append(DIV_cp_body);
        DIV_cp.append(DIV_cp_footer);

        return DIV_cp;
    }

    playlist.prototype.show_create_playlist = function() {
        var that = this;
        function display_tooltip(e) {
            document.getElementById("toolbox_create_playlist").append(that.create_playlist_DOM());
        }
    
        function remove_onclick(e) {
            if (document.getElementById('create_playlist')) {
                if (!document.getElementById('create_playlist').contains(e.target)){
                    window.removeEventListener('resize', remove_onclick);
                    window.removeEventListener('click', remove_onclick);
                    document.getElementById("create_playlist").remove();
                    document.getElementsByTagName("BODY")[0].style.pointerEvents = null;
                }
            } else {
                window.removeEventListener('resize', remove_onclick);
                window.removeEventListener('click', remove_onclick);
                document.getElementsByTagName("BODY")[0].style.pointerEvents = null;
            }
            
        }
    
        window.addEventListener("click", display_tooltip);
    
        setTimeout(function () {
            window.removeEventListener("click", display_tooltip);
            window.addEventListener('click', remove_onclick);
            window.addEventListener('resize', remove_onclick);
            document.getElementsByTagName("BODY")[0].style.pointerEvents = "none";
            document.getElementById("create_playlist").style.top = "50%";
            document.getElementById("create_playlist").style.opacity = "1";
        }, 1);
    }

    playlist.prototype.write = function(path, data) {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, data, function(err) {
                if (err) {
                    reject(err);
                }
                resolve()
            });
        });
    }

    playlist.prototype.add = async function(playlist_uuid, BeatmapID, BeatmapSetID) {
        if (playlist_uuid && BeatmapID && BeatmapSetID) {
            tasks.push({playlist_uuid, BeatmapID, BeatmapSetID, type: "add"});
            this.taskmanager();
        }
    }

    playlist.prototype.remove = async function(playlist_uuid, index) {
        if (playlist_uuid && index) {
            tasks.push({playlist_uuid, index, type: "remove"});
            this.taskmanager();
        }
    }

    playlist.prototype.delete = async function(BeatmapID, BeatmapSetID) {
        if (BeatmapID && BeatmapSetID) {
            tasks.push({BeatmapID, BeatmapSetID, type: "delete"});
            this.taskmanager();
        }
    }

    playlist.prototype.taskmanager = async function() {
        if (tasks.length > 0 && !processing) {
            if (tasks[0]["type"] == "create") {
                processing = true;
                var {name, description, cover} = tasks[0];
                var uuid = await this.getuuid();
                var playlist_path = path.join(appDataPlaylists, uuid.concat(".json"))
                var data = {
                    name,
                    description,
                    cover,
                    created: Date.now(),
                    songs: []
                }
                await this.write(playlist_path, JSON.stringify(data));
                this.update_left_panel();
                load_page_playlist(uuid);
            }
            
            if (tasks[0]["type"] == "add") {
                console.log("add")
                await this.task_add(tasks[0]);
            }

            if (tasks[0]["type"] == "remove") {
                console.log("remove")
                await this.task_remove(tasks[0]);
            }

            if (tasks[0]["type"] == "delete") {
                console.log("delete")
                await this.task_delete(tasks[0]);
            }

            tasks.shift()
            processing = false;
            if (tasks.length > 0) {
                this.taskmanager();
            }
        }
    }

    playlist.prototype.task_add = function (task) {
        return new Promise(async (resolve, reject) => {
            var {playlist_uuid, BeatmapID, BeatmapSetID} = task;
            let all_playlist_ids = await this.getAllPlaylistUUID();
            if (all_playlist_ids.includes(playlist_uuid)) {
                var playlist_path = path.join(appDataPlaylists, playlist_uuid.concat(".json"))
                var data = JSON.parse(await parse_json.read_file(playlist_path));
                var index = data["songs"].length > 0 ? Math.max.apply(Math, data["songs"].map((data) => Number(data["index"]))) + 1 : 0;
                var map = {index, BeatmapID, BeatmapSetID};
                data["songs"].push(map)
                await this.write(playlist_path, JSON.stringify(data));
                list_playlists = (await this.get_all_playlists()).sort((a, b) => b["created"] - a["created"]);
                if (LOADED_PAGE_PLAYLIST == playlist_uuid) {
                    load_page_playlist(playlist_uuid);
                }
                if (player.getCurrentPlaylistName() == playlist_uuid) {
                    player.updatePlaylist();
                }

                resolve("Song added")
            } else {
                reject("Playlist doesn't exist");
            }
        })
    }

    playlist.prototype.task_remove = function (task) {
        return new Promise(async (resolve, reject) => {
            var {playlist_uuid, index} = task;
            let all_playlist_ids = await this.getAllPlaylistUUID();
            if (all_playlist_ids.includes(playlist_uuid)) {
                var playlist_path = path.join(appDataPlaylists, playlist_uuid.concat(".json"));
                var data = JSON.parse(await parse_json.read_file(playlist_path));
                for(var x = 0; x < data["songs"].length; x++) {
                    if (data["songs"][x]["index"] == index) {
                        data["songs"].splice(x, 1);
                    }
                }
                await this.write(playlist_path, JSON.stringify(data));
                list_playlists = (await this.get_all_playlists()).sort((a, b) => b["created"] - a["created"]);
                if (player.getCurrentPlaylistName() == playlist_uuid) {
                    player.updatePlaylist();
                }
                resolve("Song removed")
            } else {
                reject("Playlist doesn't exist")
            }
        })
    }

    playlist.prototype.task_delete = function (task) {
        var that = this;
        return new Promise(async (resolve, reject) => {
            var {BeatmapID, BeatmapSetID} = task;
            let all_playlist_ids = await this.getAllPlaylistUUID();
            for (var x = 0; x < all_playlist_ids.length; x++) {
                var playlist_path = path.join(appDataPlaylists, all_playlist_ids[x].concat(".json"));
                console.log(playlist_path)
                var data = JSON.parse(await parse_json.read_file(playlist_path));
                var playlist_length = data["songs"].length;
                var removeIndex = [];
                for(var y = 0; y < data["songs"].length; y++) {
                    var id = data["songs"][y]["BeatmapID"];
                    var set_id = data["songs"][y]["BeatmapSetID"];
                    var index = data["songs"][y]["BeatmapSetID"];
                    if (id == BeatmapID && set_id == BeatmapSetID) {
                        removeIndex.push(y);
                    }
                }

                console.log(removeIndex);

                for (var i = removeIndex.length -1; i >= 0; i--) {
                    data["songs"].splice(removeIndex[i],1);
                }

                // Only write if changed
                if (playlist_length != data["songs"].length) {
                    console.log("Write")
                    await this.write(playlist_path, JSON.stringify(data));
                }
            }
            list_playlists = (await this.get_all_playlists()).sort((a, b) => b["created"] - a["created"]);
            player.updatePlaylist();
            console.log("Success");
            resolve("Success");
        })
    }

    playlist.prototype.get_all_playlists = async function() {
        return new Promise( async (resolve) => {
            var playlist_files = await parse_json.get_files_in_dir(appDataPlaylists);
            var data = [];
            for (var x = 0; x < playlist_files.length; x++) {
                try {
                    var playlist_path = path.join(appDataPlaylists, playlist_files[x])
                    var info = JSON.parse(await parse_json.read_file(playlist_path));
                    info["uuid"] = playlist_files[x].split(".")[0];
                    data.push(info);
                } catch (err) {
                    console.log("Parse Error")
                }
            }
            resolve(data)
        });
    }

    playlist.prototype.update_left_panel = async function() {
        var playlists = await this.get_all_playlists();
        playlists = playlists.sort((a, b) => b["created"] - a["created"]);
        // New playlist
        for (var x = 0; x < playlists.length; x++) {
            var exist = false;
            for (var y = 0; y < list_playlists.length; y++) {
                if (playlists[x]["uuid"] == list_playlists[y]["uuid"]) {
                    exist = true;
                    break;
                }
            }

            if (!exist) {
                var DOM_playlists_left_panel = document.getElementById("playlist_names");
                DOM_playlists_left_panel.insertBefore(this.DOM_playlist_name(playlists[x]["name"], playlists[x]["uuid"]), DOM_playlists_left_panel.firstChild);
            }
        }

        list_playlists = playlists;
    }

    playlist.prototype.build = async function() {
        list_playlists = await this.get_all_playlists();
        list_playlists = list_playlists.sort((a, b) => b["created"] - a["created"]);
        var DOM_playlists_left_panel = document.getElementById("playlist_names");
        for (var x = 0; x < list_playlists.length; x++) {
            var { name, uuid } = list_playlists[x];
            DOM_playlists_left_panel.append(this.DOM_playlist_name(name, uuid));
        }
    }

    playlist.prototype.DOM_playlist_name = function(name, uuid) {
        var li = document.createElement("LI");
        var span = document.createElement("SPAN");
        span.setAttribute("onclick", `load_page_playlist("${uuid}")`);
        span.textContent = name;
        li.append(span);
        return li;
    }
}

module.exports = new playlist();