import { Alert, CircularProgress, IconButton, Snackbar, Tooltip } from '@mui/material';
import { useStyles } from './MapActionsMUI';
import { CameraAlt } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { useState } from 'react';
import { setPosition } from '../../../../stores/slices/mapSlice';
import { svgAsPngUri } from 'save-svg-as-png';
import { imgOnLoadPromise } from '../../../../util/imgOnLoadPromise';
import download from 'downloadjs';
import LogoImg from '../../../../assets/img/logo-prod.png';
import { mapLegends } from '../../../../util/mapLegends';
import { DownloadMapViewData } from './DownloadMapViewData';
import { drugAcronymsOpposite, ngonoSusceptibleRule } from '../../../../util/drugs';
import { DownloadMapSS } from './DownloadMapSS'

export const MapActions = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const dispatch = useAppDispatch();
  const organism = useAppSelector(state => state.dashboard.organism);
  const mapView = useAppSelector(state => state.map.mapView);
  const dataset = useAppSelector(state => state.map.dataset);
  const actualTimeInitial = useAppSelector(state => state.dashboard.actualTimeInitial);
  const actualTimeFinal = useAppSelector(state => state.dashboard.actualTimeFinal);
  const globalOverviewLabel = useAppSelector(state => state.dashboard.globalOverviewLabel);
  const prevalenceMapViewOptionsSelected = useAppSelector(state => state.graph.prevalenceMapViewOptionsSelected);
  const customDropdownMapViewNG = useAppSelector(state => state.graph.customDropdownMapViewNG);
  const actualGenomes = useAppSelector(state => state.dashboard.actualGenomes);
  const actualCountry = useAppSelector(state => state.dashboard.actualCountry);
  const selectedLineages = useAppSelector(state => state.dashboard.selectedLineages);

    async function handleClick(event) { // Function to handle the click event for downloading the map as PNG
      await DownloadMapSS({
        event,
        setLoading,
        setShowAlert,
        dispatch,
        organism,
        mapView,
        dataset,
        actualTimeInitial,
        actualTimeFinal,
        globalOverviewLabel,
        prevalenceMapViewOptionsSelected,
        customDropdownMapViewNG,
        actualGenomes,
        actualCountry,
        selectedLineages,
      });
    }
  
  function handleCloseAlert() {
    setShowAlert(false);
  }

  return (
    <div className={classes.mapActions}>
      <Tooltip title="Download Data" placement="top" onClick={e => e.stopPropagation()}>
        <IconButton color="primary" disabled={organism === 'none' || loading}>
          <DownloadMapViewData fontSize="inherit" value="map" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Download Map as PNG" placement="top">
        <IconButton color="primary" onClick={handleClick} disabled={organism === 'none' || loading}>
          {loading ? <CircularProgress color="primary" size={25} /> : <CameraAlt fontSize="inherit" />}
        </IconButton>
      </Tooltip>
      <Snackbar open={showAlert} autoHideDuration={5000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
          Something went wrong with the download, please try again later.
        </Alert>
      </Snackbar>
    </div>
  );
};
