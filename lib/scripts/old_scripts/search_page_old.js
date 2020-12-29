var timeoutHandle;
var searched_data;

function init_search(){
    if (timeoutHandle) {window.clearTimeout(timeoutHandle);}
    search_value = document.getElementById("search_page_search").value;
    search_type = document.getElementById("searchon").value;
    link = encodeURI(return_bloodcat_link(search_type, search_value));
    timeoutHandle = window.setTimeout(function () {
        let results_panel = document.getElementById("list_search_results");
        let search_request = request(link);
        let search_buffer = [];
        let search_buffer_length = 0;
        show_loading_bar()
        animate_loading_bar(20, 600)
        progress(search_request).on('progress', function (state) {
        }).on('progress', (state) => {
            animate_loading_bar(state.percent * 100, 300)
        }).on('data', (chunk) => {
            search_buffer.push(chunk);
            search_buffer_length += chunk.length;
        }).on('error', (err) => {
            animate_loading_bar(100, 300);
            hide_loading_bar();
            init_search();
            // Flush DNS if bloodcat doesnt load
            exec('ipconfig /flushdns', (err, stdout, stderr) => {if (err) {return;}});
        }).on('end', () => {
            animate_loading_bar(100, 500)
            hide_loading_bar()
            try {
                chunksAll = new Uint8Array(search_buffer_length); // (4.1)
                position = 0;
                for(let chunk of search_buffer) {
                    chunksAll.set(chunk, position); // (4.2)
                    position += chunk.length;
                }
                
                search_result = new TextDecoder("utf-8").decode(chunksAll);
                results_panel.innerHTML = "";
                searched_data = JSON.parse(search_result);
                searched_data_length = Object.keys(searched_data).length;
                for(i = 0; i < searched_data_length; i++){
                    title = searched_data[i]["title"];
                    titleU = searched_data[i]["titleU"];
                    if (titleU == ""){titleU = title;}
                    artist = searched_data[i]["artist"];
                    source = searched_data[i]["source"];
                    if (source == ""){source = " - ";}
                    beatmap_id = searched_data[i]["id"];

                    duration = 0;
                    for(y = 0; y < searched_data[i]["beatmaps"].length; y++){
                        if (parseInt(searched_data[i]["beatmaps"][y]["length"]) > duration){
                            duration = parseInt(searched_data[i]["beatmaps"][y]["length"]);
                        }
                    }
                    duration = format_seconds(duration)
                    results_panel.innerHTML += createResultCard(title, artist, duration, source, beatmap_id, i, searched_data.length);
                }
                $(".list_search_results_wrapper").scrollTop(0);
            } catch (err) {}
        });
    }, 500);
}

let isLoading = false;

function load_nextPage(){
    var x = document.getElementById("list_search_results_wrapper")
    console.log(x.scrollTop);
    console.log(x.scrollHeight - x.offsetHeight * 3);
    if (x.scrollTop >= x.scrollHeight - x.offsetHeight) {
        if (!isLoading) {
            isLoading = true;
            
        }
    }
}

function return_bloodcat_link(index, search_value) {
    var link = `https://bloodcat.com/osu/?mod=json&q=${search_value}`;
    switch (index) {
        case(0): {
            link += `&c=0`;
        }
        case(1): {
            link += `&c=b`;
        }
        case(2): {
            link += `&c=s`;
        }
        case(3): {
            link += `&c=u`;
        }
    }
    return link;
} 

function createResultCard(title, artist, duration, source, beatmap_id, i, y){
    return(
    `
    <div class="card">
        <div class="cover" style='background-image: url("https://b.ppy.sh/thumb/${beatmap_id}.jpg")'></div>
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
            <p class="play-button"><span onclick='play_preview(${i})'><i id="play_searched_data_from_the_search_page_${beatmap_id}" class="fas fa-play"></i></span></p>
        </div>
    </div>
    `);
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

for(var i = 0; i < parsed_data_length; i++){
    var title = searched_data[i]["title"];
    var titleU = searched_data[i]["titleU"];
    var artist = searched_data[i]["artist"];
    var source = searched_data[i]["source"];
    var beatmap_id = searched_data[i]["id"];

    if (source == ""){source = " - ";}
    if (titleU == ""){titleU = title;}

    var duration = 0;
    for(var y = 0; y < searched_data[i]["beatmaps"].length; y++){
        if (parseInt(searched_data[i]["beatmaps"][y]["length"]) > duration){
            duration = parseInt(searched_data[i]["beatmaps"][y]["length"]);
        }
    }
    duration = format_seconds(duration);
}