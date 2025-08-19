*Shigella* + EIEC
==================

.. container:: justify-text

   *Shigella* and enteroinvasive *E. coli* (EIEC) data in AMRnet are drawn from `Enterobase <https://enterobase.warwick.ac.uk/>`__, which calls AMR genotypes using NCBI’s `AMRFinderPlus <https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/>`_ and assigns lineages using `cgMLST <https://doi.org/10.1101/gr.251678.119>`_ and `hierarchical clustering <https://doi.org/10.1093/bioinformatics/btab234>`_. Last update: 24 January 2024.

   .. warning::

      The *Shigella* + EIEC data used in AMRnet are not yet curated for purpose-of-sampling, and therefore reflect the biases of global sequencing efforts which may be skewed towards sequencing AMR strains and/or outbreaks. Data curation efforts are ongoing however until then, please be careful when interpreting the data in the dashboard.

Variable definitions
~~~~~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

   - **Lineages**: The logic used by `Enterobase <https://doi.org/10.1101/gr.251678.119>`__ to classify genomes as *Shigella* or EIEC are detailed `here <https://enterobase.readthedocs.io/en/latest/pipelines/backend-pipeline-phylotypes.html?highlight=shigella>`__. *Shigella sonnei* are monophyletic and labelled as lineage ‘S. *sonnei*’. For other *Shigella*, lineages are labeled by the species followed by the HC400 (`HierCC <https://enterobase.readthedocs.io/en/latest/features/clustering.html>`_) cluster ID (as this nomenclature has been `shown <https://doi.org/10.1038/s41467-022-28121-1>`_ to mirror the paraphyletic lineage structure of *Shigella*). EIEC lineages are labeled by ST (e.g. ‘EIEC ST99’).
   - **AMR determinants**: `Enterobase <https://enterobase.warwick.ac.uk/>`__ identifies AMR determinants using NCBI’s `AMRFinderPlus <https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/>`_. AMRnet imports these AMR genotype calls, and assigns them to drugs/classes in the dashboard using the Subclass curated in `refgenes <https://doi.org/10.1099/mgen.0.000832>`_, see :ref:`the table <amr-definition-table>`.

