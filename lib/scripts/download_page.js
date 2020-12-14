// Global Variables

{
    // Local Variables

    // This will be removed soon...
    let all_cards;

    // Local Functions

    // Still need to replace to DOM
    let download_card = (title, artist, beatmap_id, on_download_speed, on_download_percent, on_download_progress) => {
        return(`
        <div class="download_card">
            <div class="cover" style="background-image:url(https://b.ppy.sh/thumb/${beatmap_id}.jpg)"></div>
            <div class="download_card_flex">
                <div class="download_card_metadata" style="width: 40%;">
                    <div class="metadata_child">
                        <p class="title">${artist}</p>
                        <p class="value">${title}</p>
                    </div>
                </div>
                <div class="download_card_metadata" style="width: 60%;">
                    <div class="metadata_child">
                        <div style="width:100%; display: flex; justify-content: space-between;">
                            <p class="title" ${on_download_speed} style="margin: 0px">Waiting for download</p>
                            <p class="title" ${on_download_percent} style="margin: 0px">0%</p>
                        </div>
                        <input type="range" disabled="true" value="0" min="0" max="100" ${on_download_progress} class="download_progress_slider">
                    </div>
                </div>
            </div>
            <div class="download_card_playbutton">
                <p class="download_play-button"><span onclick='cancel_download(${beatmap_id})'><i class="fas fa-times cancel_button"></i></span></p>
            </div>
        </div>
        `);
    }

    // Global functions

    var init_download_page = () => {
        var panel = document.getElementById("list_downloading");
        if (panel) {
            all_cards = "";
            for (var i = 0; i < downloads.length; i++) {
                var card_info = downloads[i][Object.keys(downloads[i])[0]];

                var title = card_info["title"],
                    artist = card_info["artist"],
                    beatmap_id = card_info["beatmap_id"],
                    id_speed = "",
                    id_percent = "",
                    id_progress = "";

                if (i == 0){
                    id_speed = 'id="on_download_speed"'
                    id_percent = 'id="on_download_percent"'
                    id_progress = 'id="on_download_progress"'
                }

                all_cards += download_card(title, artist, beatmap_id, id_speed, id_percent, id_progress);
            }

            panel.innerHTML = all_cards;
            if (all_cards == ""){
                panel.innerHTML = `<div class="no_downloads">Nothing downloading at the moment!</div>`;
            }
        }
    }

    var update_download_info = (download_speed, download_percent) => {
        var id_speed = document.getElementById("on_download_speed");
        var id_percent = document.getElementById("on_download_percent");
        var id_progress = document.getElementById("on_download_progress");

        if (id_speed && id_percent && id_progress) {
            id_speed.textContent = download_speed;
            id_percent.textContent = Math.ceil(download_percent) + "%";
            id_progress.value = download_percent;
        }
    }
}
