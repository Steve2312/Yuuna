const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const RPC = require("discord-rpc");
if (process.env.NODE_ENV == 'development') require('dotenv').config();
let mainWindow = null;
let deeplinkingUrl = null;

// Force Single Instance Application
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
    return
} else {
    app.on('second-instance', (e, argv) => {
      // Someone tried to run a second instance, we should focus our window.
        if (process.platform == 'win32') {
            // Keep only command line / deep linked arguments
            deeplinkingUrl = argv.slice(1)
        }
        mainWindow.webContents.send('browser', deeplinkingUrl);
      
      if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore()
            }
            mainWindow.focus()
        }
    })
  }

function createWindow() {
    mainWindow = new BrowserWindow({
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

    mainWindow.webContents.on('did-finish-load', () => {
        // turn on in production
        // mainWindow.setMenu(null);
        mainWindow.webContents.setZoomFactor(1);
        mainWindow.webContents.setVisualZoomLevelLimits(1,1);
    });

    mainWindow.loadFile("lib/main.html");
    //mainWindow.webContents.openDevTools()

    if (process.platform == 'win32') {
        // Keep only command line / deep linked arguments
        deeplinkingUrl = process.argv.slice(1)
    }
    mainWindow.webContents.once('dom-ready', () => {
        mainWindow.webContents.send('browser', deeplinkingUrl);
    });
}

// Create myWindow, load the rest of the app, etc...
app.on("ready", createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
})

app.setAsDefaultProtocolClient('yuuna');


// Discord RPC
const rpc = new RPC.Client({ transport: typeof window !== 'undefined' ? 'websocket' : 'ipc' })
rpc.login({clientId: process.env.DISCORD_CLIENT_ID});
ipcMain.on('updateRPC', async (event, arg) => {
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
            instance: false
        });
    }
    if(arg[0] == 'paused') {
        rpc.clearActivity();
    }
});
