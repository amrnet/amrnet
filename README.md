<img src='assets/img/logo-prod.png' width="150" height="90">    

![Code Count](https://img.shields.io/github/languages/count/amrnet/amrnet)
![Main Code Base](https://img.shields.io/github/languages/top/amrnet/amrnet)
![Version](https://img.shields.io/badge/version-1.0-red)
![License](https://img.shields.io/badge/license-GPLv3-blue)
![Last Commit](https://img.shields.io/github/last-commit/amrnet/amrnet)
![Open Issues](https://img.shields.io/github/issues-raw/amrnet/amrnet)
![Repo Size](https://img.shields.io/github/repo-size/amrnet/amrnet)
[![DOI](https://zenodo.org/badge/615052960.svg)](https://zenodo.org/doi/10.5281/zenodo.10810218)


## Table of Contents

- [Description](#description)
- [Installation](#installation-for-software-development-purposes-only)
- [User guide](https://amrnetdev2-bda07af7e807.herokuapp.com/#/user-guide)
- [Citing](#citing)
- [Funding & acknowledgements](#funding--acknowledgements)


## Description

The AMRnet dashboard aims to make high-quality, robust and reliable genome-derived AMR surveillance data accessible to a wide audience. Visualizations are geared towards showing national annual AMR prevalence estimates and trends, that can be broken down and explored in terms of underlying genotypes and resistance mechanisms. We do not generate sequence data, but we hope that by making publicly deposited data more accessible and useful, we can encourage and motivate more sequencing and data sharing.

We started with Salmonella Typhi, built on our [TyphiNET](https://www.typhi.net/) dashboard which uses data curated by the [Global Typhoid Genomics Consortium](http://typhoidgenomics.org/) (to improve data quality and identify which datasets are suitable for inclusion) and analysed in [Pathogenwatch](http://pathogen.watch/) (to call AMR determinants and lineages from sequence data). More organisms will be added throughout 2024-25, using data sourced from analysis platforms such as [Pathogenwatch](http://pathogen.watch/), Enterobase, and potentially others.

Visiting the [AMRnet dashboard](https://amrnetdev2-bda07af7e807.herokuapp.com/) for more informations.

## Installation (for software development purposes only)

#### 1. Install <a href="https://git-scm.com/">GIT</a>, <a href="https://www.npmjs.com/get-npm">NPM</a> and <a href="https://www.mongodb.com/try/download/community?tck=docs_server">MongoDB</a>

`Note: While installing MongoDB, check the option to install MongoDB Compass. If there's no option, you can download it here:` <a href="https://www.mongodb.com/try/download/compass">MongoDB Compass</a>

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


#### 6. Inside the project folder, create a file named `.env`. Inside it, copy the following code.


```sh
MONGO_URI= (see item 7 from the manual)
MONGO_URI_ATLAS=(see item 7 from manual to access MongoDB Atlas cloud)
```

#### 7. When opening MongoDB Compass, you will see a white box with a connection string. Copy this string and paste it on the variable `MONGO_URI`. After clicking the `Connect` button

#### 8. Finally, inside the project folder, run the command and wait for the program to open on your browser

```sh
yarn start: prod
```
## Citing

If you use data/metadata from the AMRnet dashboard, or the analysis based on these data, please cite:

DOI: https://zenodo.org/doi/10.5281/zenodo.10810218
GitHub: https://github.com/amrnet/amrnet/

## Funding & acknowledgements

AMRnet is funded by the Wellcome Trust and based in Kat Holt's group at the London School of Hygiene and Tropical Medicine.



If you use data/metadata from the website, or the analysis based on these data, please cite AMRnet:

DOI: https://zenodo.org/doi/10.5281/zenodo.10810218
GitHub: https://github.com/amrnet/amrnet/
