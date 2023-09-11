const stats = [
  {
    $addFields: {
      NAME: {
        $toString: "$NAME",
      },
    },
  },
  {
    $project:
      /**
       * specifications: The fields to
       *   include or exclude.
       */
      {
        NAME: 1,
        // "CORE MATCHES": 1,
        // "% CORE FAMILIES": 1,
        // "% NON-CORE": 1,
        // "GENOME LENGTH": 1,
        // N50: 1,
        // NO: 1,
        // "NON-ATCG": 1,
        // "% GC CONTENT": 1,
      },
  },
  {
    $merge: {
      into: "stats",
    },
  },
];
export default stats;