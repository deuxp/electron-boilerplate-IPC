const { net, app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require("electron-squirrel-startup")) {
  app.quit();
}

let win;
function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    // icon: "public/favicon.ico",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      nodeIntegrationInWorker: false,
      webviewTag: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  // win.loadFile("index.html");
  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

/////////////////////////
// Security listeners //
///////////////////////

// if a new webview is loaded: prevent event
app.on("web-contents-created", (event, contents) => {
  contents.on("will-attach-webview", (event, webPreferences, params) => {
    // Strip away preload scripts if unused or verify their location is legitimate
    delete webPreferences.preload;

    // Disable Node.js integration
    webPreferences.nodeIntegration = false;

    // prevent the event
    event.preventDefault();
  });
});

// listens for page navigation & stops
app.on("web-contents-created", (event, contents) => {
  contents.on("will-navigate", (event, navigationUrl) => {
    event.preventDefault();
  });
});

app.on("web-contents-created", (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    event.preventDefault();
    return { action: "deny" };
  });
});

/////////////////
// Net Module //
///////////////

function handleRequest(url, cb) {
  const request = net.request(url);
  request.on("response", response => {
    const data = [];
    response.on("data", chunk => {
      data.push(chunk);
    });
    response.on("end", () => {
      const json = Buffer.concat(data).toString();
      cb(json);
    });
  });
  request.on("error", () => {
    console.log("Something went wrong with the internet");
    cb(null);
  });
  request.end();
}

///////////////////
// Ipc Handler //
/////////////////

ipcMain.handle("getCharacter", event => {
  const senderFrame = event.senderFrame.url;
  if (!validateSenderFrame(senderFrame)) return;
  const apiUrl = generateUrl();
  if (validate(apiUrl.host)) {
    handleRequest(apiUrl.href, response => {
      win.webContents.send("renderProcListener", response);
    });
  }
});

///////////////////////
// Helper functions //
/////////////////////

function getRandomIndex() {
  let num;
  const characterListLength = 826;
  num = Math.random() * characterListLength;
  num = Math.floor(num);
  num = num > 0 ? num : 1;
  return num.toString();
}

function validate(host) {
  const validateHost = "rickandmortyapi.com";
  return host === validateHost;
}

// returns url object
function generateUrl() {
  const index = getRandomIndex();
  const api = new URL("https://rickandmortyapi.com");
  const resource = `api/character/${index}`;
  api.pathname = resource;
  return api;
}

function validateSenderFrame(frame) {
  if (isDev) {
    const host = "localhost:3000";
    const frameSender = new URL(frame).host;
    return frameSender === host;
  }
  const ext = ".html";
  const name = "index";
  const file = path.parse(frame);
  return file.name === name && file.ext === ext;
}
