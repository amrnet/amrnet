import { CameraAlt, Download } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';

export const DownloadMapViewData = () => {
  const mapData = useAppSelector((state) => state.map.mapData);
  const customDropdownMapView = useAppSelector((state) => state.graph.customDropdownMapView);
  const customDropdownMapViewNG = useAppSelector((state) => state.graph.customDropdownMapViewNG);

  const downloadCSV = () => {
    if (Array.isArray(mapData) && mapData.length > 0) {
      const HeaderList = ['Country', 'Total number of Count', 
                            'Multidrug resistant (MDR)', 
                            'Extensively drug resistant (XDR)', 
                            'H58', 
                            'Ciprofloxacin resistant (CipR)', 
                            'Ciprofloxacin non-susceptible (CipNS)', 
                            'Azithromycin resistant', 
                            'ESBL prevalence', 
                            'Ceftriaxone resistant',
                            // 'Ceftriaxone resistant(ESBL_category)', 
                            // 'Azithromycin resistant',
                            'Ciprofloxacin resistant',
                            'Carbapenemase prevalence',
                            'Sensitive to all drugs/Susceptible to class I/II drugs',
                            `Genotype/Lineage ${customDropdownMapView}`,
                            `NG-MAST ${customDropdownMapViewNG}` ];

      

      // Create CSV header row
      const headers = HeaderList.join(',');
      
      // Create CSV rows
      const rows = mapData.map((item) => {
        const MDRCount = item.stats?.MDR?.count || 0;
        const XDRCount = item.stats?.XDR?.count || 0;
        const H58Count = item.stats?.H58?.count || 0;
        const CipRCount = item.stats?.CipR?.count || 0;
        const CipNSCount = item.stats?.CipNS?.count || 0;
        const AzithRCount = item.stats?.AzithR?.count || item.stats?.Azithromycin?.count || 0;
        const ESBLCount = item.stats?.ESBL?.count || 0;
        const CeftriaxoneCount = item.stats?.Ceftriaxone?.count || item.stats?.ESBL_category?.count || 0;
        const CiprofloxacinCount = item.stats?.Ciprofloxacin?.count || 0;
        const CarbCount = item.stats?.Carb?.count || 0;
        const SensitiveDrugsCount = item.stats?.Susceptible?.count || 0;
        // const Genotype = item.stats.GENOTYPE.items.find((genotypeItem) => genotypeItem.name == customDropdownMapView)?.count || 0;
        const genotypeCounts = customDropdownMapView.length > 0
        ? customDropdownMapView.map((viewItem) => {
          const genotypeItem = (item.stats?.GENOTYPE?.items.find((genotypeItem) => genotypeItem.name === viewItem));
          console.log("genotype", genotypeItem ? genotypeItem.count : 0)
          return genotypeItem ? genotypeItem.count : 0;
        }).join(',')
        : '0';
       const NGMASTCounts = customDropdownMapViewNG.length > 0
        ? customDropdownMapViewNG.map((viewItem) => {
            const NGMASTItem = item.stats?.NGMAST?.items.find((NGMASTItem) => NGMASTItem.name === viewItem);
            return NGMASTItem ? NGMASTItem.count : 0;
            }).join(',')
        : '0';

        
        return [
          item.name,
          item.count || '',
          MDRCount,
          XDRCount,
          H58Count,
          CipRCount,
          CipNSCount+CipRCount,
          AzithRCount,
          ESBLCount,
        //   ESBL_categoryCount,
          CeftriaxoneCount,
        //   AzithromycinCount,
          CiprofloxacinCount,
          CarbCount,
          SensitiveDrugsCount,
          genotypeCounts,
          NGMASTCounts
        ].join(',');
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
