import { Card, CardContent, Typography } from '@mui/material';
import { MainLayout } from '../Layout';
import { useStyles } from './UserGuideMUI';
import { Footer } from '../Elements/Footer';

export const UserGuidePage = () => {
  const classes = useStyles();

  return (
    <MainLayout>
      <Card className={classes.card}>
        <CardContent className={classes.cardContent}>
          <Typography variant="h5" className={classes.paragraph}>
            Dashboard overview
          </Typography>
          <br/>
          <Typography variant="body2" className={classes.paragraph}>
            <span className={classes.paragraphBold}>Header:</span> Use the menu to <span className={classes.paragraphBold}>select a species or pathogen group</span> to display. Each pathogen has its own dashboard configuration that is customised to show genotypes, resistances and other relevant parameters. Numbers indicate the total number of genomes and genotypes currently available in the selected dashboard. 
          </Typography>
          <br/>
          <Typography variant="body2" className={classes.paragraph}>
            <span className={classes.paragraphBold}>Map:</span> Use the menu on the right to <span className={classes.paragraphBold}>select a variable to display per-country summary data</span> on the world map. Prevalence data are pooled weighted estimates of proportion for the selected resistance or genotype. Use the <span className={classes.paragraphBold}>filters on the left</span> to recalculate summary data for a specific time period and/or subgroup/s (options available vary by pathogen). A country must have N≥20 samples (using the current filters) for summary data to be displayed, otherwise it will be coloured grey to indicate insufficient data. 
          </Typography>
          <br/>
          <Typography variant="body2" className={classes.paragraph}>
            Filters set in this panel apply not only to the map, but to all plots on the page. <span className={classes.paragraphBold}>Clicking on a country in the map</span> also functions as a filter, so that subsequent plots reflect data for the selected country only.
          </Typography>
          <br/>
          <Typography variant="body2" className={classes.paragraph}>
            <span className={classes.paragraphBold}>Detailed plots:</span> These are intended to show country-level summaries, but if no country is selected they will populate with pooled estimates of proportion across all data passing the current filters. The heading below the map summarizes the current filter set applied to all plots, and provides another opportunity to select a focus country. Below this are a series of tabs, one per available plot. <span className={classes.paragraphBold}>Click a tab title to open/close the plotting area</span>. The specific plots displayed will vary by pathogen, as do the definitions of AMR and genotype variables (see per-organism details below).
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            All plots are interactive; use the menus at the top to <span className={classes.paragraphBold}>select variables to display</span>, and whether to show <span className={classes.paragraphBold}>counts or percentages.</span>
          </Typography>
          <br/>
          <Typography variant="body2" className={classes.paragraph}>
            Each plot has a dynamic legend to the right; click on an x-axis value to display counts and percentages of secondary variables calculated amongst genomes matching that x-axis value. For example, most pathogens will have a ‘Resistance frequencies within genotypes’ plot; click a genotype to display counts and percentages of resistance estimated for each drug.
          </Typography>
          <br/>
          <Typography variant="body2" className={classes.paragraph}>
            <span className={classes.paragraphBold}>Downloads:</span> At the bottom are buttons to download (1) the individual genome-level information that is used to populate the dashboard (‘Download database (CSV format)’); and (2) a static report of the currently displayed plots, together with a basic description of the data sources and variable definitions (‘Download PDF’).
          </Typography>
          <br/>
          <Typography variant="h5" className={classes.paragraph}>
            Individual pathogen details
          </Typography>
          <br/>
          <Typography variant="h6" className={classes.paragraph}>
            Salmonella Typhi
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            Salmonella Typhi data in AMRnet are drawn from <a href="https://doi.org/10.1038/s41467-021-23091-2" target="_blank" rel="noreferrer">
              Pathogenwatch
            </a>, which calls AMR and <a href="https://doi.org/10.1093/infdis/jiab414" target="_blank" rel="noreferrer">
              GenoTyphi
            </a> genotypes from genome assemblies. The Salmonella Typhi data in <a href="https://doi.org/10.1038/s41467-021-23091-2" target="_blank" rel="noreferrer">
              Pathogenwatch
            </a> are curated by the <a href="https://www.typhoidgenomics.org" target="_blank" rel="noreferrer">
              Global Typhoid Genomics Consortium
            </a>, as described <a href="https://doi.org/10.7554/eLife.85867" target="_blank" rel="noreferrer">
              here
            </a>. The prevalence estimates shown are calculated using genome collections derived from non-targeted sampling frames (i.e. surveillance and burden studies, as opposed to AMR focused studies or outbreak investigations). Last update: XX.
          </Typography>
          <br/>
          <Typography variant="subtitle2" className={classes.paragraph}>
            Variable definitions
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            <ul>
              <li>
                Genotypes: <a href="https://doi.org/10.1093/infdis/jiab414" target="_blank" rel="noreferrer">
                GenoTyphi
              </a> scheme, see <a href="https://doi.org/10.1093/infdis/jiab414" target="_blank" rel="noreferrer">
                Dyson & Holt, 2021.
              </a>
              </li>
              <li>
                AMR determinants are described in the  <a href="https://doi.org/10.1038/s41467-021-23091-2" target="_blank" rel="noreferrer">
                Typhi Pathogenwatch paper.
              </a>
              </li>
              <li>
                Travel-associated cases are attributed to the country of travel, not the country of isolation, see <a href="https://doi.org/10.1371/journal.pntd.0007620" target="_blank" rel="noreferrer">
                Ingle et al, 2019
              </a>.
              </li>
            </ul>
          </Typography>
          <br/>
          <Typography variant="subtitle2" className={classes.paragraph}>
            Abbreviations
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            <ul>
              <li>
                MDR: multi-drug resistant (resistant to ampicillin, chloramphenicol, and trimethoprim-sulfamethoxazole)
              </li>
              <li>
                XDR: extensively drug resistant (MDR plus resistant to ciprofloxacin and ceftriaxone)
              </li>
              <li>
                Ciprofloxacin NS: ciprofloxacin non-susceptible (MIC &ge;0.06 mg/L, due to presence of one or more qnr genes or mutations in gyrA/parC/gyrB)
              </li>
              <li>
                Ciprofloxacin R: ciprofloxacin resistant (MIC &ge;0.5 mg/L, due to presence of multiple mutations and/or genes)
              </li>
            </ul>
          </Typography>

          <br/>
          <Typography variant="h6" className={classes.paragraph}>
            Klebsiella pneumoniae
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            Klebsiella pneumoniae data are sourced from <a href="https://doi.org/10.1038/s41467-021-23091-2" target="_blank" rel="noreferrer">
              Pathogenwatch
            </a>, which calls AMR (using <a href="https://github.com/klebgenomics/Kleborate" target="_blank" rel="noreferrer">
              Kleborate
            </a>) and genotypes (<a href="https://doi.org/10.1128/jcm.43.8.4178-4182.2005" target="_blank" rel="noreferrer">
              MLST
            </a>) from genomes assembled from public data. Last update: January 24th 2024.
          </Typography>
          <br/>

          <Typography variant="subtitle2" className={classes.paragraph}>
            WARNING:
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            The Klebsiella pneumoniae data used in AMRnet are not yet curated for purpose-of-sampling, and therefore reflect the biases of global sequencing efforts which have been largely directed at sequencing ESBL and carbapenemase-producing strains or hypervirulent strains. Data curation efforts are ongoing however until then, please be careful when interpreting the data in the dashboard.
          </Typography>
          <br/>

          <Typography variant="subtitle2" className={classes.paragraph}>
            Variable definitions
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            <ul>
              <li>
                Genotypes: <a href="https://doi.org/10.1128/jcm.43.8.4178-4182.2005" target="_blank" rel="noreferrer">
                    7-locus MLST scheme            
                  </a> for Klebsiella pneumoniae, maintained by <a href="https://bigsdb.pasteur.fr/klebsiella/" target="_blank" rel="noreferrer">
                Institut Pasteur.
              </a>
              </li>
              <li>
                AMR determinants are called using <a href="https://github.com/klebgenomics/Kleborate" target="_blank" rel="noreferrer">
                Kleborate v2
              </a>, described <a href="https://doi.org/10.1038/s41467-021-24448-3" target="_blank" rel="noreferrer">
                here
              </a>.
              </li>
            </ul>
          </Typography>
          <br/>
          <Typography variant="subtitle2" className={classes.paragraph}>
            Abbreviations
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            <ul>
              <li>
                ESBL: extended-spectrum beta-lactamase
              </li>
              <li>
                ST: sequence type
              </li>
            </ul>
            <br/>
          </Typography>
          <Typography variant="h6" className={classes.paragraph}>
            Neisseria gonorrhoeae 
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            Neisseria gonorrhoeae data are sourced from <a href="https://doi.org/10.1038/s41467-021-23091-2" target="_blank" rel="noreferrer">
              Pathogenwatch
            </a>, which calls AMR and lineage <a href="https://pubmlst.org/neisseria/" target="_blank" rel="noreferrer">
              genotypes
            </a> (<a href="https://doi.org/10.1128/jcm.43.8.4178-4182.2005" target="_blank" rel="noreferrer">
              MLST
            </a>, <a href="https://doi.org/10.1086/383047" target="_blank" rel="noreferrer">
              NG-MAST
            </a>) from genomes assembled from public data. The prevalence estimates shown are calculated using genome collections derived from non-targeted sampling frames (i.e. surveillance and burden studies, as opposed to AMR focused studies or outbreak investigations). These include EuroGASP <a href="https://doi.org/10.1016/s1473-3099(18)30225-1" target="_blank" rel="noreferrer">
              2013
            </a> & <a href="https://doi.org/10.1016/s2666-5247(22)00044-1" target="_blank" rel="noreferrer">
              2018
            </a>, and several national surveillance studies. Last update: January 24th 2024.
          </Typography>
          
          <br/>

          <Typography variant="subtitle2" className={classes.paragraph}>
            Variable definitions
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            <ul>
              <li>
                Genotypes: sequence types from the <a href="https://doi.org/10.1128/jcm.43.8.4178-4182.2005" target="_blank" rel="noreferrer">
                7-locus MLST scheme            
                </a> for Neisseria, or 2-locus N. gonorrhoeae multi-antigen sequence typing (<a href="https://doi.org/10.1086/383047" target="_blank" rel="noreferrer">
                NG-MAST
              </a>) scheme, both hosted by <a href="https://pubmlst.org/neisseria/" target="_blank" rel="noreferrer">
                PubMLST
              </a>.
              </li>
              <li>
                AMR determinants are identified by <a href="https://doi.org/10.1038/s41467-021-23091-2" target="_blank" rel="noreferrer">
                Pathogenwatch
              </a> using an inhouse dictionary developed and maintained in consultation with an expert advisory group, described <a href="https://doi.org/10.1186/s13073-021-00858-2" target="_blank" rel="noreferrer">
                here
              </a>.
              </li>
              <li>
                AMR determinants within genotypes - This plot shows combinations of determinants that result in clinical resistance to Azithromycin or Ceftriaxone, as defined in Figure 3 of <a href="https://doi.org/10.1186/s13073-021-00858-2" target="_blank" rel="noreferrer">
                Sánchez-Busó et al (2021)
              </a>.
              </li>
            </ul>
          </Typography>

          
          <br/>
          <Typography variant="subtitle2" className={classes.paragraph}>
            Abbreviations
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            <ul>
              <li>
                MDR: multi-drug resistant (Resistant to one of Azithromycin / Ceftriaxone / Cefixime [category I representatives], plus two or more of Penicillin / Ciprofloxacin / Spectinomycin [category II representatives])
              </li>
              <li>
                XDR: extensively drug resistant (Resistant to two of Azithromycin / Ceftriaxone / Cefixime [category I representatives], plus three of Penicillin / Ciprofloxacin / Spectinomycin [category II representatives])
              </li>
            </ul>
          </Typography>
          <br/>
          <Typography variant="body2" className={classes.paragraph}>
            Note these definitions are based on those defined in the <a href="https://www.ecdc.europa.eu/sites/default/files/documents/multi-and-extensively-drug-resistant-gonorrhoea-response-plan-Europe-2019.pdf" target="_blank" rel="noreferrer">
              European CDC Response Plan
            </a>, modified to use the specific representatives of category I and II antibiotic classes that are available in the dashboard.
          </Typography>
        </CardContent>
      </Card>
      <Footer />
    </MainLayout>
  );
};
