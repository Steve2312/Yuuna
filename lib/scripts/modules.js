const fs = require('fs');
const path = require("path");
const { shell } = require('electron');
const request = require('request');
const progress = require('request-progress');
const { exec } = require('child_process');
const extract = require('extract-zip');
var { Howl } = require('howler');

const Utils = require('./scripts/utils.js');
const Player = require('./scripts/player.js');

const utils = new Utils();
const player = new Player();

window.onload = async function() {
    await player.build();
}