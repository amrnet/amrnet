const genes = [
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
    $addFields: {
      num_amr_genes: {
        $sum: [
          "$ampC",
          "$blaCTX-M-12",
          "$blaCTX-M-15_23",
          "$blaCTX-M-55",
          "$blaOXA-1",
          "$blaOXA-7",
          "$blaOXA134_2",
          "$blaSHV-12",
          "$blaTEM-1D",
          "$catA1",
          "$cmlA",
          "$qnrB",
          "$qnrS",
          "$qnrD",
          "$sul1",
          "$sul2",
          "$dfrA1",
          "$dfrA14",
          "$dfrA15",
          "$dfrA17",
          "$dfrA18",
          "$dfrA5",
          "$dfrA7",
          "$tetA(A)",
          "$tetA(B)",
          "$tetA(C)",
          "$tetA(D)",
          "$ereA",
        ],
      },
    },
  },
  {
    $addFields: {
      num_amr_genes: {
        $toString: "$num_amr_genes",
      },
    },
  },
  {
    $addFields: {
      sul_any: {
        $cond: {
          if: {
            $and: [
              {
                $eq: ["$sul1", 0],
              },
              {
                $eq: ["$sul2", 0],
              },
            ],
          },
          then: 0,
          else: 1,
        },
      },
    },
  },
  {
    $addFields: {
      dfra_any: "0",
    },
  },
  {
    $addFields: {
      dfra_any: {
        $cond: {
          if: {
            $or: [
              {
                $eq: ["$dfrA1", 1],
              },
              {
                $eq: ["$dfrA5", 1],
              },
              {
                $eq: ["$dfrA7", 1],
              },
              {
                $eq: ["$dfrA14", 1],
              },
              {
                $eq: ["$dfrA15", 1],
              },
              {
                $eq: ["$dfrA17", 1],
              },
              {
                $eq: ["$dfrA18", 1],
              },
            ],
          },
          then: 1,
          else: 0,
        },
      },
    },
  },
  {
    $addFields: {
      co_trim: {
        $cond: {
          if: {
            $and: [
              {
                $eq: ["$sul_any", 1],
              },
              {
                $eq: ["$dfra_any", 1],
              },
            ],
          },
          then: 1,
          else: 0,
        },
      },
    },
  },
  {
    $addFields: {
      tetracycline_category: {
        $cond: {
          if: {
            $or: [
              {
                $eq: ["$tetA(A)", 1],
              },
              {
                $eq: ["$tetA(B)", 1],
              },
              {
                $eq: ["$tetA(C)", 1],
              },
              {
                $eq: ["$tetA(D)", 1],
              },
            ],
          },
          then: "TetR",
          else: "TetS",
        },
      },
    },
  },
  {
    $addFields: {
      MDR: {
        $cond: {
          if: {
            $and: [
              {
                $eq: ["$catA1", 1],
              },
              {
                $eq: ["$blaTEM-1D", 1],
              },
              {
                $eq: ["$co_trim", 1],
              },
            ],
          },
          then: "MDR",
          else: "-",
        },
      },
    },
  },
  {
    $addFields: {
      XDR: {
        $cond: {
          if: {
            $and: [
              {
                $eq: ["$MDR", "MDR"],
              },
              {
                $eq: ["$blaCTX-M-15_23", 1],
              },
              {
                $eq: ["$qnrS", 1],
              },
            ],
          },
          then: "XDR",
          else: "-",
        },
      },
    },
  },
  {
    $addFields: {
      ESBL_category: {
        $cond: {
          if: {
            $or: [
              {
                $eq: ["$blaCTX-M-15_23", 1],
              },
              {
                $eq: ["$blaOXA-7", 1],
              },
              {
                $eq: ["$blaSHV-12", 1],
              },
              {
                $eq: ["$blaCTX-M-55", 1],
              },
            ],
          },
          then: "ESBL",
          else: "Non-ESBL",
        },
      },
    },
  },
  {
    $addFields: {
      chloramphenicol_category: {
        $cond: {
          if: {
            $or: [
              {
                $eq: ["$catA1", 1],
              },
              {
                $eq: ["$cmlA", 1],
              },
            ],
          },
          then: "ChlR",
          else: "ChlS",
        },
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
  //         then: {
  //           $cond: {
  //             if: {
  //               $and: [
  //                 {
  //                   $eq: ["$qnrS", 1],
  //                 },
  //                 {
  //                   $eq: ["$qnrB", 1],
  //                 },
  //               ],
  //             },
  //             then: "_QRDR + qnrS + qnrB",
  //             else: {
  //               $cond: {
  //                 if: {
  //                   $eq: ["$qnrS", 1],
  //                 },
  //                 then: "_QRDR + qnrS",
  //                 else: {
  //                   $cond: {
  //                     if: {
  //                       $eq: ["$qnrB", 1],
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
  //                   $eq: ["$qnrS", 1],
  //                 },
  //                 {
  //                   $eq: ["$qnrB", 1],
  //                 },
  //               ],
  //             },
  //             then: {
  //               $concat: [
  //                 "$dcs_mechanisms",
  //                 "_QRDR + qnrS + qnrB",
  //               ],
  //             },
  //             else: {
  //               $cond: {
  //                 if: {
  //                   $eq: ["$qnrS", 1],
  //                 },
  //                 then: {
  //                   $concat: [
  //                     "$dcs_mechanisms",
  //                     "_QRDR + qnrS",
  //                   ],
  //                 },
  //                 else: {
  //                   $cond: {
  //                     if: {
  //                       $eq: ["$qnrB", 1],
  //                     },
  //                     then: {
  //                       $concat: [
  //                         "$dcs_mechanisms",
  //                         "_QRDR + qnrB",
  //                       ],
  //                     },
  //                     else: "_QRDR",
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
      "tetA(C)": {
        $ifNull: ["$tetA(C)", "-"],
      },
      "tetA(D)": {
        $ifNull: ["$tetA(D)", "-"],
      },
      ereA: {
        $ifNull: ["$ereA", "-"],
      },
    },
  },
  {
    $project: {
      NAME: 1,
      ampC: 1,
      "blaCTX-M-12": 1,
      "blaCTX-M-15_23": 1,
      "blaCTX-M-55": 1,
      "blaOXA-1": 1,
      "blaOXA-7": 1,
      blaOXA134_2: 1,
      "blaSHV-12": 1,
      "blaTEM-1D": 1,
      catA1: 1,
      cmlA: 1,
      qnrB: 1,
      qnrS: 1,
      qnrD: 1,
      sul1: 1,
      sul2: 1,
      dfrA1: 1,
      dfrA14: 1,
      dfrA15: 1,
      dfrA17: 1,
      dfrA18: 1,
      dfrA5: 1,
      dfrA7: 1,
      num_amr_genes: 1,
      "tetA(A)": 1,
      "tetA(B)": 1,
      "tetA(C)": 1,
      "tetA(D)": 1,
      ereA: 1,
      sul_any: 1,
      dfra_any: 1,
      co_trim: 1,
      tetracycline_category: 1,
      MDR: 1,
      XDR: 1,
      ESBL_category: 1,
      chloramphenicol_category: 1,
      // dcs_mechanisms: 1,
    },
  },
  {
    $merge: {
      into: "genescollection",
    },
  },
];
export default genes;