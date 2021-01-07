class beatmap_downloader {
    #downloads
    #init_downloading
    #init_request
    #aborted;
    constructor () {
        this.#downloads = []
        this.#aborted = false;
    }

    // Global Functions

    // Add the beatmap to the download queue
    add_download_queue(index, page) {
        var {title, artist, id, unique_id} = search_page.get_search_results()[page][index];
        
        if (!this.#inQueue(id)) {
            var a = {};
            a[id] = {};
            var b = a[id];
            b["title"] = title;
            b["artist"] = artist;
            b["download_url"] = `https://beatconnect.io/b/${id}/${unique_id}/`;
            b["beatmap_id"] = id;
            this.#downloads.push(a);
            
            // Change Download icon to Abort icon 
            var download_button = document.getElementById(`dowload_beatmap_set_${id}`);
            if (download_button) {
                download_button.className = "fas fa-times cancel_button";
            }

            // Init the downloader
            if (!this.#init_downloading) {
                this.#init_download();
                this.#init_downloading = true;
            }
        } else {
            var download_button = document.getElementById(`dowload_beatmap_set_${id}`);
            if (download_button) {
                download_button.className = "fas fa-download";
            }
            this.removeZip(path.join(appDataTemp, id + '.zip'));
        }
    }

    // Get download array, the download page uses this.
    getDownloads() {
        return this.#downloads;
    }

    // Check if beatmap is in queue,
    // look for the index and removes it from the array
    cancel_download(beatmapid) {
        if (this.#inQueue(beatmapid)) init_download_page();
    }

    #inQueue(id) {
        var values = Object.values(this.#downloads);
        for (var i = 0; i < values.length; i++) {
            if (Object.keys(values[i])[0] == id) {
                this.#downloads.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    //Local funtions
    #removeZip(src) {
        if (fs.existsSync(src)) {
            fs.unlink(src, (err) => {
                if (err) {
                    console.log(err)
                }
            });
        }
    }

    // Check next download
    #check_download_queue() {
        this.#downloads.shift();
        if (this.#downloads.length > 0) {
            this.#init_download();
        } else {
            this.#init_downloading = false;
        }
    }

    // Initialize the download
    async #init_download() {
        var {beatmap_id, download_url} = this.#downloads[0][Object.keys(this.#downloads[0])[0]];
        var that = this;
        this.#init_request = request(download_url);
        progress(this.#init_request).on('progress', function (state) {
            var speed = (state.speed ? (state.speed / 1000000).toFixed(2) + " MB/s" : "Waiting for download");
            var percent = (state.percent ? state.percent * 100 : 0);
            update_download_info(speed, percent);

            // Check if the first download is not removed
            // If the download has been removed
            // Remove zip
            var test = (that.#downloads[0] ? that.#downloads[0][Object.keys(that.#downloads[0])[0]] : null);
            if (test == null || test['beatmap_id'] != beatmap_id) {
                that.#abort()
                that.#removeZip(path.join(appDataTemp, beatmap_id + '.zip'));
            }

        }).on('error', function (err) {
            console.log(err);
            that.#init_download();
        }).on('end', function () {
            // If the download hasn't been aborted
            // Hide the download button
            // Extract the .osu
            if (!that.#aborted){
                var download_button = document.getElementById(`dowload_beatmap_set_${beatmap_id}`);
                if (download_button) download_button.style.display = "none";
                extract_downloaded_file(beatmap_id);
            }
            that.#aborted = false;
            that.#check_download_queue();
            init_download_page();
        }).pipe(fs.createWriteStream(path.join(appDataTemp, beatmap_id + '.zip')));
    }

    //abort the download
    #abort() {
        this.#aborted = true;
        this.#init_request.abort();
    }
}

module.exports = new beatmap_downloader();