Data access
===========

Summary about the data access etc.

**Architetures**: The API architectures have 3 options developed for the project which includes:

.. figure:: assets/api.jpg
   :width: 100%
   :align: center
   :alt: api


Download data via bucket
------------------------

1. Data accessing using Browser
*******************************

Viewing Available Files:
~~~~~~~~~~~~~~~~~~~~~~~~
* Step 1: Open a web browser (Chrome, Firefox, Safari, etc.).
* Step 2: Navigate to the root bucket URL by entering ``https://amrnet.s3.amazonaws.com/`` into the browser's address bar and pressing Enter.
* Step 3: This URL leads to an XML text representation listing all the files available in the Amazon S3 bucket. The XML format will display information about each file, such as its key (name), last modified date, size, etc.

Searching for a Specific Organism:
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* Step 1: Use the search functionality of your browser (Ctrl-F on Windows/Linux or Cmd-F on Mac).
* Step 2: Type the name of the organism you are looking for in the search box. This will highlight all occurrences of the organism's name in the XML text, making it easier to locate the specific file associated with that organism.

Downloading a File:
~~~~~~~~~~~~~~~~~~~
* Step 1: Once you find the ``<Key>`` field that contains the file name you are interested in, note down the file name.
* Step 2: Open a new tab in your browser.
* Step 3: Copy the root bucket URL ``https://amrnet.s3.amazonaws.com/`` into the new tab's address bar.
* Step 4: Append a slash ``/`` to the end of the URL, followed by the contents of the ``<Key>`` field (file name).
* Step 5: Press Enter, and your browser should automatically start downloading the file. This method has been tested to work in Chrome, Firefox, and Safari.

2. Data accessing using Command line
************************************

Getting the complete list of files
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* Step 1: Install ``xq``, a command-line tool for parsing XML from the ``yq`` toolset. The installation instructions vary depending on your operating system but typically involve using a package manager like ``brew`` on macOS or ``apt`` on Ubuntu.
* Step 2: Use ``curl`` to fetch the XML representation of the file list from the S3 bucket and pipe it to ``xq`` to parse and extract the keys (file names). The command looks like this:

.. code-block:: bash    
    
    curl -H "Authorization: Token 19okmz5k0i6yk17jp70jlnv91v" https://docs.example.com/en/latest/example.html

* Explanation: ``curl`` retrieves the XML data from the URL. The ``|`` symbol pipes this data into ``xq``, which parses the XML and extracts the file names, displaying them in the terminal.

Downloading a single file
~~~~~~~~~~~~~~~~~~~~~~~~~

* Step 1: Install ``jq``, a command-line tool for parsing JSON. Like ``xq``, installation instructions will vary based on your operating system.
* Step 2: Use ``curl`` to download the file by constructing the URL with the file name. The command for downloading a file named ``pathogenwatch-styphi-07lsscrbhu2x-public-genomes-amr-genes.csv`` is:

For example:

.. code-block:: bash

    curl -H "Authorization: Token 19okmz5k0i6yk17jp70jlnv91v" https://docs.example.com/en/latest/example.html

* Explanation: 
    * ``curl -O`` is used to download the file and save it with its original name.
    * ``$( ... )`` executes the command inside the parentheses and substitutes its output into the URL.
    * ``printf "file_name"`` outputs the file name.
    * ``|`` pipes this file name into ``jq``, which converts the file name into a URI-encoded string (handling any special characters appropriately).
    * The complete URL is then passed to ``curl``, which downloads the file from the S3 bucket.

By following these steps, you can efficiently search for and download specific files from the S3 bucket using both a web browser and the command line.

3. Data accessing using Using S3cmd tool
****************************************

The `s3cmd <https://s3tools.org/s3cmd>`_ tool is a versatile and powerful command-line utility designed to interact with Amazon S3 (Simple Storage Service). It simplifies tasks such as browsing, downloading, and syncing files from S3 buckets. This tool is particularly useful for managing large datasets and automating workflows involving S3 storage.

API
-----

Send an email to amrnet.api@gmail.com requesting an API token.


database and collection list to choose from:

* Organism: Diarrheagenic E. coli; database: ``decoli``; collection: ``merge_rawdata_dec``
* Organism: Klebsiella pneumoniae; database: ``kpneumo``; collection: ``merge_rawdata_kp``
* Organism: Neisseria gonorrhoeae; database: ``ngono``; collection: ``merge_rawdata_ng``
* Organism: Invasive non-typhoidal Salmonella'; database: ``sentericaints``; collection: ``merge_rawdata_seints``
* Organism: Shigella + EIEC; database: ``shige``; collection: ``merge_rawdata_sh``
* Organism: Salmonella Typhi; database: ``styphi``; collection: ``merge_rawdata_st``

Command line
************

To download data using our API, please follow the given steps:

1. Once you have API token, Replace ``<API_KEY>`` in the following command with the actual API token you received.
2. Determine the specific database and collection you need data from. 
3. Open your command line interface (CLI) or terminal and execute the following curl command to download data.

For example:

.. code-block:: bash

            curl --location --request POST 'https://eu-west-2.aws.data.mongodb-api.com/app/data-vnnyv/endpoint/data/v1/action/find'\
            --header 'Content-Type: application/json' \
            --header 'Access-Control-Request-Headers: *' \
            --header 'api-key: <API_KEY>' \
            --data-raw '{
                "collection":"<COLLECTION_NAME>",
                "database":"<DATABASE_NAME>",
                "dataSource":"ClusterAMRnet"
            }'

4. If you want to save the response data to a file, you can use the -o option with curl. This command will save the response data to a file named data.json in the current directory.

Platform
********
.. note::

    Users have the flexibility to access the API through their preferred platform. As an illustration, we provide guidance on utilizing the Postman tool to access data via the API.

Steps to Import the Example ``cURL`` Command using Postman
    
1. Open `Postman <https://www.postman.com/>`_.
2. Sign In with your credentials and "discover what a postman can do"

.. figure:: assets/login_postman.png
   :width: 100%
   :align: center
   :alt: Login

3. Click the "Import" button.

.. figure:: assets/import_postman.png
   :width: 100%
   :align: center
   :alt: Import


5. Paste the cURL command in Import:

.. figure:: assets/curl_postman.png
   :width: 100%
   :align: center
   :alt: CURL

.. code-block:: bash

    curl --location --request POST 'https://eu-west-2.aws.data.mongodb-api.com/app/data-vnnyv/endpoint/data/v1/action/findOne' \
            --header 'Content-Type: application/json' \
            --header 'Access-Control-Request-Headers: *' \
            --header 'api-key: <API_KEY>' \
            --data-raw '{
                "collection":"<COLLECTION_NAME>",
                "database":"<DATABASE_NAME>",
                "dataSource":"ClusterAMRnet"
            }'

    
6. Review the imported request details and add ``<API_KEY>``in ``Headers`` in Postman.
7. Replace database name and collection name based on data to download
8. Add filters to get specific data in ``filter``

.. figure:: assets/sample_postman.png
   :width: 100%
   :align: center
   :alt: filter

EXAMPLE 

.. code-block:: bash

    curl --location --request POST 'https://eu-west-2.aws.data.mongodb-api.com/app/data-vnnyv/endpoint/data/v1/action/findOne' \
            --header 'Content-Type: application/json' \
            --header 'Access-Control-Request-Headers: *' \
            --header 'api-key: <API_KEY>' \
            --data-raw '{
                "collection":"<COLLECTION_NAME>",
                "database":"<DATABASE_NAME>",
                "dataSource":"<Cluster>"
                "filter": "filter": {"$and": [{"DATE": "2015"},{"LOCATION": "Blantyre"}]}
            }'


9. Click "Send" to execute the request and view the response. 

.. figure:: assets/send_postman.png
   :width: 100%
   :align: center
   :alt: send

10. Save the response in file

.. figure:: assets/save_postman.png
   :width: 100%
   :align: center
   :alt: save

Graphical User Interface (GUI)
******************************
