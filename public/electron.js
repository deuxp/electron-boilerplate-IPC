const { session, net, app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const axios = require("axios");

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
let sesh;
app
  .whenReady()
  .then(createWindow)
  .then(() => {
    // Default Session
    sesh = session.defaultSession;
  });

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

//////////////////////
// Session-cookies //
////////////////////

function splitCookie(string) {
  let partition = string.indexOf("=");
  let end = string.indexOf(";");
  let name = string.slice(0, partition);
  let value = string.slice(partition + 1, end);

  return { name, value };
}

const refresh = "http://localhost:8080/api/user/refresh";
const login = "http://localhost:8080/api/user/login";

// Set a cookie with the given cookie data;
// may overwrite equivalent cookies if they exist.
function setCookie(rawCookie) {
  const { name, value } = splitCookie(rawCookie);
  const cookie = {
    url: "http://localhost:8080",
    name,
    value,
    httpOnly: true,
    path: "/",
    secure: true,
    sameSite: "strict",
    expirationDate: 1742054595000,
  };
  sesh.cookies.set(cookie).then(
    () => {
      // console.log(`\n${name} cookie is set\n`);
    },
    error => {
      console.error(error);
    }
  );
}

/////////////////
// Net Module //
///////////////

function handleRequest(options, cb) {
  try {
    const request = net.request(options);
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
  } catch (error) {
    console.log("handleRequest: ", error);
    return null;
  }
}

async function postLoginCredentials(url, credentials) {
  try {
    const res = await axios.post(
      url,
      {
        email: credentials?.email,
        password: credentials?.password,
      },
      { withCredentials: true }
    );
    // array of 2 raw cookie dough
    const cookies = res.headers["set-cookie"];
    setCookie(cookies[0]);
    setCookie(cookies[1]);

    console.log(res.data);
    const data = JSON.stringify(res.data);
    return data;
  } catch (error) {
    console.log("login request: ", error);
  }
}

///////////////////
// Ipc Handler //
/////////////////

ipcMain.handle("getCharacter", async event => {
  const senderFrame = event.senderFrame.url;
  if (!validateSenderFrame(senderFrame)) return;
  const getOptions = {
    url: "http://localhost:8080/api/characters",
    method: "GET",
    credentials: "include",
    session: sesh,
  };
  handleRequest(getOptions, response => {
    win.webContents.send("renderProcListener", response);
  });
});

ipcMain.handle("getHoney", async event => {
  const senderFrame = event.senderFrame.url;
  if (!validateSenderFrame(senderFrame)) return;
  const getOptions = {
    url: "http://localhost:8080/api/user",
    method: "GET",
    credentials: "include",
    session: sesh,
  };
  handleRequest(getOptions, response => {
    console.log(response);
    win.webContents.send("renderHoney", response);
  });
});

ipcMain.handle("refresh", async event => {
  const senderFrame = event.senderFrame.url;
  if (!validateSenderFrame(senderFrame)) return;

  const refreshOptions = {
    url: refresh,
    method: "GET",
    credentials: "include",
    session: sesh,
  };
  handleRequest(refreshOptions, response => {
    console.log(response);
    // sesh.cookies.get({}).then(cookies => {
    //   console.log(cookies);
    // });
    win.webContents.send("renderRefresh", response);
  });
});

ipcMain.handle("login", async (event, credentials) => {
  credentials = JSON.parse(credentials);
  const senderFrame = event.senderFrame.url;
  if (!validateSenderFrame(senderFrame)) return;
  const loginCredentials = await postLoginCredentials(login, credentials);
  win.webContents.send("renderLogin", loginCredentials);
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
