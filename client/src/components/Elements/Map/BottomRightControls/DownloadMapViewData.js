import { CameraAlt, Download } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';

export const DownloadMapViewData = () => {
  const mapData = useAppSelector((state) => state.map.mapData);
  const customDropdownMapView = useAppSelector((state) => state.graph.customDropdownMapView);
  const customDropdownMapViewNG = useAppSelector((state) => state.graph.customDropdownMapViewNG);
  

  const downloadCSV = () => {
    if (Array.isArray(mapData) && mapData.length > 0) {
      const HeaderList = [
                          'Country', 
                          'Total number of Count', 
                          'Multidrug resistant (MDR)',
                          'Multidrug resistant (MDR) %', 
                          'Extensively drug resistant (XDR)',
                          'Extensively drug resistant (XDR) %',
                          'H58', 
                          'H58 %',
                          'Ciprofloxacin resistant (CipR)', 
                          'Ciprofloxacin resistant (CipR) %',
                          'Ciprofloxacin non-susceptible (CipNS)', 
                          'Ciprofloxacin non-susceptible (CipNS) %',
                          'Azithromycin resistant', 
                          'Azithromycin resistant %',
                          'ESBL prevalence', 
                          'ESBL prevalence %',
                          'Ceftriaxone resistant',
                          'Ceftriaxone resistant %',
                          'Ciprofloxacin resistant',
                          'Ciprofloxacin resistant %',
                          'Carbapenemase prevalence',
                          'Carbapenemase prevalence %',
                          'Sensitive to all drugs/Susceptible to class I/II drugs',
                          'Sensitive to all drugs/Susceptible to class I/II drugs %',
                          `Genotype/Lineage ${customDropdownMapView}`,
                          `Genotype/Lineage % ${customDropdownMapView} `,
                          `NG-MAST ${customDropdownMapViewNG}`,
                          `NG-MAST % ${customDropdownMapViewNG}`
                        ];

      // Create CSV header row
      const headers = HeaderList.join(',');
      
      // Create CSV rows
      console.log("item", mapData.length, mapData)
      const rows = mapData.filter((item) => Object.keys(item).length > 0).map((item) => {
        
        const MDRCount = item.stats?.MDR?.count || 0;
        const MDRPerCount = MDRCount < 20 ? 'insufficient' : (item.stats?.MDR?.percentage || 0);

        const XDRCount = item.stats?.XDR?.count || 0;
        const XDRPerCount = XDRCount < 20 ? 'insufficient' : (item.stats?.XDR?.percentage || 0);

        const H58Count = item.stats?.H58?.count || 0;
        const H58PerCount = H58Count < 20 ? 'insufficient' : (item.stats?.H58?.percentage || 0);

        const CipRCount = item.stats?.CipR?.count || 0;
        const CipRPerCount = CipRCount < 20 ? 'insufficient' : (item.stats?.CipR?.percentage || 0);

        const CipNSCount = item.stats?.CipNS?.count || 0;
        const CipNSPerCount = CipNSCount < 20 ? 'insufficient' : (item.stats?.CipNS?.percentage || 0);

        const AzithRCount = item.stats?.AzithR?.count || item.stats?.Azithromycin?.count || 0;
        const AzithRPerCount = AzithRCount < 20 ? 'insufficient' : (item.stats?.AzithR?.percentage || item.stats?.Azithromycin?.percentage || 0);

        const ESBLCount = item.stats?.ESBL?.count || 0;
        const ESBLPerCount = ESBLCount < 20 ? 'insufficient' : (item.stats?.ESBL?.percentage || 0);

        const CeftriaxoneCount = item.stats?.Ceftriaxone?.count || item.stats?.ESBL_category?.count || 0;
        const CeftriaxonePerCount = CeftriaxoneCount < 20 ? 'insufficient' : (item.stats?.Ceftriaxone?.percentage || item.stats?.ESBL_category?.percentage || 0);

        const CiprofloxacinCount = item.stats?.Ciprofloxacin?.count || 0;
        const CiprofloxacinPerCount = CiprofloxacinCount < 20 ? 'insufficient' : (item.stats?.Ciprofloxacin?.percentage || 0);

        const CarbCount = item.stats?.Carb?.count || 0;
        const CarbPerCount = CarbCount < 20 ? 'insufficient' : (item.stats?.Carb?.percentage || 0);

        const SensitiveDrugsCount = item.stats?.Susceptible?.count || 0;
        const SensitiveDrugsPerCount = SensitiveDrugsCount < 20 ? 'insufficient' : (item.stats?.Susceptible?.percentage || 0);
        
        
        // const genotypeCounts = customDropdownMapView.length > 0
        // ? customDropdownMapView.map((viewItem) => {
        //   const genotypeItem = (item.stats?.GENOTYPE?.items.find((genotypeItem) => genotypeItem.name === viewItem));
        //   return genotypeItem ? genotypeItem.count : 0;
        // }).join(',')
        // : '0';
        // const genotypePerCounts = customDropdownMapView.length > 0
        // ? customDropdownMapView.map((viewItem) => {
        //   const genotypeItem = (item.stats?.GENOTYPE?.items.find((genotypeItem) => genotypeItem.name === viewItem));
        //   return genotypeItem ? (genotypeItem.count < 20 ? 'insufficient' : (((genotypeItem.count / item.stats.GENOTYPE.sum) * 100).toFixed(2))) : 'insufficient';
        // }).join(','): '0';

        const genotypeData = customDropdownMapView.length > 0
        ? customDropdownMapView.map((viewItem) => {
            const genotypeItem = item.stats?.GENOTYPE?.items.find((genotypeItem) => genotypeItem.name === viewItem);
            const count = genotypeItem ? genotypeItem.count : 0;
            const percentage = genotypeItem
              ? (count < 20 ? 'insufficient' : (((count / item.stats.GENOTYPE.sum) * 100).toFixed(2)))
              : 'insufficient';
            return { count, percentage };
          })
        : [{ count: '0', percentage: '0' }];

      const genotypeCounts = genotypeData.map(data => data.count).join(',');
      const genotypePerCounts = genotypeData.map(data => data.percentage).join(',');
        
        let percentCounterNG = 0;
          const genotypesNG = item.stats.NGMAST.items;
          let genotypesNG2 = [];
          genotypesNG.forEach((genotype) => {
            if (customDropdownMapViewNG.includes(genotype.name)) {
              // tooltip.content[genotype.name] = `${genotype.count} `;
              genotypesNG2.push(genotype);
            }
            percentCounterNG += genotype.count;
          });

       const NGMASTCounts = customDropdownMapViewNG.length > 0
        ? customDropdownMapViewNG.map((viewItem) => {
            const NGMASTItem = item.stats?.NGMAST?.items.find((NGMASTItem) => NGMASTItem.name === viewItem);
            return NGMASTItem ? NGMASTItem.count : 0;
            }).join(',')
        : '0';
        const NGMASTPerCounts = customDropdownMapViewNG.length > 0
        ? customDropdownMapViewNG.map((viewItem) => {
            const NGMASTItem = item.stats?.NGMAST?.items.find((NGMASTItem) => NGMASTItem.name === viewItem);
            return NGMASTItem ?(NGMASTItem.count < 20 ? 'insufficient' : (((NGMASTItem.count / item.stats.NGMAST.sum) * 100).toFixed(2))) : 'insufficient';
            }).join(',')
        : '0';

        
        return [
          item.name,
          item.count || '',
          MDRCount,
          MDRPerCount,
          XDRCount,
          XDRPerCount,
          H58Count,
          H58PerCount,
          CipRCount,
          CipRPerCount,
          CipNSCount + CipRCount,
          CipNSPerCount,
          AzithRCount,
          AzithRPerCount,
          ESBLCount,
          ESBLPerCount,
          CeftriaxoneCount,
          CeftriaxonePerCount,
          CiprofloxacinCount,
          CiprofloxacinPerCount,
          CarbCount,
          CarbPerCount,
          SensitiveDrugsCount,
          SensitiveDrugsPerCount,
          genotypeCounts,
          genotypePerCounts,
          NGMASTCounts,
          NGMASTPerCounts,
        ]
        .join(',');
      });

      // Combine header and rows into CSV content
      const csvContent = [headers, ...rows].join('\n');

      // Create a Blob from the CSV content
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create a link to download the Blob as a file
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Global map view data.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.log("mapData is not an array or is empty", mapData);
    }
  };

  return (
    <div onClick={downloadCSV}>
      <Download />
    </div>
  );
};
