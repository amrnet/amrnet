// import { Card, CardContent, Typography } from '@mui/material';
export function getSalmonellaTexts() {
  // const lastUpdated = 'January 24th 2024';
  // const githubRepo = 'https://github.com/typhoidgenomics/TyphiNET';
  // const typhinetURL = 'https://www.typhi.net';
  // const typhiPathogenwatchPaper = 'Argimon et al. 2021, Nat. Commun., (<https://doi.org/10.1038/s41467-021-23091-2>)';
  // const dysonHoltPaper = 'Dyson & Holt (2021), J. Infect. Dis. (<https://doi.org/10.1093/infdis/jiab414>)';
  // const ingleEtAlPaper = 'Ingle et al. 2019, PLoS NTDs., (<https://doi.org/10.1371/journal.pntd.0007620>)';
  // const careyEtAlPaper = 'Carey et al, 2023 https://doi.org/10.7554/eLife.85867';
  // const wellcomeTrustFunding = 'Wellcome Trust (Open Research Fund, 219692/Z/19/Z and AMRnet project, 226432/Z/22/Z)';
  // const euHorizon2020Funding =
  //   'European Union Horizon 2020 research and innovation programme under the Marie Sklodowska-Curie grant agreement No 845681';

  return [
    `This report was generated using the AMRnet dashboard (https://www.amrnet.org), see website for documentation.`,
    `Source Data`,
    `AMRnet displays genome-derived information on antimicrobial resistance (AMR) and genotypes for the bacterial pathogen`,
    'Salmonella',
    'Typhi. The prevalence estimates shown are calculated using genome',
    'collections derived from non-targeted sampling frames (i.e. surveillance and burden studies, as opposed to AMR focused studies or outbreak investigations) with known year of isolation and country of origin.',
    'Salmonella',
    'Typhi data in AMRnet are drawn from Pathogenwatch (https://pathogen.watch), which calls ',
    'AMR determinants and genotypes from genome assemblies (see https://doi.org/10.1038/s41467-021-23091-2). The',
    'Salmonella',
    'Typhi data in Pathogenwatch are curated by the Global Typhoid Genomics Consortium ',
    '(https://www.typhoidgenomics.org), as described in Carey et al (2023), eLife (https://doi.org/10.7554/eLife.85867). The AMRnet dashboard mirrors the data and functionality of the TyphiNET dashboard (https://www.typhi.net), on which AMRnet is based.',
    'Individual genome information, including derived genotype and AMR calls, sequence data accession numbers, and source information (PubMedID for citation) can be downloaded as a spreadsheet from the AMRnet dashboard (https://www.amrnet.org).',
    'AMRnet’s',
    'Salmonella',
    'Typhi database was last updated on November 6th 2024.',
    `Variable definitions`,
    `The genotypes reported here are from the GenoTyphi scheme, defined in Dyson & Holt (2021), J. Infect. Dis. (https://doi.org/10.1093/infdis/jiab414).`,
    `Travel-associated cases are attributed to the country of travel, not the country of isolation, see Ingle et al. 2019, PLoS NTDs., (https://doi.org/10.1371/journal.pntd.0007620).`,
    `Antimicrobial resistance determinants are described in the Typhi Pathogenwatch paper, see Argimon et al. 2021, Nat. Commun., (https://doi.org/10.1038/s41467-021-23091-2).`,

    'Abbreviations',
    `1. MDR, multidrug resistant (resistant to ampicillin, chloramphenicol, and trimethoprim-sulfamethoxazole)`,
    `2. XDR, extensively drug resistant (MDR plus resistant to ciprofloxacin and ceftriaxone)`,
    `3. Ciprofloxacin NS, ciprofloxacin non-susceptible (MIC >=0.06 mg/L, due to presence of one or more`,
    `genes or mutations in)`,
    `4. Ciprofloxacin R, ciprofloxacin resistant (MIC >=0.5 mg/L, due to presence of multiple mutations and/or genes, see Carey et al, 2023 https://doi.org/10.7554/eLife.85867)`,
    // `Funding`,
    // 'The TyphiNET dashboard for',
    // 'Salmonella',
    // 'Typhi received funding from the Wellcome Trust (Open ',
    // 'Research Fund, 219692/Z/19/Z) and the European Union Horizon 2020 research and innovation programme under the Marie Sklodowska-Curie grant agreement No 845681.       The AMRnet project (funded by the Wellcome Trust, 226432/Z/22/Z) builds on TyphiNET to extend functionality to other bacteria.',
  ];
}

export function getKlebsiellaTexts() {
  // const amrnetURL = 'https://www.amrnet.org';
  // const KpgithubRepo = 'https://github.com/klebgenomics/Kleborate';
  // const pathogenwatchURL = 'https://pathogen.watch';
  // const bigsdbURL = 'https://bigsdb.pasteur.fr/klebsiella';
  // const klebPathogenwatchPaperURL = 'https://doi.org/10.1093/cid/ciab784';
  // const diancourtPaper =
  //   'Diancourt et al (2005), J Clin Microbiol. (<https://doi.org/10.1128/jcm.43.8.4178-4182.2005>)';
  // const lamEtAlPaper = 'Lam et al (2021), Nature Communications, (<https://doi.org/10.1038/s41467-021-24448-3>)';

  return [
    'This report was using the AMRnet dashboard (https://www.amrnet.org), see website for documentation',
    'Source Data',
    'AMRnet displays information on antimicrobial resistance (AMR) and multi-locus sequence types (MLST) for the bacterial pathogen ',
    'Klebsiella pneumoniae',
    ', derived from public genome data.',
    'Klebsiella pneumoniae',
    ' data in AMRnet are sourced from Pathogenwatch (https://pathogen.watch), ',
    'which calls AMR and genotypes (MLST) from genomes assembled from public data (see https://doi.org/10.1093/cid/ciab784). See below for details of how the genotyping is undertaken.',
    'WARNING:',
    'The ',
    'Klebsiella pneumoniae',
    ' data used in AMRnet are not yet curated for purpose-of-sampling, and',
    'therefore reflect the biases of global sequencing efforts which have been largely directed at sequencing ESBL and carbapenemase-producing strains or hypervirulent strains in order to understand their emergence and spread, and to investigate outbreaks in hospitals. The KlebNET consortium is undertaking efforts to curate the public genome data for ',
    'Klebsiella pneumoniae',
    ' , which will ultimately ',
    'allow AMRnet to identify genome collections derived from non-targeted sampling frames (i.e. surveillance and burden studies, as opposed to AMR focused studies or outbreak investigations) suitable to calculate national annual AMR prevalence estimates and trends (as we do currently for',
    'Salmonella Typhi and Neisseria gonorrhoeae',
    '). However until then, please be careful when interpreting',
    'the data in the dashboard.',
    'Individual genome information, including MLST and AMR calls, and sequence data accession numbers, can be downloaded as a spreadsheet from the AMRnet dashboard (https://www.amrnet.org).',
    'AMRnet’s ',
    'Klebsiella pneumoniae',
    ' database was last updated on November 6th 2024.',
    'Variable definitions',
    'Genotype - Pathogenwatch assigns sequence types (STs) using the 7-locus MLST scheme for ',
    'Klebsiella pneumoniae,',
    'defined by Diancourt et al (2005), J Clin Microbiol',
    '(https://doi.org/10.1128/jcm.43.8.4178-4182.2005) and maintained by Institut Pasteur (https://bigsdb.pasteur.fr/klebsiella/)',
    `Antimicrobial resistance determinants are identified by Pathogenwatch using Kleborate v2, developed and maintained by the Holt lab (https://github.com/klebgenomics/Kleborate) and described in Lam et al (2021), Nature Communications (https://doi.org/10.1038/s41467-021-24448-3).`,
    'Abbreviations',
    'ESBL (extended-spectrum beta-lactamase)',
    'MLST (multi-locus sequence type)',
    'ST (sequence type)',
  ];
}

export function getNgonoTexts() {
  // const amrnetURL = 'https://www.amrnet.org';
  // const pathogenwatchURL = 'https://pathogen.watch';
  // const gonoPaper1 = 'https://doi.org/10.1186/s13073-021-00858-2';
  // const gonoPaper2 = 'https://doi.org/10.1186/1741-7007-5-35';
  // const gonoPaper3 = 'https://doi.org/10.1086/383047';
  // const gonoPaper4 = 'https://pubmlst.org/neisseria/';
  // const gonoPaper5 = 'https://doi.org/10.1186/s13073-021-00858-2';
  // const gonoPaper6 =
  //   'https://www.ecdc.europa.eu/sites/default/files/documents/multi-and-extensively-drug-resistant-gonorrhoea-response-plan-Europe-2019.pdf';

  return [
    'This report was using the AMRnet dashboard (https://www.amrnet.org), see website for documentation',
    `Source Data`,
    `AMRnet displays information on antimicrobial resistance (AMR) and genotype (sequence type) for the bacterial pathogen Neisseria gonorrhoeae, derived from public genome data.`,
    `The prevalence estimates shown are calculated using genome collections derived from non-targeted sampling frames (i.e. surveillance and burden studies, as opposed to AMR focused studies or outbreak investigations). These include EuroGASP 2013, 2018 & 2020 and several national surveillance studies.`,
    `Neisseria gonorrhoeae`,
    `data in AMRnet are sourced from Pathogenwatch (https://pathogen.watch),`,
    `which calls AMR and lineage genotypes (MLST, NG-MAST) from genomes assembled from public data (see https://doi.org/10.1186/s13073-021-00858-2). See below for details of how the genotyping is undertaken.`,
    `Individual genome information, including AMR, MLST and NG-MAST calls, sequence data accession numbers, and source information (PubMedID for citation) can be downloaded as a spreadsheet from the AMRnet dashboard (https://www.amrnet.org).`,
    `AMRnet’s`,
    `Neisseria gonorrhoeae`,
    `database was last updated on March 24th 2025`,
    `Variable definitions`,
    `Genotype - Users can choose from (i) sequence types (STs) assigned using the 7-locus MLST scheme for`,
    `Neisseria,`,
    `defined by Bennett et al (2007), BMC Biology (https://doi.org/10.1186/1741-7007-5-35);`,
    `or (ii) STs assigned using the 2-locus`,
    `N. gonorrhoeae`,
    `multi-antigen sequence typing (NG-MAST) `,
    `scheme, defined by Martin et al (2004), J Infect Dis  (https://doi.org/10.1086/383047). Both schemes are hosted by PubMLST (https://pubmlst.org/neisseria/).`,
    `Antimicrobial resistance determinants - These are identified by Pathogenwatch using an inhouse dictionary developed and maintained in consultation with an expert advisory group, as described by Sánchez-Busó et al (2021), Genome Medicine (https://doi.org/10.1186/s13073-021-00858-2).`,
    `AMR determinants within genotypes - This plot shows combinations of determinants that result in clinical resistance to Azithromycin or Ceftriaxone, as defined in Figure 3 of Sánchez-Busó et al (2021), Genome Medicine (https://doi.org/10.1186/s13073-021-00858-2).`,
    `Susceptible to cat I/II drugs - No determinants found for Azithromycin, Ceftriaxone, Cefixime (category I) or Penicillin, Ciprofloxacin, Spectinomycin (category II)`,
    'Abbreviations',
    `1. MDR, multidrug resistant (Resistant to one of Azithromycin / Ceftriaxone / Cefixime [category I representatives], plus two or more of Penicillin / Ciprofloxacin / Spectinomycin [category II representatives])`,
    `2. XDR, extensively drug resistant (Resistant to two of Azithromycin / Ceftriaxone / Cefixime [category I drugs], plus three of Penicillin / Ciprofloxacin / Spectinomycin [category II representatives])`,
    `Note these definitions are based on those defined in the European CDC Response Plan, modified to use the specific representatives of category I and II antibiotic classes that we have available in the dashboard. `,
    `(https://www.ecdc.europa.eu/sites/default/files/documents/multi-and-extensively-drug-resistant-gonorrhoea-response-plan-Europe-2019.pdf)`,
  ];
}

export function getEcoliTexts() {
  return [
    'Escherichia coli',
    ' and',
    'Shigella ',
    'data visualized in AMRnet are sourced from Enterobase (https://enterobase.warwick.ac.uk/)',
    'Sequence types (STs) are assigned in silico via the Achtman MLST scheme, with novel STs',
    'created as needed, and unique core-genome MLST types derived from 2,513 loci. Pathovars',
    'are predicted by hierarchical clustering, while phylogroups are determined using',
    'ClermontTyper (v. 5 July 2019) and EzClermont (v. 25 August 2018). O:H serotypes (lipopolysaccharide + flagellar antigen combinations)',
    'and fimH alleles (v. 1 May 2017) are called with EcTyper and FimTyper, respectively. Antimicrobial-resistance genotypes are detected using NCBI’s',
    'AMRFinderPlus (https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/). and virulence factors are identified via BlastFrost.',
    'For full details on pathovar prediction, MLST schemas, and other genotyping workflows, see the Enterobase documentation (https://enterobase.warwick.ac.uk/docs/).','* Shiga toxin-producing E. coli (STEC)',

    '* Enterohemorrhagic E. coli (EHEC)',
    '* Enterotoxigenic E. coli (ETEC)',
    '* Enteropathogenic E. coli (EPEC)',
    '* Enteroinvasive E. coli (EIEC)',

    'The last update was made in May 22nd 2025.',
    'WARNING:',
    'The',
    'Escherichia coli data used in AMRnet are not yet curated for purpose-of-sampling, and therefore ',
    'reflect the biases of global sequencing efforts.',

    'Abbreviations:',
    '1. MDR, multidrug resistant (resistant to ampicillin, chloramphenicol, and trimethoprim-sulfamethoxazole)',
    '2. XDR, extensively drug resistant (MDR plus resistant to fluoroquinolones and third-generation cephalosporins)',
    '3. Ciprofloxacin NS, ciprofloxacin non-susceptible (MIC >=0.06 mg/L, due to presence of one or more qnr genes or mutations in gyrA/parC/gyrB)',
    '4. Ciprofloxacin R, ciprofloxacin resistant (MIC >=0.5 mg/L, due to the presence of multiple mutations and/or genes',

    'Variable definitions',
    'Lineages',
    'are labeled by the pathovar followed by the (7-locus) ST.',
    'AMR determinants',
    'Enterobase identifies AMR determinants using NCBI’s AMRFinderPlus. AMRnet',
    'imports these AMR genotype calls, and assigns them to drugs/classes in the dashboard using the Subclass curated in refgenes (https://www.microbiologyresearch.org/content/journal/mgen/10.1099/mgen.0.000832).',
  ];
}

export function getIntsTexts() {
  return [
    'This report was using the AMRnet dashboard (https://www.amrnet.org), see website for documentation',
    'Salmonella',
    '(invasive non-typhoidal)',
    'data visualised in AMRnet are drawn from Enterobase (https://enterobase',
    '.warwick.ac.uk/), which calls AMR genotypes using NCBI’s AMRFinderPlus, assigns lineages using MLST, cgMLST and hierarchical clustering, and assigns serotypes using SISTR. The Salmonella (invasive non-typhoidal) dashboard currently includes all genomes identified as serotype Typhimurium or Enteritidis (which account for >90% of Salmonella (invasive non-typhoidal) genomes in the dashboard), and identifies lineages thereof using MLST. Last update: May 14th 2025 ',
    'For information about',
    'Salmonella',
    'Typhi, please see the Typhi dashboard.',
    'WARNING:',
    'The Salmonella (invasive non-typhoidal) data used in AMRnet have not yet been curated to include information on purpose of sampling, and therefore reflect the biases of global sequencing efforts, which may be skewed towards sequencing drug-resistant organisms and/or those isolated during outbreaks. Data curation efforts are ongoing; however, until then, please be careful when drawing inferences about generalisability of the data featured in the dashboard.',

    'Variable definitions',
    'Lineages',
    ': Lineages associated with invasive disease in low-income countries are labeled by the',
    'serotype, either Typhimuirum (iTYM) or Enteritidis (iENT) followed by the (7-locus) ST, followed by invasive sublineages defined by Van Puyvelde et al. 2023 and  Fong et al. 2023',
    'AMR determinants',
    ': Enterobase identifies AMR determinants using NCBI’s AMRFinderPlus.',
    'AMRnet assigns these determinants to drugs/classes in the dashboard using the Subclass curated in refgenes. AMR categories are those described in Van Puyvelde et al. 2023',

    'Abbreviations',
    'iTYM:',
    ' Invasive Salmonella Typhimuirum',
    'iENT:',
    ' Invasive Salmonella Enteritidis',
    'ST:',
    ' Sequence Type',
    'WAC:',
    ' West Africa Clone',
    'CEAC:',
    ' Central/East African Clone',
    'L:',
    ' Lineage',
    'MDR:',
    'multidrug resistant (resistant to ampicillin, chloramphenicol, and trimethoprim-sulfamethoxazole)',
    'XDR:',
    'extensively drug resistant (MDR plus resistant to either (i) ciprofloxacin and ceftriaxone, or ',
    '(i) azithromycin and ceftriaxone)',
    'PDR:',
    'pan-drug resistant (MDR plus resistant to ciprofloxacin, azithromycin and ceftriazone)',
    'Ciprofloxacin NS:',
    'ciprofloxacin non-susceptible (MIC >=0.06 mg/L, due to presence of one or more',
    'gnr',
    ' genes or mutations in',
    ' gyrA/parC/gyrB',
    ')',
    'Ciprofloxacin R:',
    'ciprofloxacin resistant (MIC >=0.5 mg/L, due to the presence of multiple mutations',
    'and/or genes)',
  ];
}
export function getDEcoliTexts() {
  return [
    'Escherichia coli',
    '(diarrheagenic)',
    'data visualised in AMRnet are drawn from Enterobase (https://enterobase.warwick.ac.uk/),',
    'which calls AMR genotypes using NCBI’s AMRFinderPlus (https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/) and assigns lineages using MLST. , cgMLST and hierarchical clustering. The logic used by Enterobase to classify E. coli genomes to pathotypes is shown here. Pathotypes included in the E. coli (diarrheagenic) dashboard are:',
    '* Shiga toxin-producing E. coli (STEC)',
    '* Enterohemorrhagic E. coli (EHEC)',
    '* Enterotoxigenic E. coli (ETEC)',
    '* Enteropathogenic E. coli (EPEC)',
    '* Enteroinvasive E. coli (EIEC)',

    'The last update was made in May 14th 2025.',

    'WARNING:',
    'The E. coli data used in AMRnet are not yet curated for purpose-of-sampling, and therefore',
    'reflect the biases of global sequencing efforts which may be skewed towards sequencing AMR strains and/or outbreaks. Data curation efforts are ongoing however until then, please be careful when interpreting the data in the dashboard. ',

    'Variable definitions',
    'Lineages',
    'are labeled by the pathovar followed by the (7-locus) ST.',
    'AMR determinants',
    'Enterobase identifies AMR determinants using NCBI’s AMRFinderPlus. AMRnet',
    'imports these AMR genotype calls, and assigns them to drugs/classes in the dashboard using the Subclass curated in refgenes (https://www.microbiologyresearch.org/content/journal/mgen/10.1099/mgen.0.000832).',

    // 'Abbreviations',
    // `1. MDR, multi-drug resistant (resistant to ampicillin, chloramphenicol, and trimethoprim-sulfamethoxazole)`,
    // `2. XDR, extensively drug resistant (MDR plus resistant to ciprofloxacin and ceftriaxone)`,
    // `3. Ciprofloxacin NS, ciprofloxacin non-susceptible (MIC >=0.06 mg/L, due to presence of one or more`,
    // `genes or mutations in`,
    // `)`,
    // `4. Ciprofloxacin R, ciprofloxacin resistant (MIC >=0.5 mg/L, due to presence of multiple mutations and/or genes, see Carey et al, 2023 https://doi.org/10.7554/eLife.85867)`,
  ];
}

export function getShigeTexts() {
  return [
    'Shigella',
    'data visualised in AMRnet are drawn from Enterobase (https://enterobase.warwick.ac.uk/),',
    'which calls AMR genotypes using NCBI’s AMRFinderPlus (https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/) and assigns lineages using 7-gene MLST. The last update was made in May 14th 2025.',

    // 'For information about Salmonella Typhi, please see the Typhi dashboard.',

    'WARNING:',
    'The ',
    'Shigella',
    ' + EIEC data used in AMRnet are not yet curated for purpose-of-sampling, and ',
    'therefore reflect the biases of global sequencing efforts which may be skewed towards sequencing AMR strains and/or outbreaks. Data curation efforts are ongoing however until then, please be careful when interpreting the data in the dashboard. ',

    'Variable definitions',
    'Lineages',
    'The logic used by Enterobase to classify genomes as Shigella or EIEC are detailed here. Shigella sonnei are monophyletic and labelled as lineage ‘S. sonnei’. For other Shigella, lineages are labeled by the species followed by the HC400 (HierCC) cluster ID (as this nomenclature has been shown to mirror the paraphyletic lineage structure of Shigella). EIEC lineages are labeled by ST (e.g. ‘EIEC ST99’).',
    'AMR determinants',
    'Enterobase identifies AMR determinants using NCBI’s AMRFinderPlus. AMRnet imports these AMR genotype calls, and assigns them to drugs/classes in the dashboard using the Subclass curated in refgenes.',

    // 'Abbreviations',
    // `1. MDR, multi-drug resistant (resistant to ampicillin, chloramphenicol, and trimethoprim-sulfamethoxazole)`,
    // `2. XDR, extensively drug resistant (MDR plus resistant to ciprofloxacin and ceftriaxone)`,
    // `3. Ciprofloxacin NS, ciprofloxacin non-susceptible (MIC >=0.06 mg/L, due to presence of one or more`,
    // `genes or mutations in`,
    // `)`,
    // `4. Ciprofloxacin R, ciprofloxacin resistant (MIC >=0.5 mg/L, due to presence of multiple mutations and/or genes, see Carey et al, 2023 https://doi.org/10.7554/eLife.85867)`,
  ];
}

export function getSentericaintsTexts() {
  return [
    'Salmonella enterica',
    'data visualised in AMRnet are drawn from Enterobase (https://enterobase.warwick',
    '.ac.uk/), which calls AMR genotypes using NCBI’s AMRFinderPlus (https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/) and assigns lineages using 7-gene MLST. The last update was made in May 14th 2025.',

    'For information about Salmonella Typhi, please see the Typhi dashboard.',

    'WARNING:',
    'The ',
    'Salmonella enterica',
    ' data used in AMRnet are not yet curated for purpose-of-sampling, ',
    'and therefore reflect the biases of global sequencing efforts.',

    ' Variable definitions',
    'Genotype - Pathogenwatch assigns sequence types (STs) using the 7-locus MLST scheme for Salmonella enterica, defined by XX.',
    'The genotypes reported here are from the X.',
    'Antimicrobial resistance determinants are described in the paper XXXX',

    'Abbreviations',
    `1. MDR, multidrug resistant (resistant to ampicillin, chloramphenicol, and trimethoprim-sulfamethoxazole)`,
    `2. XDR, extensively drug resistant (MDR plus resistant to ciprofloxacin and ceftriaxone)`,
    `3. Ciprofloxacin NS, ciprofloxacin non-susceptible (MIC >=0.06 mg/L, due to presence of one or more`,
    `genes or mutations in`,
    `)`,
    `4. Ciprofloxacin R, ciprofloxacin resistant (MIC >=0.5 mg/L, due to presence of multiple mutations and/or genes, see Carey et al, 2023 https://doi.org/10.7554/eLife.85867)`,
  ];
}
