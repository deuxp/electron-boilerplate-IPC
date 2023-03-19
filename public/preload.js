const { contextBridge, ipcRenderer } = require("electron");

const ipcBridge = {
  fetchCharacter: callback => {
    ipcRenderer.invoke("getCharacter");
    const listener = ipcRenderer.on("renderProcListener", (event, response) => {
      const data = JSON.parse(response);
      callback(data);
      listener.removeAllListeners("renderProcListener");
    });
  },
  getHoney: callback => {
    ipcRenderer.invoke("getHoney");
    const listener = ipcRenderer.on("renderHoney", (event, response) => {
      const data = JSON.parse(response);
      console.log(data);
      callback(data);
      listener.removeAllListeners("renderHoney");
    });
  },
  refresh: callback => {
    ipcRenderer.invoke("refresh");
    const listener = ipcRenderer.on("renderRefresh", (event, response) => {
      const data = JSON.parse(response);
      console.log(data);
      callback(data);
      listener.removeAllListeners("renderRefresh");
    });
  },
  login: (credentials, callback) => {
    const creds = JSON.stringify(credentials);
    ipcRenderer.invoke("login", creds);
    const listener = ipcRenderer.on("renderLogin", (event, response) => {
      const data = JSON.parse(response);
      console.log(data);
      callback(data);
      listener.removeAllListeners("renderLogin");
    });
  },
  register: (credentials, callback) => {
    const creds = JSON.stringify(credentials);
    ipcRenderer.invoke("register", creds);
    const listener = ipcRenderer.on("renderRegister", (event, response) => {
      const data = JSON.parse(response);
      console.log(data);
      callback(data);
      listener.removeAllListeners("renderRegister");
    });
  },
};

process.once("loaded", () => {
  contextBridge.exposeInMainWorld("bridge", ipcBridge);
});
