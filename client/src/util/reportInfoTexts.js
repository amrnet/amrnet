export function getSalmonellaTexts(date) {
  return [
    `This report was generated using TyphiNET (https://www.typhi.net), a data visualisation platform that draws genome-derived data on antimicrobial resistance and genotypes from Typhi Pathogenwatch (https://pathogen.watch), curated by the Global Typhoid Genomics Consortium (https://www.typhoidgenomics.org).`,
      `Source Data`,
      `TyphiNET data were last updated on January 24th 2024. For code and further details please see: (https://github.com/typhoidgenomics/TyphiNET).`,
      `Individual genome information, including derived genotype and AMR calls, sequence data accession numbers, and source information (PubMedID for citation) can be downloaded as a spreadsheet from the TyphiNET website (https://www.typhi.net).`,
      `Variable definitions`,  
      `The genotypes reported here are defined in Dyson & Holt (2021), J. Infect. Dis. (https://doi.org/10.1093/infdis/jiab414).`,
      `Travel-associated cases are attributed to the country of travel, not the country of isolation, Ingle et al. 2019, PLoS NTDs., (https://doi.org/10.1371/journal.pntd.0007620).`,
      `Antimicrobial resistance determinants are described in the Typhi Pathogenwatch paper, Argimon et al. 2021, Nat. Commun., (https://doi.org/10.1038/s41467-021-23091-2).`,
      'Abbreviations',
      `1. MDR, multi-drug resistant (resistant to ampicillin, chloramphenicol, and trimethoprim-sulfamethoxazole)`,
      `2. XDR, extensively drug resistant (MDR plus resistant to ciprofloxacin and ceftriaxone)`,
      `3. Ciprofloxacin NS, ciprofloxacin non-susceptible (MIC >=0.06 mg/L, due to presence of one or more`, 
      `genes or mutations in`,
      `)`,
      `4. Ciprofloxacin R, ciprofloxacin resistant (MIC >=0.5 mg/L, due to presence of multiple mutations and/or genes, see Carey et al, 2023 https://doi.org/10.7554/eLife.85867)`,
      `Funding`,											
      `This project has received funding from the Wellcome Trust (Open Research Fund, 219692/Z/19/Z and AMRnet project, 226432/Z/22/Z) and the European Union Horizon 2020 research and innovation programme under the Marie Sklodowska-Curie grant agreement No 845681`
  ];
}

export function getKlebsiellaTexts() {
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
    ' database was last updated on January 24th 2024.',
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
  return [
    'This report was using the AMRnet dashboard (https://www.amrnet.org), see website for documentation',
      `Source Data`,
      `AMRnet displays information on antimicrobial resistance (AMR) and genotype (sequence type) for the bacterial pathogen Neisseria gonorrhoeae, derived from public genome data.`,
      `The prevalence estimates shown are calculated using genome collections derived from non-targeted sampling frames (i.e. surveillance and burden studies, as opposed to AMR focused studies or outbreak investigations). These include EuroGASP 2013 & 2018, and several national surveillance studies.`,
      `Neisseria gonorrhoeae`,
      `data in AMRnet are sourced from Pathogenwatch (https://pathogen.watch),`,
      `which calls AMR and lineage genotypes (MLST, NG-MAST) from genomes assembled from public data (see https://doi.org/10.1186/s13073-021-00858-2). See below for details of how the genotyping is undertaken.`,
      `Individual genome information, including AMR, MLST and NG-MAST calls, sequence data accession numbers, and source information (PubMedID for citation) can be downloaded as a spreadsheet from the AMRnet dashboard (https://www.amrnet.org).`,
      `AMRnet’s`,
      `Neisseria gonorrhoeae`,
      `database was last updated on January 24th 2024`,
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
      'Abbreviations',
      `1. MDR, multi-drug resistant (Resistant to one of Azithromycin / Ceftriaxone / Cefixime [category I representatives], plus two or more of Penicillin / Ciprofloxacin / Spectinomycin [category II representatives])`,
      `2. XDR, extensively drug resistant (Resistant to two of Azithromycin / Ceftriaxone / Cefixime [category I representatives], plus three of Penicillin / Ciprofloxacin / Spectinomycin [category II representatives])`,
      `Note these definitions are based on those defined in the European CDC Response Plan, modified to use the specific representatives of category I and II antibiotic classes that we have available in the dashboard. `, 
      `(https://www.ecdc.europa.eu/sites/default/files/documents/multi-and-extensively-drug-resistant-gonorrhoea-response-plan-Europe-2019.pdf)`,
  ];
}


export function getEcoliTexts() {
  return [
    'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque',
    'Aliquam laoreet, dolor eu convallis fringilla, velit dolor efficitur dui, eu fermentum tortor leo non justo. Suspendisse potenti.',
    'Nam accumsan pulvinar arcu, sit amet lobortis felis bibendum quis.',
    'Donec eu urna nunc. Quisque dapibus purus quis elit convallis tincidunt. Donec scelerisque neque a leo tincidunt, a placerat quam convallis.',
    'Donec dictum et odio ac convallis. Duis non lectus in lectus auctor fringilla. Etiam eros orci, ultrices id pellentesque et, volutpat et orci.',
    'Suspendisse potenti. Nullam vitae mi orci. Duis auctor purus rhoncus sapien posuere, vel malesuada sem convallis. Mauris euismod accumsan lectus vel dapibus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Fusce venenatis, ipsum in blandit tempor, dui turpis luctus risus.',
    'Quisque in lacinia enim, vel rutrum felis. Donec venenatis pulvinar vestibulum. Fusce pretium condimentum dolor in gravida. Morbi sollicitudin mollis tellus vel laoreet. Vivamus iaculis leo non diam tincidunt rutrum. Etiam id neque.'
  ];
}
export function getDEcoliTexts() {
  return [
    'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque',
    'Aliquam laoreet, dolor eu convallis fringilla, velit dolor efficitur dui, eu fermentum tortor leo non justo. Suspendisse potenti.',
    'Nam accumsan pulvinar arcu, sit amet lobortis felis bibendum quis.',
    'Donec eu urna nunc. Quisque dapibus purus quis elit convallis tincidunt. Donec scelerisque neque a leo tincidunt, a placerat quam convallis.',
    'Donec dictum et odio ac convallis. Duis non lectus in lectus auctor fringilla. Etiam eros orci, ultrices id pellentesque et, volutpat et orci.',
    'Suspendisse potenti. Nullam vitae mi orci. Duis auctor purus rhoncus sapien posuere, vel malesuada sem convallis. Mauris euismod accumsan lectus vel dapibus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Fusce venenatis, ipsum in blandit tempor, dui turpis luctus risus.',
    'Quisque in lacinia enim, vel rutrum felis. Donec venenatis pulvinar vestibulum. Fusce pretium condimentum dolor in gravida. Morbi sollicitudin mollis tellus vel laoreet. Vivamus iaculis leo non diam tincidunt rutrum. Etiam id neque.'
  ];
}

export function getShigeTexts() {
  return [
    'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque',
    'Aliquam laoreet, dolor eu convallis fringilla, velit dolor efficitur dui, eu fermentum tortor leo non justo. Suspendisse potenti.',
    'Nam accumsan pulvinar arcu, sit amet lobortis felis bibendum quis.',
    'Donec eu urna nunc. Quisque dapibus purus quis elit convallis tincidunt. Donec scelerisque neque a leo tincidunt, a placerat quam convallis.',
    'Donec dictum et odio ac convallis. Duis non lectus in lectus auctor fringilla. Etiam eros orci, ultrices id pellentesque et, volutpat et orci.',
    'Suspendisse potenti. Nullam vitae mi orci. Duis auctor purus rhoncus sapien posuere, vel malesuada sem convallis. Mauris euismod accumsan lectus vel dapibus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Fusce venenatis, ipsum in blandit tempor, dui turpis luctus risus.',
    'Quisque in lacinia enim, vel rutrum felis. Donec venenatis pulvinar vestibulum. Fusce pretium condimentum dolor in gravida. Morbi sollicitudin mollis tellus vel laoreet. Vivamus iaculis leo non diam tincidunt rutrum. Etiam id neque.'
  ];
}

export function getSentericaTexts() {
  return [
    'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque',
    'Aliquam laoreet, dolor eu convallis fringilla, velit dolor efficitur dui, eu fermentum tortor leo non justo. Suspendisse potenti.',
    'Nam accumsan pulvinar arcu, sit amet lobortis felis bibendum quis.',
    'Donec eu urna nunc. Quisque dapibus purus quis elit convallis tincidunt. Donec scelerisque neque a leo tincidunt, a placerat quam convallis.',
    'Donec dictum et odio ac convallis. Duis non lectus in lectus auctor fringilla. Etiam eros orci, ultrices id pellentesque et, volutpat et orci.',
    'Suspendisse potenti. Nullam vitae mi orci. Duis auctor purus rhoncus sapien posuere, vel malesuada sem convallis. Mauris euismod accumsan lectus vel dapibus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Fusce venenatis, ipsum in blandit tempor, dui turpis luctus risus.',
    'Quisque in lacinia enim, vel rutrum felis. Donec venenatis pulvinar vestibulum. Fusce pretium condimentum dolor in gravida. Morbi sollicitudin mollis tellus vel laoreet. Vivamus iaculis leo non diam tincidunt rutrum. Etiam id neque.'
  ];
}
export function getSentericaintsTexts() {
  return [
    'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque',
    'Aliquam laoreet, dolor eu convallis fringilla, velit dolor efficitur dui, eu fermentum tortor leo non justo. Suspendisse potenti.',
    'Nam accumsan pulvinar arcu, sit amet lobortis felis bibendum quis.',
    'Donec eu urna nunc. Quisque dapibus purus quis elit convallis tincidunt. Donec scelerisque neque a leo tincidunt, a placerat quam convallis.',
    'Donec dictum et odio ac convallis. Duis non lectus in lectus auctor fringilla. Etiam eros orci, ultrices id pellentesque et, volutpat et orci.',
    'Suspendisse potenti. Nullam vitae mi orci. Duis auctor purus rhoncus sapien posuere, vel malesuada sem convallis. Mauris euismod accumsan lectus vel dapibus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Fusce venenatis, ipsum in blandit tempor, dui turpis luctus risus.',
    'Quisque in lacinia enim, vel rutrum felis. Donec venenatis pulvinar vestibulum. Fusce pretium condimentum dolor in gravida. Morbi sollicitudin mollis tellus vel laoreet. Vivamus iaculis leo non diam tincidunt rutrum. Etiam id neque.'
  ];
}
