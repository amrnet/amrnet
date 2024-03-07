# AMRnet

![AMRnet](assets/img/logo-prod.png){: width="80" height="auto" }

![Code Count](https://img.shields.io/github/languages/count/amrnet/amrnet)
![Main Code Base](https://img.shields.io/github/languages/top/amrnet/amrnet)
![Version](https://img.shields.io/badge/version-1.0-red)
![License](https://img.shields.io/badge/license-GPLv3-blue)
![Last Commit](https://img.shields.io/github/last-commit/amrnet/amrnet)
![Open Issues](https://img.shields.io/github/issues-raw/amrnet/amrnet)
![Repo Size](https://img.shields.io/github/repo-size/amrnet/amrnet)

## Table of Contents

- [Description](#description)
- [Installation](#installation-for-software-development-purposes-only)
- [Funding & acknowledgements](#funding--acknowledgements)

## Description

## Installation (for software development purposes only)

### 1. Install [GIT](https://git-scm.com/), [NPM](https://www.npmjs.com/get-npm), and [MongoDB](https://www.mongodb.com/try/download/community?tck=docs_server)

Note: While installing MongoDB, check the option to install MongoDB Compass. If there's no option, you can [download it here](https://www.mongodb.com/try/download/compass).

#### 2. Install YARN with the command

```sh
npm install -g yarn
```

#### 3. On the command line, run the commands

```sh
git clone https://github.com/amrnet/amrnet
```

#### 4. Inside the project folder run this command to install the server dependencies

```sh
npm install
```

#### 5. Inside the folder `/client`, run the previous command to install the client dependencies

#### 6. Inside the project folder, create a file named `.env`. Inside it, copy the following code

```sh
MONGO_URI= (see item 7 from the manual)
MONGO_URI_ATLAS=(see item 7 from manual to access MongoDB Atlas cloud)
```

#### 7. When opening MongoDB Compass, you will see a white box with a connection string. Copy this string and paste it on the variable `MONGO_URI`. After clicking the `Connect` button

#### 8. Finally, inside the project folder, run the command and wait for the program to open on your browser

```sh
yarn start: prod
```

## Funding & acknowledgements
