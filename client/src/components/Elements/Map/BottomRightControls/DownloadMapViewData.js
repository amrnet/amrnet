import { Download } from '@mui/icons-material';
import { useAppSelector } from '../../../../stores/hooks';

export const DownloadMapViewData = () => {
  const mapData = useAppSelector((state) => state.map.mapData);
  const prevalenceMapViewOptionsSelected = useAppSelector((state) => state.graph.prevalenceMapViewOptionsSelected);
  const customDropdownMapViewNG = useAppSelector((state) => state.graph.customDropdownMapViewNG);
  const organism = useAppSelector((state) => state.dashboard.organism);

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
        'Sensitive to all drugs/Pansusceptible',
        'Sensitive to all drugs/Pansusceptible %',
      ];
      prevalenceMapViewOptionsSelected.forEach((viewItem, index) => {
        HeaderList.push(`Genotype/Lineage ${viewItem}`);
        HeaderList.push(`Genotype/Lineage % ${viewItem}`);
      });
      if (organism === 'ngono')
        customDropdownMapViewNG.forEach((viewItem, index) => {
          HeaderList.push(`NG-MAST ${viewItem}`);
          HeaderList.push(`NG-MAST % ${viewItem}`);
        });

      console.log('HeaderList', HeaderList);

      // Create CSV header row
      const headers = HeaderList.join(',');

      // Create CSV rows
      console.log('item', mapData.length, mapData);
      const rows = mapData
        .filter((item) => Object.keys(item).length > 0)
        .map((item) => {
          const MDRCount = item.stats?.MDR?.count || 0;
          const MDRPerCount = MDRCount < 20 ? 'insufficient' : item.stats?.MDR?.percentage || 0;

          const XDRCount = item.stats?.XDR?.count || 0;
          const XDRPerCount = XDRCount < 20 ? 'insufficient' : item.stats?.XDR?.percentage || 0;

          const H58Count = item.stats?.H58?.count || 0;
          const H58PerCount = H58Count < 20 ? 'insufficient' : item.stats?.H58?.percentage || 0;

          const CipRCount = item.stats?.CipR?.count || 0;
          const CipRPerCount = CipRCount < 20 ? 'insufficient' : item.stats?.CipR?.percentage || 0;

          const CipNSCount = item.stats?.CipNS?.count || 0;
          const CipNSPerCount = CipNSCount < 20 ? 'insufficient' : item.stats?.CipNS?.percentage || 0;

          const AzithRCount = item.stats?.AzithR?.count || item.stats?.Azithromycin?.count || 0;
          const AzithRPerCount =
            AzithRCount < 20
              ? 'insufficient'
              : item.stats?.AzithR?.percentage || item.stats?.Azithromycin?.percentage || 0;

          const ESBLCount = item.stats?.ESBL?.count || 0;
          const ESBLPerCount = ESBLCount < 20 ? 'insufficient' : item.stats?.ESBL?.percentage || 0;

          const CeftriaxoneCount = item.stats?.Ceftriaxone?.count || item.stats?.ESBL_category?.count || 0;
          const CeftriaxonePerCount =
            CeftriaxoneCount < 20
              ? 'insufficient'
              : item.stats?.Ceftriaxone?.percentage || item.stats?.ESBL_category?.percentage || 0;

          const CiprofloxacinCount = item.stats?.Ciprofloxacin?.count || 0;
          const CiprofloxacinPerCount =
            CiprofloxacinCount < 20 ? 'insufficient' : item.stats?.Ciprofloxacin?.percentage || 0;

          const CarbCount = item.stats?.Carb?.count || 0;
          const CarbPerCount = CarbCount < 20 ? 'insufficient' : item.stats?.Carb?.percentage || 0;

          const SensitiveDrugsCount = item.stats?.Pansusceptible?.count || 0;
          const SensitiveDrugsPerCount =
            SensitiveDrugsCount < 20 ? 'insufficient' : item.stats?.Pansusceptible?.percentage || 0;

          const genotypeData =
            prevalenceMapViewOptionsSelected.length > 0
              ? prevalenceMapViewOptionsSelected.map((viewItem) => {
                  const genotypeItem = item.stats?.GENOTYPE?.items.find(
                    (genotypeItem) => genotypeItem.name === viewItem,
                  );
                  const count = genotypeItem ? genotypeItem.count : 0;
                  const percentage = genotypeItem
                    ? count < 20
                      ? 'insufficient'
                      : ((count / item.stats.GENOTYPE.sum) * 100).toFixed(2)
                    : 'insufficient';
                  return { count, percentage };
                })
              : [{ count: '0', percentage: '0' }];

          const genotypeCounts = genotypeData.map((data) => data.count);
          const genotypePerCounts = genotypeData.map((data) => data.percentage);
          const interleavedGenotypeData = [];
          genotypeCounts.forEach((count, index) => {
            interleavedGenotypeData.push(count); // Add genotype count
            interleavedGenotypeData.push(genotypePerCounts[index]); // Add corresponding genotype percentage
          });
          console.log('genotypeCounts', ...interleavedGenotypeData);

          const genotypeDataNG =
            customDropdownMapViewNG.length > 0
              ? customDropdownMapViewNG.map((viewItem) => {
                  const genotypeItem = item.stats?.NGMAST?.items.find((genotypeItem) => genotypeItem.name === viewItem);
                  const count = genotypeItem ? genotypeItem.count : 0;
                  const percentage = genotypeItem
                    ? count < 20
                      ? 'insufficient'
                      : ((count / item.stats.NGMAST.sum) * 100).toFixed(2)
                    : 'insufficient';
                  return { count, percentage };
                })
              : [{ count: '0', percentage: '0' }];

          const genotypeCountsNG = genotypeDataNG.map((data) => data.count);
          const genotypePerCountsNG = genotypeDataNG.map((data) => data.percentage);
          const interleavedGenotypeDataNG = [];
          if (organism === 'ngono')
            genotypeCountsNG.forEach((count, index) => {
              interleavedGenotypeDataNG.push(count); // Add genotype count
              interleavedGenotypeDataNG.push(genotypePerCountsNG[index]); // Add corresponding genotype percentage
            });

          console.log('genotypeCountsNG', ...interleavedGenotypeDataNG);

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
            ...interleavedGenotypeData,
            ...interleavedGenotypeDataNG,
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
      console.log('mapData is not an array or is empty', mapData);
    }
  };

  return (
    <div onClick={downloadCSV}>
      <Download />
    </div>
  );
};
