/** @type {Module} File system utilities, https://github.com/szwacz/fs-jetpack */
const jet = require('fs-jetpack');
const {app, BrowserWindow} = require('electron');

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
  const {screen} = require('electron');

  const userDataDir = jet.cwd(app.getPath('userData'));
  let defaultSize = {
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
  let restore = function() {
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
  let getCurrentPosition = function() {
    let position = win.getPosition();
    let size = win.getSize();
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
  let windowWithinBounds = function(windowState, bounds) {
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
  let resetToDefaults = function() {
    let bounds = screen.getPrimaryDisplay().bounds;
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
  let ensureVisibleOnSomeDisplay = function(windowState) {
    let visible = screen.getAllDisplays().some(function(display) {
      return windowWithinBounds(windowState, display.bounds);
    });
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
  let saveState = function() {
    if (!win.isMinimized() && !win.isMaximized()) {
      Object.assign(state, getCurrentPosition());
    }
    userDataDir.write('window-state.json', state);
    win.removeListener('close', saveState);
  };

  state = ensureVisibleOnSomeDisplay(restore());
  win = new BrowserWindow(Object.assign({}, options, state));
  win.on('close', saveState);

  win.once('ready-to-show', () => {
    win.show();
    win.focus();
  });

  return win;
}

module.exports = {
  winFactory,
};
