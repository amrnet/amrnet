import { decoli, ecoli, ints, kleb, ngono, senterica, shig, typhi } from '../assets/organisms';

export const organismsCards = [
  {
    label: (
      <span>
        <i>Salmonella</i> Typhi
      </span>
    ),
    stringLabel: 'Salmonella Typhi',
    value: 'styphi',
    abbr: 'S. Typhi',
    img: typhi,
  },
  {
    label: (
      <span>
        <i>Salmonella</i> (invasive non-typhoidal)
      </span>
    ),
    stringLabel: 'Salmonella (invasive non-typhoidal)',
    value: 'sentericaints',
    abbr: 'Salmonella (iNT)',
    img: ints,
  },
  {
    label: (
      <span>
        <i>Salmonella enterica</i> (non-typhoidal)
      </span>
    ),
    stringLabel: 'Salmonella enterica (non-typhoidal)',
    value: 'senterica',
    abbr: 'S. enterica (NT)',
    img: senterica,
  },
  {
    label: (
      <span>
        <i>Neisseria gonorrhoeae</i>
      </span>
    ),
    stringLabel: 'Neisseria gonorrhoeae',
    value: 'ngono',
    abbr: 'N. gonorrhoeae',
    img: ngono,
  },
  {
    label: (
      <span>
        <i>Klebsiella pneumoniae</i>
      </span>
    ),
    stringLabel: 'Klebsiella pneumoniae',
    value: 'kpneumo',
    abbr: 'K. pneumoniae',
    img: kleb,
  },
  {
    label: (
      <span>
        <i>Shigella</i> + EIEC
      </span>
    ),
    stringLabel: 'Shigella + EIEC',
    value: 'shige',
    abbr: 'Shigella+EIEC',
    img: shig,
  },

  {
    label: (
      <span>
        <i>Escherichia coli</i> (diarrheagenic)
      </span>
    ),
    stringLabel: 'Escherichia coli (diarrheagenic)',
    value: 'decoli',
    abbr: 'E. coli (DEC)',
    img: decoli,
  },
  {
    label: (
      <span>
        <i>Escherichia coli</i>
      </span>
    ),
    stringLabel: 'Escherichia coli',
    value: 'ecoli',
    abbr: 'E. coli',
    img: ecoli,
  },
];

export const amrLikeOrganisms = ['decoli', 'ecoli', 'shige', 'sentericaints'];

export const organismsWithLotsGenotypes = ['ecoli', 'decoli', 'senterica', 'kpneumo', 'ngono'];
