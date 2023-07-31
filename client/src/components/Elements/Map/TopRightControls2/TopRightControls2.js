/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Card, CardContent, Checkbox, ListItemText, MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { setFrequenciesGraphSelectedGenotypes } from '../../../../stores/slices/graphSlice';
import { useStyles } from './TopRightControls2MUI';


export const TopRightControls2 = () => {
  const classes = useStyles();
  const [currentTooltip, setCurrentTooltip] = useState(null);
  const dispatch = useAppDispatch();
  const organism = useAppSelector((state) => state.dashboard.organism);
  const genotypesDrugsData = useAppSelector((state) => state.graph.genotypesDrugsData);
  const frequenciesGraphSelectedGenotypes = useAppSelector((state) => state.graph.frequenciesGraphSelectedGenotypes);
  const genotypesForFilter = useAppSelector((state) => state.dashboard.genotypesForFilter);

  useEffect(() => {
    setCurrentTooltip(null);
    console.log("frequenciesGraphSelectedGenotypes", frequenciesGraphSelectedGenotypes);
  }, [genotypesDrugsData, frequenciesGraphSelectedGenotypes]);

  function getSelectGenotypeLabel(genotype) {
    const percentage = Number(((genotype.resistantCount / genotype.totalCount) * 100).toFixed(2));

    return `${genotype.name} (total N=${genotype.totalCount}, ${percentage}% resistant)`;
  }
  
  function getDataForGenotypeSelect() {
    if (organism === 'typhi') {
      // console.log("genotypesDrugsData:", genotypesDrugsData);
      return genotypesDrugsData;
    } else {
      // console.log("genotypesDrugsData:", genotypesForFilter);
      return JSON.parse(JSON.stringify(genotypesDrugsData.slice(0, genotypesForFilter.length)));
    }
    // return genotypesDrugsData;
  }

  function getData() {
    console.log("genotypesDrugsData", genotypesDrugsData);
    const data = genotypesDrugsData.filter((genotype) => frequenciesGraphSelectedGenotypes.includes(genotype.name));
    console.log("data", data);
    return data;
  }
  function handleChangeSelectedGenotypes({ event = null, all = false }) {
    if (all) {
      dispatch(setFrequenciesGraphSelectedGenotypes([]));
      setCurrentTooltip(null);
      return;
    }

    const {
      target: { value }
    } = event;


    if (value.length === 0) {
      setCurrentTooltip(null);
    }
    dispatch(setFrequenciesGraphSelectedGenotypes(value));
  }

  return (
    <div className={`${classes.topRightControls}`}>
      <Card elevation={3} className={classes.card}>
        <CardContent className={classes.frequenciesGraph}>
            <Select
              multiple
              value={frequenciesGraphSelectedGenotypes}
              onChange={(event) => handleChangeSelectedGenotypes({ event })}
              displayEmpty
              disabled={organism === 'none'}
              endAdornment={
                <Button
                  variant="outlined"
                  className={classes.genotypesSelectButton}
                  onClick={() => handleChangeSelectedGenotypes({ all: true })}
                  disabled={organism === 'none' || frequenciesGraphSelectedGenotypes.length === 0}
                  color="error"
                >
                  Clear All
                </Button>
              }
              inputProps={{ className: classes.genotypesSelectInput }}
              MenuProps={{ classes: { paper: classes.genotypesMenuPaper, list: classes.genotypesSelectMenu } }}
              renderValue={(selected) => (
                <div>{`${selected.length} of ${getDataForGenotypeSelect().length} selected`}</div>
              )}
            >
              {getDataForGenotypeSelect().map((genotype, index) => (
                <MenuItem key={`frequencies-option-${index}`} value={genotype.name}>
                  <Checkbox checked={frequenciesGraphSelectedGenotypes.indexOf(genotype.name) > -1} />
                  <ListItemText primary={getSelectGenotypeLabel(genotype)} />
                </MenuItem>
              ))}
            </Select>
        </CardContent>
     </Card>
    </div>
  );
};
