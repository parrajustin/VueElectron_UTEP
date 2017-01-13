const {app, BrowserWindow} = require('electron');

const devMenu = {
  label: 'Development',
  submenu: [
    {
      label: 'Reload',
      accelerator: 'CmdOrCtrl+R',
      click: function() {
        BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache();
      },
    }, {
      label: 'Toggle DevTools',
      accelerator: 'Alt+CmdOrCtrl+I',
      click: function() {
        BrowserWindow.getFocusedWindow().toggleDevTools();
      },
    }, {
      label: 'Quit',
      accelerator: 'CmdOrCtrl+Q',
      click: function() {
        app.quit();
      },
    },
  ],
};

module.exports = devMenu;
