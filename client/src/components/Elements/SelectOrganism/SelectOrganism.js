import { MenuItem, Select, useMediaQuery } from '@mui/material';
import { useStyles } from './SelectOrganismMUI';
import { setGlobalOverviewLabel } from '../../../stores/slices/dashboardSlice.ts';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { organismsCards } from '../../../util/organismsCards';
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';

// Render the organism's localised scientific name with <i>…</i> for the
// Latin binomial. The translation string (e.g. `<i>Salmonella</i> Typhi`)
// embeds an `<i>` tag that Trans maps to an actual React <i>.
const OrganismName = ({ value }) => (
  <Trans i18nKey={`organisms.${value}.name`} components={{ i: <i /> }} />
);

export const SelectOrganism = () => {
  const classes = useStyles();
  const matches1050 = useMediaQuery('(max-width: 1050px)');
  const matches650 = useMediaQuery('(max-width: 650px)');
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const organism = useAppSelector((state) => state.dashboard.organism);
  const loadingData = useAppSelector((state) => state.dashboard.loadingData);

  const sortedOrganismsCards = useMemo(
    () => organismsCards.slice().sort((a, b) => a.disabled - b.disabled || a.stringLabel.localeCompare(b.stringLabel)),
    [],
  );

  useEffect(() => {
    if (organism !== '') {
      const currentOrganism = sortedOrganismsCards.find((x) => x.value === organism);
      if (currentOrganism) {
        // Document title uses localised abbreviation; stringLabel (English,
        // plain text) is kept for exported PNG filenames/captions where
        // filename portability matters more than localisation.
        document.title = `AMRnet - ${t(`organisms.${currentOrganism.value}.abbr`)}`;
        dispatch(setGlobalOverviewLabel({ label: currentOrganism.label, stringLabel: currentOrganism.stringLabel }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organism, t]);

  // function handleChange(event) {
  //   const value = event.target.value;
  //   dispatch(setOrganism(value));
  // }

  // function handlePreviousAgent() {
  //   const index = activeOrganismsCards.findIndex((org) => org.value === organism);
  //   if (index !== -1) {
  //     const isFirstIndex = index === 0;
  //     const newValue = isFirstIndex
  //       ? activeOrganismsCards[activeOrganismsCards.length - 1].value
  //       : activeOrganismsCards[index - 1].value;
  //     dispatch(setOrganism(newValue));
  //   }
  // }

  // function handleNextAgent() {
  //   const index = activeOrganismsCards.findIndex((org) => org.value === organism);
  //   if (index !== -1) {
  //     const isLastIndex = activeOrganismsCards.length - 1 === index;
  //     const newValue = isLastIndex ? activeOrganismsCards[0].value : activeOrganismsCards[index + 1].value;
  //     dispatch(setOrganism(newValue));
  //   }
  // }

  return (
    <div className={classes.organismSelectWrapper}>
      {/* {!matches650 && (
        <IconButton color="inherit" onClick={handlePreviousAgent} disabled={loadingData}>
          <KeyboardArrowLeft />
        </IconButton>
      )} */}
      <Select
        value={organism}
        disableUnderline
        variant="standard"
        className={classes.organismSelect}
        inputProps={matches650 ? {} : { IconComponent: () => null }}
        disabled={loadingData}
      >
        <MenuItem value="none" disabled>
          {t('selectOrganism.placeholder')}
        </MenuItem>
        {sortedOrganismsCards.map((item, index) => (
          <MenuItem
            key={`organism-${index}`}
            value={item.value}
            disabled={item.disabled}
            component={Link}
            to={`/dashboard?organism=${item.value}`}
            target="_blank"
          >
            {matches1050 ? t(`organisms.${item.value}.abbr`) : <OrganismName value={item.value} />}
          </MenuItem>
        ))}
      </Select>
      {/* {!matches650 && (
        <IconButton color="inherit" onClick={handleNextAgent} disabled={loadingData}>
          <KeyboardArrowRight />
        </IconButton>
      )} */}
    </div>
  );
};
