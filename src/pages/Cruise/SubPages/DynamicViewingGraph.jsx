import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import {
	Box,
	Button,
	Paper,
	Typography,
	Stack,
	Divider,
	ToggleButtonGroup,
	ToggleButton,
	Slider,
	Modal,
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { DatePicker } from '@mui/x-date-pickers';
import PropTypes from 'prop-types';
import { style } from '#/components/styledComponents.jsx';
import {
	mapShipNames,
	fetchCruiseData,
	groupData,
	SHIP_NAMES_MAPPING,
} from '#/pages/Cruise/cruiseUtils.js';

const GROUP_BY_OPTIONS = [/*'days', 'events',*/ 'cruise'];
const GROUP_OPTIONS_NAME_MAPPING = {
	days: 'Days',
	events: 'Time Pulled',
	cruise: 'Cruise',
};

const X_AXIS_OPTIONS = ['collectionDate', 'weekday', 'monthday', 'month'];
const X_AXIS_OPTIONS_VARIATIONS = ['lowest', 'average'];

const FILTERING_OPTIONS = ['cruise', 'ship', 'startDate', 'endDate', 'collectionDate'];
const FILTERING_OPTIONS_NAME_MAPPING = {
	cruise: 'Cruise',
	ship: 'Ship',
	startDate: 'Start Date',
	endDate: 'End Date',
	collectionDate: 'Collection Date',
};

const FOCUS_OPTIONS = [
	'cheapestPrice',
	'interiorPrice',
	'oceanViewPrice',
	'verandahPrice',
	'conciergePrice',
];
const FOCUS_OPTIONS_NAME_MAPPING = {
	cheapestPrice: 'Cheapest Price',
	interiorPrice: 'Interior Price',
	oceanViewPrice: 'Ocean View Price',
	verandahPrice: 'Verandah Price',
	conciergePrice: 'Concierge Price',
};

const minDistance = 500;

/*
// TO  DO Ideas:
X axis options
(Can be by Lowest, or by average)
- Show by day of week price changes
- Show by day of month
- Show by month

Filter down Ideas
- Specific Cruise
- Specific Ship
- Specific Destination (or group of destinations)

// TO  DO:
Get the onMarkClick to open that point's data in a modal.

 */

const DynamicViewingGraph = () => {
	const [loading, setLoading] = useState(false);
	const [pulledCruises, setPulledCruises] = useState([]);
	const [grouping, setGrouping] = useState('cruise');
	const [focusOption, setFocusOption] = useState('cheapestPrice');
	const [xAxisOption, setXAxisOption] = useState('collectionDate');
	const [xAxisOptionVariation, setXAxisOptionVariation] = useState('lowest');
	const [series, setSeries] = useState([]);
	const [xLabels, setXLabels] = useState([]);
	const [sliderValues, setSliderValues] = useState([5000, 50000]);
	const [modalViewItem, setModalViewItem] = useState(null);
	const [filters, setFilters] = useState({ flat: true });
	const [cruiseNames, setCruiseNames] = useState([]);

	const fetchData = async () => {
		if (loading) return;
		setLoading(true);
		let cleanedFilters = _.cloneDeep(filters);
		Object.keys(cleanedFilters).forEach((key) => {
			if (cleanedFilters[key]?.length === 0 || !cleanedFilters[key]) {
				delete cleanedFilters[key];
			}
			if (Array.isArray(cleanedFilters[key])) {
				cleanedFilters[key] = cleanedFilters[key].join('|||');
			}
		});
		const data = await fetchCruiseData(cleanedFilters);
		const { cruises } = groupData(data);
		setPulledCruises(cruises);
		setLoading(false);
	};

	useEffect(() => {
		fetchData();
	}, []);

	useEffect(() => {
		fetchData();
	}, [filters]);

	useEffect(() => {
		const labels = [];
		const series = [];
		const newCruiseNames = new Set();

		pulledCruises.forEach((cruise, index) => {
			const currentSeries = {
				data: [],
				label: cruise.cruiseName,
				id: index,
				connectNulls: true,
			};
			newCruiseNames.add(cruise.name);
			cruise.priceHistory.forEach((entry) => {
				const dataPoint = parseInt(entry[focusOption]);
				const label = entry.dateCollected;
				const labelIndex = labels.findIndex((label) => label === entry.dateCollected);
				if (labelIndex === -1) {
					labels.push(label);
					currentSeries.data.push(dataPoint);
					return;
				}
				while (labelIndex > currentSeries.data.length) {
					currentSeries.data.push(null);
				}
				currentSeries.data[labelIndex] = dataPoint;
			});
			series.push(currentSeries);
		});

		setSeries(series);
		setXLabels(labels);
		setCruiseNames([...newCruiseNames]);
	}, [grouping, focusOption, pulledCruises]);

	const handleChange = (setter) => (event, newFocusOption) => {
		if (newFocusOption) {
			setter(newFocusOption);
		}
	};

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

	const handleMarkClick = (event, clickData) => {
		const valueViewed = xLabels[clickData.dataIndex];
		setModalViewItem(
			pulledCruises[clickData.seriesId].priceHistory.find(
				(entry) => entry?.dateCollected === valueViewed,
			),
		);
	};

	const renderFilterOptionOptions = (option) => {
		switch (option) {
			case 'cruise':
				return (
					<Paper key={`${option}_options`} sx={{ p: 1, m: 2 }} elevation={3}>
						{cruiseNames.map((cruise) => (
							<Button
								key={cruise}
								sx={{ m: 0.5 }}
								variant={filters.cruise?.includes(cruise) ? 'contained' : 'outlined'}
								color="secondary"
								onClick={() => {
									setFilters({
										...filters,
										cruise: filters.cruise?.includes(cruise)
											? filters.cruise.filter((item) => item !== cruise)
											: [...(filters.cruise || []), cruise],
									});
								}}
							>
								{cruise}
							</Button>
						))}
					</Paper>
				);
			case 'ship':
				return (
					<Paper key={`${option}_options`} sx={{ p: 1, m: 2 }} elevation={3}>
						{Object.keys(SHIP_NAMES_MAPPING).map((ship) => (
							<Button
								key={ship}
								sx={{ m: 0.5 }}
								variant={filters.ship?.includes(ship) ? 'contained' : 'outlined'}
								color="secondary"
								onClick={() => {
									setFilters({
										...filters,
										ship: filters.ship?.includes(ship)
											? filters.ship.filter((item) => item !== ship)
											: [...(filters.ship || []), ship],
									});
								}}
							>
								{SHIP_NAMES_MAPPING[ship]}
							</Button>
						))}
					</Paper>
				);
			case 'startDate':
			case 'endDate':
			case 'collectionDate':
				return (
					<Paper key={`${option}_options`} sx={{ p: 1, m: 2 }} elevation={3}>
						<DatePicker
							color="secondary"
							label={FILTERING_OPTIONS_NAME_MAPPING[option]}
							value={Array.isArray(filters[option]) ? null : filters[option]}
							onChange={(date) => setFilters({ ...filters, [option]: date })}
						/>
					</Paper>
				);
		}
	};

	const renderFilteringOptions = () => {
		const buildButton = (option) => (
			<Button
				key={option}
				sx={{ m: 1 }}
				variant={filters[option] ? 'contained' : 'outlined'}
				color="primary"
				onClick={() => {
					setFilters({ ...filters, [option]: filters[option] ? undefined : [] });
				}}
			>
				{FILTERING_OPTIONS_NAME_MAPPING[option]}
			</Button>
		);
		let options = [];
		// First render any options that are selected, but sorted according to the array
		Object.keys(filters)
			.sort((a, b) => FILTERING_OPTIONS.indexOf(a) - FILTERING_OPTIONS.indexOf(b))
			.forEach((key) => {
				if (filters[key] && FILTERING_OPTIONS.includes(key)) {
					options.push(buildButton(key));
					options.push(renderFilterOptionOptions(key));
				}
			});
		// Then render the rest
		FILTERING_OPTIONS.forEach((option) => {
			if (!filters[option]) {
				options.push(buildButton(option));
			}
		});
		return options;
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
						<b>Departure:</b> {modalViewItem?.startDate}
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
						<Typography variant="h7" component="h5">
							<b> Collected on:</b> {modalViewItem?.dateCollected}
						</Typography>
					</Typography>
				</Paper>
			</Modal>
			<Paper elevation={3} sx={{ p: 2 }}>
				<Typography d="modal-modal-description" sx={{ mt: 2 }}>
					Select how you want the data to be grouped.
				</Typography>
				{GROUP_BY_OPTIONS.map((option) => (
					<Button
						sx={{ m: 1 }}
						variant={grouping === option ? 'contained' : 'outlined'}
						key={option}
						color="secondary"
						onClick={() => setGrouping(option)}
					>
						{GROUP_OPTIONS_NAME_MAPPING[option]}
					</Button>
				))}
				{grouping ? (
					<Box>
						<Typography>Select which property to view in graph.</Typography>
						<ToggleButtonGroup
							color="primary"
							value={focusOption}
							exclusive
							onChange={handleChange(setFocusOption)}
							aria-label="Platform"
						>
							{FOCUS_OPTIONS.map((option) => (
								<ToggleButton key={option} value={option} aria-label={option}>
									{FOCUS_OPTIONS_NAME_MAPPING[option]}
								</ToggleButton>
							))}
						</ToggleButtonGroup>
					</Box>
				) : null}
				{grouping && focusOption ? (
					<Box>
						<Typography>Select which X axis property to view in graph.</Typography>
						<ToggleButtonGroup
							color="primary"
							value={xAxisOption}
							exclusive
							onChange={handleChange(setXAxisOption)}
							aria-label="Platform"
						>
							{X_AXIS_OPTIONS.map((option) => (
								<ToggleButton key={option} value={option} aria-label={option}>
									{option}
								</ToggleButton>
							))}
						</ToggleButtonGroup>
					</Box>
				) : null}
				{grouping && focusOption && xAxisOption ? (
					<Box>
						<Typography>Select How to calculate properties.</Typography>
						<ToggleButtonGroup
							color="primary"
							value={xAxisOptionVariation}
							exclusive
							onChange={handleChange(setXAxisOptionVariation)}
							aria-label="Platform"
						>
							{X_AXIS_OPTIONS_VARIATIONS.map((option) => (
								<ToggleButton key={option} value={option} aria-label={option}>
									{option}
								</ToggleButton>
							))}
						</ToggleButtonGroup>
					</Box>
				) : null}
				{grouping ? (
					<Box>
						<Typography>Select Filters to apply.</Typography>
						{renderFilteringOptions()}
					</Box>
				) : null}
			</Paper>
			<Divider />
			<Paper variant="outlined" sx={{ p: 3 }}>
				<Slider
					value={sliderValues}
					onChange={handleSliderChange}
					valueLabelDisplay="auto"
					min={3000}
					max={90000}
				/>
				<Stack direction="row" spacing={2}>
					<LineChart
						xAxis={[{ scaleType: 'point', data: xLabels }]}
						yAxis={[{ scaleType: 'linear', min: sliderValues[0], max: sliderValues[1] }]}
						series={series}
						height={400}
						margin={{ top: 10, bottom: 20 }}
						tooltip={{ trigger: 'item' }}
						slotProps={{ legend: { hidden: true } }}
						onMarkClick={handleMarkClick}
						skipAnimation
					/>
				</Stack>
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
