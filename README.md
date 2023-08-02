# Preface

---

The `rnm-login server` with the `r-and-m-front-end` exists as working reference example of:

1. JWT access token
2. password reset via email client
3. Electron IPC communication

## Caveats

---

This repo is using 2 libraries for http requests: (a) Electrons native net.request object, and (b) axios.

Electron native net request handler is used for one reason, it plays well with Electron’s cookies session handler.

Similar attempts to set the session with JWT access tokens in Electron using axios’ `{ includeCredentials: true }`, have not worked. 

On the other hand, Electrons net.request object was having trouble posting, the documentation is not helpful. It doesn’t list all of the options available to the parameter. However there is a helpful post on [stack overflow](https://stackoverflow.com/questions/44465614/net-request-post-data-not-working) navigating the trickiness of this method. Check it out later

# Usage

---

1. clone
2. `yarn install`
3. run with `yarn dev`
