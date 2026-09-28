import { Clear, InfoOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  IconButton,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Cell,
  Tooltip as ChartTooltip,
  LabelList,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import { useAppSelector } from '../../../../stores/hooks';
import { darkGrey, hoverColor } from '../../../../util/colorHelper';
import { drugsSP } from '../../../../util/drugs';
import { longestVisualWidth, truncateWord } from '../../../../util/helpers';
import { isTouchDevice } from '../../../../util/isTouchDevice';
import { heatmapLegendGradient, heatmapTextColor, mixColorScale } from '../../Map/mapColorHelper';
import { SelectCountry } from '../../SelectCountry';
import { PlottingOptionsHeader } from '../../Shared/PlottingOptionsHeader';
import { PlottingOptionsPanel } from '../../Shared/PlottingOptionsPanel';
import { useStyles } from './SerotypeResistanceGraphMUI';

// Top axis area reserved for the rotated -45deg serotype column labels on the
// first chart. Allocated via XAxis height so the cell row stays at the bottom
// of the first chart, immediately adjacent to the next drug row below it.
const FIRST_ROW_AXIS_HEIGHT = 90;

// Fixed serotype column order, by vaccine coverage (Kat's spec). Any serotype
// not in this list is bucketed into 'Other', which is always rendered last.
const SEROTYPE_ORDER = [
  '4',
  '6B',
  '9V',
  '14',
  '18C',
  '19F',
  '23F',
  '1',
  '5',
  '7F',
  '3',
  '6A',
  '19A',
  '22F',
  '33F',
  '8',
  '10A',
  '11A',
  '12F',
  '15B',
];
const OTHER_LABEL = 'Other';

/** Strip leading zeros from a serotype's numeric prefix: "06B"→"6B", "09V"→"9V", "03"→"3". */
function normalizeSerotype(st) {
  if (st === null || st === undefined) return '';
  return st.toString().trim().replace(/^0+(\d)/, '$1');
}

export const SerotypeResistanceGraph = ({ showFilter, setShowFilter, filterButtonRef }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [drugsSelected, setDrugsSelected] = useState([]);
  const [drugSearch, setDrugSearch] = useState('');

  const organism = useAppSelector(state => state.dashboard.organism);
  const canGetData = useAppSelector(state => state.dashboard.canGetData);
  const rawDataAll = useAppSelector(state => state.graph.rawOrganismData);
  const actualCountry = useAppSelector(state => state.dashboard.actualCountry);
  const actualRegion = useAppSelector(state => state.dashboard.actualRegion);
  const economicRegions = useAppSelector(state => state.dashboard.economicRegions);
  const loadingPDF = useAppSelector(state => state.dashboard.loadingPDF);

  // Filter rawData by the country / region chosen in the floating plotting-options
  // panel. SelectCountry writes actualCountry / actualRegion into Redux.
  const rawData = useMemo(() => {
    if (!Array.isArray(rawDataAll) || rawDataAll.length === 0) return [];
    if (actualCountry && actualCountry !== 'All') {
      return rawDataAll.filter(item => item.COUNTRY_ONLY === actualCountry);
    }
    if (actualRegion && actualRegion !== 'All') {
      const regionCountries = economicRegions?.[actualRegion] ?? [];
      const inRegion = new Set(regionCountries);
      return rawDataAll.filter(item => inRegion.has(item.COUNTRY_ONLY));
    }
    return rawDataAll;
  }, [rawDataAll, actualCountry, actualRegion, economicRegions]);

  // Available drug rows for S. pneumoniae (Pansusceptible is not a resistance row).
  const drugOptions = useMemo(() => drugsSP.filter(d => d !== 'Pansusceptible'), []);

  const filteredDrugOptions = useMemo(() => {
    return drugOptions.filter(option => option.toLowerCase().includes(drugSearch.toLowerCase()));
  }, [drugOptions, drugSearch]);

  // Default to showing every drug as a row.
  useEffect(() => {
    setDrugsSelected(drugOptions);
  }, [drugOptions]);

  // Build the serotype × drug matrix from the raw genome data.
  // Columns = serotypes present, ordered by SEROTYPE_ORDER, with 'Other' last.
  const { columns, columnTotals, resistanceByColumn } = useMemo(() => {
    if (rawData.length === 0 || organism !== 'strepneumo') {
      return { columns: [], columnTotals: {}, resistanceByColumn: {} };
    }

    const totals = {};
    const resistant = {};

    const bump = (col, item) => {
      totals[col] = (totals[col] || 0) + 1;
      if (!resistant[col]) resistant[col] = {};
      drugOptions.forEach(drug => {
        if (item[drug] === '1' || item[drug] === 1) {
          resistant[col][drug] = (resistant[col][drug] || 0) + 1;
        }
      });
    };

    const orderSet = new Set(SEROTYPE_ORDER);
    rawData.forEach(item => {
      const st = normalizeSerotype(item.Serotype);
      const col = orderSet.has(st) ? st : OTHER_LABEL;
      bump(col, item);
    });

    // Keep the fixed order, dropping serotypes with no genomes, then append
    // 'Other' when there are any off-list genomes.
    const presentColumns = SEROTYPE_ORDER.filter(st => totals[st] > 0);
    if (totals[OTHER_LABEL] > 0) presentColumns.push(OTHER_LABEL);

    return { columns: presentColumns, columnTotals: totals, resistanceByColumn: resistant };
  }, [rawData, organism, drugOptions]);

  // One row per selected drug; within a row, one square per serotype column.
  const chartRows = useMemo(() => {
    if (columns.length === 0 || drugsSelected.length === 0) return [];

    return drugsSelected.map(drug => ({
      name: drug,
      items: columns.map(col => {
        const total = columnTotals[col] || 0;
        const count = resistanceByColumn[col]?.[drug] || 0;
        const percentage = total ? Number(((count / total) * 100).toFixed(2)) : 0;
        return {
          itemName: col,
          typeName: drug,
          count,
          total,
          percentage,
          index: 1,
        };
      }),
    }));
  }, [columns, drugsSelected, columnTotals, resistanceByColumn]);

  const yAxisWidth = useMemo(() => longestVisualWidth(drugsSelected ?? []), [drugsSelected]);

  function handleChangeDrugsSelected({ event = null, all = false }) {
    const value = event?.target.value;

    if (value?.length === 1 && value[0] === undefined) return;

    if (!all) {
      setDrugsSelected(value);
      return;
    }

    if (drugsSelected.length === filteredDrugOptions.length) {
      setDrugsSelected([]);
      return;
    }
    setDrugsSelected(filteredDrugOptions);
  }

  function handleChangeDrugSearch(event) {
    event.stopPropagation();
    setDrugSearch(event.target.value);
  }

  function clearDrugSearch(event) {
    event.stopPropagation();
    setDrugSearch('');
  }

  if (!canGetData || organism !== 'strepneumo') return null;

  return (
    <CardContent className={classes.serotypeResistanceGraph}>
      <div className={classes.graphWrapper}>
        <div className={classes.graph} style={loadingPDF ? { overflow: 'visible' } : undefined} id="VAC">
          {chartRows.map((row, index) => (
            <ResponsiveContainer
              key={`serotype-heatmap-${index}`}
              width={yAxisWidth + 65 * columns.length}
              height={index === 0 ? 65 + FIRST_ROW_AXIS_HEIGHT : 65}
            >
              <ScatterChart cursor={isTouchDevice() ? 'default' : 'pointer'} margin={{ top: 0, bottom: 0 }}>
                <XAxis
                  type="category"
                  dataKey="itemName"
                  interval={0}
                  height={index === 0 ? FIRST_ROW_AXIS_HEIGHT : 0}
                  tick={
                    index === 0
                      ? props => {
                          const title = props.payload.value;
                          return (
                            <Tooltip title={title} placement="top">
                              <text
                                x={props.x}
                                y={props.y}
                                fontSize="14px"
                                dy={-10}
                                textAnchor="start"
                                transform={`rotate(-45, ${props.x}, ${props.y})`}
                                fill="rgb(128,128,128)"
                              >
                                {truncateWord(title)}
                              </text>
                            </Tooltip>
                          );
                        }
                      : false
                  }
                  axisLine={false}
                  orientation="top"
                />

                <YAxis
                  type="number"
                  dataKey="index"
                  name={row.name.toLowerCase()}
                  tick={false}
                  tickLine={false}
                  axisLine={false}
                  domain={[1, 1]}
                  label={{ value: row.name, position: 'insideRight' }}
                  width={yAxisWidth}
                />

                <ZAxis type="number" dataKey="percentage" range={[3500, 3500]} />

                <ChartTooltip
                  cursor={{ fill: hoverColor }}
                  wrapperStyle={{ zIndex: 100 }}
                  offset={40}
                  content={({ payload, active }) => {
                    if (payload !== null && active && payload.length) {
                      const point = payload[0]?.payload;
                      const serotypeLabel = point.itemName === OTHER_LABEL ? OTHER_LABEL : `Serotype ${point.itemName}`;
                      return (
                        <div
                          className={classes.chartTooltipLabel}
                          style={{ marginTop: index + 1 === chartRows.length ? -40 : 0 }}
                        >
                          <Typography variant="body1" fontWeight="500">
                            {serotypeLabel}
                          </Typography>
                          <Typography variant="caption" fontWeight="500">
                            Total: {point.total}
                          </Typography>
                          <Typography variant="body2">
                            {`${point.typeName}: ${point.count} (${point.percentage}%)`}
                          </Typography>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Scatter data={row.items} shape="square">
                  {row.items.map((option, cellIndex) => (
                    <Cell
                      key={`serotype-cell-${cellIndex}`}
                      fill={option.percentage === 0 ? darkGrey : mixColorScale(option.percentage)}
                    />
                  ))}
                  <LabelList
                    dataKey="percentage"
                    fontSize={12}
                    content={({ x, y, value }) => {
                      return (
                        <text
                          x={x + 33}
                          y={y + 38}
                          textAnchor="middle"
                          fontSize={15}
                          fontWeight={600}
                          fill={heatmapTextColor(value)}
                          pointerEvents="none"
                        >
                          {value}
                        </text>
                      );
                    }}
                  />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          ))}
        </div>
      </div>

      {(columns.length === 0 || drugsSelected.length === 0) && (
        <Box className={classes.nothingSelected}>
          <Typography fontWeight={600}>{t('common.noDataToShow')}</Typography>
        </Box>
      )}

      <Divider className={classes.divider} />
      <div className={classes.bottomLegend}>
        <div className={classes.legend}>
          <Typography fontSize="0.75rem">0%</Typography>
          <Box className={classes.singleBox} sx={{ backgroundColor: darkGrey }} />
        </div>
        <div className={classes.legend}>
          <Typography fontSize="0.75rem">1%</Typography>
          <Box className={classes.gradientBox} style={{ backgroundImage: heatmapLegendGradient() }} />
          <Typography fontSize="0.75rem">100%</Typography>
        </div>
      </div>

      <PlottingOptionsPanel show={showFilter} className={classes.floatingFilter} anchorRef={filterButtonRef}>
          <Card elevation={3}>
            <CardContent>
              <PlottingOptionsHeader
                onClose={() => setShowFilter && setShowFilter(false)}
                className={classes.titleWrapper}
              />
              <div className={classes.selectsWrapper}>
                <SelectCountry />
                <div className={classes.selectPreWrapper}>
                  <div className={classes.selectWrapper}>
                    <div className={classes.labelWrapper}>
                      <Typography variant="caption">{t('common.selectDrug')}</Typography>
                      <Tooltip title="Serotype columns are fixed and ordered by vaccine coverage." placement="top">
                        <InfoOutlined color="action" fontSize="small" className={classes.labelTooltipIcon} />
                      </Tooltip>
                    </div>
                    <Select
                      multiple
                      value={drugsSelected}
                      onChange={event => handleChangeDrugsSelected({ event })}
                      displayEmpty
                      disabled={organism === 'none'}
                      endAdornment={
                        <Button
                          variant="outlined"
                          className={classes.selectButton}
                          onClick={() => handleChangeDrugsSelected({ all: true })}
                          disabled={organism === 'none'}
                          color={drugsSelected.length === filteredDrugOptions.length ? 'error' : 'primary'}
                        >
                          {drugsSelected.length === filteredDrugOptions.length
                            ? t('common.clearAll')
                            : t('common.selectAll')}
                        </Button>
                      }
                      inputProps={{ className: classes.multipleSelectInput }}
                      MenuProps={{
                        disableAutoFocusItem: true,
                        classes: { paper: classes.menuPaper, list: classes.selectMenu },
                      }}
                      renderValue={selected => <div>{`${selected?.length} of ${drugOptions.length} selected`}</div>}
                      onClose={clearDrugSearch}
                    >
                      <Box
                        className={classes.selectSearch}
                        onClick={e => e.stopPropagation()}
                        onKeyDown={e => e.stopPropagation()}
                      >
                        <TextField
                          variant="standard"
                          placeholder={'Search for more...'}
                          fullWidth
                          value={drugSearch}
                          onChange={handleChangeDrugSearch}
                          InputProps={
                            drugSearch === ''
                              ? undefined
                              : {
                                  endAdornment: (
                                    <IconButton size="small" onClick={clearDrugSearch}>
                                      <Clear />
                                    </IconButton>
                                  ),
                                }
                          }
                        />
                      </Box>
                      {filteredDrugOptions.map((option, index) => (
                        <MenuItem key={`serotype-drug-option-${index}`} value={option}>
                          <Checkbox checked={drugsSelected.indexOf(option) > -1} />
                          <ListItemText primary={option} />
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </PlottingOptionsPanel>
    </CardContent>
  );
};
