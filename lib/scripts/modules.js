const fs = require('fs');
const path = require("path");
const { shell } = require('electron');
const request = require('request');
const progress = require('request-progress');
const { exec } = require('child_process');
const extract = require('extract-zip');
var { Howl } = require('howler');
const { ipcRenderer } = require('electron')
// My classes

const utils = require('./scripts/utils.js');
const player = require('./scripts/player.js');
const beatmap_dl = require('./scripts/beatmap_dl.js');


window.onload = async function() {
    await player.build();
}

var appData;
var appDataTemp;
var appDataSongs;

ipcRenderer.on('appdata-reply', (event, arg) => {
    appData = arg;
    appDataTemp = path.join(appData, 'temp');
    // Create temp folder if there is none
    if (!fs.existsSync(appDataTemp)) {
        fs.mkdirSync(appDataTemp);
    }
    appDataSongs = path.join(appData, 'songs');
    // Create song folder if there is none
    if (!fs.existsSync(appDataSongs)) {
        fs.mkdirSync(appDataSongs);
    }
});
ipcRenderer.send('appdata');