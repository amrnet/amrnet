const merge_rawdata_kleb = [
    {
        $lookup: {
        from: "pw_klebsiella_metadata",
        localField: "Genome Name",
        foreignField: "name",
        as: "pw_klebsiella_metadata",
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
                $arrayElemAt: [
                    "$pw_klebsiella_metadata",
                    0,
                ],
                },
                "$$ROOT",
            ],
            },
        },
    },
    // {
    //     $project: {
    //     pw_klebsiella_metadata: 0,
    //     name: 0,
    //     year: 0,
    //     ST: 0,
    //     "Kleborate version": 0,
    //     species_match: 0,
    //     "Genome Name": 0,
    //     QC_warnings: 0,
    //     ambiguous_bases: 0,
    //     "Genome ID": 0,
    //     Version: 0,
    //     country: 0,
    //     "City/region": 0,
    //     "Age group": 0,
    //     year: 0,
    //     "Sample alias": 0,
    //     month: 0,
    //     name: 0,
    //     latitude: 0,
    //     Location: 0,
    //     literatureLink: 0,
    //     day: 0,
    //     Country: 0,
    //     longitude: 0,
    //     "Environmental sample": 0,
    //     fileId: 0,
    //     literaturelink: 0,
    //     "Collection date": 0,
    //     City: 0,
    //     FIELD25: 0,
    //     KStringParts: 0,
    //     OStringParts: 0,
    //     },
    // },
    {
        $merge: {
            into: "merge_rawdata_kleb",
        },
    },
];

export default merge_rawdata_kleb; 