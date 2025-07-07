.. _label-contributing:

Contributor Guide
=================

.. raw:: html

    <div class="justify-text">Thank you for your interest in improving this project. This project is open-source
      under the <a href="https://opensource.org/licenses/GPL-3.0" target="_blank">GPL-3.0 license</a>. and welcomes
      contributions in the form of bug reports, feature requests, and pull requests.
   </div>

Here is a list of important resources for contributors:

-  `Source Code <https://github.com/amrnet>`__
-  `Documentation <https://amrnet.readthedocs.io/>`__
-  `Issue Tracker <https://github.com/amrnet/amrnet/issues>`__
-  :doc:`Code of Conduct <codeofconduct>`

How to report a bug
-------------------

Report bugs on the `Issue Tracker <https://github.com/amrnet/amrnet/issues>`__.

When filing an issue, make sure to answer these questions:

-  Which operating system and Python version are you using?
-  Which version of this project are you using?
-  What did you do?
-  What did you expect to see?
-  What did you see instead?

The best way to get your bug fixed is to provide a test case, and/or steps to reproduce
the issue.

How to request a feature
------------------------

.. raw:: html

    <div class="justify-text">Features that improve <span class="inline-code">AMRnet</span> can be suggested on the
      <a href="https://github.com/amrnet/amrnet/issues" target="_blank">Issue Tracker </a>.
      It's a good idea to first submit the proposal as a feature request prior to submitting a
      pull request as this allows for the best coordination of efforts by preventing the
      duplication of work, and allows for feedback on your ideas.
   </div>

How to set up your development environment
------------------------------------------

.. raw:: html

    <div class="justify-text"><span class="inline-code">AMRnet</span> uses <span class="inline-code">uv</span> for python project management. <span class="inline-code">uv</span> can be installed
      on using the standalone installer:
   </div>

.. code:: shell

   curl -LsSf https://astral.sh/uv/install.sh | sh

Installation instructions for other methods and Windows can be found
`here <https://docs.astral.sh/uv/getting-started/installation/>`__.

``uv`` can then be used to install the latest compatible version of python:

.. code:: shell

   uv python install 3.13

``AMRnet`` and it's development dependencies can be installed with:

.. code:: shell

   uv sync

.. raw:: html

    <div class="justify-text">Specific extras (e.g. <span class="inline-code">numba</span>) can be installed with the <span class="inline-code">--extra</span> flag or all
      extras with the <span class="inline-code">--all-extras</span> flag:
   </div>

.. code:: shell

   uv sync --extra numba
   uv sync --all-extras

.. raw:: html

    <div class="justify-text">If you want to build the documentation locally, you will need to install <span class="inline-code">pandoc</span>. The
   <a href="https://pandoc.org/installing.html" target="_blank">installation method </a> depends on what OS you are running.
   </div>

To run a script using the development virtual environment, you can run:

.. code:: shell

   uv run example.py

Refer to the ``uv`` `documentation <https://docs.astral.sh/uv/>`__ for more information
relating to using ``uv`` for project management.

How to test the project
-----------------------

Pre-commit
---------- 

.. raw:: html

    <div class="justify-text"> <a href="https://pre-commit.com/" target="_blank">Pre-commit </a> ensures code quality and consistency by running
      the <span class="inline-code">ruff</span> linter and formatter, stripping out execution cells in jupyter notebooks,
      and running several pre-commit hooks.
   </div>

These can be run against all files in the project with:

.. code:: shell

   uv run pre-commit run --all-files

However, the best way to ensure code quality is by installing the git pre-commit hook:

.. code:: shell

   uv run pre-commit install

This will run ``pre-commit`` against all changed files when attempting to
``git commit``. You will need to fix the offending files prior to being able to commit a
change unless you run ``git commit --no-verify``.

Type Checking
-------------

``AMRnet`` uses ``pyright`` to ensure strict type-checking where possible.
``pyright`` can be run on all files with:

.. code:: shell

   uv run pyright

Tests
-----

The ``AMRnet`` tests are located in the tests directory and are written
using the `pytest <https://pytest.readthedocs.io/>`__ testing framework. The test suite
can be run with:

.. code:: shell

   uv run pytest -m 'not benchmark_suite'


.. raw:: html

    <div class="justify-text">If the code you are modifying may affect the performance of <span class="inline-code">AMRnet</span>, it is
      recommended that you run the benchmarking tests to verify the performance before and
      after your changes. There are three different benchmarking suites: ``geometry``,
      <span class="inline-code">meshing</span> and <span class="inline-code">analysis</span>. These can be run like this:
   </div>

.. code:: shell

   uv run pytest -m benchmark_geom
   uv run pytest -m benchmark_mesh
   uv run pytest -m benchmark_analysis

.. raw:: html

    <div class="justify-text">Note that a plot of the results can be generated by adding the <span class="inline-code">--benchmark-histogram</span>option to the above commands.
    </div>

Documentation
-------------

You can build the documentation locally with:

.. code:: shell

   uv run sphinx-build docs docs/_build


.. raw:: html

    <div class="justify-text">Make sure that you have a recent version of <span class="inline-code">pandoc</span>nstalled so that the example notebooks can be generated.
    <div class="spacer"></div>Note that all pull requests also build the documentation on Read the Docs, so building
      the documentation locally is not required.
    </div>

How to submit changes
---------------------

Open a `pull request <https://github.com/amrnet/amrnet/pulls>`__
to submit changes to this project.

Your pull request needs to meet the following guidelines for acceptance:

.. raw:: html
   
   <div class="justify-text">
      <ul>
            <li>The test suite, pre-commit and pyright checks must pass without errors and warnings.</li>
            <li>Include unit tests. This project aims for a high code coverage.</li>
            <li>If your changes add functionality, update the documentation accordingly.</li>
      </ul>
   </div>

.. raw:: html
   
   <div class="justify-text">It is recommended to open an issue before starting work on anything.
   This will allow a chance to talk it over with the owners and validate your approach.
   </div>