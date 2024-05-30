Data access
===============

Summary about the data access etc.

Download data via bucket
--------------------------
Browser
~~~~~~~
Click on the root bucket URL (https://amrnet.s3.amazonaws.com/) to view an XML text representation of all the available files.

Use Ctrl-F/Cmd-F to search the page with the name of the organism

Copy the root bucket URL into a new tab + / at the end of the URL and append the contents of the Key field (i.e. <Key>[file name]</Key> and your browser should automatically download it (tested in Chrome/Firefox/Safari)

Command line
~~~~~~~~~~~~

.. code-block:: bash

    1. Getting the complete list of files.
    xq is a tool for parsing XML from the yq set of tools. It can be easily installed for most systems.

    curl https://https://amrnet.s3.amazonaws.com/ | xq '.ListBucketResult.Contents[].Key'

    2. Downloading a single file
    jq is a tool for parsing JSON files on the command line. It can also be easily installed on most systems.

    Note: substitute the file name you wish to download into the command below.

    curl -O https://https://amrnet.s3.amazonaws.com//$( printf "pathogenwatch-styphi-07lsscrbhu2x-public-genomes-amr-genes.csv" | jq -sRr '@uri )'

Using S3cmd tool
~~~~~~~~~~~~~~~~~

The easiest tool for working with S3 buckets is the s3cmd tool. It supports browsing, downloading and syncing from S3 buckets in general.

API 
----
SaaS
~~~~
GUI
~~~~
Request API token
-----------------
Update automatically the token
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

