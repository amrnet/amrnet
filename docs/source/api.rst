Data access
===========

Summary about the data access etc.

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


    .. prompt:: bash $

        curl -H "Authorization: Token 19okmz5k0i6yk17jp70jlnv91v" https://docs.example.com/en/latest/example.html

    * Explanation: ``curl`` retrieves the XML data from the URL. The ``|`` symbol pipes this data into ``xq``, which parses the XML and extracts the file names, displaying them in the terminal.

Downloading a single file
~~~~~~~~~~~~~~~~~~~~~~~~~

    * Step 1: Install ``jq``, a command-line tool for parsing JSON. Like ``xq``, installation instructions will vary based on your operating system.
    * Step 2: Use ``curl`` to download the file by constructing the URL with the file name. The command for downloading a file named ``pathogenwatch-styphi-07lsscrbhu2x-public-genomes-amr-genes.csv`` is:

    For example:

    .. prompt:: bash $

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

AMRnet API
----------
Via SaaS
********

Via GUI
********

Request API token
-----------------