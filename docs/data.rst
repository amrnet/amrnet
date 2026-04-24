Data access
===========

.. container:: justify-text

    AMRnet data can be accessed in three ways: (1) directly from the dashboard
    via the **Download** button at the bottom of each organism page, (2) as
    flat files from the public S3 bucket, and (3) programmatically through the
    public REST API at `api.amrnet.org <https://api.amrnet.org>`_.


1. Download via the dashboard
-----------------------------

.. container:: justify-text

    Every organism page in the `dashboard <https://www.amrnet.org>`_ has a
    *Download database (TSV format)* button at the bottom. This returns the
    full sample-level dataset for the currently-selected organism, including
    all curated metadata and AMR determinant fields. No registration is
    required.


2. Download via the public S3 bucket
------------------------------------

.. container:: justify-text

    Up-to-date compressed CSV snapshots of the whole database are published
    weekly to a public AWS S3 bucket. Choose the organism from the table below
    and append its key to ``https://amrnet.s3.amazonaws.com/amrnet-latest/``.

    .. list-table::
       :header-rows: 1
       :widths: 45 55

       * - Organism
         - S3 key
       * - *Salmonella* Typhi
         - ``amrnetdb-Salmonella_Typhi.csv.gz``
       * - *Salmonella* (non-typhoidal)
         - ``amrnetdb-Salmonella_enterica_nontyphoidal.csv.gz``
       * - *Salmonella* (invasive non-typhoidal)
         - ``amrnetdb-Salmonella_enterica_invasive_nontyphoidal.csv.gz``
       * - *Klebsiella pneumoniae*
         - ``amrnetdb-Klebsiella_pneumoniae.csv.gz``
       * - *Neisseria gonorrhoeae*
         - ``amrnetdb-Neisseria_gonorrhoeae.csv.gz``
       * - *Escherichia coli*
         - ``amrnetdb-Escherichia_coli.csv.gz``
       * - *Escherichia coli* (diarrheagenic)
         - ``amrnetdb-Escherichia_coli_diarrheagenic.csv.gz``
       * - *Shigella* + EIEC
         - ``amrnetdb-Shigella_EIEC.csv.gz``

    Example — browser or ``curl``:

    .. code-block:: bash

        # Download the S. Typhi snapshot
        curl -O https://amrnet.s3.amazonaws.com/amrnet-latest/amrnetdb-Salmonella_Typhi.csv.gz

        # List every file in the bucket (XML response)
        curl -s https://amrnet.s3.amazonaws.com/

    Example — `s3cmd <https://s3tools.org/s3cmd>`_ (unauthenticated; the
    bucket is public-read):

    .. code-block:: bash

        s3cmd --no-check-certificate get s3://amrnet/amrnet-latest/amrnetdb-Salmonella_Typhi.csv.gz


3. Programmatic access: AMRnet REST API
---------------------------------------

.. container:: justify-text

    The public REST API at **https://api.amrnet.org** exposes the same
    curated dataset that powers the dashboard. It replaces the earlier
    MongoDB Atlas Data API described in previous versions of this document.

3.1 Get an API key
******************

.. container:: justify-text

    Register a key at `https://api.amrnet.org/api-register
    <https://api.amrnet.org/api-register>`_. Registration is free; a key is
    emailed to you. All endpoints require the key passed either as:

    * HTTP header — ``X-API-Key: YOUR_KEY`` (recommended)
    * Query parameter — ``?api_key=YOUR_KEY``

3.2 Interactive docs (Swagger / OpenAPI)
****************************************

.. container:: justify-text

    Full interactive documentation lives at
    `https://api.amrnet.org/api-docs <https://api.amrnet.org/api-docs>`_.
    Every endpoint has a **Try it out** button that issues a live request —
    paste your key into the "Authorize" dialog and the built-in server
    selector already targets the production host.

    The OpenAPI 3.0 spec is available at
    `https://api.amrnet.org/api-docs.json <https://api.amrnet.org/api-docs.json>`_
    if you want to generate a client library with ``openapi-generator``.

3.3 Endpoints
*************

.. list-table::
   :header-rows: 1
   :widths: 42 58

   * - Endpoint
     - Description
   * - ``GET /api/v1/organisms``
     - List all organisms with genome counts
   * - ``GET /api/v1/organisms/{id}/resistance``
     - Resistance prevalence by drug (filters: country, year range)
   * - ``GET /api/v1/organisms/{id}/genomes``
     - Paginated per-genome records
   * - ``GET /api/v1/organisms/{id}/countries``
     - Per-country summary with year ranges
   * - ``GET /api/v1/organisms/{id}/download``
     - Full dataset download (``?format=csv`` or ``?format=json``)

    Supported ``{id}`` values: ``styphi``, ``senterica``, ``sentericaints``,
    ``ecoli``, ``decoli``, ``shige``, ``kpneumo``, ``ngono``, ``saureus``,
    ``strepneumo``.

3.4 Quick start — ``curl``
**************************

.. code-block:: bash

    API_KEY="your-registered-api-key"

    # List every organism with its current genome count
    curl -H "X-API-Key: $API_KEY" https://api.amrnet.org/api/v1/organisms

    # Resistance prevalence for S. enterica in Brazil
    curl -H "X-API-Key: $API_KEY" \
      "https://api.amrnet.org/api/v1/organisms/senterica/resistance?country=Brazil"

    # Per-country summary for E. coli
    curl -H "X-API-Key: $API_KEY" https://api.amrnet.org/api/v1/organisms/ecoli/countries

    # Full CSV export for S. Typhi
    curl -H "X-API-Key: $API_KEY" \
      "https://api.amrnet.org/api/v1/organisms/styphi/download?format=csv" \
      -o styphi.csv

3.5 Quick start — Python
************************

.. code-block:: python

    import requests
    import pandas as pd

    BASE = "https://api.amrnet.org/api/v1"
    HEADERS = {"X-API-Key": "your-registered-api-key"}

    # Organism list
    orgs = requests.get(f"{BASE}/organisms", headers=HEADERS).json()

    # Resistance prevalence for S. Typhi
    r = requests.get(
        f"{BASE}/organisms/styphi/resistance",
        headers=HEADERS,
        params={"country": "India", "year_from": 2018, "year_to": 2023},
    ).json()

    df = pd.DataFrame(r["data"])

3.6 Quick start — R
*******************

.. code-block:: r

    library(httr)
    library(jsonlite)

    base <- "https://api.amrnet.org/api/v1"
    key  <- "your-registered-api-key"

    r <- GET(
      paste0(base, "/organisms/kpneumo/resistance"),
      add_headers(`X-API-Key` = key),
      query = list(country = "Pakistan")
    )
    df <- fromJSON(content(r, "text"))$data

3.7 Rate limits
***************

.. container:: justify-text

    * ``/api/v1/*`` — 30 requests / second per IP, bursts of 50
    * ``/api/v1/organisms/*/download`` — 2 requests / second per IP, bursts of 5

    These limits are enforced by nginx upstream of the Node application. If
    you need a bulk export, the S3 snapshots in section 2 are the recommended
    source — no key, no rate limit, and the file is already compressed.


Citation
--------

.. container:: justify-text

    If you use AMRnet data in published work, please cite:

    Cerdeira LT, Dyson ZA, Sharma V, et al. **AMRnet: a data visualization
    platform to interactively explore pathogen variants and antimicrobial
    resistance.** Nucleic Acids Res. 2025. doi:
    `10.1093/nar/gkaf1101 <https://doi.org/10.1093/nar/gkaf1101>`_.

    Please also cite the upstream data sources relevant to the organism(s)
    you queried — these are listed on each pathogen page and under
    :doc:`source`.
