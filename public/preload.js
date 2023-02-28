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
};

process.once("loaded", () => {
  contextBridge.exposeInMainWorld("bridge", ipcBridge);
});
