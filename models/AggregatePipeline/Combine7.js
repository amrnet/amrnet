const combine7 = [
  {
    $lookup: {
      from: "genes",
      localField: "NAME",
      foreignField: "NAME",
      as: "pw_amr-genes",
    },
  },
  {
    $lookup: {
      from: "prediction",
      localField: "NAME",
      foreignField: "NAME",
      as: "pw_species-prediction",
    },
  },
  {
    $lookup: {
      from: "snps",
      localField: "NAME",
      foreignField: "NAME",
      as: "pw_amr-snps",
    },
  },
  {
    $lookup: {
      from: "metadata",
      localField: "NAME",
      foreignField: "NAME",
      as: "pw_metadata",
    },
  },
  {
    $lookup: {
      from: "stats",
      localField: "NAME",
      foreignField: "NAME",
      as: "pw_stats",
    },
  },
  {
    $lookup: {
      from: "typing",
      localField: "NAME",
      foreignField: "NAME",
      as: "pw_typing",
    },
  },
  {
    $replaceRoot:
      /**
       * replacementDocument: A document or string.
       */
      {
        newRoot: {
          $mergeObjects: [
            {
              $arrayElemAt: ["$pw_amr-genes", 0],
            },
            {
              $arrayElemAt: [
                "$pw_species-prediction",
                0,
              ],
            },
            {
              $arrayElemAt: ["$pw_amr-snps", 0],
            },
            {
              $arrayElemAt: ["$pw_metadata", 0],
            },
            {
              $arrayElemAt: ["$pw_stats", 0],
            },
            {
              $arrayElemAt: ["$pw_typing", 0],
            },
            "$$ROOT",
          ],
        },
      },
  },
  {
    $addFields: {
      cip_pheno_qrdr_gene: {
        $ifNull: ["$cip_pheno_qrdr_gene", ""],
      },
    },
  },
  {
    $addFields: {
      cip_pheno_qrdr_gene: {
        $cond: {
          if: {
            $eq: ["$cip_pheno_qrdr_gene", ""],
          },
          then: {
            $concat: [
              {
                $toString: "$qnrS",
              },
              {
                $toString: "$qnrB",
              },
            ],
          },
          else: {
            $concat: [
              {
                $toString: "$cip_pheno_qrdr_gene",
              },
              {
                $toString: "$qnrS",
              },
              {
                $toString: "$qnrB",
              },
            ],
          },
        },
      },
    },
  },
  {
    $addFields: {
      cip_pheno_qrdr_gene: {
        $ifNull: ["$cip_pheno_qrdr_gene", ""],
      },
    },
  },
  {
    $addFields: {
      cip_pheno_qrdr_gene: {
        $cond: {
          if: {
            $eq: ["$cip_pheno_qrdr_gene", ""],
          },
          then: {
            $toString: "$cip_pred_pheno",
          },
          else: {
            $concat: [
              {
                $toString: "$cip_pred_pheno",
              },
              {
                $toString: "$cip_pheno_qrdr_gene",
              },
            ],
          },
        },
      },
    },
  },
  {
    $addFields: {
      cip_pred_pheno: {
        $cond: {
          if: {
            $or: [
              {
                $eq: [
                  "$cip_pheno_qrdr_gene",
                  "CipS10",
                ],
              },
              {
                $eq: [
                  "$cip_pheno_qrdr_gene",
                  "CipS11",
                ],
              },
              {
                $eq: [
                  "$cip_pheno_qrdr_gene",
                  "CipS01",
                ],
              },
            ],
          },
          then: "CipNS",
          else: {
            $cond: {
              if: {
                $or: [
                  {
                    $eq: [
                      "$cip_pheno_qrdr_gene",
                      "CipNS10",
                    ],
                  },
                  {
                    $eq: [
                      "$cip_pheno_qrdr_gene",
                      "CipNS11",
                    ],
                  },
                  {
                    $eq: [
                      "$cip_pheno_qrdr_gene",
                      "CipNS01",
                    ],
                  },
                ],
              },
              then: "CipR",
              else: "$cip_pred_pheno",
            },
          },
        },
      },
    },
  },
  {
    $addFields: {
      cip_pred_pheno: {
        $cond: {
          if: {
            $or: [
              {
                $eq: ["$qnrS", 1],
              },
              {
                $eq: ["$qnrB", 1],
              },
            ],
          },
          then: "CipR",
          else: {
            $cond: {
              if: {
                $or: [
                  {
                    $eq: ["$num_qrdr", 1],
                  },
                  {
                    $eq: ["$num_qrdr", 2],
                  },
                ],
              },
              then: "CipNS",
              else: {
                $cond: {
                  if: {
                    $eq: ["$num_qrdr", 3],
                  },
                  then: "CipR",
                  else: {
                    $cond: {
                      if: {
                        $eq: ["$num_qrdr", 0],
                      },
                      then: "CipS",
                      else: "cip_pred_pheno",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  {
    $addFields: {
      dcs_category: {
        $cond: {
          if: {
            $in: [
              "$cip_pred_pheno",
              ["CipNS", "CipR"],
            ],
          },
          then: "DCS",
          else: "CipS",
        },
      },
    },
  },
  // {
  //   $addFields: {
  //     cip_pred_pheno: {
  //       $cond: {
  //         if: {
  //           $and: [
  //             {
  //               $eq: ["$num_qrdr", 0],
  //             },
  //             {
  //               $or: [
  //                 {
  //                   $eq: ["$qnrS", 1],
  //                 },
  //                 {
  //                   $eq: ["$qnrB", 1],
  //                 },
  //               ],
  //             },
  //           ],
  //         },
  //         then: "CipNS",
  //         else: {
  //           $cond: {
  //             if: {
  //               $eq: ["$num_qrdr", 0],
  //             },
  //             then: "CipS",
  //             else: {
  //               else: {
  //                 $cond: {
  //                   if: {
  //                     $eq: ["$num_qrdr", 1],
  //                   },
  //                   then: "CipNS",
  //                   else: "CipR",
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  // }
  {
    $addFields: {
      dcs_mechanisms: {
        $cond: {
          if: {
            $in: [
              {
                $ifNull: ["$dcs_mechanisms", ""],
              },
              // Use $ifNull to handle null or undefined values
              ["NA", "Not Provided", "", "-"],
            ],
          },
          then: {
            $cond: {
              if: {
                $and: [
                  {
                    $eq: ["$qnrS", 1],
                  },
                  {
                    $eq: ["$qnrB", 1],
                  },
                ],
              },
              then: "_QRDR + qnrS + qnrB",
              else: {
                $cond: {
                  if: {
                    $eq: ["$qnrS", 1],
                  },
                  then: "_QRDR + qnrS",
                  else: {
                    $cond: {
                      if: {
                        $eq: ["$qnrB", 1],
                      },
                      then: "_QRDR + qnrB",
                      else: "_QRDR",
                    },
                  },
                },
              },
            },
          },
          else: {
            $cond: {
              if: {
                $and: [
                  {
                    $eq: ["$qnrS", 1],
                  },
                  {
                    $eq: ["$qnrB", 1],
                  },
                ],
              },
              then: {
                $concat: [
                  {
                    $toString: "$dcs_mechanisms",
                  },
                  "_QRDR + qnrS + qnrB",
                ],
              },
              else: {
                $cond: {
                  if: {
                    $eq: ["$qnrS", 1],
                  },
                  then: {
                    $concat: [
                      {
                        $toString:
                          "$dcs_mechanisms",
                      },
                      "_QRDR + qnrS",
                    ],
                  },
                  else: {
                    $cond: {
                      if: {
                        $eq: ["$qnrB", 1],
                      },
                      then: {
                        $concat: [
                          {
                            $toString:
                              "$dcs_mechanisms",
                          },
                          "_QRDR + qnrB",
                        ],
                      },
                      else: {
                        $concat: [
                          {
                            $toString:
                              "$dcs_mechanisms",
                          },
                          "_QRDR",
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  {
    $addFields: {
      amr_category: {
        $switch: {
          branches: [
            {
              case: {
                $eq: ["$XDR", "XDR"],
              },
              then: "XDR",
            },
            {
              case: {
                $and: [
                  {
                    $eq: ["$MDR", "MDR"],
                  },
                  {
                    $eq: ["$dcs_category", "DCS"],
                  },
                  {
                    $eq: [
                      "$cip_pred_pheno",
                      "CipNS",
                    ],
                  },
                  {
                    $eq: [
                      "$cip_pheno_qrdr_gene",
                      "CipNS00",
                    ],
                  },
                  {
                    $eq: [
                      "$azith_pred_pheno",
                      "AzithR",
                    ],
                  },
                ],
              },
              then: "AzithR_DCS_MDR",
            },
            {
              case: {
                $and: [
                  {
                    $eq: ["$MDR", "MDR"],
                  },
                  {
                    $eq: ["$dcs_category", "DCS"],
                  },
                  {
                    $or: [
                      {
                        $eq: [
                          "$cip_pred_pheno",
                          "CipNS",
                        ],
                      },
                      {
                        $eq: [
                          "$cip_pred_pheno",
                          "CipR",
                        ],
                      },
                    ],
                  },
                  {
                    $or: [
                      {
                        $eq: [
                          "$cip_pheno_qrdr_gene",
                          "CipNS00",
                        ],
                      },
                      {
                        $eq: [
                          "$cip_pheno_qrdr_gene",
                          "CipNS01",
                        ],
                      },
                      {
                        $eq: [
                          "$cip_pheno_qrdr_gene",
                          "CipS10",
                        ],
                      },
                      {
                        $eq: [
                          "$cip_pheno_qrdr_gene",
                          "CipR00",
                        ],
                      },
                    ],
                  },
                  {
                    $eq: [
                      "$azith_pred_pheno",
                      "AzithS",
                    ],
                  },
                ],
              },
              then: "MDR_DCS",
            },
            {
              case: {
                $and: [
                  {
                    $eq: ["$dcs_category", "DCS"],
                  },
                  {
                    $or: [
                      {
                        $eq: [
                          "$cip_pred_pheno",
                          "CipR",
                        ],
                      },
                      {
                        $eq: [
                          "$cip_pred_pheno",
                          "CipS",
                        ],
                      },
                      {
                        $eq: [
                          "$cip_pred_pheno",
                          "CipNS",
                        ],
                      },
                    ],
                  },
                  {
                    $or: [
                      {
                        $eq: [
                          "$cip_pheno_qrdr_gene",
                          "CipNS00",
                        ],
                      },
                      {
                        $eq: [
                          "$cip_pheno_qrdr_gene",
                          "CipR00",
                        ],
                      },
                    ],
                  },
                  {
                    $eq: [
                      "$azith_pred_pheno",
                      "AzithR",
                    ],
                  },
                ],
              },
              then: "AzithR_DCS",
            },
            {
              case: {
                $and: [
                  {
                    $eq: ["$dcs_category", "DCS"],
                  },
                  {
                    $or: [
                      {
                        $eq: [
                          "$cip_pred_pheno",
                          "CipR",
                        ],
                      },
                      {
                        $eq: [
                          "$cip_pred_pheno",
                          "CipNS",
                        ],
                      },
                    ],
                  },
                  {
                    $ne: ["$num_amr_genes", "0"],
                  },
                  {
                    $eq: [
                      "$azith_pred_pheno",
                      "AzithS",
                    ],
                  },
                ],
              },
              then: "AMR_DCS",
            },
            {
              case: {
                $and: [
                  {
                    $eq: ["$dcs_category", "DCS"],
                  },
                  {
                    $eq: ["$MDR", "-"],
                  },
                  {
                    $or: [
                      {
                        $eq: [
                          "$cip_pred_pheno",
                          "CipNS",
                        ],
                      },
                      {
                        $eq: [
                          "$cip_pred_pheno",
                          "CipR",
                        ],
                      },
                    ],
                  },
                  {
                    $or: [
                      {
                        $eq: [
                          "$cip_pheno_qrdr_gene",
                          "CipNS00",
                        ],
                      },
                      {
                        $eq: [
                          "$cip_pheno_qrdr_gene",
                          "CipR00",
                        ],
                      },
                    ],
                  },
                  {
                    $eq: [
                      "$azith_pred_pheno",
                      "AzithS",
                    ],
                  },
                ],
              },
              then: "DCS",
            },
            {
              case: {
                $and: [
                  {
                    $ne: ["$dcs_category", "DCS"],
                  },
                  {
                    $eq: ["$MDR", "MDR"],
                  },
                  {
                    $eq: [
                      "$cip_pred_pheno",
                      "CipS",
                    ],
                  },
                  {
                    $eq: [
                      "$cip_pheno_qrdr_gene",
                      "CipS00",
                    ],
                  },
                  {
                    $eq: [
                      "$azith_pred_pheno",
                      "AzithR",
                    ],
                  },
                ],
              },
              then: "AzithR_MDR",
            },
            {
              case: {
                $and: [
                  {
                    $eq: [
                      "$dcs_category",
                      "CipS",
                    ],
                  },
                  {
                    $eq: ["$MDR", "MDR"],
                  },
                  {
                    $eq: [
                      "$cip_pred_pheno",
                      "CipS",
                    ],
                  },
                  {
                    $eq: [
                      "$cip_pheno_qrdr_gene",
                      "CipS00",
                    ],
                  },
                  {
                    $eq: [
                      "$azith_pred_pheno",
                      "AzithS",
                    ],
                  },
                ],
              },
              then: "MDR",
            },
            {
              case: {
                $and: [
                  {
                    $ne: ["$dcs_category", "DCS"],
                  },
                  {
                    $eq: ["$MDR", "-"],
                  },
                  {
                    $ne: ["$num_amr_genes", "0"],
                  },
                  {
                    $eq: [
                      "$cip_pred_pheno",
                      "CipS",
                    ],
                  },
                  {
                    $eq: [
                      "$cip_pheno_qrdr_gene",
                      "CipS00",
                    ],
                  },
                  {
                    $eq: [
                      "$azith_pred_pheno",
                      "AzithS",
                    ],
                  },
                ],
              },
              then: "AMR",
            },
            {
              case: {
                $and: [
                  {
                    $eq: ["$num_amr_genes", "0"],
                  },
                  {
                    $eq: [
                      "$cip_pred_pheno",
                      "CipS",
                    ],
                  },
                  {
                    $eq: [
                      "$cip_pheno_qrdr_gene",
                      "CipS00",
                    ],
                  },
                  {
                    $eq: [
                      "$azith_pred_pheno",
                      "AzithS",
                    ],
                  },
                ],
              },
              then: "No AMR detected",
            },
          ],
          default: "$amr_category", // Provide a default value if none of the cases match
        },
      },
    },
  },
  {
    $addFields: {
      Exclude: {
        $cond: {
          if: {
            $and: [
              {
                $ne: ["$DATE", "-"],
              },
              {
                $ne: ["$COUNTRY_ONLY", "-"],
              },
              {
                $in: [
                  "$PURPOSE OF SAMPLING",
                  [
                    "Non Targeted [Surveillance Study]",
                    "Non Targeted [Routine diagnostics]",
                    "Non Targeted [Reference lab]",
                    "Non Targeted [Other]",
                  ],
                ],
              },
            ],
          },
          then: "Include",
          else: "Exclude",
        },
      },
    },
  },
  // {
  //   $set: {
  //     newArrayField: {
  //       $concatArrays: [
  //         ["$amr_category"],
  // Add the value of field1 to the array
  //         ["$cip_pheno_qrdr_gene"], // Add the value of field2 to the array
  //       ],
  //     },
  //   },
  // },
  {
    $project: {
      "pw_amr-genes": 0,
      "pw_species-prediction": 0,
      "pw_amr-snps": 0,
      pw_metadata: 0,
      pw_stats: 0,
      pw_typing: 0,
    },
  },
  {
    $merge: {
      into: "combine7",
    },
  },
];
export default combine7;