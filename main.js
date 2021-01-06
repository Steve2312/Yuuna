const { app, BrowserWindow, ipcMain } = require('electron');
const RPC = require("discord-rpc");
if (process.env.NODE_ENV == 'development') require('dotenv').config();

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        minHeight: 700,
        minWidth: 800,
        frame: false,
        backgroundColor: '#1e1e1e',
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    })

    win.webContents.on('did-finish-load', () => {
        // turn on in production
        // win.setMenu(null);
        win.webContents.setZoomFactor(1);
        win.webContents.setVisualZoomLevelLimits(1,1);
    });

    win.loadFile("lib/main.html");
    //win.webContents.openDevTools()
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
})

const browser = typeof window !== 'undefined';
const rpc = new RPC.Client({ transport: browser ? 'websocket' : 'ipc' })

rpc.on("ready", () => {
    rpc.clearActivity();
});

rpc.login({
    clientId: process.env.DISCORD_CLIENT_ID
})

ipcMain.on('updateRPC', (event, arg) => {
    rpc.clearActivity();
    if(arg[0] == 'playing') {
        rpc.setActivity({
            details: arg[1],
            state: "By: " + arg[2],
            largeImageKey:  "icon",
            largeImageText: "Playlist: " + arg[3],
            smallImageKey: "playing",
            smallImageText: "Beatmap ID: " + arg[4],
            startTimestamp: new Date(),
            endTimestamp: arg[5],
            instance: true
        });
    }
    if(arg[0] == 'paused') {
        rpc.clearActivity();
    }
});
