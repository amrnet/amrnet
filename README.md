<!-- markdownlint-disable MD033 -->
<img src="assets/img/logo-prod.png" width="150" alt="AMRnet logo">
<!-- markdownlint-enable MD033 -->

[![Version](https://img.shields.io/badge/version-1.1.4-blue.svg)](https://github.com/amrnet/amrnet)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Citation](https://img.shields.io/badge/DOI-10.1093/nar/gkaf1101-blue)](https://doi.org/10.1093/nar/gkaf1101)
[![Issues](https://img.shields.io/github/issues/amrnet/amrnet)](https://github.com/amrnet/amrnet/issues)
[![Last commit](https://img.shields.io/github/last-commit/amrnet/amrnet)](https://github.com/amrnet/amrnet/commits/main)

**Making genome-derived AMR surveillance data accessible worldwide.**

**Quick links** — [Dashboard](https://www.amrnet.org) ·
[API](https://api.amrnet.org) · [Docs](https://amrnet.readthedocs.io) ·
[GitHub](https://github.com/amrnet/amrnet)

---

## What is AMRnet?

AMRnet is a web platform that turns publicly deposited bacterial genome data
into interactive national-level estimates of antimicrobial resistance (AMR)
prevalence. Source data are curated by the AMRnet team and the community; AMR
determinants are called by [Pathogenwatch](https://pathogen.watch) and
[Enterobase](https://enterobase.warwick.ac.uk) / AMRfinderplus. We do not
generate sequence data — we make existing public data easier to use for
surveillance.

The UI is available in English, Português (BR), Español and Français.

## Supported organisms

| Code            | Organism                              | Source        |
| --------------- | ------------------------------------- | ------------- |
| `styphi`        | _Salmonella_ Typhi                    | Pathogenwatch |
| `senterica`     | _Salmonella enterica_ (non-typhoidal) | Enterobase    |
| `sentericaints` | _Salmonella_ (invasive non-typhoidal) | Enterobase    |
| `kpneumo`       | _Klebsiella pneumoniae_               | Pathogenwatch |
| `ngono`         | _Neisseria gonorrhoeae_               | Pathogenwatch |
| `ecoli`         | _Escherichia coli_                    | Enterobase    |
| `decoli`        | _E. coli_ (diarrheagenic)             | Enterobase    |
| `shige`         | _Shigella_ + EIEC                     | Enterobase    |
| `saureus`       | _Staphylococcus aureus_               | Pathogenwatch |
| `strepneumo`    | _Streptococcus pneumoniae_            | Pathogenwatch |

_S. aureus and S. pneumoniae are currently dashboard-dev only while curation is
validated._

## Using the dashboard

1. Open [amrnet.org](https://www.amrnet.org).
2. Pick an organism.
3. Filter by country / region / year / dataset.
4. Explore maps, trends, per-country comparisons.
5. Click **Download database (TSV)** at the bottom of any page to export the
   filtered dataset.

## Using the API

The public REST API at `api.amrnet.org` serves the same curated dataset.

```bash
# 1. Register a key (free) — https://api.amrnet.org/api-register
API_KEY="your-key-here"

# 2. Call any endpoint
curl -H "X-API-Key: $API_KEY" https://api.amrnet.org/api/v1/organisms
curl -H "X-API-Key: $API_KEY" \
  "https://api.amrnet.org/api/v1/organisms/styphi/resistance?country=India"
curl -H "X-API-Key: $API_KEY" \
  "https://api.amrnet.org/api/v1/organisms/ecoli/download?format=csv" -o ecoli.csv
```

Full interactive docs at
[api.amrnet.org/api-docs](https://api.amrnet.org/api-docs).

### Python

```python
import requests, pandas as pd

BASE = "https://api.amrnet.org/api/v1"
HEADERS = {"X-API-Key": "your-key"}

r = requests.get(f"{BASE}/organisms/styphi/resistance",
                 params={"country": "India", "year_from": 2020},
                 headers=HEADERS).json()
df = pd.DataFrame(r["data"])
```

### R

```r
library(httr); library(jsonlite)
r <- GET("https://api.amrnet.org/api/v1/organisms/kpneumo/resistance",
         add_headers(`X-API-Key` = "your-key"),
         query = list(country = "Pakistan"))
df <- fromJSON(content(r, "text"))$data
```

### Endpoints

| Endpoint                                | Description                                            |
| --------------------------------------- | ------------------------------------------------------ |
| `GET /api/v1/organisms`                 | List organisms + current genome counts                 |
| `GET /api/v1/organisms/{id}/resistance` | Resistance prevalence by drug (filters: country, year) |
| `GET /api/v1/organisms/{id}/genomes`    | Paginated per-genome records                           |
| `GET /api/v1/organisms/{id}/countries`  | Per-country summary                                    |
| `GET /api/v1/organisms/{id}/download`   | Full dataset (`format=csv` or `json`)                  |

### Rate limits

- `/api/v1/*` — 30 req/s per IP, bursts of 50
- `/api/v1/*/download` — 2 req/s per IP, bursts of 5

For bulk data, prefer the **S3 snapshots** described in
[data access docs](https://amrnet.readthedocs.io/en/latest/data.html). No key,
no rate limit.

## Running locally

Prereqs: Node 22+, MongoDB 7+ (local or Atlas), Git.

```bash
git clone https://github.com/amrnet/amrnet.git
cd amrnet
npm install
(cd client && npm install)
cp .env.example .env          # edit MONGODB_URI
npm run start:dev             # http://localhost:3000
```

The dev server proxies API calls to the backend on port 8080.

## Deployment

Production (`main`) runs on AWS EC2 t3.xlarge with MongoDB 7 co-hosted, nginx
reverse-proxying to a Node 22 process, CloudFront CDN at the edge, and daily S3
backups. Dev (`development`) runs on a separate t3.large at
[dev.amrnet.org](https://dev.amrnet.org).

```bash
./deploy/deploy-dev.sh              # development → dev.amrnet.org
./deploy/deploy-production.sh       # main → www.amrnet.org
```

The build sets `REACT_APP_ENVIRONMENT` so features can be gated per environment
(e.g. organisms still in curation are visible on dev only).

## Project structure

```text
client/          React 18 frontend (MUI, recharts, react-i18next)
routes/api/      Express routes + Swagger OpenAPI spec
controllers/     Business logic
models/          Mongoose schemas per organism
middleware/      Auth, rate limits, compression
docs/            Sphinx/readthedocs source
deploy/          Deploy scripts (gitignored secrets)
scripts/         Pre-commit hooks, maintenance scripts
```

## Contributing

Bug reports and pull requests welcome. See [CONTRIBUTING.md](CONTRIBUTING.md)
and the
[developer guide on ReadTheDocs](https://amrnet.readthedocs.io/en/latest/contributing.html).
Quick version: fork, branch, commit, PR.

Data / curation questions are best raised on
[GitHub Discussions](https://github.com/amrnet/amrnet/discussions) or emailed to
`amrnetdashboard@gmail.com`.

## Citation

> Cerdeira LT, Dyson ZA, Sharma V, et al. **AMRnet: a data visualization
> platform to interactively explore pathogen variants and antimicrobial
> resistance.** _Nucleic Acids Research_ 2025.
> doi:[10.1093/nar/gkaf1101](https://doi.org/10.1093/nar/gkaf1101)

Please also cite the upstream data sources (Pathogenwatch, Enterobase, WHO
GLASS, etc.) relevant to the organism(s) you queried — listed on each pathogen
page and the
[sources page](https://amrnet.readthedocs.io/en/latest/source.html).

## License

GPL-3.0 — see [LICENSE](LICENSE). Commercial use is permitted; derivative works
must remain GPL-3.0 and publish source.

## Funding & acknowledgements

- **Wellcome Trust** — core platform development and maintenance
- **London School of Hygiene & Tropical Medicine** — institutional support
- **Global Typhoid Genomics Consortium**, **Pathogenwatch**, **Enterobase**,
  **WHO GLASS** — data curation, bioinformatics, and phenotypic surveillance

---

[Dashboard](https://www.amrnet.org) • [API](https://api.amrnet.org) •
[Docs](https://amrnet.readthedocs.io) •
[GitHub](https://github.com/amrnet/amrnet) •
[amrnetdashboard@gmail.com](mailto:amrnetdashboard@gmail.com)
