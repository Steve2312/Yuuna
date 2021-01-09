const beatmap_downloader = function() {
    let init_downloading = null;
    let init_request = null;
    let aborted = false;
    let downloads = [];

    // Add the beatmap to the download queue
    beatmap_downloader.prototype.add_download_queue = function(index, page) {
        var {title, artist, id, unique_id} = search_page.get_search_results()[page][index];

        if (!fs.existsSync(path.join(appDataTemp))) {
            fs.mkdirSync(path.join(appDataTemp));
        }
        
        if (!this.inQueue(id)) {
            var a = {};
            a[id] = {};
            var b = a[id];
            b["title"] = title;
            b["artist"] = artist;
            b["download_url"] = `https://beatconnect.io/b/${id}/${unique_id}/`;
            b["beatmap_id"] = id;
            downloads.push(a);
            
            // Change Download icon to Abort icon 
            var download_button = document.getElementById(`dowload_beatmap_set_${id}`);
            if (download_button) {
                download_button.className = "fas fa-times cancel_button";
            }

            // Init the downloader
            if (!init_downloading) {
                this.init_download();
                init_downloading = true;
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
    beatmap_downloader.prototype.getDownloads = function() {
        return downloads;
    }

    // Check if beatmap is in queue,
    // look for the index and removes it from the array
    beatmap_downloader.prototype.cancel_download = function(beatmapid) {
        if (this.inQueue(beatmapid)) {
            init_download_page();
        }
    }

    beatmap_downloader.prototype.inQueue = function(id) {
        var values = Object.values(downloads);
        for (var i = 0; i < values.length; i++) {
            if (Object.keys(values[i])[0] == id) {
                downloads.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    beatmap_downloader.prototype.removeZip = function(src) {
        if (fs.existsSync(src)) {
            fs.unlink(src, (err) => {
                if (err) console.log(err);
            });
        }
    }

    // Check next download
    beatmap_downloader.prototype.check_download_queue = function() {
        if (!aborted) downloads.shift();
        if (downloads.length > 0) {
            this.init_download();
        } else {
            init_downloading = false;
        }
    }

    // Initialize the download
    beatmap_downloader.prototype.init_download = async function() {
        var {beatmap_id, download_url} = downloads[0][Object.keys(downloads[0])[0]];

        init_request = request(download_url);
        var that = this;

        progress(init_request).on('progress', function(state) {
            var speed = (state.speed ? (state.speed / 1000000).toFixed(2) + " MB/s" : "Waiting for download");
            var percent = (state.percent ? state.percent * 100 : 0);
            update_download_info(speed, percent);

            // Check if the first download is not removed
            // If the download has been removed
            // Remove zip
            var test = (downloads[0] ? downloads[0][Object.keys(downloads[0])[0]] : null);
            if (test == null || test['beatmap_id'] != beatmap_id) {
                that.abort();
                that.removeZip(path.join(appDataTemp, beatmap_id + '.zip'));
            }

        }).on('error', function(err) {
            console.log(err);
            that.check_download_queue();
        }).on('end', function() {
            // If the download hasn't been aborted
            // Hide the download button
            // Extract the .osu
            if (!aborted){
                var download_button = document.getElementById(`dowload_beatmap_set_${beatmap_id}`);
                if (download_button) download_button.style.display = "none";
                extract_downloaded_file(beatmap_id);
            }
            that.check_download_queue();
            aborted = false;
            init_download_page();
        }).pipe(fs.createWriteStream(path.join(appDataTemp, beatmap_id + '.zip')));
    }

    //abort the download
    beatmap_downloader.prototype.abort = function() {
        aborted = true;
        init_request.abort();
    }
}

module.exports = new beatmap_downloader();