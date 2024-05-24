About AMRnet
===============

Dashboard overview
------------------

**Header**: Use the menu to **select a species or pathogen group** to display. Each pathogen has its own dashboard configuration that is customised to show genotypes, resistances and other relevant parameters. Numbers indicate the total number of genomes and genotypes currently available in the selected dashboard. 

**Map**: Use the menu on the right to **select a variable to display per-country summary data** on the world map. Prevalence data are pooled weighted estimates of proportion for the selected resistance or genotype. Use the **filters on the left** to recalculate summary data for a specific time period and/or subgroup/s (options available vary by pathogen). A country must have N≥20 samples (using the current filters) for summary data to be displayed, otherwise it will be coloured grey to indicate insufficient data. 

Filters set in this panel apply not only to the map, but to all plots on the page. **Clicking on a country in the map** also functions as a filter, so that subsequent plots reflect data for the selected country only. 

**Detailed plots**: These are intended to show country-level summaries, but if no country is selected they will populate with pooled estimates of proportion across all data passing the current filters. The heading below the map summarizes the current filter set applied to all plots, and provides another opportunity to select a focus country. Below this are a series of tabs, one per available plot. **Click a tab title to open/close the plotting area**. The specific plots displayed will vary by pathogen, as do the definitions of AMR and genotype variables (see per-organism details below). 

All plots are interactive; use the menus at the top to **select variables to display**, and whether to show **counts or percentages**. 

Each plot has a dynamic legend to the right; click on an x-axis value to display counts and percentages of secondary variables calculated amongst genomes matching that x-axis value. For example, most pathogens will have a ‘Resistance frequencies within genotypes’ plot; click a genotype to display counts and percentages of resistance estimated for each drug.

**Downloads**: At the bottom are buttons to download (1) the individual genome-level information that is used to populate the dashboard (‘Download database (CSV format)’); and (2) a static report of the currently displayed plots, together with a basic description of the data sources and variable definitions (‘Download PDF’). Please note PDF reports are not yet available for all organisms, they will be added in future updates.

.. note:: 
   Please note PDF reports are not yet available for all organisms, they will be added in future updates.

Individual pathogen details
---------------------------

*Salmonella* Typhi
~~~~~~~~~~~~~~~~~~

*Salmonella* Typhi data in AMRnet are drawn from `Pathogenwatch <http://Pathogen.watch>`_, which calls AMR and `GenoTyphi<https://doi.org/10.1093/infdis/jiab414>`_ genotypes from genome assemblies. The *Salmonella* Typhi data in Pathogenwatch are curated by the `Global Typhoid Genomics Consortium <https://www.typhoidgenomics.org>`_, as described `here <https://doi.org/10.7554/eLife.85867>`_. The prevalence estimates shown are calculated using genome collections derived from non-targeted sampling frames (i.e. surveillance and burden studies, as opposed to AMR focused studies or outbreak investigations). Last update: 24 January 2024.

**Variable definitions**

- **Genotypes**: GenoTyphi scheme, see `Dyson & Holt, 2021 <https://doi.org/10.1093/infdis/jiab414>`_.
- **AMR determinants** are described in the `Typhi Pathogenwatch paper <https://doi.org/10.1038/s41467-021-23091-2>`_.
- **Travel-associated cases** are attributed to the country of travel, not the country of isolation, see `Ingle et al, 2019 <https://doi.org/10.1371/journal.pntd.0007620>`_.

**Abbreviations**

- **MDR**: multi-drug resistant (resistant to ampicillin, chloramphenicol, and trimethoprim-sulfamethoxazole)
- **XDR**: extensively drug resistant (MDR plus resistant to ciprofloxacin and ceftriaxone)
- **Ciprofloxacin NS**: ciprofloxacin non-susceptible (MIC >=0.06 mg/L, due to presence of one or more *qnr* genes or mutations in *gyrA/parC/gyrB*)
- **Ciprofloxacin R**: ciprofloxacin resistant (MIC >=0.5 mg/L, due to presence of multiple mutations and/or genes)

*Klebsiella pneumoniae*
~~~~~~~~~~~~~~~~~~~~~~~
*Klebsiella pneumoniae* data are sourced from `Pathogenwatch <https://doi.org/10.1093/cid/ciab784>`_, which calls AMR (using `Kleborate <https://github.com/klebgenomics/Kleborate>`_) and genotypes (`MLST <https://doi.org/10.1128/jcm.43.8.4178-4182.2005>`_) from genomes assembled from public data. Last update: 24 January 2024.

.. warning:: The *Klebsiella pneumoniae* data used in AMRnet are not yet curated for purpose-of-sampling, and therefore reflect the biases of global sequencing efforts which have been largely directed at sequencing ESBL and carbapenemase-producing strains or hypervirulent strains. Data curation efforts are ongoing however until then, please be careful when interpreting the data in the dashboard.

**Variable definitions**

- **Genotypes**: `7-locus MLST scheme <https://doi.org/10.1128/jcm.43.8.4178-4182.2005>`_ for Klebsiella pneumoniae, maintained by `Institut Pasteur <https://bigsdb.pasteur.fr/klebsiella/>`_.
- **AMR determinants** are called using `Kleborate v2 <https://github.com/klebgenomics/Kleborate>`_, described `here<https://doi.org/10.1038/s41467-021-24448-3>`_.

**Abbreviations**

- **ESBL**: extended-spectrum beta-lactamase
- **ST**: sequence type

*Neisseria gonorrhoeae*
~~~~~~~~~~~~~~~~~~~~~~~

*Neisseria gonorrhoeae* data are sourced from `Pathogenwatch <https://doi.org/10.1186/s13073-021-00858-2>`_, which calls AMR and lineage `genotypes <https://pubmlst.org/neisseria/>`_ (`MLST <https://doi.org/10.1186/1741-7007-5-35>`_, `NG-MAST <https://doi.org/10.1086/383047>`_) from genomes assembled from public data. The prevalence estimates shown are calculated using genome collections derived from non-targeted sampling frames (i.e. surveillance and burden studies, as opposed to AMR focused studies or outbreak investigations). These include EuroGASP `2013 <https://doi.org/10.1016/s1473-3099(18)30225-1>`_ & `2018 <https://doi.org/10.1016/s2666-5247(22)00044-1>`_, and several national surveillance studies. Last update: 24 January 2024.

**Variable definitions**

- **Genotypes**: sequence types from the `7-locus MLST scheme <https://doi.org/10.1128/jcm.43.8.4178-4182.2005>`_ for **Neisseria**, or 2-locus **N. gonorrhoeae** multi-antigen sequence typing (`NG-MAST <https://doi.org/10.1086/383047>`_) scheme, both hosted by `PubMLST <https://pubmlst.org/neisseria/>`_.
- **AMR determinants** are identified by Pathogenwatch using an inhouse dictionary developed and maintained in consultation with an expert advisory group, described `here <https://doi.org/10.1186/s13073-021-00858-2>`_. 
- **AMR determinants within genotypes** - This plot shows combinations of determinants that result in clinical resistance to Azithromycin or Ceftriaxone, as defined in Figure 3 of `Sánchez-Busó et al (2021) <https://doi.org/10.1186/s13073-021-00858-2>`_.
- **Susceptible to cat I/II drugs** - No determinants found for Azithromycin, Ceftriaxone, Cefixime (category I) or Penicillin, Ciprofloxacin, Spectinomycin (category II).


**Abbreviations**

- **MDR**: multi-drug resistant (Resistant to one of Azithromycin / Ceftriaxone / Cefixime [category I representatives], plus two or more of Penicillin / Ciprofloxacin / Spectinomycin [category II representatives])
- **XDR**: extensively drug resistant (Resistant to two of Azithromycin / Ceftriaxone / Cefixime [category I representatives], plus three of Penicillin / Ciprofloxacin / Spectinomycin [category II representatives])

.. note::

   These definitions are based on those defined in the `European CDC Response Plan <https://www.ecdc.europa.eu/sites/default/files/documents/multi-and-extensively-drug-resistant-gonorrhoea-response-plan-Europe-2019.pdf>`_, modified to use the specific representatives of category I and II antibiotic classes that are available in the dashboard.


*Shigella* + EIEC
~~~~~~~~~~~~~~~~~~~

*Shigella* and enteroinvasive E. *coli* (EIEC) data in AMRnet are drawn from `Enterobase <https://enterobase.warwick.ac.uk/>`_, which calls AMR genotypes using NCBI’s `AMRFinderPlus <https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/>`_ and assigns lineages using `cgMLST <https://doi.org/10.1101/gr.251678.119>`_ and `hierarchical clustering <https://doi.org/10.1093/bioinformatics/btab234>`_. Last update: 24 January 2024.

.. warning:: 
   
   The *Shigella* + EIEC data used in AMRnet are not yet curated for purpose-of-sampling, and therefore reflect the biases of global sequencing efforts which may be skewed towards sequencing AMR strains and/or outbreaks. Data curation efforts are ongoing however until then, please be careful when interpreting the data in the dashboard.

**Variable definitions**

- **Lineages**: The logic used by `Enterobase <https://doi.org/10.1101/gr.251678.119>`_ to classify genomes as *Shigella* or EIEC are detailed `here <https://enterobase.readthedocs.io/en/latest/pipelines/backend-pipeline-phylotypes.html?highlight=shigella>`_. *Shigella sonnei* are monophyletic and labelled as lineage ‘S. *sonnei*’. For other *Shigella*, lineages are labeled by the species followed by the HC400 (`HierCC <https://enterobase.readthedocs.io/en/latest/features/clustering.html>`_) cluster ID (as this nomenclature has been `shown <https://doi.org/10.1038/s41467-022-28121-1>`_ to mirror the paraphyletic lineage structure of *Shigella*). EIEC lineages are labeled by ST (e.g. ‘EIEC ST99’).

- **AMR determinants**: `Enterobase <https://enterobase.warwick.ac.uk/>`_ identifies AMR determinants using NCBI’s `AMRFinderPlus <https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/>`_. AMRnet assigns these determinants to drugs/classes in the dashboard using the Subclass curated in `refgenes <https://doi.org/10.1099/mgen.0.000832>`_.

Diarrheagenic E. *coli*
~~~~~~~~~~~~~~~~~~~~~~~~~

Diarrheagenic E. *coli* data in AMRnet are drawn from `Enterobase <https://enterobase.warwick.ac.uk/>`_, which calls AMR genotypes using NCBI’s `AMRFinderPlus <https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/>`_ and assigns lineages using MLST, `cgMLST <https://doi.org/10.1101/gr.251678.119>`_ and `hierarchical clustering <https://doi.org/10.1093/bioinformatics/btab234>`_. The logic used by Enterobase to classify E. *coli* genomes to pathotypes is shown `here <https://enterobase.readthedocs.io/en/latest/pipelines/backend-pipeline-phylotypes.html?highlight=pathovar>`_. Pathotypes included in the diarrheagenic E. *coli* dashboard are:

- Shiga toxin-producing E. *coli* (STEC)
- Enterohemorrhagic E. *coli* (EHEC)
- Enterotoxigenic E. *coli* (ETEC)
- Enteropathogenic E. *coli* (EPEC)
- Enteroinvasive E. *coli* (EIEC)

Last update: 24 January 2024.

.. warning:: 
   The E. *coli* data used in AMRnet are not yet curated for purpose-of-sampling, and therefore reflect the biases of global sequencing efforts which may be skewed towards sequencing AMR strains and/or outbreaks. Data curation efforts are ongoing however until then, please be careful when interpreting the data in the dashboard.

**Variable definitions**

- **Lineages**: Lineages are labeled by the pathovar followed by the (7-locus) ST.

- **AMR determinants**: `Enterobase <https://enterobase.warwick.ac.uk/>`_ identifies AMR determinants using NCBI’s `AMRFinderPlus <https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/>`_. AMRnet assigns these determinants to drugs/classes in the dashboard using the Subclass curated in `refgenes <https://doi.org/10.1099/mgen.0.000832>`_.


Invasive Non-Typhoidal *Salmonella*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Invasive non-typhoidal *Salmonella* (iNTS) data in AMRnet are drawn from `Enterobase <https://enterobase.warwick.ac.uk/>`_, which calls AMR genotypes using NCBI’s `AMRFinderPlus <https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/>`_, assigns lineages using MLST, `cgMLST <https://doi.org/10.1101/gr.251678.119>`_ and `hierarchical clustering <https://doi.org/10.1093/bioinformatics/btab234>`_, and assigns serotypes using `SISTR <https://doi.org/10.1371/journal.pone.0147101>`_. The iNTS dashboard currently includes all genomes identified as serotype Typhimurium or Enteritidis (which account for `>90% of iNTS <https://doi.org/10.1016/S1473-3099(21)00615-0>`_), and identifies lineages thereof using MLST. Last update: 24 January 2024.

.. warning:: 
   The iNTS data used in AMRnet are not yet curated for purpose-of-sampling, and therefore reflect the biases of global sequencing efforts which may be skewed towards sequencing AMR strains and/or outbreaks. Data curation efforts are ongoing however until then, please be careful when interpreting the data in the dashboard.

**Variable definitions**

- **Lineages**: Lineages are labeled by the serotype followed by the (7-locus) ST.

- **AMR determinants**: `Enterobase <https://enterobase.warwick.ac.uk/>`_ identifies AMR determinants using NCBI’s `AMRFinderPlus <https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/>`_. AMRnet assigns these determinants to drugs/classes in the dashboard using the Subclass curated in `refgenes <https://doi.org/10.1099/mgen.0.000832>`_.


