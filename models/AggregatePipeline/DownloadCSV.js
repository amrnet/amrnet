const Download = [
  {
    $addFields: {
      CipNS: {
        $cond: {
          if: {
            $eq: ["$cip_pred_pheno", "CipNS"],
          },
          then: "CipNS",
          else: "-",
        },
      },
      CipR: {
        $cond: {
          if: {
            $eq: ["$cip_pred_pheno", "CipR"],
          },
          then: "CipR",
          else: "-",
        },
      },
    },
  },
  {
    $project: {
      AGE: 0,
      "TRAVEL ASSOCIATED": 0,
      "TRAVEL COUNTRY": 0,
      "COUNTRY OF ORIGIN": 0,
    },
  },
];
export default Download; 