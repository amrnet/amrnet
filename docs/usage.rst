Dashboard overview
====================

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


Header
~~~~~~

.. container:: justify-text

   Use the menu to **select a species or pathogen group** to display. Each pathogen has its own dashboard configuration that is customised to show genotypes, resistances and other relevant parameters. Numbers indicate the total number of genomes and genotypes currently available in the selected dashboard.

   .. figure:: assets/header.png
      :width: 100%
      :align: center
      :alt: header

Map
~~~~~~

.. container:: justify-text

   Use the **Plotting options** panel on the right to **select a variable to display per-country summary data** on the world map. Prevalence data are pooled weighted estimates of proportion for the selected resistance or genotype. Use the **Global filters** panel on the left to recalculate summary data for a specific time period and/or subgroup/s (options available vary by pathogen). A country must have N≥20 samples (using the current filters) for summary data to be displayed otherwise, it will be coloured grey to indicate insufficient data are available.
   Filters set in this panel apply not only to the map, but to all plots on the page. **Clicking on a country in the map** also functions as a filter, so that the **Summary plots** in the panels below reflect data for the selected country only. Per-country values displayed in the map can be downloaded by clicking the downward-arrow button at the top right of the panel. A static image (PNG format) of the current map view can be downloaded by clicking the camera icon.

   .. figure:: assets/map.png
      :width: 100%
      :align: center
      :alt: map

Summary plots
~~~~~~~~~~~~~

.. container:: justify-text

   This panel offers a series of summary plots. The default view is "AMR trends". **Click a plot title** in the rotating selector at the top of the panel, to choose a different plot. The specific plots available vary by pathogen, as do the definitions of AMR and genotype variables (see per-organism details below). Summary plots are intended to show region- or country-level summaries, but if no country is selected they will populate with pooled estimates of proportion across all data passing the current filters.

   All plots are interactive. Use the **Plotting options** panel on the right to modify the region/country to display, or to select other options available for the current plot such as which variables to display, and whether to show **counts or percentages**.

   Each plot has a dynamic legend to the right; click on an x-axis value to display counts and percentages of secondary variables calculated amongst genomes matching that x-axis value. For example, most pathogens will have a ‘AMR by genotype’ plot; click a genotype to display counts and percentages of resistance estimated for each drug or class.

   Summarised values displayed in the current plot can be downloaded by clicking the downward-arrow button at the top of the Summary plots panel. A static image (PNG format) of the current plotting view can be downloaded by clicking the camera icon.


   .. added summary plots figure

   .. figure::  assets/Summary.png
      :width: 100%
      :align: center
      :alt: summary

Downloads
~~~~~~~~~~~~~

.. container:: justify-text

   At the bottom are buttons to download (1) the individual genome-level information that is used to populate the dashboard (‘Download database (CSV format)’); and (2) a static report of the currently displayed plots, together with a basic description of the data sources and variable definitions (‘Download PDF’). Please note PDF reports are not yet available for all organisms, they will be added in future updates.

   .. figure::  assets/downloads.png
      :width: 100%
      :align: center
      :alt: downloads

   .. .. note::
   ..    Please note PDF reports are not yet available for all organisms, they will be added in future updates.
