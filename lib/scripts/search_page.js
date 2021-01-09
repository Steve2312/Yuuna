const search_page = function() {
    let search_results = null;
    let isProcessing = null;
    let inactivityTimeout = null;
    let page = null;
    let searchRequest = null;
    let lastPage = null;

    search_page.prototype.beatconnect_link = function(query, page, type) {
        return encodeURI(`https://beatconnect.io/api/search/?token=${process.env.TEASE_BEATCONNECT_API_KEY}&m=all&q=${query}&s=${type}&p=${page}`);
    }

    search_page.prototype.createResultCard = function(title, artist, duration, source, beatmap_id, index, page, downloaded) {
        return(
        `
        <div class="card">
            <div class="cover" style='background-image: url("https://b.ppy.sh/thumb/${beatmap_id}l.jpg"), url("https://steamuserimages-a.akamaihd.net/ugc/848216173214789511/C2CB4C35AE9386EB78FF5F34FFEBB69DD587E7F0/")'></div>
            <div class="card_flex">
                <div class="card_metadata">
                    <div class="metadata_child">
                        <p class="title">TITLE</p>
                        <p class="value">${title}</p>
                    </div>
                </div>
                <div class="card_metadata">
                    <div class="metadata_child">
                        <p class="title">ARTIST</p>
                        <p class="value">${artist}</p>
                    </div>
                </div>
                <div class="card_metadata">
                    <div class="metadata_child">
                        <p class="title">DURATION</p>
                        <p class="value">${duration}</p>
                    </div>
                </div>
                <div class="card_metadata">
                    <div class="metadata_child">
                        <p class="title">SOURCE</p>
                        <p class="value">${source}</p>
                    </div>
                </div>
                <div class="card_metadata">
                    <div class="metadata_child">
                        <p class="title">BEATMAP ID</p>
                        <p class="value"><a class="beatmap_link_opener" onclick="search_page.open_beatmap_site(${beatmap_id})">${beatmap_id}</a></p>
                    </div>
                </div>
            </div>
            <div class="card_playbutton">
                <p class="play-button"><span onclick='beatmap_dl.add_download_queue(${index}, ${page})'><i ${downloaded ? "style='display:none'" : ""} id="dowload_beatmap_set_${beatmap_id}" class="fas fa-download"></i></span></p>
                <p class="play-button"><span onclick='player.play_preview(${index}, ${page})'><i id="play_preview_${beatmap_id}" class="fas fa-play"></i></span></p>
            </div>
        </div>
        `);
    }

    search_page.prototype.loadingComplete = function() {
        this.animate_loading_bar(100, 500);
        this.hide_loading_bar();
        isProcessing = false;
    }

    search_page.prototype.addEventOnSearch = function() {
        var input = document.getElementById("search_page_search");
        input.addEventListener("keyup", () => {
            if(inactivityTimeout) window.clearTimeout(inactivityTimeout);
                inactivityTimeout = window.setTimeout(() => {
                    if (isProcessing) searchRequest.abort();
                    this.search_beatmap(true);
            }, 1000);
        });
    }

    search_page.prototype.load_nextPage = function() {
        var list = document.getElementById("list_search_results_wrapper");
        if (list.scrollTop >= list.scrollHeight - list.offsetHeight && !isProcessing && !lastPage && list.scrollHeight - list.offsetHeight != 0) this.search_beatmap(false);
    }

    search_page.prototype.search_beatmap = function(isNewSearch) {
        var list = document.getElementById("list_search_results");
        var query = document.getElementById("search_page_search").value;
        var type = document.getElementById("searchon").value;
        var buffer = [];
        var buffer_length = 0;

        if (!isProcessing) this.show_loading_bar();
        page = isNewSearch ? 0 : page + 1;

        searchRequest = request(this.beatconnect_link(query, page, type));
        isProcessing = true;
        lastPage = false;

        this.animate_loading_bar(0.01 * 100, 1000);

        progress(searchRequest).on('progress', (state) => {
            this.animate_loading_bar(state.percent * 100, 300);
        }).on('data', (chunk) => {
            buffer.push(chunk);
            buffer_length += chunk.length;
        }).on('error', (err) => {
            this.loadingComplete();
            console.log(err);
            // If the search fails try again.
            this.search_beatmap(isNewSearch);
        }).on('end', async () => {
            this.loadingComplete();
            try {
                var chunksAll = new Uint8Array(buffer_length);
                var position = 0;
                for(var chunk of buffer) {
                    chunksAll.set(chunk, position);
                    position += chunk.length;
                }
                var data_decorder = new TextDecoder("utf-8").decode(chunksAll);
                var data = JSON.parse(data_decorder);
                var data_length = Object.keys(data["beatmaps"]).length;
                if (isNewSearch) {
                    search_results = [];
                    list.innerHTML = "";
                    list.scrollTop = 0;
                }

                search_results.push(data["beatmaps"]);
                if (data_length == 0) {
                    lastPage = true;
                    list.innerHTML +=  `<div style="margin: 10px 0px;width: 100%; display:flex;justify-content: center;"><p style="font-family: NotoBold;margin: 0px 10px;font-size: 10px;color: var(--subject_color);"> No more results </p></div>`;
                } else {
                    var allsongs = await this.getAlldownloaded();
                    for(var i = 0; i < data_length; i++){
                        var beatmap = search_results[page][i];
                        var {title, artist, source, id, beatmaps} = beatmap;
                        source = source ? source : "";
    
                        // Get duration of the longest beatmap
                        var duration = () => {
                            var max_length = 0;
                            for (var y in beatmaps) {
                                var { total_length } = beatmaps[y];
                                if (!max_length || total_length > max_length) max_length = total_length;
                            }
                            return utils.format_seconds(max_length);
                        };
                        list.innerHTML += this.createResultCard(title, artist, duration(), source, id, i, search_results.length - 1, allsongs.includes(id.toString()));
                    }
                }
            } catch (err) {
                console.log(err);
            }
        });
    }

    search_page.prototype.getAlldownloaded = function() {
        return new Promise(resolve => {
            var songspath = appDataSongs;
            fs.readdir(songspath, (err, files) => {
                if (files) resolve(Object.values(files));
                else resolve([]);
            });
        });
    }

    search_page.prototype.open_beatmap_site = function(id) {
        shell.openExternal(`https://osu.ppy.sh/beatmapsets/${id}`);
    }

    search_page.prototype.get_search_results = function() {
        return search_results;
    }

    // Using JQUERY, Looking for alternative
    search_page.prototype.animate_loading_bar = function(width, speed) {
        $(".loading_bar").css("opacity", "1");
        $(".loading_bar").animate({
            width: `${width}%`
        }, speed, "easeInOutQuart", function() {
            $(".loading_bar").css("width", `${width}%`);
        });
    }

    // Using JQUERY, Looking for alternative
    search_page.prototype.show_loading_bar = function() {
        $(".loading_bar").animate({
            'opacity': `1`
        }, 500, "easeInOutQuart", function() {
            $(".loading_bar").css("opacity", `1`);
        });
    }

    // Using JQUERY, Looking for alternative
    search_page.prototype.hide_loading_bar = function() {
        $(".loading_bar").animate({
            'opacity': `0`
        }, 500, "easeInOutQuart", function() {
            $(".loading_bar").css("opacity", `0`);
            $(".loading_bar").css("width", `0`);
        });
    }
}

module.exports = new search_page();