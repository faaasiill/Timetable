const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const notifier = require('node-notifier');
const soundPlay = require('sound-play');

let mainWindow;
let tray;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  mainWindow.loadFile('index.html');
  
  // Hide window instead of closing when user clicks the 'X'
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'assets', 'icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Show App', 
      click: () => mainWindow.show() 
    },
    { 
      label: 'Quit', 
      click: () => {
        isQuitting = true;
        app.quit();
      } 
    }
  ]);
  
  tray.setToolTip('Study Timer');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  isQuitting = true;
});

// IPC handlers
ipcMain.handle('show-notification', async (event, { title, message }) => {
  notifier.notify({
    title: title,
    message: message,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    sound: true,
    wait: true
  });
  
  return true;
});

ipcMain.handle('play-sound', async () => {
  try {
    await soundPlay.play(path.join(__dirname, 'assets', 'alarm.mp3'));
    return true;
  } catch (error) {
    console.error('Error playing sound:', error);
    return false;
  }
});