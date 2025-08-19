AMRnet
======

.. container:: justify-text

   The `AMRnet dashboard <https://www.amrnet.org/>`_ aims to make high-quality, robust and reliable genome-derived AMR surveillance data accessible to a wide audience. Visualizations are geared towards showing national annual AMR prevalence estimates and trends, that can be broken down and explored in terms of underlying lineages/genotypes and resistance mechanisms. We do not generate sequence data, but we hope that by making publicly deposited data more accessible and useful, we can encourage and motivate more sequencing and data sharing.

   We started with *Salmonella* Typhi, based on our `TyphiNET <https://www.typhi.net>`_ dashboard which uses data curated by the `Global Typhoid Genomics Consortium <http://typhoidgenomics.org>`_ (to improve data quality and identify which datasets are suitable for inclusion) and analysed in `Pathogenwatch <http://pathogen.watch>`_ (to call AMR determinants and lineages from sequence data). Dashboards are now available for *Klebsiella pneumoniae*, *Neisseria gonorrhoeae*, non-typhoidal *Salmonella*, *E. coli* and *Shigella* using data sourced from the `Pathogenwatch <http://pathogen.watch>`_ and `Enterobase <https://enterobase.warwick.ac.uk/>`_ platforms. In the future, we plan to add additional organisms, sourced from these and other platforms.

   A major barrier to using public data for surveillance is the need for careful data curation, to identify which datasets are relevant for inclusion in pooled estimates of AMR and genotype prevalence. This kind of curation can benefit a wide range of users and we plan to work with other organism communities to curate data, and to contribute to wider efforts around metadata standards. Please get in touch if you would like to work with us (`amrnetdashboard@gmail.com <amrnetdashboard@gmail.com>`_).


   **Key links:**

   - The dashboard is accessible at `https://www.amrnet.org <https://www.amrnet.org/>`_.

   - Info about the project team (based at London School of Hygiene and Tropical Medicine), and our policy advisory group, is `here <https://www.lshtm.ac.uk/amrnet>`__.



Citation, Code and License
-------
.. container:: justify-text

   AMRnet is free and open source software, distributed under the terms of the :doc:`GPLv3 License <license>`.  

   - The dashboard code is open access and available in `GitHub <https://github.com/amrnet/amrnet>`_.

   - Issues and feature requests can be posted `here <https://github.com/amrnet/amrnet/issues>`__. 

   - API access is described on the :doc:`/data` page.

   - If you want to install the AMRnet code to develop your own dashboard instances, see the :doc:`Installation Guide <installation>`.

   If you use the AMRnet website or code, please cite **AMRnet** (https://www.amrnet.org) or **GitHub**: https://github.com/amrnet/amrnet, and **DOI**: 10.5281/zenodo.10810219 (Louise Cerdeira, Vandana Sharma, Kathryn Holt). 

   Depending on what data and visualizations you are using in AMRnet, you should also consider citing the upstream source databases (`Pathogenwatch <http://pathogen.watch>`_/`Enterobase <https://enterobase.warwick.ac.uk/>`_), typing tools (noted in the pathogen-specific pages), or individual source studies (via PubMed IDs or DOIs available in the TSV download at the bottom of each dashboard).


Disclaimer
----------
.. container:: justify-text

   AMRnet is an open source research project, providing access to data and visualisations sourced from publicly accessible sequence databases and analysis platforms. The content on our service is provided for general information only. It is not intended to amount to advice on which you should rely. You must obtain professional or specialist advice before taking, or refraining from, any action on the basis of the content on our service. Although we make reasonable efforts to update the information on our service, we make no representations, warranties or guarantees, whether express or implied, that the content on our service is accurate, complete or up to date. We are not responsible for the results of reliance on any such information. 

   Refer to the
   :doc:`License <license>` for clarification of the conditions of use.

.. autosummary::
    :toctree: gen
    :template: custom-module-template.rst
    :recursive:

.. toctree::
    :caption: Dashboard users
    :hidden:
   
    Dashboard overview <usage>
    Individual pathogen details <pathogen>
    Acknowledgements <acknowledgements>
    
.. toctree::
    :caption: API users
    :hidden:

    API Reference <api>
    Data access <data>

.. toctree::
    :caption: Developers
    :hidden:

    Developer Guide <installation>
