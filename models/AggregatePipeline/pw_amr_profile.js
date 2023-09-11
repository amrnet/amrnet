const pw_profile = [
  {
    $addFields: {
      NAME: {
        $trim: {
          input: {
            $toString: "$NAME",
          },
        },
      },
    },
  },
  {
    $project: {
      NAME: 1,
      // Ampicillin: 1,
      // "Broad-Spectrum Cephalosporins": 1,
      // Chloramphenicol: 1,
      // Ciprofloxacin: 1,
      // Sulfonamides: 1,
      // Trimethoprim: 1,
      // "Co-Trimoxazole": 1,
      // Tetracycline: 1,
      // Azithromycin: 1,
      // Colistin: 1,
      // Meropenem: 1,
    },
  },
  {
    $merge: {
      into: "profile",
    },
  },
];
export default pw_profile;