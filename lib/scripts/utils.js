class Utils {
    format_seconds(totalSeconds) {
        var hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        var minutes = Math.floor(totalSeconds / 60);
        var seconds = Math.floor(totalSeconds % 60);

        if (hours < 10) { hours = "0" + hours }
        if (minutes < 10) { minutes = "0" + minutes }
        if (seconds < 10) { seconds = "0" + seconds }

        if (isNaN(hours)) { hours = "00" }
        if (isNaN(minutes)) { minutes = "00" }
        if (isNaN(seconds)) { seconds = "00" }

        if (hours == '00'){
            return (`${minutes}:${seconds}`)
        } else {
            return (`${hours}:${minutes}:${seconds}`)
        }
    }
}

module.exports = Utils;