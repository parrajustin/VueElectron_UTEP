import { app, BrowserWindow, Menu, shell } from 'electron';
import jet from 'fs-jetpack';
import util from './utils/util';

let menu;
let template;
/**
 *   Main Electron window object
 *   @type {Object}
 */
let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support'); // eslint-disable-line
  sourceMapSupport.install();

  app.setPath('userData', `${app.getPath('userData')}/${app.getVersion()}`);
}

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')(); // eslint-disable-line global-require
  const path = require('path'); // eslint-disable-line
  const p = path.join(__dirname, '..', 'app', 'node_modules'); // eslint-disable-line
  require('module').globalPaths.push(p); // eslint-disable-line

  app.setPath('userData', `${jet.cwd()}/appData/${app.getVersion()}`);
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

/**
 *   Installs the development Tools
 *   @method installExtensions
 *   @return {Promise}         installs tools
 */
const installExtensions = async () => {
  if (process.env.NODE_ENV === 'development') {
    const installer = require('electron-devtools-installer'); // eslint-disable-line global-require

    const extensions = [
      'REACT_DEVELOPER_TOOLS',
      'REDUX_DEVTOOLS'
    ];

    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;

    // TODO: Use async interation statement.
    //       Waiting on https://github.com/tc39/proposal-async-iteration
    //       Promises will fail silently, which isn't what we want in development
    Promise
      .all(extensions.map(name => installer.default(installer[name], forceDownload)))
      .catch(console.log);
  }
};

app.on('ready', async () => {
  await installExtensions();

  mainWindow = util.winFactory(
    'main', {
      width: 1024,
      height: 728,
      backgroundColor: '#ffffff',
      show: false
    }
  );

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.openDevTools();
    mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([{
        label: 'Inspect element',
        click() {
          mainWindow.inspectElement(x, y);
        }
      }]).popup(mainWindow);
    });
  }

  template = util.toolMenu(mainWindow);
  menu = Menu.buildFromTemplate(template);
  mainWindow.setMenu(menu);
});
