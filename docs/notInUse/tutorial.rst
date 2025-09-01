====================
AMRnet User Tutorial
====================

Welcome to AMRnet!
==================

.. container:: justify-text

   This tutorial will guide you through using AMRnet, a web platform that visualizes antimicrobial resistance (AMR) data from bacterial pathogens worldwide. AMRnet makes complex genomic surveillance data accessible to healthcare professionals, public health officials, researchers, and policymakers - regardless of their technical background in genomics or bioinformatics.

What is AMRnet?
===============

.. container:: justify-text

   AMRnet is a global surveillance dashboard that shows antimicrobial resistance patterns in disease-causing bacteria. Think of it as a "weather map" for antibiotic resistance - it helps you understand:

   - **Where** resistant bacteria are found geographically
   - **When** resistance patterns are changing over time
   - **Which** antibiotics are still effective in different regions
   - **How** bacterial strains are related to each other

   The platform analyzes thousands of bacterial genome sequences from public databases and presents the findings in user-friendly visualizations.

Who Should Use AMRnet?
======================

.. container:: justify-text

   AMRnet is designed for a diverse audience:

   **Healthcare Professionals**
      - Clinicians making treatment decisions
      - Infection control specialists
      - Clinical microbiologists

   **Public Health Officials**
      - Epidemiologists tracking resistance patterns
      - Policy makers developing AMR strategies
      - Surveillance coordinators

   **Researchers & Academics**
      - Students learning about AMR
      - Researchers studying resistance mechanisms
      - Healthcare educators

   **Global Health Organizations**
      - WHO regional offices
      - National health ministries
      - International surveillance networks

Key Concepts Made Simple
========================

Understanding Antimicrobial Resistance (AMR)
--------------------------------------------

.. container:: justify-text

   **What is AMR?**
   Antimicrobial resistance occurs when bacteria evolve to survive treatments that previously killed them. It's like bacteria developing "armor" against antibiotics.

   **Why does it matter?**
   When bacteria become resistant, common infections become harder to treat, leading to:
   - Longer hospital stays
   - Higher treatment costs
   - Increased risk of complications
   - Sometimes death from previously treatable infections

   **How do bacteria become resistant?**
   - **Genetic mutations**: Random changes in bacterial DNA
   - **Gene acquisition**: Bacteria can share resistance genes with each other
   - **Selection pressure**: Overuse/misuse of antibiotics favors resistant strains

Understanding Bacterial Genomes
-------------------------------

.. container:: justify-text

   **What is a genome?**
   A genome is the complete set of genetic instructions for an organism - like a blueprint. For bacteria, this blueprint determines their characteristics, including resistance to antibiotics.

   **What is genome sequencing?**
   Genome sequencing is like reading the bacterial blueprint to understand:
   - What species/strain the bacteria is
   - Which resistance genes it carries
   - How it relates to other bacterial samples

   **Why sequence bacterial genomes?**
   - Identify resistance mechanisms
   - Track outbreak sources
   - Monitor resistance spread
   - Guide treatment decisions

Understanding Bacterial Classification
--------------------------------------

.. container:: justify-text

   Bacteria are classified in a hierarchical system (like a family tree):

   **Species**: The basic unit (e.g., *Salmonella* Typhi, *Klebsiella pneumoniae*)

   **Strains/Genotypes**: Variants within a species with similar genetic makeup
   - Think of these as "subspecies" or "varieties"
   - Useful for tracking specific lineages
   - Some strains may be more resistant than others

   **Sequence Types (STs)**: Specific genetic "fingerprints"
   - Used to identify and track bacterial strains
   - Numbers like ST313, ST15 refer to specific genetic profiles

Getting Started with AMRnet
===========================

Accessing the Platform
----------------------

.. container:: justify-text

   1. Visit `www.amrnet.org <https://www.amrnet.org>`_
   2. No registration required - it's completely free and open access
   3. Works on any device with an internet connection (computer, tablet, phone)

Choosing Your Pathogen
----------------------

.. container:: justify-text

   **Step 1**: At the top of the page, you'll see a menu to select different bacteria:

   - **Salmonella Typhi**: Causes typhoid fever
   - **Klebsiella pneumoniae**: Causes pneumonia, bloodstream infections
   - **Neisseria gonorrhoeae**: Causes gonorrhea
   - **Escherichia coli**: Causes diarrheal diseases, urinary tract infections
   - **Shigella**: Causes dysentery
   - **Non-typhoidal Salmonella**: Causes food poisoning, invasive disease

   **Step 2**: Click on the pathogen you're interested in to access its specific dashboard.

Understanding the Dashboard Layout
==================================

The Map View
------------

.. container:: justify-text

   **What you see**: A world map with countries colored by resistance levels

   **How to interpret colors**:
   - **Green/Blue**: Lower resistance levels (antibiotics still work well)
   - **Yellow/Orange**: Moderate resistance levels
   - **Red/Dark Red**: High resistance levels (antibiotics less effective)
   - **Grey**: Insufficient data available

   **Key controls**:
   - **Right panel**: Choose what resistance pattern to display
   - **Left panel**: Filter data by year, region, or bacterial strain

   **Data requirements**: Countries need at least 20 bacterial samples for data to be displayed

The Filter Panel (Left Side)
----------------------------

.. container:: justify-text

   **Year Range**: Select specific time periods to see how resistance changes over time

   **Geographic Filters**: Focus on specific regions or countries

   **Strain/Genotype Filters**: Look at specific bacterial variants
   - Useful for tracking particular strains of concern

   **Sample Source**: Filter by where samples came from (surveillance studies, clinical samples, etc.)

The Variable Selection Panel (Right Side)
-----------------------------------------

.. container:: justify-text

   **Resistance Variables**: Choose which antibiotic resistance to display
   - Individual antibiotics (e.g., ciprofloxacin, ceftriaxone)
   - Resistance categories (MDR, XDR)
   - Specific resistance mechanisms

   **Genotype Variables**: Display the distribution of bacterial strains
   - Useful for understanding which strains are circulating where

Understanding Data Visualizations
=================================

Resistance Frequency Graphs
---------------------------

.. container:: justify-text

   **What they show**: The percentage of bacteria resistant to different antibiotics

   **How to read them**:
   - X-axis: Different antibiotics or bacterial strains
   - Y-axis: Percentage resistant (0-100%)
   - Colors: Different categories (susceptible, resistant, intermediate)

   **Interactive features**:
   - Click on bars to see detailed breakdowns
   - Hover for exact percentages and counts

Time Trend Graphs
-----------------

.. container:: justify-text

   **What they show**: How resistance patterns change over time

   **How to read them**:
   - X-axis: Years
   - Y-axis: Percentage resistant
   - Lines: Different resistance patterns or strains

   **What to look for**:
   - **Increasing trends**: Resistance is getting worse
   - **Decreasing trends**: Interventions may be working
   - **Stable patterns**: Resistance levels are consistent

Drug Resistance Profiles
------------------------

.. container:: justify-text

   **What they show**: Patterns of multiple drug resistance

   **Key patterns to understand**:
   - **Susceptible**: Bacteria killed by the antibiotic
   - **MDR (Multi-Drug Resistant)**: Resistant to 3+ antibiotics
   - **XDR (Extensively Drug Resistant)**: Resistant to most available antibiotics

   **Clinical significance**:
   - Higher resistance = fewer treatment options
   - XDR strains are particularly concerning for patient care

Pathogen-Specific Guidance
==========================

Salmonella Typhi (Typhoid Fever)
--------------------------------

.. container:: justify-text

   **Clinical Context**:
   - Causes typhoid fever, mainly in South Asia and Sub-Saharan Africa
   - Spread through contaminated food and water
   - Preventable by vaccination and improved sanitation

   **Key Resistance Patterns**:
   - **MDR**: Resistant to ampicillin, chloramphenicol, trimethoprim-sulfamethoxazole
   - **Ciprofloxacin resistance**: Reduces effectiveness of first-line oral treatment
   - **XDR**: Resistant to MDR drugs plus ciprofloxacin and ceftriaxone

   **What to look for**:
   - High MDR levels in endemic regions
   - Emerging XDR strains (especially concerning)
   - Travel-associated cases in non-endemic countries

   **Important Strains**:
   - **H58**: Historically dominant MDR lineage
   - **H58 XDR**: Extremely concerning extensively resistant variant

Klebsiella pneumoniae
---------------------

.. container:: justify-text

   **Clinical Context**:
   - Causes pneumonia, bloodstream infections, urinary tract infections
   - Major hospital-acquired pathogen
   - Particularly dangerous for immunocompromised patients

   **Key Resistance Patterns**:
   - **ESBL**: Extended-spectrum beta-lactamases (resist many antibiotics)
   - **Carbapenemase**: Resist carbapenems (last-resort antibiotics)
   - **Colistin resistance**: Resist the "antibiotic of last resort"

   **What to look for**:
   - High ESBL rates globally
   - Emerging carbapenemase-producing strains
   - Hypervirulent strains that cause severe infections

   **Important Strains**:
   - **ST258**: Major epidemic clone with carbapenem resistance
   - **ST11**: Common in Asia with extensive resistance

Neisseria gonorrhoeae (Gonorrhea)
---------------------------------

.. container:: justify-text

   **Clinical Context**:
   - Sexually transmitted infection
   - Can cause serious complications if untreated
   - WHO priority pathogen for AMR

   **Key Resistance Patterns**:
   - **Azithromycin resistance**: Threatens dual therapy
   - **Ceftriaxone resistance**: Eliminates current first-line treatment
   - **XDR**: Resistant to multiple drug classes

   **What to look for**:
   - Declining azithromycin susceptibility globally
   - Emerging ceftriaxone resistance
   - Regional differences in resistance patterns

   **Treatment Implications**:
   - Dual therapy (ceftriaxone + azithromycin) is current standard
   - Resistance to either drug threatens treatment effectiveness

Practical Use Cases
===================

For Clinicians
--------------

.. container:: justify-text

   **Treatment Decision Support**:
   1. Check local resistance rates for your pathogen of interest
   2. Identify which antibiotics are still effective in your region
   3. Monitor trends to anticipate future resistance issues

   **Example Workflow**:
   1. Patient presents with suspected typhoid fever
   2. Check AMRnet for local Salmonella Typhi resistance rates
   3. Avoid antibiotics with high local resistance
   4. Choose empirical therapy based on local susceptibility patterns

For Public Health Officials
---------------------------

.. container:: justify-text

   **Surveillance and Monitoring**:
   1. Track resistance trends in your region over time
   2. Compare your data to regional/global patterns
   3. Identify emerging resistance threats

   **Policy Development**:
   1. Use data to guide antibiotic stewardship programs
   2. Prioritize surveillance efforts for high-risk strains
   3. Develop evidence-based treatment guidelines

   **Example Use Case**:
   1. Monitor XDR typhoid emergence in your region
   2. Compare rates to neighboring countries
   3. Implement targeted vaccination programs if needed

For Researchers
---------------

.. container:: justify-text

   **Hypothesis Generation**:
   1. Identify geographical hotspots of resistance
   2. Investigate temporal trends in resistance emergence
   3. Study relationships between strains and resistance patterns

   **Data for Analysis**:
   1. Download aggregate data for statistical analysis
   2. Generate hypotheses for detailed genomic studies
   3. Identify knowledge gaps for future research

Interpreting Results Correctly
==============================

Understanding Data Limitations
------------------------------

.. container:: justify-text

   **Sampling Bias**:
   - Data reflects what has been sequenced, not necessarily what's circulating
   - Some regions/countries have more data than others
   - Clinical samples may over-represent resistant strains

   **Temporal Lag**:
   - Sequencing and analysis take time
   - Data may be 6-12 months behind current circulation
   - Recent trends may not yet be visible

   **Geographic Representation**:
   - Urban areas often better represented than rural
   - Some countries have limited surveillance capacity
   - Travel-associated cases may be attributed to travel destination

Critical Interpretation Guidelines
----------------------------------

.. container:: justify-text

   **Green Light Indicators** (Data you can trust):
   - Countries with ≥20 samples in the time period
   - Data from unbiased surveillance studies
   - Consistent patterns across multiple years

   **Yellow Light Indicators** (Interpret with caution):
   - Countries with 10-19 samples
   - Data from mixed sources
   - Rapidly changing patterns

   **Red Light Indicators** (Be very careful):
   - Countries with <10 samples
   - Data primarily from outbreak investigations
   - Single time point measurements

Common Misinterpretations to Avoid
----------------------------------

.. container:: justify-text

   **"No data = No resistance"**
   - Grey areas on maps don't mean no resistance
   - May indicate limited surveillance capacity

   **"Higher resistance = worse healthcare"**
   - May reflect better surveillance systems
   - Could indicate more accurate diagnosis

   **"Recent changes = real trends"**
   - Small sample fluctuations can create apparent trends
   - Look for consistent patterns over multiple years

Advanced Features
=================

Downloading Data
----------------

.. container:: justify-text

   **CSV Downloads**:
   - Access raw data behind visualizations
   - Use for your own analysis
   - Includes metadata about sample sources

   **PDF Reports**:
   - Generate static reports for presentations
   - Include data descriptions and caveats
   - Useful for stakeholder communication

Comparing Time Periods
----------------------

.. container:: justify-text

   **Before/After Analysis**:
   1. Set baseline time period (e.g., 2015-2017)
   2. Compare to recent period (e.g., 2020-2022)
   3. Look for significant changes in resistance patterns

   **Trend Analysis**:
   1. Use line graphs to visualize trends over time
   2. Look for inflection points where trends change
   3. Consider external factors (policy changes, outbreaks)

Multi-Pathogen Comparisons
--------------------------

.. container:: justify-text

   **Cross-Pathogen Insights**:
   1. Compare resistance patterns across different bacteria
   2. Identify common resistance mechanisms
   3. Assess overall AMR burden in a region

Best Practices for Different User Types
=======================================

For Healthcare Students
-----------------------

.. container:: justify-text

   **Learning Objectives**:
   - Understand global AMR patterns
   - Learn about resistance mechanisms
   - Practice interpreting epidemiological data

   **Recommended Exercises**:
   1. Compare resistance patterns between high and low-income countries
   2. Track the emergence of XDR tuberculosis globally
   3. Analyze the impact of vaccination on typhoid resistance

For Clinical Microbiologists
----------------------------

.. container:: justify-text

   **Laboratory Integration**:
   - Compare local laboratory results to global patterns
   - Identify unusual resistance patterns for investigation
   - Guide selective reporting of susceptibility results

   **Quality Assurance**:
   - Validate local resistance rates against regional data
   - Identify potential methodology issues
   - Benchmark laboratory performance

For Policymakers
----------------

.. container:: justify-text

   **Evidence-Based Decision Making**:
   1. Use data to prioritize AMR interventions
   2. Allocate resources to high-risk areas/pathogens
   3. Monitor impact of policy interventions

   **Stakeholder Communication**:
   1. Generate compelling visualizations for presentations
   2. Demonstrate AMR burden to funding bodies
   3. Build case for surveillance investments

Troubleshooting Common Issues
=============================

Technical Problems
------------------

.. container:: justify-text

   **Slow Loading**:
   - Try refreshing the page
   - Check internet connection
   - Clear browser cache

   **Map Not Displaying**:
   - Ensure JavaScript is enabled
   - Try different browser
   - Disable ad blockers temporarily

   **Data Not Updating**:
   - Check filter settings
   - Ensure sufficient sample size
   - Verify time period selection

Interpretation Challenges
-------------------------

.. container:: justify-text

   **Unexpected Results**:
   - Check sample sizes and sources
   - Review data curation warnings
   - Consider temporal factors

   **Missing Countries**:
   - Insufficient data for display
   - Check minimum sample requirements
   - Consider regional aggregation

   **Conflicting Information**:
   - Different data sources may vary
   - Check methodology descriptions
   - Consider temporal differences

Getting Help and Support
========================

.. container:: justify-text

   **Documentation Resources**:
   - Full technical documentation at `docs.amrnet.org <https://docs.amrnet.org>`_
   - Pathogen-specific guides in the user manual
   - Methodology papers linked in each dashboard

   **Community Support**:
   - GitHub discussions for technical questions
   - Email support: amrnetdashboard@gmail.com
   - Twitter: @AMRnet_org for updates

   **Training Materials**:
   - Video tutorials (coming soon)
   - Webinar recordings
   - Educational slide sets

Staying Updated
===============

.. container:: justify-text

   **Platform Updates**:
   - New pathogens added regularly
   - Enhanced visualizations
   - Improved data curation

   **Data Updates**:
   - Monthly data refreshes for most pathogens
   - Quarterly major updates
   - Annual methodology reviews

   **Following AMRnet**:
   - Subscribe to newsletters
   - Follow social media accounts
   - Join the GitHub community

Conclusion
==========

.. container:: justify-text

   AMRnet democratizes access to complex genomic surveillance data, making it actionable for diverse users worldwide. By understanding these fundamental concepts and following best practices, you can confidently use AMRnet to:

   - Make informed clinical decisions
   - Develop evidence-based policies
   - Conduct meaningful research
   - Educate others about AMR

   Remember that AMRnet is a tool to support decision-making, not replace clinical judgment or local surveillance data. Always consider local context, data limitations, and consult relevant experts when making critical decisions.

   Together, we can use data to combat antimicrobial resistance and preserve these life-saving medicines for future generations.

Further Reading
===============

.. container:: justify-text

   **Key Publications**:
   - TyphiNET methodology: `Dyson & Holt, 2021 <https://doi.org/10.1093/infdis/jiab414>`_
   - Global Typhoid Genomics Consortium: `Carey et al, 2023 <https://doi.org/10.7554/eLife.85867>`_
   - Pathogenwatch platform: `Argimón et al, 2021 <https://doi.org/10.1186/s13073-021-00858-2>`_

   **Related Resources**:
   - WHO Global AMR Surveillance System (GLASS)
   - CDC Antibiotic Resistance Threats Report
   - ECDC Annual Epidemiological Report

   **Educational Materials**:
   - WHO AMR training modules
   - CDC AMR education resources
   - Coursera "Introduction to Genomic Medicine" course
