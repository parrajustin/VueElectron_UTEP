import { app, BrowserWindow, Menu } from 'electron';
/**
 *   File system utilities, https://github.com/szwacz/fs-jetpack
 *   @type {Module}
 */
import jet from 'fs-jetpack';

//
//                                             iiii
//                                            i::::i
//                                             iiii
//
//  wwwwwww           wwwww           wwwwwwwiiiiiiinnnn  nnnnnnnn
//   w:::::w         w:::::w         w:::::w i:::::in:::nn::::::::nn
//    w:::::w       w:::::::w       w:::::w   i::::in::::::::::::::nn
//     w:::::w     w:::::::::w     w:::::w    i::::inn:::::::::::::::n
//      w:::::w   w:::::w:::::w   w:::::w     i::::i  n:::::nnnn:::::n
//       w:::::w w:::::w w:::::w w:::::w      i::::i  n::::n    n::::n
//        w:::::w:::::w   w:::::w:::::w       i::::i  n::::n    n::::n
//         w:::::::::w     w:::::::::w        i::::i  n::::n    n::::n
//          w:::::::w       w:::::::w        i::::::i n::::n    n::::n
//           w:::::w         w:::::w         i::::::i n::::n    n::::n
//            w:::w           w:::w          i::::::i n::::n    n::::n
//             www             www           iiiiiiii nnnnnn    nnnnnn
//

/**
 *   Creates the Main window and has the ability to remember its previous position
 *   @method winFactory
 *   @param  {string} name    the name of this window
 *   @param  {obj} options option parameters
 *   @return {obj}         window object
 */
function winFactory(name, options) {
  const { screen } = require('electron');  // eslint-disable-line

  const userDataDir = jet.cwd(app.getPath('userData'));
  const defaultSize = {
    width: options.width,
    height: options.height,
  };
  let state = {};
  let win;

  /**
   *   Tries to restore the window to a previous state
   *   @method restore
   *   @return {Object} the previous window state
   */
  const restore = function restore() {
    let restoredState = {};
    try {
      restoredState = userDataDir.read('window-state.json', 'json');
    } catch (err) {
      // For some reason json can't be read (might be corrupted).
      // No worries, we have defaults.
    }
    return Object.assign({}, defaultSize, restoredState);
  };

  /**
   *   Gets the current position of the window
   *   @method getCurrentPosition
   *   @return {Object}           an object that contains the the state of the window
   */
  const getCurrentPosition = function getCurrentPosition() {
    const position = win.getPosition();
    const size = win.getSize();
    return {
      x: position[0],
      y: position[1],
      width: size[0],
      height: size[1],
    };
  };

  /**
   *   are the bounds within a window
   *   @method windowWithinBounds
   *   @param  {object}           windowState a window state from electron
   *   @param  {object}           bounds      the bounds of a window
   *   @return {boolean}                       true if the bounds are within a window
   */
  const windowWithinBounds = function windowWithinBounds(windowState, bounds) {
    return windowState.x >= bounds.x && windowState.y >= bounds.y &&
      windowState.x + windowState.width <= bounds.x + bounds.width &&
      windowState.y + windowState.height <= bounds.y + bounds.height;
  };

  /**
   *   sets the properties to their default values
   *   @method resetToDefaults
   *   @param  {Object}        windowState The screen of the primary display
   *   @return {Object}        default window state
   */
  const resetToDefaults = function resetToDefaults() {
    const bounds = screen.getPrimaryDisplay().bounds;
    return Object.assign({}, defaultSize, {
      x: (bounds.width - defaultSize.width) / 2,
      y: (bounds.height - defaultSize.height) / 2,
    });
  };

  /**
   *   Makes sure the window is visible on display
   *   @method ensureVisibleOnSomeDisplay
   *   @param  {Object}                   windowState [description]
   *   @return {Object}                               A valid window state
   */
  const ensureVisibleOnSomeDisplay = function ensureVisibleOnSomeDisplay(windowState) {
    const visible = screen.getAllDisplays().some((display) => windowWithinBounds(windowState, display.bounds));
    if (!visible) {
      // Window is partially or fully not visible now.
      // Reset it to safe defaults.
      return resetToDefaults();
    }
    return windowState;
  };

  /**
   *   save the window state on close
   *   @method saveState
   */
  const saveState = function saveState() {
    if (!win.isMinimized() && !win.isMaximized()) {
      Object.assign(state, getCurrentPosition());
    }
    userDataDir.write('window-state.json', state);
    win.removeListener('close', saveState);
  };

  state = ensureVisibleOnSomeDisplay(restore());
  win = new BrowserWindow(Object.assign({}, options, state));
  win.on('close', saveState);

  return win;
}

//
//     mmmmmmm    mmmmmmm       eeeeeeeeeeee    nnnn  nnnnnnnn    uuuuuu    uuuuuu
//   mm:::::::m  m:::::::mm   ee::::::::::::ee  n:::nn::::::::nn  u::::u    u::::u
//  m::::::::::mm::::::::::m e::::::eeeee:::::een::::::::::::::nn u::::u    u::::u
//  m::::::::::::::::::::::me::::::e     e:::::enn:::::::::::::::nu::::u    u::::u
//  m:::::mmm::::::mmm:::::me:::::::eeeee::::::e  n:::::nnnn:::::nu::::u    u::::u
//  m::::m   m::::m   m::::me:::::::::::::::::e   n::::n    n::::nu::::u    u::::u
//  m::::m   m::::m   m::::me::::::eeeeeeeeeee    n::::n    n::::nu::::u    u::::u
//  m::::m   m::::m   m::::me:::::::e             n::::n    n::::nu:::::uuuu:::::u
//  m::::m   m::::m   m::::me::::::::e            n::::n    n::::nu:::::::::::::::uu
//  m::::m   m::::m   m::::m e::::::::eeeeeeee    n::::n    n::::n u:::::::::::::::u
//  m::::m   m::::m   m::::m  ee:::::::::::::e    n::::n    n::::n  uu::::::::uu:::u
//  mmmmmm   mmmmmm   mmmmmm    eeeeeeeeeeeeee    nnnnnn    nnnnnn    uuuuuuuu  uuuu
//
/**
 *   Creates the menu for the window
 *   @method toolMenu
 *   @param  {Object} mainWindow the electron window
 *   @return {Object}            menu template
 */
function toolMenu(mainWindow) {
  let template;

  if (process.platform === 'darwin') {
    template = [{
      label: 'Electron',
      submenu: [{
        label: 'About ElectronReact',
        selector: 'orderFrontStandardAboutPanel:'
      }, {
        type: 'separator'
      }, {
        label: 'Services',
        submenu: []
      }, {
        type: 'separator'
      }, {
        label: 'Hide ElectronReact',
        accelerator: 'Command+H',
        selector: 'hide:'
      }, {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        selector: 'hideOtherApplications:'
      }, {
        label: 'Show All',
        selector: 'unhideAllApplications:'
      }, {
        type: 'separator'
      }, {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() {
          app.quit();
        }
      }]
    }, {
      label: 'Edit',
      submenu: [{
        label: 'Undo',
        accelerator: 'Command+Z',
        selector: 'undo:'
      }, {
        label: 'Redo',
        accelerator: 'Shift+Command+Z',
        selector: 'redo:'
      }, {
        type: 'separator'
      }, {
        label: 'Cut',
        accelerator: 'Command+X',
        selector: 'cut:'
      }, {
        label: 'Copy',
        accelerator: 'Command+C',
        selector: 'copy:'
      }, {
        label: 'Paste',
        accelerator: 'Command+V',
        selector: 'paste:'
      }, {
        label: 'Select All',
        accelerator: 'Command+A',
        selector: 'selectAll:'
      }]
    }, {
      label: 'View',
      submenu: (process.env.NODE_ENV === 'development') ? [{
        label: 'Reload',
        accelerator: 'Command+R',
        click() {
          mainWindow.webContents.reload();
        }
      }, {
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Command+F',
        click() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
      }, {
        label: 'Toggle Developer Tools',
        accelerator: 'Alt+Command+I',
        click() {
          mainWindow.toggleDevTools();
        }
      }] : [{
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Command+F',
        click() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
      }]
    }, {
      label: 'Window',
      submenu: [{
        label: 'Minimize',
        accelerator: 'Command+M',
        selector: 'performMiniaturize:'
      }, {
        label: 'Close',
        accelerator: 'Command+W',
        selector: 'performClose:'
      }, {
        type: 'separator'
      }, {
        label: 'Bring All to Front',
        selector: 'arrangeInFront:'
      }]
    }];
  } else {
    template = [{
      label: '&File',
      submenu: [{
        label: '&Open',
        accelerator: 'Ctrl+O'
      }, {
        label: '&Close',
        accelerator: 'Ctrl+W',
        click() {
          mainWindow.close();
        }
      }]
    }, {
      label: 'Edit',
      submenu: [{
        label: 'Undo',
        accelerator: 'Command+Z',
        selector: 'undo:'
      }, {
        label: 'Redo',
        accelerator: 'Shift+Command+Z',
        selector: 'redo:'
      }, {
        type: 'separator'
      }, {
        label: 'Cut',
        accelerator: 'Command+X',
        selector: 'cut:'
      }, {
        label: 'Copy',
        accelerator: 'Command+C',
        selector: 'copy:'
      }, {
        label: 'Paste',
        accelerator: 'Command+V',
        selector: 'paste:'
      }, {
        label: 'Select All',
        accelerator: 'Command+A',
        selector: 'selectAll:'
      }]
    }, {
      label: '&View',
      submenu: (process.env.NODE_ENV === 'development') ? [{
        label: '&Reload',
        accelerator: 'Ctrl+R',
        click() {
          mainWindow.webContents.reload();
        }
      }, {
        label: 'Toggle &Full Screen',
        accelerator: 'F11',
        click() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
      }, {
        label: 'Toggle &Developer Tools',
        accelerator: 'Alt+Ctrl+I',
        click() {
          mainWindow.toggleDevTools();
        }
      }] : [{
        label: 'Toggle &Full Screen',
        accelerator: 'F11',
        click() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
      }]
    }];
  }

  return template;
}

module.exports = {
  winFactory,
  toolMenu
};
