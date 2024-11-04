import React, { useEffect, useState } from 'react';
import { cloneDeep } from 'lodash';
import {
	Box,
	Button,
	Paper,
	Typography,
	Divider,
	ToggleButtonGroup,
	ToggleButton,
	Slider,
	Modal,
	TextField,
	Accordion,
	AccordionSummary,
	AccordionDetails,
} from '@mui/material';
import './styles.css';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DatePicker } from '@mui/x-date-pickers';
import PropTypes from 'prop-types';
import { style } from '#/components/styledComponents.jsx';
import { mapShipNames, fetchGraphData, SHIP_NAMES_MAPPING } from '#/pages/Cruise/cruiseUtils.js';
import { fetchFilterData } from '../cruiseUtils.js';
import CustomLineWrapper from '../components/CustomLineWrapper.jsx';

const FILTERING_OPTIONS_NAME_MAPPING = {
	cruise: 'Cruise',
	ship: 'Ship',
	startDate: 'Earliest Cruise Start Date',
	endDate: 'Latest Cruise End Date',
	destinations: 'Destinations',
};

const DEFAULT_FILTERS = {
	groupCalculationFocus: 'lowest',
	groupBy: 'weekday',
	ships: ['ShipLogo_DisneyMagic'],
	focusOption: 'cheapestPrice',
};

const minDistance = 500;

// todo: when clicking on a line in the graph, allow to focus, or hide line
// Also add a button to show all lines again

const DynamicViewingGraph = () => {
	const [loading, setLoading] = useState(true);
	const [pulledCruises, setPulledCruises] = useState([]);
	const [series, setSeries] = useState([]);
	const [xLabels, setXLabels] = useState([]);
	const [sliderValues, setSliderValues] = useState([5000, 50000]);
	const [modalViewItem, setModalViewItem] = useState(null);
	const [availableFilters, setAvailableFilters] = useState({
		version: 1,
		filters: {
			startDate: null,
			endDate: null,
		},
		nameMappings: {
			startDate: 'Start Date',
			endDate: 'End Date',
		},
		groupings: {},
	});
	const [filters, setFilters] = useState(DEFAULT_FILTERS);
	const [visibleFilters, setVisibleFilters] = useState({});

	const fetchData = async (override) => {
		if (loading && !override) return;
		setLoading(true);
		let cleanedFilters = cloneDeep(filters);
		console.log('BBBB cleanedFilters BEFORE: ', cleanedFilters);
		Object.keys(cleanedFilters).forEach((key) => {
			if (cleanedFilters[key]?.length === 0 || !cleanedFilters[key]) {
				delete cleanedFilters[key];
			}
			if (Array.isArray(cleanedFilters[key])) {
				cleanedFilters[key] = cleanedFilters[key].join('|||');
			}
		});
		console.log('BBBB cleanedFilters AFTER: ', cleanedFilters);
		try {
			if (!availableFilters.groupings.xAxis) {
				// fetch filters from API
				fetchFilterData().then((response) => {
					setAvailableFilters(response);
				});
			}
			const response = await fetchGraphData(cleanedFilters);
			// If response is empty object, bail
			if (Object.keys(response).length === 0) {
				setLoading(false);
				return;
			}
			setPulledCruises(response.data);
			setSeries(response.graphData?.series);
			setXLabels(response.graphData?.xlabels);
			setVisibleFilters(response.filterOptions);
			setSliderValues([response.graphData?.min - 1000, response.graphData?.max + 1000]);
		} catch (error) {
			console.error('Error getting entries:', error);
		}
		setLoading(false);
	};

	useEffect(() => {
		// load previous filters from local storage if there
		const storedFilters = localStorage.getItem('cruiseFilters');
		if (storedFilters) {
			const newFilters = JSON.parse(storedFilters);
			if (newFilters.version !== 1) {
				fetchData(true);
				return;
			}
			delete newFilters.startDate;
			delete newFilters.endDate;
			setLoading(false);
			setFilters(newFilters);
		} else {
			fetchData(true);
		}
	}, []);

	useEffect(() => {
		if (!loading) localStorage.setItem('cruiseFilters', JSON.stringify(filters));
		fetchData();
	}, [filters]);

	//region Graph Slider section
	const handleSliderChange = (event, newValue, activeThumb) => {
		if (!Array.isArray(newValue)) {
			return;
		}

		if (newValue[1] - newValue[0] < minDistance) {
			if (activeThumb === 0) {
				const clamped = Math.min(newValue[0], 100 - minDistance);
				setSliderValues([clamped, clamped + minDistance]);
			} else {
				const clamped = Math.max(newValue[1], minDistance);
				setSliderValues([clamped - minDistance, clamped]);
			}
		} else {
			setSliderValues(newValue);
		}
	};

	const handleMinValueChange = (event) => {
		const value = parseInt(event.target.value, 10);
		setSliderValues([value, sliderValues[1]]);
	};

	const handleMaxValueChange = (event) => {
		const value = parseInt(event.target.value, 10);
		setSliderValues([sliderValues[0], value]);
	};

	const handleMarkClick = (event, clickData) => {
		switch (filters.groupBy) {
			case 'collectionDate':
				(() => {
					const label = xLabels[clickData.dataIndex];
					const actualCruise = pulledCruises.find((a) => a.id === clickData.seriesId);
					const viewedDate = actualCruise.priceHistory.find(
						(entry) => entry.dateCollected === label,
					);
					setModalViewItem(viewedDate);
				})();
				break;
		}
	};

	//endregion

	const handleBoolToggleChange = (property) => () => {
		setFilters({
			...filters,
			[property]: filters[property] && filters[property].includes('true') ? [] : ['true'],
		});
	};

	const handleArrayChange = (property, unique) => (event) => {
		const newFocusOption = event.target.value;
		if (unique) {
			setFilters({
				...filters,
				[property]: [newFocusOption],
			});
			return;
		}
		const newFilters = { ...filters };
		if (!newFilters[property]) {
			newFilters[property] = [newFocusOption];
		} else if (newFilters[property]?.includes(newFocusOption)) {
			newFilters[property] = newFilters[property].filter((a) => a !== newFocusOption);
		} else {
			newFilters[property] = [...newFilters[property], newFocusOption];
		}
		setFilters(newFilters);
	};

	const renderFilteringOptionGroup = ({
		options = [],
		selected = [],
		available,
		property,
		onClick,
	}) => {
		const Title = (
			<Typography sx={{ mt: 3 }}>{availableFilters.nameMappings[property] || property}.</Typography>
		);
		const paperProperties = {
			key: `${property}_options`,
			sx: { p: 1, m: 2 },
			elevation: 3,
		};
		const ClearButton = (
			<Button
				key={`${property}_clear`}
				sx={{ m: 0.5 }}
				variant={selected.length ? 'contained' : 'outlined'}
				color="secondary"
				onClick={() => setFilters({ ...filters, [property]: [] })}
			>
				Clear
			</Button>
		);
		if (typeof options === 'boolean') {
			return (
				<Paper {...paperProperties}>
					{Title}
					<ToggleButtonGroup
						value={selected.length ? selected : ['false']}
						onChange={handleBoolToggleChange(property)}
						aria-label={property}
						color="secondary"
					>
						<ToggleButton value={'false'}>Disabled</ToggleButton>
						<ToggleButton value={'true'}>Enabled</ToggleButton>
					</ToggleButtonGroup>
				</Paper>
			);
		}
		if (!Array.isArray(options) && typeof options !== 'object') {
			return;
		}
		if (!Array.isArray(selected)) {
			selected = [selected];
		}

		if (property.includes('Date')) {
			return (
				<Paper {...paperProperties}>
					{Title}
					<DatePicker
						color="secondary"
						label={FILTERING_OPTIONS_NAME_MAPPING[property]}
						value={selected[0]}
						onChange={(date) => setFilters({ ...filters, [property]: [date] })}
					/>
					<Divider />
					{ClearButton}
				</Paper>
			);
		} else if (!options || options?.length === 0) {
			return `Empty property ${property}`;
		}
		let mapping = {};
		if (!Array.isArray(options) && typeof options === 'object') {
			mapping = options;
			options = Object.keys(options);
		}

		return (
			<Paper {...paperProperties}>
				{Title}
				{options.map((option) => (
					<Button
						key={`${property}_${option}`}
						sx={{ m: 0.5 }}
						variant={selected.includes(option) ? 'contained' : 'outlined'}
						color="secondary"
						className={Array.isArray(available) && !available.includes(option) ? 'ghosted' : ''}
						onClick={onClick}
						value={option}
					>
						{mapping[option] || SHIP_NAMES_MAPPING[option] || option}
					</Button>
				))}
				<Divider />
				{ClearButton}
			</Paper>
		);
	};

	return (
		<Box>
			<Modal
				open={modalViewItem !== null}
				onClose={() => setModalViewItem(null)}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Paper sx={{ ...style, width: 800 }}>
					<Typography variant="h4" component="h2">
						{modalViewItem?.name}
					</Typography>
					<Typography variant="h6" component="h1">
						<b> Name:</b> {mapShipNames(modalViewItem?.shipName)}
					</Typography>
					<Typography variant="h6" component="h4">
						<b>Departure:</b> {new Date(modalViewItem?.startDate).toLocaleString()}
					</Typography>
					<Typography variant="h6" component="h4">
						<b>Destinations:</b> {modalViewItem?.destinations}
					</Typography>
					<Typography variant="h6" component="h4">
						<b>Prices:</b>
						<ul>
							<li>Interior: {modalViewItem?.interiorPrice || 'unavailable'}</li>
							<li>Ocean View: {modalViewItem?.oceanViewPrice || 'unavailable'}</li>
							<li>Verandah: {modalViewItem?.verandahPrice || 'unavailable'}</li>
							<li>Concierge: {modalViewItem?.conciergePrice || 'unavailable'}</li>
						</ul>
					</Typography>
					<Typography variant="h7" component="h5">
						<b> Collected on:</b> {new Date(modalViewItem?.dateCollected).toLocaleString()}
					</Typography>
				</Paper>
			</Modal>
			<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel1-content"
					id="panel1-header"
				>
					Filters
				</AccordionSummary>
				<AccordionDetails>
					<Accordion>
						<AccordionSummary expandIcon={<ExpandMoreIcon />}>Filter the Data</AccordionSummary>
						<AccordionDetails>
							{Object.keys(availableFilters?.filters).map((key) => {
								const options = availableFilters?.filters[key];
								return renderFilteringOptionGroup({
									options,
									selected: filters[key],
									property: key,
									available: visibleFilters[key],
									onClick: handleArrayChange(key),
								});
							})}
						</AccordionDetails>
					</Accordion>
					<Accordion>
						<AccordionSummary expandIcon={<ExpandMoreIcon />}>X Axis Groupings</AccordionSummary>
						<AccordionDetails>
							{availableFilters?.groupings?.xAxis &&
								renderFilteringOptionGroup({
									options: availableFilters?.groupings?.xAxis,
									selected: filters.groupBy,
									property: 'groupBy',
									onClick: handleArrayChange('groupBy', true),
								})}
						</AccordionDetails>
					</Accordion>
					<Accordion>
						<AccordionSummary expandIcon={<ExpandMoreIcon />}>
							Line Groupings (Not Working)
						</AccordionSummary>
						<AccordionDetails>
							{Object.keys(availableFilters?.groupings?.lines || {}).map((key) => {
								const options = availableFilters?.groupings?.lines[key];
								return renderFilteringOptionGroup({
									options,
									selected: filters[key],
									property: key,
									available: visibleFilters[key],
									onClick: handleArrayChange(key),
								});
							})}
						</AccordionDetails>
					</Accordion>
					<Accordion>
						<AccordionSummary expandIcon={<ExpandMoreIcon />}>
							Calculating grouped point values
						</AccordionSummary>
						<AccordionDetails>
							{Object.keys(availableFilters?.groupings?.perPoint || {}).map((key) => {
								const options = availableFilters?.groupings?.perPoint[key];
								return renderFilteringOptionGroup({
									options,
									selected: filters[key],
									property: key,
									available: visibleFilters[key],
									onClick: handleArrayChange(key, true),
								});
							})}
						</AccordionDetails>
					</Accordion>
				</AccordionDetails>
			</Accordion>
			<Divider />
			<Paper variant="outlined" sx={{ p: 3 }}>
				<Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
					<TextField
						label="Min Value"
						type="number"
						value={sliderValues[0]}
						onChange={handleMinValueChange}
						variant="outlined"
						size="small"
					/>
					<TextField
						label="Max Value"
						type="number"
						value={sliderValues[1]}
						onChange={handleMaxValueChange}
						variant="outlined"
						size="small"
					/>
				</Box>
				<Slider
					value={sliderValues}
					onChange={handleSliderChange}
					valueLabelDisplay="auto"
					min={3000}
					max={90000}
				/>
				<CustomLineWrapper
					xLabels={xLabels}
					sliderValues={sliderValues}
					handleMarkClick={handleMarkClick}
					series={series}
				/>
			</Paper>
		</Box>
	);
};

DynamicViewingGraph.propTypes = {
	data: PropTypes.array,
	pulledDays: PropTypes.array,
	pulledEvents: PropTypes.array,
	pulledCruises: PropTypes.array,
};

export default DynamicViewingGraph;
