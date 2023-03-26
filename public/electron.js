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
///////////////
// API URLS //
/////////////

const deployBase = "http://localhost:8080";
// const deployBase = "https://rnm-login-server-production.up.railway.app";

const refresh = `${deployBase}/api/user/refresh`;
const login = `${deployBase}/api/user/login`;
const register = `${deployBase}/api/user/register`;
const reset = `${deployBase}/api/reset`;
const newPassword = `${deployBase}/api/reset/new-password`;

// Set a cookie with the given cookie data;
// may overwrite equivalent cookies if they exist.
function setCookie(rawCookie) {
  const { name, value } = splitCookie(rawCookie);
  const cookie = {
    url: deployBase,
    // url: "http://localhost:8080",
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
    cb(null);
  }
}

async function postNewPassword(url, credentials) {
  const { email, password, password_confirm } = credentials;
  // console.log(credentials);
  try {
    const res = await axios.post(
      url,
      {
        email,
        password,
        password_confirm,
      },
      { withCredentials: true }
    );
    const data = JSON.stringify(res.data);
    return data;
  } catch (error) {
    console.log(
      "Main::problem posting new password, server error?: ",
      error.message
    );
    return '{"update": false}';
  }
}

async function resetPassword(url, email) {
  try {
    const res = await axios.post(
      url,
      {
        email,
      },
      { withCredentials: true }
    );
    const data = JSON.stringify(res.data);
    return data;
  } catch (error) {
    console.log(
      "Main::problem resetting password, server error?: ",
      error.message
    );
    return '{"reset": false}';
  }
}

async function registerNewUser(url, credentials) {
  // console.log("axios sending credentials", credentials);
  try {
    const res = await axios.post(
      url,
      {
        email: credentials?.email,
        password: credentials?.password,
        password_confirm: credentials?.password_confirm,
        name: credentials?.name,
      },
      { withCredentials: true }
    );
    const data = JSON.stringify(res.data);
    return data;
  } catch (error) {
    console.log("New user not registered: ", error.message);
    return '{"register": false}';
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
    console.log("login request: ", error.message);
    return '{"login": false}';
  }
}

///////////////////
// Ipc Handler //
/////////////////

ipcMain.handle("getCharacter", async event => {
  const senderFrame = event.senderFrame.url;
  if (!validateSenderFrame(senderFrame)) return;
  const getOptions = {
    url: `${deployBase}/api/characters`,
    method: "GET",
    credentials: "include",
    session: sesh,
  };
  handleRequest(getOptions, response => {
    win.webContents.send("renderProcListener", response);
  });
});

ipcMain.handle("verifyAccess", async event => {
  const senderFrame = event.senderFrame.url;
  if (!validateSenderFrame(senderFrame)) return;
  const getOptions = {
    url: `${deployBase}/api/user`,
    method: "GET",
    credentials: "include",
    session: sesh,
  };
  handleRequest(getOptions, response => {
    console.log(response);
    win.webContents.send("renderAccess", response);
  });
});

ipcMain.handle("refreshAccess", async event => {
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
    win.webContents.send("renderRefreshAccess", response);
  });
});

////////////// ///////
// RESET PASSWORD  //
////////////// /////

ipcMain.handle("resetPassword", async (event, email) => {
  const senderFrame = event.senderFrame.url;
  if (!validateSenderFrame(senderFrame)) return;
  // POST options function
  const newPassword = await resetPassword(reset, email);
  console.log(newPassword);
  win.webContents.send("renderResetPassword", newPassword);
});

////////////// /////////
// POST NEW PASSWORD //
////////////// ///////

ipcMain.handle("postNewPassword", async (event, credentials) => {
  credentials = JSON.parse(credentials);
  const senderFrame = event.senderFrame.url;
  if (!validateSenderFrame(senderFrame)) return;
  const postPassword = await postNewPassword(newPassword, credentials);
  win.webContents.send("renderNewPassword", postPassword);
});

//////////////
// REGISTER //
//////////////

ipcMain.handle("register", async (event, credentials) => {
  credentials = JSON.parse(credentials);
  const senderFrame = event.senderFrame.url;
  if (!validateSenderFrame(senderFrame)) return;
  const registerStatus = await registerNewUser(register, credentials);
  win.webContents.send("renderRegister", registerStatus);
});

////////////
// LOGIN //
//////////

ipcMain.handle("login", async (event, credentials) => {
  credentials = JSON.parse(credentials);
  const senderFrame = event.senderFrame.url;
  if (!validateSenderFrame(senderFrame)) return;
  const loginStatus = await postLoginCredentials(login, credentials);
  win.webContents.send("renderLogin", loginStatus);
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
