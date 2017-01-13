'use strict';
const {app, BrowserWindow, Menu} = require('electron');

/** @type {Module} Is utility, https://github.com/delvedor/electron-is */
const is = require('electron-is');
/** @type {Module} utilities for working with file and directory paths */
const path = require('path');
/** @type {Object} edit application menu */
const edit = require('./main_includes/edit.js');
/** @type {Module} File system utilities, https://github.com/szwacz/fs-jetpack */
const jet = require('fs-jetpack');
/** @type {Object} development application menu */
const dev = require('./main_includes/dev.js');
/** @type {Object} Electron utilities */
const util = require('./main_includes/util.js');

/** @type {Object} Main Electron window object */
let mainWindow = null;
let config = {};

if (is.dev()) {
  config = require('../config');
  config.url = `http://localhost:${config.port}`;

  // sets save data to this directory
  app.setPath('userData', jet.cwd() + '/appData/' + app.getVersion());
} else {
  config.devtron = false;
  config.url = `file://${__dirname}/dist/index.html`;

  app.setPath('userData', app.getPath('userData') + '/' + app.getVersion());
}

/**
 *   Sets the application menu
 *   @method setApplicationMenu
 */
const setApplicationMenu = function() {
  const menus = [edit];
  if (is.dev())
    menus.push(dev);

  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};


/** Creates the Main window */
function createWindow() {
  setApplicationMenu();

  /**
   * Initial window options
   */
  mainWindow = util.winFactory(
    'main', {
      width: 500, height: 500,
      backgroundColor: '#ffffff',
    }
  );

  mainWindow.loadURL(config.url);

  if (is.dev()) {
    BrowserWindow.addDevToolsExtension(path.join(__dirname, '../node_modules/devtron'));

    const installExtension = require('electron-devtools-installer');
    const {VUEJS_DEVTOOLS} = require('electron-devtools-installer');

    installExtension.default(VUEJS_DEVTOOLS)
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((err) => console.log('An error occurred: ', err));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

//
//    aaaaaaaaaaaaa  ppppp   ppppppppp   ppppp   ppppppppp
//    a::::::::::::a p::::ppp:::::::::p  p::::ppp:::::::::p
//    aaaaaaaaa:::::ap:::::::::::::::::p p:::::::::::::::::p
//             a::::app::::::ppppp::::::ppp::::::ppppp::::::p
//      aaaaaaa:::::a p:::::p     p:::::p p:::::p     p:::::p
//    aa::::::::::::a p:::::p     p:::::p p:::::p     p:::::p
//   a::::aaaa::::::a p:::::p     p:::::p p:::::p     p:::::p
//  a::::a    a:::::a p:::::p    p::::::p p:::::p    p::::::p
//  a::::a    a:::::a p:::::ppppp:::::::p p:::::ppppp:::::::p
//  a:::::aaaa::::::a p::::::::::::::::p  p::::::::::::::::p
//   a::::::::::aa:::ap::::::::::::::pp   p::::::::::::::pp
//    aaaaaaaaaa  aaaap::::::pppppppp     p::::::pppppppp
//                    p:::::p             p:::::p
//                    p:::::p             p:::::p
//                   p:::::::p           p:::::::p
//                   p:::::::p           p:::::::p
//                   p:::::::p           p:::::::p
//                   ppppppppp           ppppppppp
//
app.on('ready', createWindow);

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  if (mainWindow === null) {
    createWindow();
  }
});
