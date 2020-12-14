var search_results = [];
{

    // Local variables
    let isProcessing = false;
    let inactivityTimeout;
    let page = 0;
    let searchRequest;
    let lastPage;

    // Local functions
    let getLink = (query, page, type) => {
        return encodeURI(`https://beatconnect.io/api/search/?token=${process.env.TEASE_BEATCONNECT_API_KEY}&m=all&q=${query}&s=${type}&p=${page}`);
    }

    let createResultCard = (title, artist, duration, source, beatmap_id, i, y) => {
        return(
        `
        <div class="card">
            <div class="cover" style='background-image: url("https://b.ppy.sh/thumb/${beatmap_id}l.jpg")'></div>
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
                        <p class="value"><a class="beatmap_link_opener" onclick="open_beatmap_site(${beatmap_id})">${beatmap_id}</a></p>
                    </div>
                </div>
            </div>
            <div class="card_playbutton">
                <p class="play-button"><span onclick='add_download_queue(${i}, ${y})'><i id="dowload_beatmap_set_${beatmap_id}" class="fas fa-download"></i></span></p>
                <p class="play-button"><span onclick='play_preview(${i}, ${y})'><i id="play_searched_data_from_the_search_page_${beatmap_id}" class="fas fa-play"></i></span></p>
            </div>
        </div>
        `);
    }

    let loadingComplete = () => {
        animate_loading_bar(100, 500);
        hide_loading_bar();
        isProcessing = false;
    }

    var addEventOnSearch = () => {
        var input = document.getElementById("search_page_search");
        input.addEventListener("keyup", function() {
            if(inactivityTimeout) window.clearTimeout(inactivityTimeout);
            inactivityTimeout = window.setTimeout(function () {
                if (isProcessing) searchRequest.abort();
                search_beatmap(true);
            }, 1000);
        });
    };

    var load_nextPage = () => {
        var list = document.getElementById("list_search_results_wrapper")
        if (list.scrollTop >= list.scrollHeight - list.offsetHeight && !isProcessing && !lastPage) search_beatmap(false);
    }

    var search_beatmap = (isNewSearch) => {
        var list = document.getElementById("list_search_results");
        var query = document.getElementById("search_page_search").value;
        var type = document.getElementById("searchon").value;
        var buffer = [];
        var buffer_length = 0;

        if (!isProcessing) show_loading_bar();

        page = (isNewSearch ? 0 : page + 1);

        searchRequest = request(getLink(query, page, type));
        console.log(getLink(query, page, type))
        isProcessing = true;
        lastPage = false;

        progress(searchRequest).on('progress', (state) => {
            animate_loading_bar(state.percent * 100, 300);
        }).on('data', (chunk) => {
            buffer.push(chunk);
            buffer_length += chunk.length;
        }).on('error', (err) => {
            loadingComplete();
            console.log(err);
            // If the search fails try again.
            search_beatmap(query, isNewSearch);
        }).on('end', () => {
            loadingComplete();
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
                    for(var i = 0; i < data_length; i++){
                        var beatmap = search_results[page][i];
                        var title = beatmap["title"];
                        var artist = beatmap["artist"];
                        var source = beatmap["source"] ? beatmap["source"] : "-";
                        var beatmap_id = beatmap["id"];
                        var beatmaps = beatmap["beatmaps"]
    
                        // Get duration of the longest beatmap
                        var duration = () => {
                            var max_length = 0;
                            for (var y in beatmaps) {
                                var total_length = beatmaps[y]["total_length"];
                                if (!max_length || total_length > max_length) max_length = total_length;
                            }
                            return format_seconds(max_length);
                        };
                        list.innerHTML += createResultCard(title, artist, duration(), source, beatmap_id, i, search_results.length - 1);
                    }
                }
            } catch (err) {}
        });
    }
}






















function open_beatmap_site(id){
    shell.openExternal(`https://osu.ppy.sh/beatmapsets/${id}`);
}

function animate_loading_bar(width, speed) {
    $(".loading_bar").css("opacity", "1");
    $(".loading_bar").animate({
        width: `${width}%`
    }, speed, "easeInOutQuart", function() {
        $(".loading_bar").css("width", `${width}%`);
    });
}

function show_loading_bar() {
    $(".loading_bar").animate({
        'opacity': `1`
    }, 500, "easeInOutQuart", function() {
        $(".loading_bar").css("opacity", `1`);
    });
}

function hide_loading_bar() {
    $(".loading_bar").animate({
        'opacity': `0`
    }, 500, "easeInOutQuart", function() {
        $(".loading_bar").css("opacity", `0`);
        $(".loading_bar").css("width", `0`);
    });
}