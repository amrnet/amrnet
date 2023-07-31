import { InfoOutlined } from '@mui/icons-material';
import { Box, Card, CardContent, MenuItem, Select, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { useStyles } from './TopRightControlsMUI';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { setMapView } from '../../../../stores/slices/mapSlice.ts';
import { darkGrey, getColorForGenotype, lightGrey } from '../../../../util/colorHelper';
import { genotypes } from '../../../../util/genotypes';
import { redColorScale, samplesColorScale, sensitiveColorScale } from '../mapColorHelper';
import { mapLegends } from '../../../../util/mapLegends';

const generalSteps = ['1 - 2%', '3 - 10%', '11 - 50%', '51 - 100%'];
const sensitiveSteps = ['0 - 10%', '10 - 20%', '20 - 50%', '50 - 90%', '90 - 100%'];
const noSamplesSteps = ['1 - 9', '10 - 19', '20 - 99', '100 - 299', '>= 300'];
const mapViewsWithZeroPercentOption = ['CipNS', 'CipR', 'AzithR', 'MDR', 'XDR', 'H58 / Non-H58', 'ESBL', 'Carb'];

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
    dispatch(setMapView(event.target.value));
  }

  function hasZeroPercentOption() {
    return mapViewsWithZeroPercentOption.includes(mapView);
  }

  function getGenotypeColor(genotype) {
    return organism === 'typhi' ? getColorForGenotype(genotype) : colorPallete[genotype] || '#F5F4F6';
  }

  function getDominantGenotypeSteps(genotype) {
    if (organism === 'typhi') {
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
      case 'Select custom Genotype':
        return getDominantGenotypeSteps();
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
      case 'Select custom Genotype':
        return getGenotypeColor(step);
      default:
        return redColorScale(step);
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
            <Typography variant="caption">Select map view</Typography>
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
              return (
                <MenuItem key={index + 'mapview'} value={legend.value}>
                  {legend.label}
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
              {getSteps().map((step, index) => {
                return (
                  <div key={`step-${index}`} className={classes.legend}>
                    <Box className={classes.legendColorBox} style={{ backgroundColor: getStepBoxColor(step, index) }} />
                    <span className={classes.legendText}>{step}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
