import { Card, CardContent, Typography } from '@mui/material';
import { MainLayout } from '../Layout';
import { useStyles } from './UserGuideMUI';
import { Footer } from '../Elements/Footer';
import Divider from '@mui/material/Divider';
import header from '../../assets/img/screencaptures/header.png';
import map from '../../assets/img/screencaptures/map.png';
import filter from '../../assets/img/screencaptures/filter.png';
import downloads from '../../assets/img/screencaptures/downloads.png';

export const UserGuidePage = () => {
  const classes = useStyles();

  return (
    <MainLayout>
      <Card className={classes.card}>
        <CardContent className={classes.cardContent}>
          <Typography variant="h4" className={classes.paragraph}>
            Dashboard overview
          </Typography>
          <br />
          <Typography variant="body2" className={classes.paragraph}>
            <span className={classes.paragraphBold}>Header:</span> Use the menu to{' '}
            <span className={classes.paragraphBold}>select a species or pathogen group</span> to display. Each pathogen
            has its own dashboard configuration that is customised to show genotypes, resistances and other relevant
            parameters. Numbers indicate the total number of genomes and genotypes currently available in the selected
            dashboard.
          </Typography>
          <br />
          <img className={classes.img} srcSet={header} src={header} alt={'Header'} loading="lazy" />
          <br />
          <br />
          <Typography variant="body2" className={classes.paragraph}>
            <span className={classes.paragraphBold}>Map:</span> Use the menu on the right to{' '}
            <span className={classes.paragraphBold}>select a variable to display per-country summary data</span> on the
            world map. Prevalence data are pooled weighted estimates of proportion for the selected resistance or
            genotype. Use the <span className={classes.paragraphBold}>filters on the left</span> to recalculate summary
            data for a specific time period and/or subgroup/s (options available vary by pathogen). A country must have
            N≥20 samples (using the current filters) for summary data to be displayed, otherwise it will be coloured
            grey to indicate insufficient data.
          </Typography>
          <br />
          <img className={classes.img} srcSet={map} src={map} alt={'map'} loading="lazy" />
          <br />
          <br />
          <Typography variant="body2" className={classes.paragraph}>
            Filters set in this panel apply not only to the map, but to all plots on the page.{' '}
            <span className={classes.paragraphBold}>Clicking on a country in the map</span> also functions as a filter,
            so that subsequent plots reflect data for the selected country only.
          </Typography>
          <br />
          <img className={classes.img} srcSet={filter} src={filter} alt={'Filter'} loading="lazy" />
          <br />
          <br />
          <Typography variant="body2" className={classes.paragraph}>
            <span className={classes.paragraphBold}>Detailed plots:</span> These are intended to show country-level
            summaries, but if no country is selected they will populate with pooled estimates of proportion across all
            data passing the current filters. The heading below the map summarizes the current filter set applied to all
            plots, and provides another opportunity to select a focus country. Below this are a series of tabs, one per
            available plot.{' '}
            <span className={classes.paragraphBold}>Click a tab title to open/close the plotting area</span>. The
            specific plots displayed will vary by pathogen, as do the definitions of AMR and genotype variables (see
            per-organism details below).
          </Typography>
          <br />
          <Typography variant="body2" className={classes.paragraph}>
            All plots are interactive; use the menus at the top to{' '}
            <span className={classes.paragraphBold}>select variables to display</span>, and whether to show{' '}
            <span className={classes.paragraphBold}>counts or percentages</span>.
          </Typography>

          <br />
          <Typography variant="body2" className={classes.paragraph}>
            Each plot has a dynamic legend to the right; click on an x-axis value to display counts and percentages of
            secondary variables calculated amongst genomes matching that x-axis value. For example, most pathogens will
            have a ‘Resistance frequencies within genotypes’ plot; click a genotype to display counts and percentages of
            resistance estimated for each drug.
          </Typography>
          <br />
          <Typography variant="body2" className={classes.paragraph}>
            <span className={classes.paragraphBold}>Downloads:</span> At the bottom are buttons to download (1) the
            individual genome-level information that is used to populate the dashboard (‘Download database (CSV
            format)’); and (2) a static report of the currently displayed plots, together with a basic description of
            the data sources and variable definitions (‘Download PDF’).
          </Typography>
          <br />
          <img className={classes.img} srcSet={downloads} src={downloads} alt={'Downloads'} loading="lazy" />
          <br />
          <br />
          <Typography variant="body2" className={classes.paragraph}>
            <span className={classes.paragraphBold}>NOTE:</span> Please note PDF reports are not yet available for all
            organisms, they will be added in future updates.
          </Typography>
          <br />
          <Divider sx={{ borderBottomWidth: 3 }} />
          <br />
          <Typography variant="h4" className={classes.paragraph}>
            Individual pathogen details
          </Typography>
          <br />
          <Typography variant="h6" className={classes.paragraph}>
            <i>Salmonella</i> Typhi
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            <i>Salmonella</i> Typhi data in AMRnet are drawn from{' '}
            <a href="http://Pathogen.watch" target="_blank" rel="noreferrer">
              Pathogenwatch
            </a>
            , which calls AMR and{' '}
            <a href="https://doi.org/10.1093/infdis/jiab414" target="_blank" rel="noreferrer">
              GenoTyphi
            </a>{' '}
            genotypes from genome assemblies. The <i>Salmonella</i> Typhi data in Pathogenwatch are curated by the{' '}
            <a href="https://www.typhoidgenomics.org" target="_blank" rel="noreferrer">
              Global Typhoid Genomics Consortium
            </a>
            , as described{' '}
            <a href="https://doi.org/10.7554/eLife.85867" target="_blank" rel="noreferrer">
              here
            </a>
            . The prevalence estimates shown are calculated using genome collections derived from non-targeted sampling
            frames (i.e. surveillance and burden studies, as opposed to AMR focused studies or outbreak investigations).
            Last update: 24 January 2024.
          </Typography>
          <br />
          <Typography variant="subtitle2" className={classes.paragraph}>
            Variable definitions
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            <li>
              <span className={classes.paragraphBold}>Genotypes:</span>{' '}
              <a href="https://doi.org/10.1093/infdis/jiab414" target="_blank" rel="noreferrer">
                GenoTyphi
              </a>{' '}
              scheme, see{' '}
              <a href="https://doi.org/10.1093/infdis/jiab414" target="_blank" rel="noreferrer">
                Dyson & Holt, 2021
              </a>
              .
            </li>
            <li>
              <span className={classes.paragraphBold}>AMR determinants</span> are described in the{' '}
              <a href="https://doi.org/10.1038/s41467-021-23091-2" target="_blank" rel="noreferrer">
                Typhi Pathogenwatch paper
              </a>{' '}
              and the{' '}
              <a href="https://elifesciences.org/articles/85867" target="_blank" rel="noreferrer">
                Consortium paper
              </a>
              .
            </li>
            <li>
              <span className={classes.paragraphBold}>Travel-associated cases</span> are attributed to the country of
              travel, not the country of isolation, see{' '}
              <a href="https://doi.org/10.1371/journal.pntd.0007620" target="_blank" rel="noreferrer">
                Ingle et al, 2019
              </a>
              .
            </li>
          </Typography>
          <br />
          <Typography variant="subtitle2" className={classes.paragraph}>
            Abbreviations
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            <li>
              <span className={classes.paragraphBold}>MDR:</span> multi-drug resistant (resistant to ampicillin,
              chloramphenicol, and trimethoprim-sulfamethoxazole)
            </li>
            <li>
              <span className={classes.paragraphBold}>XDR:</span> extensively drug resistant (MDR plus resistant to
              ciprofloxacin and ceftriaxone)
            </li>
            <li>
              <span className={classes.paragraphBold}>Ciprofloxacin NS:</span> ciprofloxacin non-susceptible (MIC
              &ge;0.06 mg/L, due to presence of one or more <i>qnr</i> genes or mutations in <i>gyrA/parC/gyrB</i>)
            </li>
            <li>
              <span className={classes.paragraphBold}>Ciprofloxacin R:</span> ciprofloxacin resistant (MIC &ge;0.5 mg/L,
              due to presence of multiple mutations and/or genes)
            </li>
          </Typography>
          <br />
          <Divider />
          <br />
          <Typography variant="h6" className={classes.paragraph}>
            <i>Klebsiella pneumoniae</i>
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            <i>Klebsiella pneumoniae</i> data are sourced from{' '}
            <a href="https://pathogen.watch/" target="_blank" rel="noreferrer">
              Pathogenwatch
            </a>
            , which calls AMR (using{' '}
            <a href="https://doi.org/10.1038/s41467-021-24448-3" target="_blank" rel="noreferrer">
              Kleborate
            </a>
            ) and genotypes (
            <a href="https://doi.org/10.1128/jcm.43.8.4178-4182.2005" target="_blank" rel="noreferrer">
              MLST
            </a>
            ) from genomes assembled from public data. Last update: 24 January 2024.
          </Typography>
          <br />

          <Typography variant="subtitle2" className={classes.paragraph}>
            WARNING:
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            The <i>Klebsiella pneumoniae</i> data used in AMRnet are not yet curated for purpose-of-sampling, and
            therefore reflect the biases of global sequencing efforts which have been largely directed at sequencing
            ESBL and carbapenemase-producing strains or hypervirulent strains. Data curation efforts are ongoing however
            until then, please be careful when interpreting the data in the dashboard.
          </Typography>
          <br />

          <Typography variant="subtitle2" className={classes.paragraph}>
            Variable definitions
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            <li>
              <span className={classes.paragraphBold}>Genotypes:</span>{' '}
              <a href="https://doi.org/10.1128/jcm.43.8.4178-4182.2005" target="_blank" rel="noreferrer">
                7-locus MLST scheme
              </a>{' '}
              for <i>Klebsiella pneumoniae</i>, maintained by{' '}
              <a href="https://bigsdb.pasteur.fr/klebsiella/" target="_blank" rel="noreferrer">
                Institut Pasteur
              </a>
              .
            </li>
            <li>
              <span className={classes.paragraphBold}>AMR determinants</span> are called using{' '}
              <a href="https://github.com/klebgenomics/Kleborate" target="_blank" rel="noreferrer">
                Kleborate v2
              </a>
              , described{' '}
              <a href="https://doi.org/10.1038/s41467-021-24448-3" target="_blank" rel="noreferrer">
                Lam et al, 2021
              </a>
              .
            </li>
          </Typography>
          <br />
          <Typography variant="subtitle2" className={classes.paragraph}>
            Abbreviations
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            <li>
              <span className={classes.paragraphBold}>ESBL:</span> extended-spectrum beta-lactamase
            </li>
            <li>
              <span className={classes.paragraphBold}>ST:</span> sequence type
            </li>
          </Typography>
          <br />
          <Divider />
          <br />
          <Typography variant="h6" className={classes.paragraph}>
            <i>Neisseria gonorrhoeae</i>
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            <i>Neisseria gonorrhoeae</i> data are sourced from{' '}
            <a href="https://pathogen.watch/" target="_blank" rel="noreferrer">
              Pathogenwatch
            </a>
            , which calls AMR and lineage{' '}
            <a href="https://pubmlst.org/neisseria/" target="_blank" rel="noreferrer">
              genotypes
            </a>{' '}
            (
            <a href="https://doi.org/10.1128/jcm.43.8.4178-4182.2005" target="_blank" rel="noreferrer">
              MLST
            </a>
            ,{' '}
            <a href="https://doi.org/10.1086/383047" target="_blank" rel="noreferrer">
              NG-MAST
            </a>
            ) from genomes assembled from public data. The prevalence estimates shown are calculated using genome
            collections derived from non-targeted sampling frames (i.e. surveillance and burden studies, as opposed to
            AMR focused studies or outbreak investigations). These include EuroGASP{' '}
            <a href="https://doi.org/10.1016/s1473-3099(18)30225-1" target="_blank" rel="noreferrer">
              2013
            </a>{' '}
            &{' '}
            <a href="https://doi.org/10.1016/s2666-5247(22)00044-1" target="_blank" rel="noreferrer">
              2018
            </a>
            , and several national surveillance studies. Last update: 24 January 2024.
          </Typography>

          <br />

          <Typography variant="subtitle2" className={classes.paragraph}>
            Variable definitions
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            <li>
              <span className={classes.paragraphBold}>Genotypes:</span> sequence types from the{' '}
              <a href="https://doi.org/10.1128/jcm.43.8.4178-4182.2005" target="_blank" rel="noreferrer">
                7-locus MLST scheme
              </a>{' '}
              for Neisseria, or 2-locus N. gonorrhoeae multi-antigen sequence typing (
              <a href="https://doi.org/10.1086/383047" target="_blank" rel="noreferrer">
                NG-MAST
              </a>
              ) scheme, both hosted by{' '}
              <a href="https://pubmlst.org/neisseria/" target="_blank" rel="noreferrer">
                PubMLST
              </a>
              .
            </li>
            <li>
              <span className={classes.paragraphBold}>AMR determinants</span> are identified by Pathogenwatch using an
              inhouse dictionary developed and maintained in consultation with an expert advisory group, described{' '}
              <a href="https://doi.org/10.1186/s13073-021-00858-2" target="_blank" rel="noreferrer">
                Sánchez-Busó et al (2021)
              </a>
              .
            </li>
            <li>
              <span className={classes.paragraphBold}>AMR determinants within genotypes</span> - This plot shows
              combinations of determinants that result in clinical resistance to Azithromycin or Ceftriaxone, as defined
              in Figure 3 of{' '}
              <a href="https://doi.org/10.1186/s13073-021-00858-2" target="_blank" rel="noreferrer">
                Sánchez-Busó et al (2021)
              </a>
              .
            </li>
            <li>
              <span className={classes.paragraphBold}>Susceptible to class I/II drugs</span> - No determinants found for
              Azithromycin, Ceftriaxone, Cefixime (category I) or Penicillin, Ciprofloxacin, Spectinomycin (category
              II).
            </li>
          </Typography>

          <br />
          <Typography variant="subtitle2" className={classes.paragraph}>
            Abbreviations
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            <li>
              <span className={classes.paragraphBold}>MDR:</span> multi-drug resistant (Resistant to one of Azithromycin
              / Ceftriaxone / Cefixime [category I representatives], plus two or more of Penicillin / Ciprofloxacin /
              Spectinomycin [category II representatives])
            </li>
            <li>
              <span className={classes.paragraphBold}>XDR:</span> extensively drug resistant (Resistant to two of
              Azithromycin / Ceftriaxone / Cefixime [category I representatives], plus three of Penicillin /
              Ciprofloxacin / Spectinomycin [category II representatives])
            </li>
          </Typography>

          <br />
          <Typography variant="body2" className={classes.paragraph}>
            <span className={classes.paragraphBold}>NOTE:</span> These definitions are based on those defined in the{' '}
            <a
              href="https://www.ecdc.europa.eu/sites/default/files/documents/multi-and-extensively-drug-resistant-gonorrhoea-response-plan-Europe-2019.pdf"
              target="_blank"
              rel="noreferrer"
            >
              European CDC Response Plan
            </a>
            , modified to use the specific representatives of category I and II antibiotic classes that are available in
            the dashboard.
          </Typography>
          <br />
          <Divider sx={{ borderBottomWidth: 3 }} />
          <br />

          <Typography variant="h6" className={classes.paragraph}>
            <i>Shigella</i> + EIEC
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            <i>Shigella</i> and enteroinvasive <i>E. coli</i> (EIEC) data in AMRnet are drawn from{' '}
            <a href="https://enterobase.warwick.ac.uk/" target="_blank" rel="noreferrer">
              <a href="https://enterobase.warwick.ac.uk/" target="_blank" rel="noreferrer">
                Enterobase
              </a>
            </a>
            , which calls AMR genotypes using NCBI’s{' '}
            <a
              href="https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/"
              target="_blank"
              rel="noreferrer"
            >
              AMRFinderPlus
            </a>{' '}
            and assigns lineages using{' '}
            <a href="https://doi.org/10.1101/gr.251678.119" target="_blank" rel="noreferrer">
              cgMLST
            </a>{' '}
            and{' '}
            <a href="https://doi.org/10.1093/bioinformatics/btab234" target="_blank" rel="noreferrer">
              hierarchical clustering
            </a>
            . Last update: 24 January 2024.
          </Typography>

          <br />
          <Typography variant="subtitle2" className={classes.paragraph}>
            WARNING:
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            The <i>Shigella</i> + EIEC data used in AMRnet are not yet curated for purpose-of-sampling, and therefore
            reflect the biases of global sequencing efforts which may be skewed towards sequencing AMR strains and/or
            outbreaks. Data curation efforts are ongoing however until then, please be careful when interpreting the
            data in the dashboard.
          </Typography>
          <br />
          <Typography variant="subtitle2" className={classes.paragraph}>
            Variable definitions
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            <li>
              <span className={classes.paragraphBold}>Lineages:</span> The logic used by{' '}
              <a href="https://enterobase.warwick.ac.uk/" target="_blank" rel="noreferrer">
                <a href="https://enterobase.warwick.ac.uk/" target="_blank" rel="noreferrer">
                  Enterobase
                </a>
              </a>{' '}
              to classify genomes as Shigella or EIEC are detailed{' '}
              <a
                href="https://enterobase.readthedocs.io/en/latest/pipelines/backend-pipeline-phylotypes.html?highlight=shigella"
                target="_blank"
                rel="noreferrer"
              >
                here
              </a>
              . Shigella sonnei are monophyletic and labelled as lineage ‘S. sonnei’. For other Shigella, lineages are
              labeled by the species followed by the HC400 (
              <a
                href="https://enterobase.readthedocs.io/en/latest/features/clustering.html"
                target="_blank"
                rel="noreferrer"
              >
                HierCC
              </a>
              ) cluster ID (as this nomenclature has been{' '}
              <a href="https://doi.org/10.1038/s41467-022-28121-1" target="_blank" rel="noreferrer">
                shown
              </a>{' '}
              to mirror the paraphyletic lineage structure of Shigella). EIEC lineages are labeled by ST (e.g. ‘EIEC
              ST99’).
            </li>
            <li>
              <span className={classes.paragraphBold}>AMR determinants:</span>{' '}
              <a href="https://enterobase.warwick.ac.uk/" target="_blank" rel="noreferrer">
                Enterobase
              </a>{' '}
              identifies AMR determinants using NCBI’s{' '}
              <a
                href="https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/"
                target="_blank"
                rel="noreferrer"
              >
                AMRFinderPlus
              </a>
              . AMRnet assigns these determinants to drugs/classes in the dashboard using the Subclass curated in{' '}
              <a href="https://doi.org/10.1099/mgen.0.000832" target="_blank" rel="noreferrer">
                refgenes
              </a>
              .
            </li>
          </Typography>

          <br />
          <Divider />
          <br />

          <Typography variant="h6" className={classes.paragraph}>
            Diarrheagenic<i> E. coli</i>
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            Diarrheagenic <i>E. coli</i> data in AMRnet are drawn from{' '}
            <a href="https://enterobase.warwick.ac.uk/" target="_blank" rel="noreferrer">
              Enterobase
            </a>
            , which calls AMR genotypes using NCBI’s{' '}
            <a
              href="https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/"
              target="_blank"
              rel="noreferrer"
            >
              AMRFinderPlus
            </a>{' '}
            and assigns lineages using MLST,{' '}
            <a href="https://doi.org/10.1101/gr.251678.119" target="_blank" rel="noreferrer">
              cgMLST
            </a>{' '}
            and{' '}
            <a href="https://doi.org/10.1093/bioinformatics/btab234" target="_blank" rel="noreferrer">
              hierarchical clustering
            </a>
            . The logic used by{' '}
            <a href="https://enterobase.warwick.ac.uk/" target="_blank" rel="noreferrer">
              Enterobase
            </a>{' '}
            to classify <i>E. coli</i> genomes to pathotypes is shown{' '}
            <a
              href="https://enterobase.readthedocs.io/en/latest/pipelines/backend-pipeline-phylotypes.html?highlight=pathovar"
              target="_blank"
              rel="noreferrer"
            >
              here
            </a>
            . Pathotypes included in the diarrheagenic <i>E. coli</i> dashboard are:
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            <li>
              Shiga toxin-producing <i>E. coli</i> (STEC)
            </li>
            <li>
              Enterohemorrhagic <i>E. coli</i> (EHEC)
            </li>
            <li>
              Enterotoxigenic <i>E. coli</i> (ETEC)
            </li>
            <li>
              Enteropathogenic <i>E. coli</i> (EPEC)
            </li>
            <li>
              Enteroinvasive <i>E. coli</i> (EIEC)
            </li>
          </Typography>
          <br />
          <Typography variant="body2" className={classes.paragraph}>
            Last update: 24 January 2024
          </Typography>

          <br />
          <Typography variant="subtitle2" className={classes.paragraph}>
            WARNING:
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            The <i>E. coli</i> data used in AMRnet are not yet curated for purpose-of-sampling, and therefore reflect
            the biases of global sequencing efforts which may be skewed towards sequencing AMR strains and/or outbreaks.
            Data curation efforts are ongoing however until then, please be careful when interpreting the data in the
            dashboard.
          </Typography>
          <br />
          <Typography variant="subtitle2" className={classes.paragraph}>
            Variable definitions
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            <li>
              <span className={classes.paragraphBold}>Lineages:</span> Lineages are labeled by the pathovar followed by
              the (7-locus) ST.
            </li>
            <li>
              <span className={classes.paragraphBold}>AMR determinants:</span>{' '}
              <a href="https://enterobase.warwick.ac.uk/" target="_blank" rel="noreferrer">
                Enterobase
              </a>{' '}
              identifies AMR determinants using NCBI’s{' '}
              <a
                href="https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/"
                target="_blank"
                rel="noreferrer"
              >
                AMRFinderPlus
              </a>
              . AMRnet assigns these determinants to drugs/classes in the dashboard using the Subclass curated in{' '}
              <a href="https://doi.org/10.1099/mgen.0.000832" target="_blank" rel="noreferrer">
                refgenes
              </a>
              .
            </li>
          </Typography>

          <br />
          <Divider />
          <br />
          <Typography variant="h6" className={classes.paragraph}>
            Invasive Non-Typhoidal <i>Salmonella</i>
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            Invasive non-typhoidal Salmonella (iNTS) data in AMRnet are drawn from{' '}
            <a href="https://enterobase.warwick.ac.uk/" target="_blank" rel="noreferrer">
              Enterobase
            </a>
            , which calls AMR genotypes using NCBI’s{' '}
            <a
              href="https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/"
              target="_blank"
              rel="noreferrer"
            >
              AMRFinderPlus
            </a>
            , assigns lineages using MLST,{' '}
            <a href="https://doi.org/10.1101/gr.251678.119" target="_blank" rel="noreferrer">
              cgMLST
            </a>{' '}
            and{' '}
            <a href="https://doi.org/10.1093/bioinformatics/btab234" target="_blank" rel="noreferrer">
              hierarchical clustering
            </a>
            , and assigns serotypes using{' '}
            <a href="https://doi.org/10.1371/journal.pone.0147101" target="_blank" rel="noreferrer">
              SISTR
            </a>
            . he iNTS dashboard currently includes invasive lineages of serovar Typhimurium or Enteritidis (which
            account for{' '}
            <a href="https://doi.org/10.1016/S1473-3099(21)00615-0" target="_blank" rel="noreferrer">
              &gt;90% of iNTS
            </a>
            ), based on HierCC 150 clusters. Last update: 24 January 2024.
          </Typography>

          <br />
          <Typography variant="subtitle2" className={classes.paragraph}>
            WARNING:
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            The iNTS data used in AMRnet are not yet curated for purpose-of-sampling, and therefore reflect the biases
            of global sequencing efforts which may be skewed towards sequencing AMR strains and/or outbreaks. Data
            curation efforts are ongoing however until then, please be careful when interpreting the data in the
            dashboard.
          </Typography>
          <br />
          <Typography variant="subtitle2" className={classes.paragraph}>
            Variable definitions
          </Typography>
          <Typography variant="body2" className={classes.paragraph}>
            <li>
              <span className={classes.paragraphBold}>Lineages:</span> Lineage is labelled as iTYM (invasive
              Typhimurium) or iENT (invasive Enteritidis), followed by the lineage name. Lineages are identified based
              on HierCC 150 clusters as follows: 305 = iTYM ST19-L1; 1547 = iTYM ST19-L3; 48 = iTYM ST19-L4; 9882 = iTYM
              ST313-L1; 12675 = iENT CEAC (Central/East Africa Clade); 2452 = iENT WAC (West Africa Clade).
            </li>
            <li>
              <span className={classes.paragraphBold}>AMR determinants:</span>{' '}
              <a href="https://enterobase.warwick.ac.uk/" target="_blank" rel="noreferrer">
                Enterobase
              </a>{' '}
              identifies AMR determinants using NCBI’s{' '}
              <a
                href="https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/"
                target="_blank"
                rel="noreferrer"
              >
                AMRFinderPlus
              </a>
              . AMRnet assigns these determinants to drugs/classes in the dashboard using the Subclass curated in{' '}
              <a href="https://doi.org/10.1099/mgen.0.000832" target="_blank" rel="noreferrer">
                refgenes
              </a>
              .
            </li>
          </Typography>

          {/* <br/> */}
          {/* <Divider sx={{ borderBottomWidth: 3 }}/> */}
          {/* <br/> */}
        </CardContent>
      </Card>
      <Footer />
    </MainLayout>
  );
};
