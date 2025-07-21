Data access
===========

.. raw:: html

    <div class="justify-text">
        The full sample-level data for each organism can be downloaded from the AMRnet dashboard itself, using the ‘Download database (CSV) format’ button at the bottom of the page. In addition, you can access AMRnet data via the API described below.
    </div>

**Architectures**: The API architectures have 2 options developed for the project which include:

1. Download data via bucket
---------------------------

.. note:: **Organism name for downloading files from AWS:**
    Escherichia coli (diarrheagenic) as ``decoli``;
    Escherichia coli as ``ecoli``;
    Klebsiella pneumoniae as ``kpneumo``;
    Neisseria gonorrhoeae as ``ngono``;
    Salmonella (invasive non-typhoidal) as ``sentericaints``;
    Salmonella (non-typhoidal) as ``senterica``;
    Shigella as ``shige``;
    Salmonella Typhi as ``styphi``

a. Data accessing using Browser
******************************************

i. Viewing Available Files
~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. raw:: html

    <div class="justify-text">
        <ul>
          <li><b>Step 1:</b> Open a web browser (Chrome, Firefox, Safari, etc.).</li>
          <li><b>Step 2:</b> Navigate to the root bucket URL by clicking <a href="https://amrnet.s3.amazonaws.com/">https://amrnet.s3.amazonaws.com/</a>.</li>
          <li><b>Step 3:</b> This URL leads to an XML text representation listing all the files available in the Amazon S3 bucket. The XML format will display information about each file, such as its key (name), last modified date, size, etc.</li>
        </ul> 
    </div>
.. * Step 1: Open a web browser (Chrome, Firefox, Safari, etc.).
.. * Step 2: Navigate to the root bucket URL by clicking `https://amrnet.s3.amazonaws.com/ <https://amrnet.s3.amazonaws.com/>`_.
.. * Step 3: This URL leads to an XML text representation listing all the files available in the Amazon S3 bucket. The XML format will display information about each file, such as its key (name), last modified date, size, etc.

ii. Searching for a Specific Organism
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. raw:: html

    <div class="justify-text">
        <ul>
          <li><b>Step 1:</b> Use the search functionality of your browser (Ctrl-F on Windows/Linux or Cmd-F on Mac).</li>
          <li><b>Step 2:</b> Type the name of the file based on the organism you are looking for in the search box. This will highlight all occurrences of the organism's name in the XML text, making it easier to locate the specific file associated with that organism.</li>
        </ul>
    </div>
.. * Step 1: Use the search functionality of your browser (Ctrl-F on Windows/Linux or Cmd-F on Mac).
.. * Step 2: Type the name of file based on the organism you are looking for in the search box. This will highlight all occurrences of the organism's name in the XML text, making it easier to locate the specific file associated with that organism.

iii. Downloading a File
~~~~~~~~~~~~~~~~~~~~~~~~

.. raw:: html

    <div class="justify-text">
        <ul>
          <li><b>Step 1:</b> Once you find the <span class="inline-code">&lt;Key&gt;</span> field that contains the file name you are interested in, note down the file name.</li>
          <li><b>Step 2:</b> Open a new tab in your browser and copy the root bucket URL <a href="https://amrnet.s3.amazonaws.com/">https://amrnet.s3.amazonaws.com/</a> into the new tab's address bar.</li>
          <li><b>Step 3:</b> Append a slash <span class="inline-code">/</span> to the end of the URL, followed by the contents of the <span class="inline-code">&lt;Key&gt;</span> field (file name).</li>
          <li><b>Step 4:</b> Press Enter, and your browser should automatically start downloading the file. This method has been tested to work in Chrome, Firefox, and Safari.</li>
        </ul> 
    </div>
.. * Step 1: Once you find the ``<Key>`` field that contains the file name you are interested in, note down the file name.
.. * Step 2: Open a new tab in your browser.
.. * Step 3: Copy the root bucket URL ``https://amrnet.s3.amazonaws.com`` into the new tab's address bar.
.. * Step 4: Append a slash ``/`` to the end of the URL, followed by the contents of the ``<Key>`` field (file name).
.. * Step 5: Press Enter, and your browser should automatically start downloading the file. This method has been tested to work in Chrome, Firefox, and Safari.

**OR**

.. raw:: html

    <div class="justify-text">
        <ul>
          <li>Copy the URL below and modify the organism name added at the end <span class="inline-code">amrnet-</span> <span class="inline-code">decoli</span> <span class="inline-code">.csv</span> based on organism list given above.</li>
        </ul>
    </div>

Example:

.. code-block:: bash

    https://amrnet.s3.amazonaws.com/amrnet-latest/amrnet-decoli.csv

b. Data accessing using Command line
************************************************


.. raw:: html

    <div class="justify-text">
        <ul>
          <li><b>Step 1:</b> Open your terminal.</li>
          <li><b>Step 2:</b> Use the following command to download data from the provided URL:</li>
        </ul>
    </div>
.. * Step 1: Open your terminal.
.. * Step 2: Use the following command to download data from the provided URL:

.. code-block:: bash

    curl -O https://amrnet.s3.amazonaws.com/

Similarly, if you need to download a specific file from the URL, you would specify the file name in the URL. For example:

.. code-block:: bash

    curl -O https://amrnet.s3.amazonaws.com/filename

Example:

.. code-block:: bash

    curl -O https://amrnet.s3.amazonaws.com/amrnet-latest/amrnet-shige.csv


c. Data accessing using Using S3cmd tool
***************************************************

.. raw:: html

    <div class="justify-text">
        The <a href="https://s3tools.org/s3cmd" target="_blank"> s3cmd </a> tool is a versatile and powerful command-line utility designed to interact with Amazon S3 (Simple Storage Service). It simplifies tasks such as browsing, downloading, and syncing files from S3 buckets. This tool is particularly useful for managing large datasets and automating workflows involving S3 storage.
    </div>

2. Download data via API
------------------------

.. raw:: html

    <div class="justify-text">
        <ul>
          <li><b>Step 1:</b> Send an email to <a href="mailto:mrnet.api@gmail.com">requesting an API token</a>.</li>
        </ul>
    </div>
.. 1. Send an email to amrnet.api@gmail.com requesting an API token.

Example:

.. code-block:: bash

        Subject: Request for API Token

.. code-block:: bash

        I am writing to request an API token for accessing the AMRnet database. Below are the specific details for my request:

        Organism Name: Escherichia coli

.. raw:: html

    <div class="justify-text">
        <ul>
          <li><b>Step 2:</b> You will receive an email from us with all the necessary details, including <span class="inline-code">API_TOKEN_KEY</span>, <span class="inline-code">collection</span>, <span class="inline-code">database</span>, and <span class="inline-code">dataSource</span>.</li>
          <li><b>Step 3:</b> Once you receive these details, use the method below to download the required data.</li>
          <li><b>Step 4:</b> To download data with specific <span class="inline-code">COUNTRY</span> and <span class="inline-code">DATE</span>, add a <span class="inline-code">filter</span>.</li>
        </ul>
    </div>
.. 2. You will receive email from us with all the necessary detailed. like: **API_TOKEN_KEY, collection, database, dataSource**.
.. 3. Once you received these details use the method below to download required data.
.. 4. To download data with specific COUNTRY and DATE add a **filter**.

Example code to download all the data for an organism:

.. code-block:: bash

    curl --location --request POST 'https://eu-west-2.aws.data.mongodb-api.com/app/data-vnnyv/endpoint/data/v1/action/find' \
            --header 'Content-Type: application/json' \
            --header 'Access-Control-Request-Headers: *' \
            --header 'api-key: <API_TOKEN_KEY>' \
            --data-raw '{
                "collection":"<COLLECTION_NAME>",
                "database":"<DATABASE_NAME>",
                "dataSource":"<dataSource_NAME>"
            }'

.. raw:: html

    <div class="justify-text"> 
        Example code to download the data with filters <span class="inline-code">DATE</span> and <span class="inline-code">COUNTRY</span> for an organism:
    </div>

.. code-block:: bash

    curl --location --request POST 'https://eu-west-2.aws.data.mongodb-api.com/app/data-vnnyv/endpoint/data/v1/action/find' \
            --header 'Content-Type: application/json' \
            --header 'Access-Control-Request-Headers: *' \
            --header 'api-key: <API_TOKEN_KEY>' \
            --data-raw '{
                "collection":"<COLLECTION_NAME>",
                "database":"<DATABASE_NAME>",
                "dataSource":"<dataSource_NAME>",
                "filter": {"$and": [{"DATE": "2015"},{"COUNTRY": "United Kingdom"}]}
            }'

.. raw:: html

    <div class="justify-text">
        Example code to download the data with only one filter e.g. <span class="inline-code">DATE</span> for an organism:
    </div>

.. code-block:: bash

    curl --location --request POST 'https://eu-west-2.aws.data.mongodb-api.com/app/data-vnnyv/endpoint/data/v1/action/find' \
            --header 'Content-Type: application/json' \
            --header 'Access-Control-Request-Headers: *' \
            --header 'api-key: <API_TOKEN_KEY>' \
            --data-raw '{
                "collection":"<COLLECTION_NAME>",
                "database":"<DATABASE_NAME>",
                "dataSource":"<dataSource_NAME>",
                "filter": {"DATE": "2015"}
            }'

Example code to download the data and save in JSON:

.. code-block:: bash

    curl --location --request POST 'https://eu-west-2.aws.data.mongodb-api.com/app/data-vnnyv/endpoint/data/v1/action/find' \
            --header 'Content-Type: application/json' \
            --header 'Access-Control-Request-Headers: *' \
            --header 'api-key: <API_TOKEN_KEY>' \
            --data-raw '{
                "collection":"<COLLECTION_NAME>",
                "database":"<DATABASE_NAME>",
                "dataSource":"<dataSource_NAME>",
                "filter": {"DATE": "2015"}
            }' > output.json

Example code to download the data and save in JSON

.. code-block:: bash

    curl --location --request POST 'https://eu-west-2.aws.data.mongodb-api.com/app/data-vnnyv/endpoint/data/v1/action/find' \
            --header 'Content-Type: application/json' \
            --header 'Access-Control-Request-Headers: *' \
            --header 'api-key: <API_TOKEN_KEY>' \
            --data-raw '{
                "collection":"<COLLECTION_NAME>",
                "database":"<DATABASE_NAME>",
                "dataSource":"<dataSource_NAME>"
                "filter": {"DATE": "2015"}
            }' > output.json

.. note::

    To test your cURL requests, you can use the online tool `Run Curl Commands Online <https://reqbin.com/curl>`_. This tool provides a convenient way to execute and test your cURL commands directly in your web browser without needing to install any additional software.

a. Command line
***************

To download data using our API, please follow the given steps:

.. raw:: html

    <div class="justify-text">
        <ul>
          <li><b>Step 1:</b> Once you have API token, replace <span class="inline-code">&lt;API_TOKEN_KEY&gt;</span> in the following command with the actual API token you received.</li>
          <li><b>Step 2:</b> Determine the specific database and collection you need data from.</li>
          <li><b>Step 3:</b> Open your command line interface (CLI) or terminal and execute the following <span class="inline-code">curl</span> command to download data.</li>
          <li><b>Step 4:</b> If you want to save the response data to a file, you can use the <span class="inline-code">-o</span> option with <span class="inline-code">curl</span>. This command will save the response data to a file named <span class="inline-code">data.json</span> in the current directory.</li>
        </ul>
    </div>
.. 1. Once you have API token, Replace ``<API_TOKEN_KEY>`` in the following command with the actual API token you received.
.. 2. Determine the specific database and collection you need data from.
.. 3. Open your command line interface (CLI) or terminal and execute the following **curl** command to download data.
.. 4. If you want to save the response data to a file, you can use the -o option with curl. This command will save the response data to a file named data.json in the current directory.

b. Platform
***********

.. note::

    Users have the flexibility to access the API through their preferred platform. As an illustration, we provide guidance on utilizing the Postman tool to access data via the API.

Steps to Import the Example ``cURL`` Command using Postman

1. Open `Postman <https://www.postman.com/>`_.
2. Sign In with your credentials and "discover what a postman can do"

.. figure::  assets/login_postman.png
   :width: 100%
   :align: center
   :alt: Login

3. **Click the "Import" button.**

.. figure:: assets/import_postman.png
   :width: 100%
   :align: center
   :alt: Import

5. **Paste the cURL command in Import:**

.. figure:: assets/curl_postman.png
   :width: 100%
   :align: center
   :alt: CURL

6. Review the imported request details and add ``<API_TOKEN_KEY>`` in ``Headers`` in Postman.
7. Replace database name and collection name based on data to download
8. Add filters to get specific data in ``filter``

.. figure:: assets/sample_postman.png
   :width: 100%
   :align: center
   :alt: filter

9. **Click "Send" to execute the request and view the response.**

.. figure:: assets/send_postman.png
   :width: 100%
   :align: center
   :alt: send

10. **Save the response in file**

.. figure:: assets/save_postman.png
   :width: 100%
   :align: center
   :alt: save

3. Graphical User Interface (GUI)
---------------------------------