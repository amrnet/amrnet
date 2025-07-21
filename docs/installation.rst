.. _label-installation:

Installation
============

.. raw:: html

    <div class="justify-text">These instructions will get you a copy of <span class="inline-code">AMRnet</span> 
    up and running on your machine. You will need a working copy of python 3.11, 3.12 or 3.13 to get started.
    <span class="inline-code">AMRnet</span> uses <a href="https://github.com/shapely/shapely" target="_blank"> shapely </a> 
    to prepare the cross-section geometry and <a href="hhttps://github.com/m-clare/cytriangle" target="_blank">CyTriangle </a> 
    to efficiently generate a conforming triangular mesh. <a href="https://github.com/numpy/numpy" target="_blank">numpy </a> 
    and <a href="https://github.com/scipy/scipy" target="_blank">scipy </a> are used to aid finite element computations, 
    while <a href="https://github.com/matplotlib/matplotlib" target="_blank">matplotlib </a> and 
    <a href="https://github.com/Textualize/rich" target="_blank">rich </a> are used for post-processing.
    <span class="inline-code">AMRnet</span> and all of its dependencies can be installed through the python  package index: 
    </div>

.. code-block:: shell

    pip install AMRnet

Installing ``Numba``
--------------------

.. raw:: html

    <div class="justify-text"><span class="inline-code">Numba</span> translates a subset of Python and NumPy code into fast machine code, allowing
    algorithms to approach the speeds of C. The speed of several <span class="inline-code">AMRnet</span>
    analysis functions have been enhanced with  <a href="https://github.com/numba/numba" target="_blank"><span class="inline-code">numba</span></a>.
    To take advantage of this increase in performance you can install <span class="inline-code">numba</span> alongside <span class="inline-code">AMRnet</span> with:
    </div>

.. code-block:: shell

    pip install AMRnet[numba]

Installing ``PARDISO`` Solver
-----------------------------

.. raw:: html

    <div class="justify-text">The default sparse solver used in <span class="inline-code">scipy</span> is <span class="inline-code">SuperLU</span>.
        It performs okay for small matrices but appears to be slower for larger matrices. The
        <span class="inline-code">PARDISO</span> solver is a much faster alternative
        (see <a href="https://github.com/haasad/PyPardisoProject" target="_blank">pypardiso</a>), but it requires the
        installation of the <span class="inline-code">MKL</span> library, which takes a lot of disk space. Note that this
        library is only available for Linux and Windows systems.
    </div>

If you do not have a disk space constraint, you can install the ``PARDISO`` solver with:

.. code-block:: shell

    pip install AMRnet[pardiso]

Installing CAD Modules
----------------------

.. raw:: html

    <div class="justify-text">The dependencies used to import from <span class="inline-code">.dxf</span> and <span class="inline-code">.3dm</span> (rhino) files are not
    included by default in the base installation.
    <a href="https://github.com/aegis1980/cad-to-shapely" target="_blank">cad-to-shapely </a> is used to import
    <span class="inline-code">.dxf</span> files, while
    <a href="https://github.com/normanrichardson/rhino_shapely_interop" target="_blank">rhino-shapely-interop </a> is
    used to import <span class="inline-code">.3dm</span> files.

To install ``AMRnet`` with the above functionality, use the ``dxf`` and/or
``rhino`` options:

.. code-block:: shell

    pip install AMRnet[dxf]
    pip install AMRnet[rhino]