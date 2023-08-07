/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Card, CardContent, Checkbox, ListItemText, MenuItem, Select , InputAdornment} from '@mui/material';
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { setCustomDropdownMapView } from '../../../../stores/slices/graphSlice';
import { useStyles } from './TopRightControls2MUI';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';


export const TopRightControls2 = () => {
  const classes = useStyles();
  const [currentTooltip, setCurrentTooltip] = useState(null);
  const [searchValue2, setSearchValue2] = useState("")
  const dispatch = useAppDispatch();
  const organism = useAppSelector((state) => state.dashboard.organism);
  const genotypesDrugsData2 = useAppSelector((state) => state.graph.genotypesDrugsData2);
  const customDropdownMapView = useAppSelector((state) => state.graph.customDropdownMapView);
  const genotypesForFilter = useAppSelector((state) => state.dashboard.genotypesForFilter);

  useEffect(() => {
    setCurrentTooltip(null);
    // console.log("customDropdownMapView", customDropdownMapView);
  }, [genotypesDrugsData2, customDropdownMapView]);

  function getSelectGenotypeLabel(genotype) {
    // console.log("genotype2",genotype.Susceptible );
    const percentage = Number(((genotype.Susceptible / genotype.totalCount) * 100).toFixed(2));

    return `${genotype.name} (total N=${genotype.totalCount}, ${percentage}% Susceptible)`;
  }
  
  function getDataForGenotypeSelect() {
    // console.log("getDataForGenotypeSelect",genotypesDrugsData2);
    return genotypesDrugsData2;
  }

  function handleChangeSelectedGenotypes({ event = null, all = false }) {
    if (all) {
      dispatch(setCustomDropdownMapView([]));
      setCurrentTooltip(null);
      return;
    }

    const {
      target: { value }
    } = event;

    if (customDropdownMapView.length === 10 && value.length > 10) {
      return;
    }

    if (value.length === 0) {
      setCurrentTooltip(null);
    }
    dispatch(setCustomDropdownMapView(value));
  }
 function setSearchValue(event){
  event.preventDefault()
  setSearchValue2(event.target.value)
 }

const filteredData = getDataForGenotypeSelect().filter((genotype) =>
  genotype.name.startsWith(searchValue2)
);

console.log("customDropdownMapView", customDropdownMapView.length);
 console.log("searchValue2", searchValue2);
  return (
    <div className={`${classes.topRightControls}`}>
      <Card elevation={3} className={classes.card}>
        <CardContent className={classes.frequenciesGraph}>
            <Select
              multiple
              labelId="search-select-label"
              id="search-select"
              value={customDropdownMapView}
              onChange={(event) => handleChangeSelectedGenotypes({ event })}
              disabled={organism === 'none'}
              displayEmpty
              onClose={(e) => setSearchValue2("")}
              endAdornment={
                <Button
                  variant="outlined"
                  className={classes.genotypesSelectButton}
                  onClick={() => handleChangeSelectedGenotypes({ all: true })}
                  disabled={organism === 'none' || customDropdownMapView.length === 0}
                  color="error"
                >
                  Clear All
                </Button>
              }
              // inputProps={{ className: classes.genotypesSelectInput }}
              // MenuProps={{ classes: { paper: classes.genotypesMenuPaper, list: classes.genotypesSelectMenu } }}
              renderValue={(selected) => (
                <div>{`${selected.length} of ${getDataForGenotypeSelect().length} selected`}</div>
              )}
            >
              <TextField 
                size="small"
                autoFocus
                placeholder="Type to search..."
                label="Search genotype" 
                variant="standard" 
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                sx={{ width:'90%', margin:'0% 5%'}}
                onChange={e => setSearchValue(e)}
                onKeyDown={(e) => e.stopPropagation()}
              />
              {filteredData.map((genotype, index) => (
                <MenuItem key={`frequencies-option-${index}`} value={genotype.name} >
                  <Checkbox checked={customDropdownMapView.indexOf(genotype.name) > -1} />
                  <ListItemText primary={getSelectGenotypeLabel(genotype)} />
                </MenuItem>
              ))}
            </Select>
        </CardContent>
     </Card>
    </div>
  );
};
