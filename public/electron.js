const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const fs = require('fs');

const path = require('path');
const isDev = require('electron-is-dev');
const wallpaper = require('wallpaper');
const axios = require('axios');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({width: 945, height: 580, resizable: false, autoHideMenuBar: true, webPreferences: {nodeIntegration: true, webSecurity: false}}); //webPreferences added for developement only to get rid of cors error
//   mainWindow.isResizable(false);
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
  mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('toggle-image', (event, arg) => {
    DownloadImage(arg,event); 
});

function DownloadImage(url,event){
    axios({
        url,
        responseType: 'stream'
    }).then(response => new Promise((resolve, reject) => {
        response.data
          .pipe(fs.createWriteStream('/home/shubham/Pictures/test.jpg'))
          .on('finish', () => resolve())
          .on('error', e => reject(e));
        }))
        .then(response => {
            wallpaper.set('/home/shubham/Pictures/test.jpg');
        })
        .then(response => {
            event.sender.send('reply', 'Message');
        })
        .finally(()=>{
            // console.log("Wallpaper set successfully");
        })
}