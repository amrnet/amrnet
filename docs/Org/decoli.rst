*Escherichia coli* diarrheagenic
=================================

.. container:: justify-text

   Enterobase classifies *E. coli* genomes to pathotypes using `this logic <https://enterobase.readthedocs.io/en/latest/pipelines/backend-pipeline-phylotypes.html?highlight=pathovar>`__. Pathotypes included in the *E. coli* (diarrheagenic) dashboard are:

   - Shiga toxin-producing *E. coli* (STEC)
   - Enterohemorrhagic *E. coli* (EHEC)
   - Enterotoxigenic *E. coli* (ETEC)
   - Enteropathogenic *E. coli* (EPEC)
   - Enteroinvasive *E. coli* (EIEC)

   Last update: 5 August 2025.

   .. warning::
      The *E. coli* data used in AMRnet are not yet curated for purpose-of-sampling, and therefore reflect the biases of global sequencing efforts which may be skewed towards sequencing AMR strains and/or outbreaks. Data curation efforts are ongoing however until then, please be careful when interpreting the data in the dashboard.

Variable definitions
~~~~~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

   - **Lineages**: Lineages are labeled by the pathovar followed by the (7-locus) ST.

   - **AMR determinants**: `Enterobase <https://enterobase.warwick.ac.uk/>`_ identifies AMR determinants using NCBI’s `AMRFinderPlus <https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/>`_. AMRnet imports these AMR genotype calls, and assigns them to drugs/classes in the dashboard using the Subclass curated in `refgenes <https://doi.org/10.1099/mgen.0.000832>`_, see :ref:`the table <amr-definition-table>`.
