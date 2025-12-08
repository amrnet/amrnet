*Salmonella* Typhi
==================
.. container:: justify-text

   *Salmonella* Typhi data in AMRnet are drawn from `Pathogenwatch <http://Pathogen.watch>`__, which calls AMR determinants and `GenoTyphi <https://doi.org/10.1093/infdis/jiab414>`_ genotypes from genome assemblies. The *Salmonella* Typhi data in Pathogenwatch are curated by the `Global Typhoid Genomics Consortium <https://www.typhoidgenomics.org>`_, as described `here <https://doi.org/10.7554/eLife.85867>`_.

   The prevalence estimates shown are calculated using genome collections derived from non-targeted sampling frames (i.e. surveillance and burden studies, as opposed to AMR focused studies or outbreak investigations) with known year of isolation and country of origin. Last update: 5 August 2025.

Variable definitions
~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

   - **Genotypes**: GenoTyphi scheme, see `Dyson & Holt, 2021 <https://doi.org/10.1093/infdis/jiab414>`_.
   - **AMR determinants** and technical details of how they are called are described in the Typhi Pathogenwatch `paper <https://doi.org/10.1038/s41467-021-23091-2>`_ and `documentation <https://gitlab.com/cgps/pathogenwatch/amr-libraries/-/blob/master/90370.toml>`_.
   - **Travel-associated cases** are attributed to the country of travel, not the country of isolation, see `Ingle et al, 2019 <https://doi.org/10.1371/journal.pntd.0007620>`_.

Abbreviations
~~~~~~~~~~~~~~

.. container:: justify-text

   - **MDR**: multidrug resistant (resistant to ampicillin, chloramphenicol, and trimethoprim-sulfamethoxazole)
   - **XDR**: extensively drug resistant (MDR plus resistant to ciprofloxacin and ceftriaxone)
   - **Ciprofloxacin NS**: ciprofloxacin non-susceptible (MIC >=0.06 mg/L, due to presence of one or more *qnr* genes or mutations in *gyrA/parC/gyrB*)
   - **Ciprofloxacin R**: ciprofloxacin resistant (MIC >=0.5 mg/L, due to presence of multiple mutations and/or genes)


Related tools
~~~~~~~~~~~~~~

The AMRnet project is based on the TyphiNET dashboard, available at `https://www.typhi.net/ <https://www.typhi.net/>`_ and described in the paper: `Dyson et al, Genome Medicine 2025 <https://doi.org/10.1186/s13073-025-01470-4>`_. The TyphiNET dashboard includes some different visualisations to AMRnet, and is maintained in the form described in the TyphiNET paper, in parallel to AMRnet and populated with the same underlying data as curated by the GTGC. Notably, `TyphiNET <https://www.typhi.net/>`_ has the additional feature of plotting combinations of AMR markers (for a single drug/class), per genotype.
