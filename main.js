const { app, BrowserWindow, ipcMain } = require('electron')
const {download} = require('electron-dl');
app.commandLine.appendSwitch("disable-http-cache");
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

    win.loadFile("lib/main.html")
    //win.webContents.openDevTools()
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})