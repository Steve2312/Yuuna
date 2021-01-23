const win = remote.getCurrentWindow();

document.onreadystatechange = (event) => {
    if (document.readyState == "complete") {
        handleWindowControls();
    }
};

window.onbeforeunload = (event) => {
    win.removeAllListeners();
}

function handleWindowControls() {
    // Make minimise/maximise/restore/close buttons work when they are clicked
    document.getElementById('min-button').addEventListener("click", event => {
        win.minimize();
    });

    document.getElementById('max-button').addEventListener("click", event => {
        if (win.isMaximized()) {
            win.unmaximize();
        } else {
            win.maximize();
        }
    });

    document.getElementById('close-button').addEventListener("click", event => {
        win.close();
    });
}

ipcRenderer.on('browser', async (event, arg) => {
    var link = arg.toString().replace("--allow-file-access-from-files," , "");
    link = link.split(":")
    if (link[1] == "beatmapset") {
        var beatmapset = link[2];
    }
});