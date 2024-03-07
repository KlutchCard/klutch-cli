# Klutch Card CLI

Klutch CLI early access is available in early access for mini app developers. The primary feature available in this CLI is 

## Prerequisites
* Klutch developer account. Register at (dev.klutchcard.com)[https://dev.klutchcard.com/#!/docs]
* Nodejs and NPM installed
* A configured miniapp uploaded to the dev portal.
* Expo app for launching the app in debug mode.

## Installation
```
npm i -g @klutch-card/klutch-cli
```

After installing, the CLI is available using the `klutch` command.


## Commands

```
klutch generateKey           //Generate Keys for the miniapp
klutch init                  //Creates a blank miniapp template.
klutch login                 //Logs you in as a developer
klutch publish               //Publish your miniapp to our sandbox environment
klutch test-users list       //List Test Users
klutch test-users create     //Creates a sandbox test user
```