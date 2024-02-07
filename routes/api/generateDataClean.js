import express from 'express';
import {client} from '../../config/db2.js'

const router = express.Router();

router.post('/newdoctyphi', function (req, res, next) {
  const organism = req.body.organism;
  let collection,collection2, localFilePath;
  // collection = client.db('salmotyphi').collection('clean_merge_st');///Orignal with db "salmotyphi"

  collection2 = client.db('salmotyphi').collection('merge_rawdata_st');
  console.log("I am trying to update a collection: merge_rawdata_st, with new query method (w/o aggregare functions)");
    
  collection2.find().forEach(function(doc) {
    const empty = ['NA', 'Not Provided', '', '-', undefined];
    var h58_genotype, GENOTYPE_SIMPLE, curate, name_, travel, sul_any, dfra_any, co_trim, tetracycline_category, mdr, xdr, esbl, chlCat, dcsCategory, dcsMechanisms, dView,  amrCategory;
    var date, cip, azith, cipqrdr, cipns, cipr;
    const h58_genotypes = [
              '4.3.1',
              '4.3.1.1',
              '4.3.1.1.P1',
              '4.3.1.2',
              '4.3.1.2.1',
              '4.3.1.2.1.1',
              '4.3.1.3',
              '4.3.1.1.EA1',
              '4.3.1.2.EA2',
              '4.3.1.2.EA3',
              '4.3.1.3.Bdq'
            ];
    if (h58_genotypes.indexOf(doc["GENOTYPHI GENOTYPE"]) != -1) {
      h58_genotype = doc["GENOTYPHI GENOTYPE"];
      GENOTYPE_SIMPLE = "H58";
    }else{
      h58_genotype = "-";
      GENOTYPE_SIMPLE = "Non-H58";
    }

    const curate_223 = [
              '9953_5_76_LaoLNT1480_2010',
              '10060_6_13_LaoSV430_2009',
              '10060_6_20_LaoUI10788_2007',
              '10060_6_30_LaoUI14598_2009',
              '10209_5_36_LaoUI2001_2002',
              '10209_5_60_LaoUI3396_2003'
            ];
    var curate = ((curate_223.indexOf(doc["NAME"]) !== -1) ? "2.2.3" : doc["GENOTYPHI GENOTYPE"]).toString();

    const name = [
                "9953_5_76_LaoLNT1480_2010",
                "10060_6_13_LaoSV430_2009",
                "10060_6_20_LaoUI10788_2007",
                "10060_6_30_LaoUI14598_2009",
                "10209_5_36_LaoUI2001_2002",
                "10209_5_60_LaoUI3396_2003",
            ];
    var name_ = (name.indexOf(doc["NAME"]) !== -1) ? "2.2.3" : doc["GENOTYPHI SNPs CALLED"];
    
    // var date = (empty.indexOf(doc["DATE"]) !== -1) ? "-" : doc["DATE"].toString();
    

    if(empty.indexOf(doc["DATE"]) !== -1){
        date = "-";
    }else{
        date = (doc["DATE"].toString()).trim();
        if(date.length > 4){
            date = date.substring(date.length - 5);
        }
    }
    
    // console.log("before", date.replaceAll(' ', ''));

    if(doc["TRAVEL ASSOCIATED"] == "No"){
        travel = "local";
    }else if (doc["TRAVEL ASSOCIATED"] == "Yes"){
        travel = "travel"
    }else{
        travel = "Not Provided";
    }

    const gyrSum = [
          "gyrA_S83F",
          "gyrA_S83Y",
          "gyrA_D87A",
          "gyrA_D87G",
          "gyrA_D87N",
          "gyrA_D87V",
          "gyrA_D87Y",
          "gyrB_S464F",
          "gyrB_S464Y",
          "parC_S80I",
          "parC_E84G",
          "parC_E84K",
          "parC_S80R"
        ];
    var num_qrdr=0;
    // gyrSum.forEach(value=>{ 
    //     num_qrdr += doc[value]; 
    // });
    for (let value of gyrSum) {
        if (doc[value] == '1') {
            num_qrdr++;
        }
    }

    console.log("num_qrdr", num_qrdr);

    const num_amr_genes_sum = [
          "ampC",
          "blaCTX-M-12",
          "blaCTX-M-15_23",
          "blaCTX-M-55",
          "blaOXA-1",
          "blaOXA-7",
          "blaOXA134_2",
          "blaSHV-12",
          "blaTEM-1D",
          "catA1",
          "cmlA",
          "qnrB",
          "qnrS",
          "qnrD",
          "sul1",
          "sul2",
          "dfrA1",
          "dfrA14",
          "dfrA15",
          "dfrA17",
          "dfrA18",
          "dfrA5",
          "dfrA7",
          "tetA(A)",
          "tetA(B)",
          "tetA(C)",
          "tetA(D)",
          "ereA",
        ];
    var num_amr_genes=0;
    for (let column of num_amr_genes_sum) {
        if (doc[column] == '1') {
        num_amr_genes++;
        }
    }

    if(doc["sul1"]=='0' && doc["sul2"]=='0'){
        sul_any = '0';
    }else{
        sul_any = '1';
    }

    if(doc["dfrA1"]=='1' || doc["dfrA5"]=='1' || doc["dfrA7"]=='1' || doc["dfrA14"]=='1' || doc["dfrA15"]=='1' || doc["dfrA17"]=='1' || doc["dfrA18"]=='1'){
        dfra_any = '1';
    }else{
        dfra_any = '0';
    }

    if(sul_any =='1' && dfra_any=='1'){
        co_trim = '1';
    }else{
        co_trim = '0';
    }
    // console.log("sul_any,dfra_any, co_trim : ", sul_any,dfra_any, co_trim);
    if(doc["tetA(A)"]=='1' || doc["tetA(B)"]=='1' || doc["tetA(C)"]=='1' || doc["tetA(D)"]=='1'){
        tetracycline_category = "TetR";
    }else{
        tetracycline_category = "TetS";
    }

    if(doc["catA1"]=='1' && doc["blaTEM-1D"]=='1' && co_trim =='1'){
        mdr = "MDR";
    }else{
        mdr = "-";
    }

    if(mdr=="MDR" && doc["blaCTX-M-15_23"]=='1' && doc["qnrS"]=='1'){
        xdr = "XDR";
    }else{
        xdr = "-";
    }

    if(doc["blaCTX-M-15_23"]=='1' || doc["blaOXA-7"]=='1' || doc["blaSHV-12"]=='1' || doc["blaCTX-M-12"]=='1' || doc["blaCTX-M-55"]=='1'){
        esbl = "ESBL";
    }else{
        esbl = "Non-ESBL";
    }

    if(doc["catA1"]=='1' || doc["cmlA"]=='1' ){
        chlCat = "ChlR";
    }else{
        chlCat = "ChlS";
    }
    
    

    if (dcsMechanisms == undefined) {
        if (doc['qnrS'] == '1' && doc['qnrB'] == '1') {
            dcsMechanisms = `_QRDR + qnrS + qnrB`;
        } else if (doc['qnrS'] == '1' && doc['qnrD'] == '1') {
            dcsMechanisms = `_QRDR + qnrS + qnrD`; 
        } else if (doc['qnrS'] == '1') {
            dcsMechanisms = `_QRDR + qnrS`;
        } else if (doc['qnrB'] == '1') {
            dcsMechanisms = `_QRDR + qnrB`;
        } else if (doc['qnrD'] == '1') {
            dcsMechanisms = `_QRDR + qnrD`;
        } else {
            dcsMechanisms = `_QRDR`;
        }
    } else {
        if (doc['qnrS'] == '1' && doc['qnrB'] == '1') {
            dcsMechanisms = dcsMechanisms + `_QRDR + qnrS + qnrB`;
        } else if (doc['qnrS'] == '1' && doc['qnrD'] == '1') {
            dcsMechanisms = dcsMechanisms + `_QRDR + qnrS + qnrD`;
        } else if (doc['qnrS'] == '1') {
            dcsMechanisms = dcsMechanisms + `_QRDR + qnrS`;
        } else if (doc['qnrB'] == '1') {
            dcsMechanisms = dcsMechanisms + `_QRDR + qnrB`;
        } else if (doc['qnrD'] == '1') {
            dcsMechanisms = dcsMechanisms + `_QRDR + qnrD`;
        } else {
            let auxDCS = dcsMechanisms;
            if (!(typeof auxDCS === 'string' && auxDCS.includes('QRDR'))) {
                dcsMechanisms = dcsMechanisms + `_QRDR`;
            }
        }
    }


    if (dcsMechanisms == undefined) {
        dcsMechanisms = num_qrdr;
    } else {
        dcsMechanisms = num_qrdr+dcsMechanisms;
    }

    if(doc["acrB_R717Q"]>0 || doc["acrB_R717L"]>0){
        azith = "AzithR";
    }else{
        azith = "AzithS";
    }

    if(num_qrdr==3){
        cip = "CipR";
    }else if(num_qrdr==2 || num_qrdr==1){
        cip = "CipNS";
    }else if(num_qrdr ==0){
        cip = "CipS";
    }

    if(cipqrdr == undefined){
        cipqrdr = (doc["qnrS"].toString()+doc["qnrB"].toString()+doc["qnrD"].toString());
    }else{
        cipqrdr = (cipqrdr+doc["qnrS"].toString()+doc["qnrB"].toString()+doc["qnrD"].toString());
    }   
    
    // if(cipqrdr==""){
    //     cipqrdr = (cip).toString();
    // }else{
    //     cipqrdr = (cip+cipqrdr).toString();
    // }
    
    if(cipqrdr != undefined){
        let cip_ = cip + cipqrdr;
        cipqrdr = cip_;
        if(cip_=="CipS101" || cip_=="CipS110" || cip_=="CipS010"){
            cip = "CipNS";
        }else if(cip_=="CipNS100" || cip_=="CipNS110" || cip_=="CipNS010"){
            cip = "CipR";
        }
    }else{
        cipqrdr = cip.toString();
    }

    // if(cipqrdr == undefined){
    //     cipqrdr = (doc["qnrS"].toString()+doc["qnrB"].toString()+doc["qnrD"].toString());
    // }else{
    //     cipqrdr = (cipqrdr+doc["qnrS"].toString()+doc["qnrB"].toString()+doc["qnrD"].toString());
    // }   

    if(num_qrdr=== 0 && (doc["qnrS"]===1 || doc["qnrB"]===1  || doc["qnrD"]===1 )){
        cip = "CipNS";
    }else if (num_qrdr===0){
        cip = "CipS";
    }else if(num_qrdr=== 1 && (doc["qnrS"]===1  || doc["qnrB"]===1  || doc["qnrD"]===1 )){
        cip = "CipR";
    }else if(num_qrdr=== 1){
        cip = "CipNS";
    }else if(num_qrdr=== 2 && (doc["qnrS"]===1  || doc["qnrB"]===1  || doc["qnrD"]===1 )){
        cip = "CipR";
    }else if(num_qrdr=== 2){
        cip = "CipNS";
    }else{
        cip = "CipR";
    }


        dcsCategory = cip;
    if(cip == "CipNS" || cip == "CipR"){
        dcsCategory = "DCS";
    }else {
        dcsCategory = "CipS";
    }

    
    
    if (
        cip != undefined && dcsCategory != undefined && cipqrdr != undefined && mdr != undefined &&
        azith != undefined && xdr != undefined) {
        let XDR = xdr;
        let dcs_category = dcsCategory;
        let cip_pheno_qrdr_gene = cipqrdr;
        let cip_pred_pheno = cip;
        let azith_pred_pheno = azith;
        let MDR = mdr;
        let Num_amr_genes = num_amr_genes;

        if (XDR == 'XDR') {
            amrCategory = 'XDR';
        } else if (
            MDR == 'MDR' &&
            dcs_category == 'DCS' &&
            cip_pred_pheno == 'CipNS' &&
            cip_pheno_qrdr_gene == 'CipNS000' &&
            azith_pred_pheno == 'AzithR'
            ) {
            amrCategory = 'AzithR_DCS_MDR';
        } else if (
            MDR == 'MDR' &&
            dcs_category == 'DCS' &&

            (cip_pred_pheno == 'CipNS' || cip_pred_pheno == 'CipR') &&
            (cip_pheno_qrdr_gene == 'CipNS000' ||
            cip_pheno_qrdr_gene == 'CipNS010' ||
            cip_pheno_qrdr_gene == 'CipS101' ||
            cip_pheno_qrdr_gene == 'CipR000') &&
            azith_pred_pheno == 'AzithS'
        ) {
            amrCategory = 'MDR_DCS';
        } else if (
            dcs_category == 'DCS' &&
            (cip_pred_pheno == 'CipR' || cip_pred_pheno == 'CipS' || cip_pred_pheno == 'CipNS') &&
            (cip_pheno_qrdr_gene == 'CipNS000' || cip_pheno_qrdr_gene == 'CipR000') &&
            azith_pred_pheno == 'AzithR'
        ) {
            amrCategory = 'AzithR_DCS';
        } else if (
            dcs_category == 'DCS' &&
            (cip_pred_pheno == 'CipR' || cip_pred_pheno == 'CipNS') &&
            Num_amr_genes != '0' &&
            azith_pred_pheno == 'AzithS'
        ) {
            amrCategory = 'AMR_DCS';
        } else if (
            dcs_category == 'DCS' &&
            MDR == '-' &&
            azith_pred_pheno == 'AzithS' &&
            (cip_pred_pheno == 'CipNS' || cip_pred_pheno == 'CipR') &&
            (cip_pheno_qrdr_gene == 'CipNS000' || cip_pheno_qrdr_gene == 'CipR000')
        ) {
            amrCategory = 'DCS';
        } else if (
            MDR == 'MDR' &&
            dcs_category != 'DCS' &&
            cip_pred_pheno == 'CipS' &&
            azith_pred_pheno == 'AzithR' &&
            cip_pheno_qrdr_gene == 'CipS000'
        ) {
            amrCategory = 'AzithR_MDR';
        } else if (
            MDR == 'MDR' &&
            dcs_category == 'CipS' &&
            azith_pred_pheno == 'AzithS' &&
            cip_pred_pheno  == 'CipS' &&
            cip_pheno_qrdr_gene == 'CipS000'
        ) {
            amrCategory = 'MDR';
        } else if (
            MDR == '-' &&
            dcs_category != 'DCS' &&
            cip_pred_pheno  == 'CipS' &&
            cip_pheno_qrdr_gene == 'CipS000' &&
            Num_amr_genes != '0' &&
            azith_pred_pheno == 'AzithS'
        ) {
            amrCategory = 'AMR';
        } else if (
            cip_pred_pheno  == 'CipS' &&
            azith_pred_pheno == 'AzithS' &&
            cip_pheno_qrdr_gene == 'CipS000' &&
            Num_amr_genes == '0'
        ) {
            amrCategory = 'No AMR detected';
        }
    }

    if(cip == "CipNS"){
        cipns = 1;
        cipr = 0;
    }else if(cip == "CipR"){
        cipns = 1;
        cipr = 1;
    }




    var travelLocation = (empty.indexOf(doc["TRAVEL COUNTRY"]) !== -1) ? "-" : doc["TRAVEL COUNTRY"];
    var incTypes = (empty.indexOf(doc["Inc Types"]) !== -1) ? "-" : doc["Inc Types"];
    var pValue = (empty.indexOf(doc["p-Value"]) !== -1) ? "-" : doc["p-Value"];
    var mashDistance = (empty.indexOf(doc["Mash Distance"]) !== -1) ? "-" : doc["Mash Distance"];
    var organismID = (empty.indexOf(doc["Organism ID"]) !== -1) ? "-" : doc["Organism ID"];
    var speciesName = (empty.indexOf(doc["Species Name"]) !== -1) ? "-" : doc["Species Name"];
    var speciesID = (empty.indexOf(doc["Species ID"]) !== -1) ? "-" : doc["Species ID"];
    var genusID = (empty.indexOf(doc["Genus ID"]) !== -1) ? "-" : doc["Genus ID"];
    var genusName = (empty.indexOf(doc["Genus Name"]) !== -1) ? "-" : doc["Genus Name"];
    var referenceID = (empty.indexOf(doc["Reference ID"]) !== -1) ? "-" : doc["Reference ID"];
    var matchingHashes = (empty.indexOf(doc["Matching Hashes"]) !== -1) ? "-" : doc["Matching Hashes"];
    var organismName = (empty.indexOf(doc["Organism Name"]) !== -1) ? "-" : doc["Organism Name"];
    var version = (empty.indexOf(doc["Version"]) !== -1) ? "-" : doc["Version"];
    var genomeID = (empty.indexOf(doc["Genome ID"]) !== -1) ? "-" : doc["Genome ID"];
    var tetAC = (empty.indexOf(doc["tetA(C)"]) !== -1) ? "-" : doc["tetA(C)"];
    var tetAD = (empty.indexOf(doc["tetA(D)"]) !== -1) ? "-" : doc["tetA(D)"];
    var ereA = (empty.indexOf(doc["ereA"]) !== -1) ? "-" : doc["ereA"];
    
    var accession = (empty.indexOf(doc["ACCESSION"]) !== -1) ? "-" : doc["ACCESSION"];
    var strain = (empty.indexOf(doc["STRAIN"]) !== -1) ? "-" : doc["STRAIN"];
    var contact = (empty.indexOf(doc["CONTACT"]) !== -1) ? "-" : doc["CONTACT"];
    var tgcID = (empty.indexOf(doc["TGC ID"]) !== -1) ? "-" : doc["TGC ID"];
    var age = (empty.indexOf(doc["AGE"]) !== -1) ? "-" : doc["AGE"];
    var pourposeOfSampling = (empty.indexOf(doc["PURPOSE OF SAMPLING"]) !== -1) ? "-" : doc["PURPOSE OF SAMPLING"];
    var source = (empty.indexOf(doc["SOURCE"]) !== -1) ? "-" : doc["SOURCE"];
    var symptomStatus = (empty.indexOf(doc["SYMPTOM STATUS"]) !== -1) ? "-" : doc["SYMPTOM STATUS"];
    var location = (empty.indexOf(doc["LOCATION"]) !== -1) ? "-" : doc["LOCATION"];
    var biosample = (empty.indexOf(doc["BIOSAMPLE"]) !== -1) ? "-" : doc["BIOSAMPLE"];
    var projectAccession = (empty.indexOf(doc["PROJECT ACCESSION"]) !== -1) ? "-" : doc["PROJECT ACCESSION"];
    var lab = (empty.indexOf(doc["LAB"]) !== -1) ? "-" : doc["LAB"];
    var countryIsolated = (empty.indexOf(doc["COUNTRY ISOLATED"]) !== -1) ? "-" : doc["COUNTRY ISOLATED"];
    var pmid = (empty.indexOf(doc["PMID"]) !== -1) ? "-" : doc["PMID"];
    var travelAssociated = (empty.indexOf(doc["TRAVEL ASSOCIATED"]) !== -1) ? "-" : doc["TRAVEL ASSOCIATED"];
    
    var countryOnly = (empty.indexOf(doc["COUNTRY OF ORIGIN"]) !== -1) ? "-" : doc["COUNTRY OF ORIGIN"];
    var regionInCounty = (empty.indexOf(doc["LOCATION"]) !== -1) ? "-" : doc["LOCATION"];
    var countyOrigin = (empty.indexOf(doc["COUNTRY OF ORIGIN"]) !== -1) ? "-" : doc["COUNTRY OF ORIGIN"];
    var travelCountry = (empty.indexOf(doc["TRAVEL COUNTRY"]) !== -1) ? "-" : doc["TRAVEL COUNTRY"];
    var countyOfOrigin = (empty.indexOf(doc["COUNTRY OF ORIGIN"]) !== -1) ? "-" : doc["COUNTRY OF ORIGIN"];
    var accuracy = (empty.indexOf(doc["ACCURACY"]) !== -1) ? "-" : doc["ACCURACY"];
    var latitude = (empty.indexOf(doc["LATITUDE"]) !== -1) ? "-" : doc["LATITUDE"];
    var longitude = (empty.indexOf(doc["LONGITUDE"]) !== -1) ? "-" : doc["LONGITUDE"];

    if(date != "-" && countryOnly != "-" && 
        (doc["PURPOSE OF SAMPLING"] == "Non Targeted [Surveillance Study]" ||
        doc["PURPOSE OF SAMPLING"] == "Non Targeted [Routine diagnostics]" ||
        doc["PURPOSE OF SAMPLING"] == "Non Targeted [Reference lab]" ||
        doc["PURPOSE OF SAMPLING"] == "Non Targeted [Other]") && doc["SYMPTOM STATUS"] != "Asymptomatic Carrier" &&
        doc["SOURCE"] != "Environment" && doc["SOURCE"] != "Gallbladder"){
            dView = "Include";
    }else{
            dView = "Exclude";
    }


    collection2.updateOne(
      { "_id": doc._id },
      { $set: { "NAME": doc["NAME"].toString(),
                "h58_genotypes": h58_genotype,
                "GENOTYPE_SIMPLE":GENOTYPE_SIMPLE,
                "GENOTYPE":curate,
                "GENOTYPHI SNPs CALLED": name_,
                "DATE": date,
                "TRAVEL": travel,
                "num_qrdr":num_qrdr,
                "num_amr_genes": num_amr_genes.toString(),
                "sul_any":sul_any,
                "dfra_any": dfra_any,
                "co_trim": co_trim,
                "tetracycline_category":tetracycline_category,
                "MDR": mdr,
                "XDR": xdr,
                "ESBL_category": esbl,
                "chloramphenicol_category": chlCat,
                "dcs_category": dcsCategory,
                "dcs_mechanisms": dcsMechanisms,
                "dcs_mechanisms2": dcsMechanisms,
                "amr_category": amrCategory,
                "cip_pred_pheno": cip,
                "CipNS": cipns,
                "CipR":cipr,
                "azith_pred_pheno":azith,
                "cip_pheno_qrdr_gene":cipqrdr,

                "num_acrb": doc["acrB_R717Q"],
                "TRAVEL_LOCATION": travelLocation,
                "Inc Types": incTypes,
                "p-Value": pValue,
                "Mash Distance": mashDistance,
                "Organism ID": organismID,
                "Species Name": speciesName,
                "Species ID": speciesID,
                "Genus ID": genusID,
                "Genus Name": genusName,
                "Reference ID": referenceID,
                "Matching Hashes": matchingHashes,
                "Organism Name": organismName,
                "Version": version,
                "Genome ID": genomeID,
                "tetA(C)": tetAC,
                "tetA(D)": tetAD,
                "ereA": ereA,

                "ACCESSION": accession,
                "STRAIN": strain,
                "CONTACT": contact,
                "TGC ID": tgcID,
                "AGE": age,
                "PURPOSE OF SAMPLING": pourposeOfSampling,
                "SOURCE": source,
                "SYMPTOM STATUS": symptomStatus,
                "LOCATION": location,
                "BIOSAMPLE": biosample,
                "PROJECT ACCESSION": projectAccession,
                "LAB": lab,
                "COUNTRY ISOLATED": countryIsolated,
                "PMID": pmid,
                "TRAVEL ASSOCIATED": travelAssociated,
                
                "COUNTRY_ONLY": countryOnly,
                "REGION_IN_COUNTRY": regionInCounty,
                "COUNTRY_ORIGIN": countyOrigin,
                "TRAVEL COUNTRY": travelCountry,
                "COUNTRY OF ORIGIN": countyOfOrigin,
                "ACCURACY": accuracy,
                "LATITUDE": latitude,
                "LONGITUDE": longitude,
                "dashboard view": dView}
      },
    );
  });
  res.status(200).json({ message: "Typhi Collection update initiated successfully" });
});


router.post('/newdockleb', function (req, res, next) {
  const organism = req.body.organism;
  let collection,collection2, localFilePath;
  // collection = client.db('salmotyphi').collection('clean_merge_st');///Orignal with db "salmotyphi"

  collection2 = client.db('klebpnneumo').collection('merge_rawdata_kleb');
  console.log("I am trying to update a collection: merge_rawdata_kleb, with new query method (w/o aggregare functions)");
    
  var dView, kLocus, oLocus, location;
  collection2.find().forEach(function(doc) {
    const empty = ['NA', 'Not Provided', '', '-', undefined];

    var date = (empty.indexOf(doc["year"]) !== -1) ? "-" : doc["year"];
    
    var countryOnly = (empty.indexOf(doc["Country"]) !== -1) ? "-" : doc["Country"];

    var latitude = (empty.indexOf(doc["latitude"]) !== -1) ? "-" : doc["latitude"];

    var longitude = (empty.indexOf(doc["longitude"]) !== -1) ? "-" : doc["longitude"];
    
    if(date != "-" && countryOnly != "-"  && doc["species"] == "Klebsiella pneumoniae"){
            dView = "Include";
    }else{
            dView = "Exclude";
    }

    if(empty.indexOf(doc["K_locus_identity"]) !== -1){
            kLocus = "-";
        }else{
            kLocus = (doc["K_locus_identity"].toString()).replace("%", "").trim();
    }
    kLocus = (parseFloat(kLocus)/100).toFixed(4);

    if(empty.indexOf(doc["O_locus_identity"]) !== -1){
            oLocus = "-";
        }else{
            oLocus = (doc["O_locus_identity"].toString()).replace("%", "").trim();
    }
    oLocus = (parseFloat(oLocus)/100).toFixed(4);

    collection2.updateOne(
      { "_id": doc._id },
      { $set: { "NAME": doc["name"].toString(),
                "DATE": date,
                "GENOTYPE":doc["ST"].toString(),
                "COUNTRY_ONLY": countryOnly,
                "LATITUDE": latitude,
                "LONGITUDE": longitude,
                "LOCATION": doc["City"] && doc["City"]["region"] !== undefined ? doc["City"]["region"] : "-",
                "K_locus_identity": kLocus,
                "K_locus_identity": kLocus,
                "O_locus_identity": oLocus,
                "dashboard view": dView}
      },
    );
  });
  res.status(200).json({ message: "Kleb Collection update initiated successfully" });
});

export default router;
