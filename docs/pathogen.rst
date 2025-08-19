.. _individual_pathogen_details:

Individual pathogen details
===========================

.. container:: justify-text

    Each dashboard is populated a bit differently, from different sources and with different inclusion criteria, using AMR genotyping and lineage definitions specific to the pathogen. 

    Select a pathogen below to see the details:

    - *Escherichia coli*
    - *Escherichia coli* (diarrheagenic)
    - *Shigella* + EIEC
    - *Klebsiella pneumoniae*
    - *Neisseria gonorrhoeae*
    - *Salmonella* (non-typhoidal)
    - *Salmonella* (invasive non-typhoidal)
    - *Salmonella* Typhi

    A list of all upstream databases and tools, with links and citations, is available on the acknowledgments page.

.. _amr-definition-table:

AMR definitions based on Enterobase/AMRfinderplus data
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

These definitions are used in the *E. coli*, *Shigella*, and non-typhoidal *Salmonella* dashboards, where data are populated from `Enterobase <https://enterobase.warwick.ac.uk/>`_ which uses `AMRfinderplus <https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/>`_ to identify AMR determinants from genome assemblies. For other organisms, populated from Pathogenwatch, see the pathogen-specific pages above for details of how AMR is detected/defined.


.. list-table::   
   :widths: 50 40 60 70
   :header-rows: 1

   * - Resistance indicator variable
     - Definition
     - Enterobase column/s
     - Drawn from AMRFinderPlus Class/Subclass
   * - Ampicillin
     - ≥1 marker from any column
     - Penicillin, Carbapenemase, ESBL
     - Subclass: BETA-LACTAM
   * - Aminoglycosides
     - ≥1 marker
     - Aminoglycoside
     - Class: AMINOGLYCOSIDE
   * - Carbapenems
     - ≥1 marker
     - Carbapenemase
     - Subclass: CARBAPENEM
   * - Ciprofloxacin (non-susceptible)
     - ≥1 marker
     - Quinolone
     - Class: QUINOLONE
   * - Chloramphenicol
     - ≥1 marker
     - Phenicol
     - Class: PHENICOL
   * - Colistin
     - ≥1 marker
     - Colistin
     - Class: COLISTIN
   * - ESBL
     - ≥1 marker from any column
     - ESBL, Carbapenemase
     - Subclass: CEPHALOSPORIN
   * - Fosfomycin
     - ≥1 marker
     - Fosfomycin
     - Class: FOSFOMYCIN
   * - Macrolide
     - mph(A) or acrB_R717
     - Macrolide
     - Class: MACROLIDE
   * - Tetracycline
     - ≥1 marker
     - Tetracycline
     - Class: TETRACYCLINE
   * - Tigecycline
     - ≥1 marker
     - Other Classes: Tigecycline
     - Subclass: TIGECYCLINE
   * - Trimethoprim
     - ≥1 marker
     - Trimethoprim
     - Class: TRIMETHOPRIM
   * - Trimethoprim-Sulfamethoxazole
     - ≥1 marker from each column
     - Trimethoprim, Sulfonamide
     - Class: TRIMETHOPRIM, SULFONAMIDE
   * - Pansusceptible
     - 0 markers
     - all AMR columns
     - —

.. raw:: html

    <p><a href="javascript:history.back()">← Go back</a></p>


.. toctree::
    :maxdepth: 2
    :hidden:

    Escherichia coli  <Org/ecoli>
    Escherichia coli diarrheagenic <Org/decoli>
    Shigella + EIEC <Org/shige>
    Klebsiella pneumoniae <Org/kpneumo>
    Neisseria gonorrhoeae <Org/ngono>
    Salmonella (non-typhoidal) <Org/senterica>
    Salmonella (invasive non-typhoidal) <Org/sentericaints>
    Salmonella Typhi <Org/styphi>

