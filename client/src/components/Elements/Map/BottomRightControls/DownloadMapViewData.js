import { CameraAlt, Download } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';

export const DownloadMapViewData = () => {
  const mapData = useAppSelector((state) => state.map.mapData);
  console.log("mapData", mapData)

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
                            'Genotype/Lineage/NG-MAST', ];

      

      // Create CSV header row
      const headers = HeaderList.join(',');
      
      // Create CSV rows
      const rows = mapData.map((item) => {
        const MDRCount = (item.stats && item.stats.MDR && item.stats.MDR.count)   ? item.stats.MDR.count  : 0;
        const XDRCount = (item.stats && item.stats.XDR && item.stats.XDR.count)   ? item.stats.XDR.count  : 0;
        const H58Count = (item.stats && item.stats.H58 && item.stats.H58.count)   ? item.stats.H58.count  : 0;
        const CipRCount = (item.stats && item.stats.CipR && item.stats.CipR.count)   ? item.stats.CipR.count  : 0;
        const CipNSCount = (item.stats && item.stats.CipNS && item.stats.CipNS.count)   ? item.stats.CipNS.count  : 0;
        const AzithRCount = ((item.stats && item.stats.AzithR && item.stats.AzithR.count) ? item.stats.AzithR.count  : 0) || ((item.stats && item.stats.Azithromycin && item.stats.Azithromycin.count)   ? item.stats.Azithromycin.count  : 0) ;
        const ESBLCount = (item.stats && item.stats.ESBL && item.stats.ESBL.count)   ? item.stats.ESBL.count  : 0;
        // const ESBL_categoryCount = (item.stats && item.stats.ESBL_category && item.stats.ESBL_category.count)   ? item.stats.ESBL_category.count  : 0;
        const CeftriaxoneCount = ((item.stats && item.stats.Ceftriaxone && item.stats.Ceftriaxone.count)   ? item.stats.Ceftriaxone.count  : 0) || ((item.stats && item.stats.ESBL_category && item.stats.ESBL_category.count)   ? item.stats.ESBL_category.count  : 0) ;
        // const AzithromycinCount = (item.stats && item.stats.Azithromycin && item.stats.Azithromycin.count)   ? item.stats.Azithromycin.count  : 0;
        const CiprofloxacinCount = (item.stats && item.stats.Ciprofloxacin && item.stats.Ciprofloxacin.count)   ? item.stats.Ciprofloxacin.count  : 0;
        const CarbCount = (item.stats && item.stats.Carb && item.stats.Carb.count)   ? item.stats.Carb.count  : 0;
        const SensitiveDrugsCount = (item.stats && item.stats.Susceptible && item.stats.Susceptible.count  )
                ? item.stats.Susceptible.count
                 : 0;
        const Genotype = (item.stats && item.stats.GENOTYPE && item.stats.GENOTYPE.count)   ? item.stats.GENOTYPE.count  : 0;

        console.log("Susceptible",item.stats.Susceptible.count);
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
          Genotype
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
