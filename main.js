// Modules to control application life and create native browser window
const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

// Force Single Instance Application
const onlyOneInstance = app.requestSingleInstanceLock();
if (onlyOneInstance) {
  app.on("second-instance", (e, argv) => {
    // Someone tried to run a second instance, we should focus our window.

    // Protocol handler for win32
    // argv: An array of the second instance’s (command line / deep linked) arguments
    if (process.platform == "win32") {
      // Keep only command line / deep linked arguments
      openAppHandlerUrl = argv.slice(1);
    }
    logEverywhere("app.makeSingleInstance# " + openAppHandlerUrl);

    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
} else {
  app.quit();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    icon: "./youtube-icon.png",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile("index.html");

  mainWindow.webContents.openDevTools();

  // Protocol handler for win32
  if (process.platform == "win32" && process.argv.slice(1).length > 0) {
    // Keep only command line / deep linked arguments
    openAppHandlerUrl = process.argv.slice(1);
    logEverywhere(
      "createWindow: APP ABERTO COM O HANDLER => " + openAppHandlerUrl
    );
  }

  // Emitted when the window is closed.
  mainWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

if (!app.isDefaultProtocolClient("electron-handler")) {
  // Define custom protocol handler. Deep linking works on packaged versions of the application!
  app.setAsDefaultProtocolClient("electron-handler");
}

app.on("will-finish-launching", function () {
  // Protocol handler for osx
  app.on("open-url", function (event, url) {
    event.preventDefault();
    openAppHandlerUrl = url;
    logEverywhere(
      "open-url: HANDLER CLICADO COM APP ABERTO => " + openAppHandlerUrl
    );
  });
});

// Loga tanto no devtools da aplicação quanto no terminal node rodando a aplicação
function logEverywhere(s) {
  console.log(s);
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.executeJavaScript(`console.log("${s}")`);
  }
}
