import { InfoOutlined } from '@mui/icons-material';
import { Box, Card, CardContent, MenuItem, Select, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { useStyles } from './TopRightControlsMUI';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { setMapView, setIfCustom} from '../../../../stores/slices/mapSlice.ts';
import { darkGrey, getColorForGenotype, lightGrey } from '../../../../util/colorHelper';
import { genotypes } from '../../../../util/genotypes';
import { redColorScale, samplesColorScale, sensitiveColorScale } from '../mapColorHelper';
import { mapLegends } from '../../../../util/mapLegends';

const generalSteps = ['>0 and ≤2%', '>2% and ≤10%', '>10% and ≤50%', '>50%'];
const sensitiveSteps = ['0 - 10%', '10 - 20%', '20 - 50%', '50 - 90%', '90 - 100%'];
const noSamplesSteps = ['1 - 9', '10 - 19', '20 - 99', '100 - 299', '>= 300'];
const gradientStyle = ['0.01% - 25.00% ', '25.01 - 50.00%', '50.01% - 75.00%', '75.01% - 100.00%'];
const ExcludedView = ['Genotype prevalence', 'NG-MAST prevalence', 'Lineage prevalence'];
const mapViewsWithZeroPercentOption = ['CipNS', 'CipR', 'AzithR', 'MDR', 'XDR', 'H58 / Non-H58', 'ESBL', 'Carb', 'Genotype prevalence', 'NG-MAST prevalence', 'Lineage prevalence'];

export const TopRightControls = () => {
  const classes = useStyles();
  const matches = useMediaQuery('(max-width:700px)');

  const dispatch = useAppDispatch();
  const mapData = useAppSelector((state) => state.map.mapData);
  const mapView = useAppSelector((state) => state.map.mapView);
  const organism = useAppSelector((state) => state.dashboard.organism);
  const colorPallete = useAppSelector((state) => state.dashboard.colorPallete);
  const genotypesForFilter = useAppSelector((state) => state.dashboard.genotypesForFilter);

  function handleChangeMapView(event) {
    if(event.target.value === 'Genotype prevalence' || event.target.value === 'NG-MAST prevalence' || event.target.value === 'Lineage prevalence')
      dispatch(setIfCustom(true));
    else
      dispatch(setIfCustom(false));
    dispatch(setMapView(event.target.value));
  }

  function hasZeroPercentOption() {
    return mapViewsWithZeroPercentOption.includes(mapView);
  }

  function getGenotypeColor(genotype) {
    return organism === 'styphi' ? getColorForGenotype(genotype) : colorPallete[genotype] || '#F5F4F6';
  }

  function getDominantGenotypeSteps(genotype) {
    if (organism === 'styphi') {
      return genotypes;
    } else {
      return genotypesForFilter;
    }
  }

  function getSteps() {
    switch (mapView) {
      case 'Sensitive to all drugs':
        return sensitiveSteps;
      case 'No. Samples':
        return noSamplesSteps;
      case 'Dominant Genotype':
        return getDominantGenotypeSteps();
      case 'NG-MAST prevalence':
      case 'Genotype prevalence':
      case 'Lineage prevalence':
        return gradientStyle;
      default:
        return generalSteps;
    }
  }

  function getStepBoxColor(step, index) {
    switch (mapView) {
      case 'Sensitive to all drugs':
        const aux = ['10', '20', '50', '90', '100'];
        return sensitiveColorScale(aux[index]);
      case 'No. Samples': {
        const aux = [1, 10, 20, 100, 300];
        return samplesColorScale(aux[index]);
      }
      case 'Dominant Genotype':
        return getGenotypeColor(step);
      default:
        const aux3 = ['0.01', '2.01', '10.01', '50.01'];
        return redColorScale(aux3[index]);
    }
  }

  function getMapLegends() {
    return mapLegends.filter((legend) => legend.organisms.includes(organism));
  }

  return (
    <div className={`${classes.topRightControls} ${matches ? classes.bp700 : ''}`}>
      <Card elevation={3} className={classes.card}>
        <CardContent className={classes.cardContent}>
          <div className={classes.label}>
            <Typography variant="caption">Colour country by</Typography>
            <Tooltip
              title="Percentage frequency data is shown only for countries with
          N≥20 genomes"
              placement="top"
            >
              <InfoOutlined color="action" fontSize="small" className={classes.labelTooltipIcon} />
            </Tooltip>
          </div>
          <Select
            variant="standard"
            value={mapView}
            onChange={handleChangeMapView}
            inputProps={{ className: classes.selectInput }}
            MenuProps={{ classes: { list: classes.selectMenu } }}
            disabled={organism === 'none'}
          >
            {getMapLegends().map((legend, index) => {
              let legendLabel;
              if (legend.label === 'Extensively drug resistant (XDR)') {
                  legendLabel = (
                    <Tooltip title="XDR, extensively drug resistant (MDR plus resistant to ciprofloxacin and ceftriaxone)." placement="top">
                      <span>Extensively drug resistant (XDR)</span>
                      </Tooltip>
                  );
              } else if(legend.label === 'Multidrug resistant (MDR)'){
                  legendLabel = (
                    <Tooltip title="MDR, multi-drug resistant (resistant to ampicillin, chloramphenicol, and trimethoprim-sulfamethoxazole)" placement="top">
                      <span>Multidrug resistant (MDR)</span>
                      </Tooltip>
                  );
              }else if (legend.label === 'Lineage prevalence') {
                  legendLabel = (
                    <Tooltip title="Lineage prevalence" placement="top">
                      <span>Lineage prevalence</span>
                      </Tooltip>
                  );
              }else{
                  legendLabel = legend.label;
              }
              return (
                <MenuItem key={index + 'mapview'} value={legend.value}>
                  {legendLabel}
                </MenuItem>
              );
            })}
          </Select>
          {organism !== 'none' && mapData.length > 0 && (
            <div className={classes.legendWrapper}>
              <div className={classes.legend}>
                <Box className={classes.legendColorBox} style={{ backgroundColor: lightGrey }} />
                <span className={classes.legendText}>Insufficient data</span>
              </div>
              {hasZeroPercentOption() && (
                <div className={classes.legend}>
                  <Box className={classes.legendColorBox} style={{ backgroundColor: darkGrey }} />
                  <span className={classes.legendText}>0%</span>
                </div>
              )}
              {/* {getSteps().map((step, index) => {
                return (
                  <div key={`step-${index}`} className={classes.legend}>
                    <Box className={classes.legendColorBox} style={{ backgroundColor: getStepBoxColor(step, index) }} />
                    <span className={classes.legendText}>{step}</span>
                  </div>
                );
              })} */}
              {ExcludedView.includes(mapView) ?(
                <div key={`step-1`} className={classes.legend}>
                  <Box
                    className={classes.legendColorBox}
                    style={{
                      height: '50px',
                      marginTop:'2px',
                      backgroundImage: "linear-gradient( #FAAD8F, #FA694A, #DD2C24, #A20F17)"
                    }}
                  />
                  <span className={classes.legendText}>
                    <div style={{textAlign:'left', height: '50px'}}>
                      <div>1%</div>
                      <br/>
                      <br/>
                      <div>100%</div>
                    </div>
                  </span>
                </div>
              ) : (
                getSteps().map((step, index) => (
                  <div key={`step-${index}`} className={classes.legend}>
                    <Box className={classes.legendColorBox} style={{ backgroundColor: getStepBoxColor(step, index) }} />
                    <span className={classes.legendText}>{step}</span>
                  </div>
                ))
              ) }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
