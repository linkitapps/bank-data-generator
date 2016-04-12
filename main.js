if(require('electron-squirrel-startup')) return;
var app = require('app');
var BrowserWindow = require('browser-window');

var autoUpdater = require('auto-updater');
var dialog = require('dialog');
autoUpdater.setFeedURL("http://findash.io/app");
autoUpdater.checkForUpdates();

var mainWindow = null;

app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', function() {
  autoUpdater.on("update-downloaded", function(){
    var index = dialog.showMessageBox({
      message: "업데이트가 있습니다.",
      detail: "프로그램을 종료하고 다시 시작 합니다.",
      buttons: ["지금 다시 시작", "다음에"]
    })

    if (index === 0) {
      autoUpdater.quitAndInstall();
    }

  });

  autoUpdater.on("update-not-available", function(){
    dialog.showMessageBox({
      message: "업데이트가 없습니다.",
      buttons: ["OK"]
    });
  });

  autoUpdater.on("error", function(Error){
    dialog.showMessageBox({
      message: Error,
      buttons: ["OK"]
    });
  });

  mainWindow = new BrowserWindow({width: 800, height: 600});

  mainWindow.loadURL('file://' + __dirname + '/index.html');

  //mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});