
const clean_merge_st = [
  {
    $addFields: {
      GENOTYPE: {
        $toString: "$GENOTYPHI GENOTYPE",
      },
      h58_genotypes: {
        $cond: {
          if: {
            $in: [
              "$GENOTYPHI GENOTYPE",
              [
                "4.3.1",
                "4.3.1.1",
                "4.3.1.1.P1",
                "4.3.1.2",
                "4.3.1.2.1",
                "4.3.1.2.1.1",
                "4.3.1.3",
                "4.3.1.1.EA1",
                "4.3.1.2.EA2",
                "4.3.1.2.EA3",
                "4.3.1.3.Bdq",
              ],
            ],
          },
          then: "$GENOTYPHI GENOTYPE",
          else: "-",
        },
      },
    },
  },
  {
    $addFields: {
      GENOTYPE_SIMPLE: {
        $cond: {
          if: {
            $in: ["$h58_genotypes", ["-"]],
          },
          then: "Non-H58",
          else: "H58",
        },
      },
      GENOTYPE: {
        $cond: {
          if: {
            $in: [
              "$NAME",
              [
                "9953_5_76_LaoLNT1480_2010",
                "10060_6_13_LaoSV430_2009",
                "10060_6_20_LaoUI10788_2007",
                "10060_6_30_LaoUI14598_2009",
                "10209_5_36_LaoUI2001_2002",
                "10209_5_60_LaoUI3396_2003",
              ],
            ],
          },
          then: "2.2.3",
          else: "$GENOTYPE",
        },
      },
      "GENOTYPHI SNPs CALLED": {
        $cond: {
          if: {
            $in: [
              "$NAME",
              [
                "9953_5_76_LaoLNT1480_2010",
                "10060_6_13_LaoSV430_2009",
                "10060_6_20_LaoUI10788_2007",
                "10060_6_30_LaoUI14598_2009",
                "10209_5_36_LaoUI2001_2002",
                "10209_5_60_LaoUI3396_2003",
              ],
            ],
          },
          then: "2.2.3",
          else: "$GENOTYPHI SNPs CALLED",
        },
      },
      "Inc Types": {
        $ifNull: ["$Inc Types", "-"],
      },
    },
  },
  {
    $addFields: {
      "p-Value": {
        $cond: {
          if: {
            $in: [
              "$p-Value",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$p-Value",
        },
      },
      "Mash Distance": {
        $cond: {
          if: {
            $in: [
              "$Mash Distance",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$Mash Distance",
        },
      },
      "Organism ID": {
        $cond: {
          if: {
            $in: [
              "$Organism ID",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$Organism ID",
        },
      },
      "Species Name": {
        $cond: {
          if: {
            $in: [
              "$Species Name",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$Species Name",
        },
      },
      "Species ID": {
        $cond: {
          if: {
            $in: [
              "$Species ID",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$Species ID",
        },
      },
      "Genus ID": {
        $cond: {
          if: {
            $in: [
              "$Genus ID",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$Genus ID",
        },
      },
      "Genus Name": {
        $cond: {
          if: {
            $in: [
              "$Genus Name",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$Genus Name",
        },
      },
      "Reference ID": {
        $cond: {
          if: {
            $in: [
              "$Reference ID",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$Reference ID",
        },
      },
      "Matching Hashes": {
        $cond: {
          if: {
            $in: [
              "$Matching Hashes",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$Matching Hashes",
        },
      },
      "Organism Name": {
        $cond: {
          if: {
            $in: [
              "$Organism Name",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$Organism Name",
        },
      },
      Version: {
        $cond: {
          if: {
            $in: [
              "$Version",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$Version",
        },
      },
      "Genome ID": {
        $cond: {
          if: {
            $in: [
              "$Genome ID",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$Genome ID",
        },
      },
    },
  },
  {
    $addFields: {
      "p-Value": {
        $ifNull: ["$p-Value", "-"],
      },
      "Mash Distance": {
        $ifNull: ["$Mash Distance", "-"],
      },
      "Organism ID": {
        $ifNull: ["$Organism ID", "-"],
      },
      "Species Name": {
        $ifNull: ["$Species Name", "-"],
      },
      "Species ID": {
        $ifNull: ["$Species ID", "-"],
      },
      "Genus ID": {
        $ifNull: ["$Genus ID", "-"],
      },
      "Genus Name": {
        $ifNull: ["$Genus Name", "-"],
      },
      "Reference ID": {
        $ifNull: ["$Reference ID", "-"],
      },
      "Matching Hashes": {
        $ifNull: ["$Matching Hashes", "-"],
      },
      "Organism Name": {
        $ifNull: ["$Organism Name", "-"],
      },
      Version: {
        $ifNull: ["$Version", "-"],
      },
    },
  },
  {
    $addFields: {
      ACCESSION: "$NAME",
      STRAIN: {
        $cond: {
          if: {
            $in: [
              "$STRAIN",
              ["NA", "", " ", "Not Provided"],
            ],
          },
          then: "-",
          else: "$STRAIN",
        },
      },
      CONTACT: {
        $cond: {
          if: {
            $in: [
              "$CONTACT",
              ["NA", "", " ", "Not Provided"],
            ],
          },
          then: "-",
          else: "$CONTACT",
        },
      },
      "TGC ID": {
        $cond: {
          if: {
            $in: [
              "$TGC ID",
              ["NA", "", " ", "Not Provided"],
            ],
          },
          then: "-",
          else: "$TGC ID",
        },
      },
      AGE: {
        $cond: {
          if: {
            $in: [
              "$AGE",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$AGE",
        },
      },
      "PURPOSE OF SAMPLING": {
        $cond: {
          if: {
            $in: [
              "$PURPOSE OF SAMPLING",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$PURPOSE OF SAMPLING",
        },
      },
      SOURCE: {
        $cond: {
          if: {
            $in: [
              "$SOURCE",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$SOURCE",
        },
      },
      "SYMPTOM STATUS": {
        $cond: {
          if: {
            $in: [
              "$SYMPTOM STATUS",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$SYMPTOM STATUS",
        },
      },
      LOCATION: {
        $cond: {
          if: {
            $in: [
              "$LOCATION",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$LOCATION",
        },
      },
      "PROJECT ACCESSION": {
        $cond: {
          if: {
            $in: [
              "$PROJECT ACCESSION",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$PROJECT ACCESSION",
        },
      },
      BIOSAMPLE: {
        $cond: {
          if: {
            $in: [
              "$BIOSAMPLE",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$BIOSAMPLE",
        },
      },
      LAB: {
        $cond: {
          if: {
            $in: [
              "$LAB",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$LAB",
        },
      },
      PMID: {
        $cond: {
          if: {
            $in: [
              "$PMID",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$PMID",
        },
      },
      "COUNTRY ISOLATED": {
        $cond: {
          if: {
            $in: [
              "$COUNTRY ISOLATED",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$COUNTRY ISOLATED",
        },
      },
    },
  },
  {
    $addFields: {
      DATE: {
        $cond: {
          if: {
            $in: [
              "$DATE",
              [
                null,
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$DATE",
        },
      },
    },
  },
  {
    $addFields: {
      DATE: {
        $toString: "$DATE",
      },
    },
  },
  {
    $addFields: {
      dateStringParts: {
        $split: ["$DATE", " "],
      },
    },
  },
  {
    $addFields: {
      DATE: {
        $arrayElemAt: ["$dateStringParts", -1],
      },
    },
  },
  {
    $addFields: {
      "TRAVEL ASSOCIATED": {
        $ifNull: ["$TRAVEL ASSOCIATED", "-"],
      },
    },
  },
  {
    $addFields: {
      COUNTRY_ONLY: {
        $cond: {
          if: {
            $in: [
              "$COUNTRY OF ORIGIN",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$COUNTRY OF ORIGIN",
        },
      },
    },
  },
  {
    $addFields: {
      REGION_IN_COUNTRY: {
        $cond: {
          if: {
            $in: [
              "$LOCATION",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$LOCATION",
        },
      },
    },
  },
  {
    $addFields: {
      COUNTRY_ORIGIN: {
        $cond: {
          if: {
            $in: [
              "$COUNTRY OF ORIGIN",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$COUNTRY OF ORIGIN",
        },
      },
    },
  },
  {
    $addFields: {
      "TRAVEL COUNTRY": {
        $cond: {
          if: {
            $in: [
              "$TRAVEL COUNTRY",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$TRAVEL COUNTRY",
        },
      },
    },
  },
  {
    $addFields: {
      TRAVEL_LOCATION: {
        $cond: {
          if: {
            $in: [
              "$TRAVEL COUNTRY",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: {
            $cond: [
              {
                $not: {
                  $gt: ["$TRAVEL COUNTRY", null],
                },
              },
              "-",
              "$TRAVEL COUNTRY",
            ],
          },
        },
      },
    },
  },
  {
    $addFields: {
      ACCESSION: {
        $cond: {
          if: {
            $in: [
              "$ACCESSION",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$ACCESSION",
        },
      },
    },
  },
  {
    $addFields: {
      "COUNTRY OF ORIGIN": {
        $cond: {
          if: {
            $in: [
              "$COUNTRY OF ORIGIN",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$COUNTRY OF ORIGIN",
        },
      },
    },
  },
  {
    $addFields: {
      TRAVEL: {
        $cond: {
          if: {
            $in: ["$TRAVEL ASSOCIATED", ["No"]],
          },
          then: "local",
          else: {
            $cond: {
              if: {
                $in: [
                  "$TRAVEL ASSOCIATED",
                  ["Yes"],
                ],
              },
              then: "travel",
              else: "$TRAVEL ASSOCIATED",
            },
          },
        },
      },
    },
  },
  {
    $addFields: {
      "TRAVEL ASSOCIATED": {
        $cond: {
          if: {
            $in: [
              "$TRAVEL ASSOCIATED",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$TRAVEL ASSOCIATED",
        },
      },
    },
  },
  {
    $addFields: {
      DATE: {
        $ifNull: ["$DATE", "-"],
      },
      "TGC ID": {
        $ifNull: ["$TGC ID", "-"],
      },
      ACCESSION: {
        $ifNull: ["$ACCESSION", "-"],
      },
      AGE: {
        $ifNull: ["$AGE", "-"],
      },
      "COUNTRY OF ORIGIN": {
        $ifNull: ["$COUNTRY OF ORIGIN", "-"],
      },
      LOCATION: {
        $ifNull: ["$LOCATION", "-"],
      },
      COUNTRY_ONLY: {
        $ifNull: ["$COUNTRY_ONLY", "-"],
      },
      COUNTRY_ORIGIN: {
        $ifNull: ["$COUNTRY_ORIGIN", "-"],
      },
      "COUNTRY ISOLATED": {
        $ifNull: ["$COUNTRY ISOLATED", "-"],
      },
      "TRAVEL COUNTRY": {
        $ifNull: ["$TRAVEL COUNTRY", "-"],
      },
      STRAIN: {
        $ifNull: ["$STRAIN", "-"],
      },
      "PURPOSE OF SAMPLING": {
        $ifNull: ["$PURPOSE OF SAMPLING", "-"],
      },
      SOURCE: {
        $ifNull: ["$SOURCE", "-"],
      },
      "SYMPTOM STATUS": {
        $ifNull: ["$SYMPTOM STATUS", "-"],
      },
      "PROJECT ACCESSION": {
        $ifNull: ["$PROJECT ACCESSION", "-"],
      },
      BIOSAMPLE: {
        $ifNull: ["$BIOSAMPLE", "-"],
      },
      LAB: {
        $ifNull: ["$LAB", "-"],
      },
      CONTACT: {
        $ifNull: ["$CONTACT", "-"],
      },
      ACCURACY: {
        $ifNull: ["$ACCURACY", "-"],
      },
      PMID: {
        $ifNull: ["$PMID", "-"],
      },
      LATITUDE: {
        $ifNull: ["$LATITUDE", "-"],
      },
      LONGITUDE: {
        $ifNull: ["$LONGITUDE", "-"],
      },
    },
  },
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
              {
                $ne: ["$SYMPTOM STATUS","Asymptomatic Carrier"],
              },
              {
                $ne: ["$SOURCE", "Environment"],
              },
              {
                $ne: ["$SOURCE", "Gallbladder"],
              },
            ],
          },
          then: "Include",
          else: "Exclude",
        },
      },
    },
  },
  {
    $merge: {
      into: "clean_merge_st",
    },
  },
];
export default clean_merge_st; 