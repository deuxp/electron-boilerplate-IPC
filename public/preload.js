const { contextBridge, ipcRenderer } = require("electron");

const ipcBridge = {
  fetchCharacter: callback => {
    ipcRenderer.invoke("getCharacter");
    const listener = ipcRenderer.on("renderProcListener", (event, res) => {
      const data = JSON.parse(res);
      callback(data);
      listener.removeAllListeners("renderProcListener");
    });
  },
  getHoney: callback => {
    ipcRenderer.invoke("getHoney");
    const listener = ipcRenderer.on("renderHoney", (event, res) => {
      const data = JSON.parse(res);
      console.log(data);
      callback(data);
      listener.removeAllListeners("renderHoney");
    });
  },
  refresh: callback => {
    ipcRenderer.invoke("refresh");
    const listener = ipcRenderer.on("renderRefresh", (event, res) => {
      const data = JSON.parse(res);
      console.log(data);
      callback(data);
      listener.removeAllListeners("renderRefresh");
    });
  },
  login: (credentials, callback) => {
    const creds = JSON.stringify(credentials);
    ipcRenderer.invoke("login", creds);
    const listener = ipcRenderer.on("renderLogin", (event, res) => {
      const data = JSON.parse(res);
      console.log(data);
      callback(data);
      listener.removeAllListeners("renderLogin");
    });
  },
  resetPassword: (email, callback) => {
    ipcRenderer.invoke("resetPassword", email);
    const listener = ipcRenderer.on("renderResetPassword", (e, res) => {
      const data = JSON.parse(res);
      console.log(data);
      callback(data);
      listener.removeAllListeners("renderResetPassword");
    });
  },
  postNewPassword: (credentials, callback) => {
    const creds = JSON.stringify(credentials);
    ipcRenderer.invoke("postNewPassword", creds);
    const listener = ipcRenderer.on("renderNewPassword", (event, res) => {
      const data = JSON.parse(res);
      console.log(data);
      callback(data);
      listener.removeAllListeners("renderNewPassword");
    });
  },
  register: (credentials, callback) => {
    const creds = JSON.stringify(credentials);
    ipcRenderer.invoke("register", creds);
    const listener = ipcRenderer.on("renderRegister", (event, res) => {
      const data = JSON.parse(res);
      console.log(data);
      callback(data);
      listener.removeAllListeners("renderRegister");
    });
  },
};

process.once("loaded", () => {
  contextBridge.exposeInMainWorld("bridge", ipcBridge);
});
