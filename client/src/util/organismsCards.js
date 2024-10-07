import { decoli, ecoli, ints, kleb, ngono, senterica, shig, typhi } from '../assets/organisms';

export const organismsCards = [
  {
    label: (
      <div>
        <i>Salmonella</i> Typhi
      </div>
    ),
    stringLabel: 'Salmonella Typhi',
    value: 'styphi',
    abbr: 'S. Typhi',
    img: typhi,
  },
  {
    label: (
      <div>
        <i>Klebsiella pneumoniae</i>
      </div>
    ),
    stringLabel: 'Klebsiella pneumoniae',
    value: 'kpneumo',
    abbr: 'K. pneumoniae',
    img: kleb,
  },
  {
    label: (
      <div>
        <i>Neisseria gonorrhoeae</i>
      </div>
    ),
    stringLabel: 'Neisseria gonorrhoeae',
    value: 'ngono',
    abbr: 'N. gonorrhoeae',
    img: ngono,
  },
  {
    label: (
      <div>
        <i>Escherichia coli</i>
      </div>
    ),
    stringLabel: 'Escherichia coli',
    value: 'ecoli',
    abbr: 'E. coli',
    img: ecoli,
  },
  {
    label: (
      <div>
        Diarrheagenic <i>E. coli</i>
      </div>
    ),
    stringLabel: 'Diarrheagenic E. coli',
    value: 'decoli',
    abbr: 'DEC',
    img: decoli,
  },
  {
    label: (
      <div>
        <i>Shigella</i> + EIEC
      </div>
    ),
    stringLabel: 'Shigella + EIEC',
    value: 'shige',
    abbr: 'Shigella+EIEC',
    img: shig,
  },
  {
    label: (
      <div>
        Invasive non-typhoidal <i>Salmonella</i>
      </div>
    ),
    stringLabel: 'Invasive non-typhoidal Salmonella',
    value: 'sentericaints',
    abbr: 'iNTS',
    img: ints,
  },
  {
    label: (
      <div>
        <i>Salmonella enterica</i>
      </div>
    ),
    stringLabel: 'Salmonella enterica',
    value: 'senterica',
    abbr: 'S. enterica',
    img: senterica,
  },
];
