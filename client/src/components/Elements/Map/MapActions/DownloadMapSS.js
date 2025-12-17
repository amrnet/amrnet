import { Alert, cardMediaClasses, CircularProgress, IconButton, Snackbar, Tooltip } from '@mui/material';
import { useStyles } from './MapActionsMUI';
import { CameraAlt } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { useState } from 'react';
import { setPosition } from '../../../../stores/slices/mapSlice';
import { svgAsPngUri } from 'save-svg-as-png';
import { imgOnLoadPromise } from '../../../../util/imgOnLoadPromise';
import download from 'downloadjs';
import LogoImg from '../../../../assets/img/logo-prod.png';
import { DownloadMapViewData } from './DownloadMapViewData';
import { drugAcronymsOpposite, ngonoSusceptibleRule } from '../../../../util/drugs';

  
  export const DownloadMapSS = async ({
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
    mapLegendLabel,
    }) => {
    event.stopPropagation();
    setLoading(true);
    dispatch(setPosition({ coordinates: [0, 0], zoom: 1 }));

  try {
      await svgAsPngUri(document.getElementById('global-overview-map'), {
        // scale: 4,
        backgroundColor: 'white',
        width: 1200,
        left: -200,
      }).then(async uri => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const mapImg = document.createElement('img');
        const mapImgPromise = imgOnLoadPromise(mapImg);
        mapImg.src = uri;
        await mapImgPromise;

        const cWidth = 3600;
        const cHeight = 1800;
        const textHeight = 250;
        const legendHeight = 350;

        const genotypesTextLength = (
          mapView +
          (mapView === 'NG-MAST prevalence'
            ? customDropdownMapViewNG.join(', ')
            : prevalenceMapViewOptionsSelected.join(', '))
        ).length;

        canvas.width = cWidth;
        canvas.height = cHeight + textHeight + legendHeight + genotypesTextLength / 5;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = 'bolder 50px Montserrat';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        // Draw the entire text with the original font style
        if (organism === 'sentericaints') ctx.fillText(`Global Overview of ${mapLegendLabel}`, canvas.width * 0.5, 80);
        else ctx.fillText(`Global Overview of ${mapLegendLabel}`, canvas.width * 0.5, 80);
        // Set the font style for "Salmonella" to italic
        // ctx.font = 'italic bold 50px Montserrat';
        // ctx.fillText(globalOverviewLabel.label0, canvas.width * 0.55, 80);

        // Revert to the original font style for the remaining text
        // ctx.font = 'bolder 50px Montserrat';
        // const labelSplit = globalOverviewLabel.stringLabel.split(' ');

        // if (organism === 'styphi') {
        //   ctx.font = 'italic bold 50px Montserrat';
        //   ctx.fillText(labelSplit[0], canvas.width * 0.55, 80);
        //   ctx.font = 'bolder 50px Montserrat';
        //   ctx.fillText(labelSplit[1], canvas.width * 0.615, 80);
        // } else if (['kpneumo', 'ngono'].includes(organism)) {
        //   ctx.font = 'italic bold 50px Montserrat';
        //   ctx.fillText(labelSplit[0], canvas.width * 0.55, 80);
        //   ctx.fillText(labelSplit[1], canvas.width * 0.64, 80);
        // } else if (organism === 'ecoli') {
        //   ctx.font = 'bolder 50px Montserrat';
        //   ctx.fillText(labelSplit[0], canvas.width * 0.56, 80);
        //   ctx.font = 'italic bold 50px Montserrat';
        //   ctx.fillText(labelSplit[1], canvas.width * 0.62, 80);
        // } else if (organism === 'decoli') {
        //   ctx.font = 'italic bold 50px Montserrat';
        //   ctx.fillText(labelSplit[0], canvas.width * 0.56, 80);
        //   ctx.fillText(labelSplit[1], canvas.width * 0.62, 80);
        //   ctx.font = 'bolder bold 50px Montserrat';
        //   ctx.fillText(labelSplit[2], canvas.width * 0.7, 80);
        // } else if (organism === 'shige') {
        //   ctx.font = 'italic bold 50px Montserrat';
        //   ctx.fillText(labelSplit[0], canvas.width * 0.545, 80);
        //   ctx.font = 'bolder 50px Montserrat';
        //   ctx.fillText(labelSplit[1], canvas.width * 0.585, 80);
        //   ctx.fillText(labelSplit[2], canvas.width * 0.61, 80);
        // } else if (organism === 'sentericaints') {
        //   ctx.font = 'italic bold 50px Montserrat';
        //   ctx.fillText(labelSplit[0], canvas.width * 0.48, 80);
        //   ctx.font = 'bolder bold 50px Montserrat';
        //   ctx.fillText(labelSplit[1], canvas.width * 0.56, 80);
        //   ctx.fillText(labelSplit[2], canvas.width * 0.65, 80);
        // } else {
        //   ctx.font = 'italic bold 50px Montserrat';
        //   ctx.fillText(labelSplit[0], canvas.width * 0.55, 80);
        //   ctx.font = 'bolder 50px Montserrat';
        //   ctx.fillText(labelSplit[1], canvas.width * 0.64, 80);
        // }

        ctx.font = '35px Montserrat';
        ctx.textAlign = 'center';

        const actualMapView = mapLegendLabel;

        // ctx.fillText('Map View: ' + actualMapView, canvas.width / 2, 140);

        ctx.fillText('Time Period: ' + actualTimeInitial + ' to ' + actualTimeFinal, canvas.width / 2, 140);
        ctx.fillText(`Total: ${actualGenomes} genomes`, canvas.width / 2, 190);
        ctx.fillText('Dataset: ' + dataset, canvas.width / 2, 240);
        ctx.fillText(`Country: ${actualCountry}`, canvas.width / 2, 290);
        ctx.fillText(`Organism: ${globalOverviewLabel.stringLabel}`, canvas.width / 2, 340);
        const getAxisLabel = () => {
          switch (organism) {
            case 'decoli':
            case 'shige':
              return `Selected Pathotypes : ${selectedLineages.join(', ')} `; //improve heading with Selected Pathotypes and Organism for Screenshots
            case 'sentericaints':
            case 'kpneumo':
              return `Selected Serotypes : ${selectedLineages.join(', ')}`;
            default:
              return ``;
          }
        };
          ctx.fillText(`${getAxisLabel()} `, canvas.width / 2, 390);

        const prevalenceMapViews = [
          'Genotype prevalence',
          'Lineage prevalence',
          'ST prevalence',
          'Sublineage prevalence',
          'Pathotype prevalence',
          'Serotype prevalence',
          'O prevalence',
          'H prevalence',
        ];
        let y = 440;
        const maxLineLength = 190;

        // Helper to draw wrapped text
        // Improve code for {mapView}: {Prevelance list}
        const drawWrappedText = (label, text) => {
          const fullText = `${label}: ${text}`;
          for (let i = 0; i < fullText.length; i += maxLineLength) {
            const line = fullText.slice(i, i + maxLineLength);
            ctx.fillText(line, canvas.width / 2, y);
            y += 40;
          }
        };

        // Prevalence map views
        if (prevalenceMapViews.includes(mapView)) {
          const genotypesText = prevalenceMapViewOptionsSelected.join(', ');
          drawWrappedText(actualMapView, genotypesText);
        }

        // NG-MAST specific view
        if (mapView === 'NG-MAST prevalence') {
          const genotypesText = customDropdownMapViewNG.join(', ');
          drawWrappedText(actualMapView, genotypesText);
        }

        // Resistance prevalence view
        if (mapView === 'Resistance prevalence') {
        //   const resolvedOptions =
        //     ngonoSusceptibleRule(prevalenceMapViewOptionsSelected, organism) ||
        //     drugAcronymsOpposite[prevalenceMapViewOptionsSelected] ||
        //     prevalenceMapViewOptionsSelected;

        //   const genotypesText = resolvedOptions.join(', ');
        //   drawWrappedText(mapView, genotypesText);
        // } // CHECK
          if (prevalenceMapViewOptionsSelected.length === 1) {
            ctx.fillText(
              `${actualMapView}: ` +
                (ngonoSusceptibleRule(prevalenceMapViewOptionsSelected.join(), organism) ||
                  drugAcronymsOpposite[prevalenceMapViewOptionsSelected.join()] ||
                  prevalenceMapViewOptionsSelected.join()),
              canvas.width / 2,
              440,
            );
          } else if (prevalenceMapViewOptionsSelected.length > 1) {
            const genotypesText = prevalenceMapViewOptionsSelected.join(', ');
            ctx.fillText(`${actualMapView}: ` + genotypesText, canvas.width / 2, 440);
          }
        }
        ctx.drawImage(mapImg, -100, y + 20, canvas.width, cHeight);

        const legendImg = document.createElement('img');
        const legendImgPromise = imgOnLoadPromise(legendImg);
        let legendWidth = 439;

        switch (mapView) {
          case 'Dominant Genotype':
            legendWidth = organism === 'styphi' ? 3085 : 2937;
            legendImg.src = `legends/MapView_DominantGenotype_${organism}.png`;
            break;
          case 'No. Samples':
            legendImg.src = 'legends/MapView_NoSamples.png';
            break;
          case 'Pansusceptible':
            legendImg.src = 'legends/MapView_Sensitive.png';
            break;
          case 'NG-MAST prevalence':
          case 'Genotype prevalence':
          case 'Lineage prevalence':
          case 'ST prevalence':
          case 'Sublineage prevalence':
            legendImg.src = 'legends/MapView_prevalence.png';
            break;
          case 'Resistance prevalence':
          default:
            legendImg.src = 'legends/MapView_Others.png';
            break;
        }
        if (mapView === 'Dominant Genotype') {
          await legendImgPromise;
          ctx.drawImage(
            legendImg,
            canvas.width / 2 - legendWidth / 2,
            canvas.height - legendHeight - 30,
            legendWidth,
            legendHeight,
          );
        } else {
          await legendImgPromise;
          ctx.drawImage(legendImg, canvas.width - canvas.width / 6, 0, legendWidth, legendHeight);
        }

        const amrnetLogo = document.createElement('img');
        const amrnetLogoPromise = imgOnLoadPromise(amrnetLogo);
        amrnetLogo.src = LogoImg;
        await amrnetLogoPromise;
        ctx.drawImage(amrnetLogo, 25, 25);

        const base64 = canvas.toDataURL();
        await download(base64, `AMRnet - Global Overview of ${mapView}_${globalOverviewLabel.stringLabel}.png`);
      });
    } catch (error) {
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  }