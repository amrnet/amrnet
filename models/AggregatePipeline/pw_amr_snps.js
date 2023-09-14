const snps = [
  // {
  //   $addFields: {
  //     NAME: {
  //       $toString: "$NAME",
  //     },
  //   },
  // }
  {
    $addFields: {
      NAME: {
        $toString: "$NAME",
      },
      num_qrdr: {
        $sum: [
          "$gyrA_S83F",
          "$gyrA_S83Y",
          "$gyrA_D87A",
          "$gyrA_D87G",
          "$gyrA_D87N",
          "$gyrA_D87V",
          "$gyrA_D87Y",
          "$gyrB_S464F",
          "$gyrB_S464Y",
          "$parC_S80I",
          "$parC_E84G",
          "$parC_E84K",
        ],
      },
      num_acrb: "$acrB_R717Q",
    },
  },
  // {
  //   $addFields: {
  //     num_acrb: "$acrB_R717Q",
  //   },
  // }
  {
    $addFields: {
      dcs_mechanisms: {
        $ifNull: [
          "$dcs_mechanisms",
          {
            $cond: {
              if: {
                $in: [
                  {
                    $ifNull: [
                      "$dcs_mechanisms",
                      "",
                    ],
                  },
                  ["NA", "Not Provided", "", "-"],
                ],
              },
              then: "$num_qrdr",
              else: {
                $add: [
                  "$dcs_mechanisms",
                  "$num_qrdr",
                ],
              },
            },
          },
        ],
      },
    },
  },
  // {
  //   $addFields: {
  //     dcs_mechanisms: {
  //       $cond: {
  //         if: {
  //           $in: [
  //             {
  //               $ifNull: ["$dcs_mechanisms", ""],
  //             },
  // Use $ifNull to handle null or undefined values
  //             ["NA", "Not Provided", "", "-"],
  //           ],
  //         },
  //         then: "$num_qrdr",
  //         else: {
  //           $add: ["$dcs_mechanisms", "$num_qrdr"],
  //         },
  //       },
  //     },
  //   },
  // },
  // {
  //   $addFields: {
  //     dcs_mechanisms: {
  //       $cond: {
  //         if: {
  //           $in: [
  //             {
  //               $ifNull: ["$dcs_mechanisms", ""],
  //             },
  // Use $ifNull to handle null or undefined values
  //             ["NA", "Not Provided", "", "-"],
  //           ],
  //         },
  //         then: {
  //           $cond: {
  //             if: {
  //               $and: [
  //                 {
  //                   $eq: ["$qnrS", "1"],
  //                 },
  //                 {
  //                   $eq: ["$qnrB", "1"],
  //                 },
  //               ],
  //             },
  //             then: "_QRDR + qnrS + qnrB",
  //             else: {
  //               $cond: {
  //                 if: {
  //                   $eq: ["$qnrS", "1"],
  //                 },
  //                 then: "_QRDR + qnrS",
  //                 else: {
  //                   $cond: {
  //                     if: {
  //                       $eq: ["$qnrB", "1"],
  //                     },
  //                     then: "_QRDR + qnrB",
  //                     else: "_QRDR",
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //         else: {
  //           $cond: {
  //             if: {
  //               $and: [
  //                 {
  //                   $eq: ["$qnrS", "1"],
  //                 },
  //                 {
  //                   $eq: ["$qnrB", "1"],
  //                 },
  //               ],
  //             },
  //             then: {
  //               $concat: [
  //                 {
  //                   $toString: "$dcs_mechanisms",
  //                 },
  //                 "_QRDR + qnrS + qnrB",
  //               ],
  //             },
  //             else: {
  //               $cond: {
  //                 if: {
  //                   $eq: ["$qnrS", "1"],
  //                 },
  //                 then: {
  //                   $concat: [
  //                     {
  //                       $toString:
  //                         "$dcs_mechanisms",
  //                     },
  //                     "_QRDR + qnrS",
  //                   ],
  //                 },
  //                 else: {
  //                   $cond: {
  //                     if: {
  //                       $eq: ["$qnrB", "1"],
  //                     },
  //                     then: {
  //                       $concat: [
  //                         {
  //                           $toString:
  //                             "$dcs_mechanisms",
  //                         },
  //                         "_QRDR + qnrB",
  //                       ],
  //                     },
  //                     else: {
  //                       $concat: [
  //                         {
  //                           $toString:
  //                             "$dcs_mechanisms",
  //                         },
  //                         "_QRDR",
  //                       ],
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  // },
  {
    $addFields: {
      cip_pred_pheno: {
        $cond: {
          if: {
            $eq: ["$num_qrdr", 0],
          },
          then: "CipS",
          else: {
            $cond: {
              if: {
                $eq: ["$num_qrdr", 1],
              },
              then: "CipNS",
              else: {
                $cond: {
                  if: {
                    $in: ["$num_qrdr", [2, 3]],
                  },
                  then: "CipR",
                  else: "$cip_pred_pheno", // Adjust as needed for other cases or provide a default value
                },
              },
            },
          },
        },
      },
    },
  },
  // {
  //   $addFields: {
  //     dcs_category: {
  //       $cond: {
  //         if: {
  //           $in: [
  //             "$cip_pred_pheno",
  //             ["CipNS", "CipR"],
  //           ],
  //         },
  //         then: "DCS",
  //         else: "$cip_pred_pheno",
  //       },
  //     },
  //   },
  // }
  {
    $addFields: {
      azith_pred_pheno: {
        $cond: {
          if: {
            $or: [
              {
                $gt: ["$acrB_R717Q", 0],
              },
              {
                $gt: ["$acrB_R717L", 0],
              },
            ],
          },
          then: "AzithR",
          else: "AzithS",
        },
      },
    },
  },
  {
    $project: {
      NAME: 1,
      gyrA_S83F: 1,
      gyrA_S83Y: 1,
      gyrA_D87A: 1,
      gyrA_D87G: 1,
      gyrA_D87N: 1,
      gyrA_D87V: 1,
      gyrA_D87Y: 1,
      gyrB_S464F: 1,
      gyrB_S464Y: 1,
      parC_S80I: 1,
      parC_E84G: 1,
      parC_E84K: 1,
      parE_D420N: 1,
      parE_L416F: 1,
      acrB_R717Q: 1,
      acrB_R717L: 1,
      num_qrdr: 1,
      num_acrb: 1,
      dcs_mechanisms: 1,
      cip_pred_pheno: 1,
      dcs_category: 1,
      azith_pred_pheno: 1,
    },
  },
  {
    $merge: {
      into: "snpscollection",
    },
  },
];
export default snps;