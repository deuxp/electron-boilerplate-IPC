module.exports = {
  packagerConfig: {
    icon: "public/favicon.ico",
    name: "Rick and Morty Character Roller",
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        icon: "src/icons/win.icon.ico",
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
      config: {
        icon: "src/icons/mac/icon.icns",
      },
    },
    {
      name: "@electron-forge/maker-deb",
      config: {
        icon: "src/icons/png/32x32.png",
      },
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {
        icon: "src/icons/png/32x32.png",
      },
    },
  ],
};
