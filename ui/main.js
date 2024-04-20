const {app, BrowserWindow} = require('electron')
const url = require("url");
const path = require("path");

require('electron-reload')(__dirname, {
	electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
});

let mainWindow

function createWindow () {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 480,
		webPreferences: {
			nodeIntegration: true,
		  webSecurity: false
    },
    fullscreen: true,
    useContentSize: true
	})

	mainWindow.loadURL(
		url.format({
			pathname: path.join(__dirname, `/dist/index.html`),
			protocol: "file:",
			slashes: true
		})
	);
	// Open the DevTools.
	//mainWindow.webContents.openDevTools()
  mainWindow.maximize()

	mainWindow.on('closed', function () {
		mainWindow = null
	})
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
	if (mainWindow === null) createWindow()
})
