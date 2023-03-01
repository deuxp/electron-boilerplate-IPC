const APP_NAME = "r-and-m-character-roller";
module.exports = {
  packagerConfig: {
    icon: "src/icons/png/32x32.png",
    name: APP_NAME,
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        icon: "src/icons/win.icon.ico",
        name: APP_NAME,
        author: "Gottfried K",
        exe: `${APP_NAME}.exe`,
        description: "Roll a random character from the rick and morty universe",
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
      config: {
        icon: "src/icons/mac/icon.icns",
        name: APP_NAME,
      },
    },
    {
      name: "@electron-forge/maker-deb",
      platforms: ["linux"],
      config: {
        icon: "src/icons/png/32x32.png",
        name: APP_NAME,
        description: "Roll a random character from the rick and morty universe",
      },
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {
        icon: "src/icons/png/32x32.png",
        name: APP_NAME,
      },
    },
    {
      name: "@electron-forge/maker-dmg",
      config: {
        background: "./src/icons/png/512x512.png",
        format: "ULFO",
        name: APP_NAME,
      },
    },
  ],
};
