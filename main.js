const { app, BrowserWindow, ipcMain } = require('electron');

if (process.env.NODE_ENV == 'production') require('dotenv').config();

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        minHeight: 700,
        minWidth: 800,
        webPreferences: {
            nodeIntegration: true
        }
    })

    win.loadFile("lib/main.html");
    //win.webContents.openDevTools()

    ipcMain.on('appdata', (event, arg) => {
        event.reply('appdata-reply', app.getPath('userData'));
    });
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