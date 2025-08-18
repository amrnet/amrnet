
Invasive Nontyphoidal *Salmonella* 
===================================

.. container:: justify-text

   *Salmonella* (invasive non-typhoidal) data in AMRnet are drawn from `Enterobase <https://enterobase.warwick.ac.uk/>`_, which calls AMR genotypes using NCBI’s `AMRFinderPlus <https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/>`_, assigns lineages using MLST, `cgMLST <https://doi.org/10.1101/gr.251678.119>`_ and `hierarchical clustering <https://doi.org/10.1093/bioinformatics/btab234>`_, and assigns serotypes using `SISTR <https://doi.org/10.1371/journal.pone.0147101>`_. The iNTS dashboard currently includes all genomes identified as serotype Typhimurium or Enteritidis (which account for `>90% of iNTS <https://doi.org/10.1016/S1473-3099(21)00615-0>`_), and identifies lineages thereof using MLST. Last update: 24 January 2024.


   The invasive non-typhoidal *Salmonella* (iNTS) dashboard is populated with data from specific *Salmonella enterica* lineages that are associated with invasive disease in low-income countries; namely serotype Typhimurium (ST19, ST313 and sublineages thereof as defined by `Van Puyvelde et al <https://doi.org/10.1038/s41467-023-41152-6>`_) and Enteritidis (Central/Eastern and West African clades as defined by `Fong et al <https://doi.org/10.1099/mgen.0.001017>`_). Together these account for `>90% of iNTS <https://doi.org/10.1016/S1473-3099(21)00615-0>`_. Data in AMRnet are drawn from `Enterobase <https://enterobase.warwick.ac.uk/>`_, which calls AMR genotypes using NCBI’s `AMRFinderPlus <https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/>`_, assigns lineages using MLST, `cgMLST <https://doi.org/10.1101/gr.251678.119>`_ and `hierarchical clustering <https://doi.org/10.1093/bioinformatics/btab234>`_, and assigns serotypes using `SISTR <https://doi.org/10.1371/journal.pone.0147101>`_. Last update: 24 January 2024.

   .. warning::
      The iNTS data used in AMRnet are not yet curated for purpose-of-sampling, and therefore reflect the biases of global sequencing efforts which may be skewed towards sequencing AMR strains and/or outbreaks. Data curation efforts are ongoing however until then, please be careful when interpreting the data in the dashboard.

Variable definitions
~~~~~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text
    
   - **Lineages**: Lineages are labeled by iTYM (invasive Typhimurium) or iENT (invasive Enteritidis) followed by the lineage name, defined from cgMLST as follows:

   * iTYM ST19-L1: HC150-305
   * iTYM ST19-L3: HC150=1547
   * iTYM ST19-L4: HC150=48
   * iTYM ST313-L1: HC150=9882
   * iTYM ST313-L2: HC150=728 and HC50=728
   * iENT CEAC: HC150=12675
   * iENT WAC: HC150=2452

   - **AMR determinants**: `Enterobase <https://enterobase.warwick.ac.uk/>`_ identifies AMR determinants using NCBI’s `AMRFinderPlus <https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/>`_. AMRnet imports these AMR genotype calls, and assigns them to drugs/classes in the dashboard using the Subclass curated in `refgenes <https://doi.org/10.1099/mgen.0.000832>`_.
