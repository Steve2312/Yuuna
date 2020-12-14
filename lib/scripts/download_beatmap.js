// Global Variables
var downloads = [];

{   
    // Local Variables
    let init_downloading = false;
    let init_request;

    // Local Functions

    // Get path of the temp folder
    let get_temp_path = () => {
        var temp_folder = __dirname.split("\\");
        temp_folder.pop();
        temp_folder.push("temp");
        temp_folder = temp_folder.join("\\");

        // Create temp folder if there is none
        if (!fs.existsSync(temp_folder)) {
            fs.mkdirSync(temp_folder);
        }

        return temp_folder;
    }

    // The downloader process
    let init_download = async () => {
        var download_info = downloads[0][Object.keys(downloads[0])[0]];
        init_request = request(download_info["download_url"]);
        progress(init_request).on('progress', function (state) {
            var speed;
            var percent;

            if (state.speed) speed = (state.speed / 1000000).toFixed(2) + " MB/s";
            else speed = "Waiting for download";
        
            if (state.percent) percent = state.percent * 100;
            else percent = 0;
    
            update_download_info(speed, percent);
    
        }).on('error', function (err) {
            console.log(err);
            init_download();
        }).on('end', function () {
            var download_button = document.getElementById(`dowload_beatmap_set_${download_info["beatmap_id"]}`);
            if (download_button) download_button.style.opacity = "0";
            extract_downloaded_file(download_info["beatmap_id"]);
            check_download_queue();
            init_download_page();
        }).pipe(fs.createWriteStream(path.join(get_temp_path(), download_info["beatmap_id"] + '.zip')));
            
    }

    // Check next download
    let check_download_queue = () => {
        downloads.shift();
        if (downloads.length > 0) {
            init_download();
        } else {
            init_downloading = false;
        }
    }

    // Global functions

    var add_download_queue = (index, page) => {
        var data = search_results[page][index];
        console.log(data);
        // Still need to implement if songs is already in downloads remove it...
        if (true) {
            var a = {};
            a[data["id"]] = {};
            var b = a[data["id"]];
            b["title"] = data["title"];
            b["artist"] = data["artist"];
            b["download_url"] = `https://beatconnect.io/b/${data["id"]}/${data["unique_id"]}/`;
            b["beatmap_id"] = data["id"];
            downloads.push(a);
            
            // Change Download icon to Abort icon 
            var download_button = document.getElementById(`dowload_beatmap_set_${data["id"]}`);
            if (download_button) {
                download_button.className = "fas fa-times cancel_button";
            }

            // Init the downloader
            if (!init_downloading) {
                init_download();
                init_downloading = true;
            }
        }
    }

    var cancel_download = (beatmap_id) => {
        init_request.abort();
        fs.unlink(path.join(get_temp_path(), download_info["beatmap_id"] + '.zip'), (err) => {
            if (err) {
                console.error(err)
            }
        });
    }
}
