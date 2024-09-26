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
	TextField,
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { DatePicker } from '@mui/x-date-pickers';
import PropTypes from 'prop-types';
import { style } from '#/components/styledComponents.jsx';
import { mapShipNames, fetchGraphData, SHIP_NAMES_MAPPING } from '#/pages/Cruise/cruiseUtils.js';

const GROUP_BY_OPTIONS = ['collectionDate', 'weekday', 'monthday', 'month'];
const GROUP_OPTIONS_NAME_MAPPING = {
	collectionDate: 'Price per Collection Date',
	weekday: 'Price per Weekday Purchased on',
	monthday: 'Price per Monthday Purchased on',
	month: 'Price per Month Purchased on',
};
const X_AXIS_OPTIONS_VARIATIONS = ['lowest', 'average'];

const FILTERING_OPTIONS = ['cruise', 'ship', 'startDate', 'endDate'];
const FILTERING_OPTIONS_NAME_MAPPING = {
	cruise: 'Cruise',
	ship: 'Ship',
	startDate: 'Earliest Cruise Start Date',
	endDate: 'Latest Cruise End Date',
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

class CustomLineWrapper extends React.Component {
	shouldComponentUpdate(nextProps) {
		if (
			!_.isEqual(this.props.xLabels, nextProps.xLabels) ||
			!_.isEqual(this.props.sliderValues, nextProps.sliderValues) ||
			!_.isEqual(this.props.series, nextProps.series)
		) {
			return true;
		}
		return false;
	}
	render() {
		console.log('BBBB ------------------------------');
		return (
			<Stack direction="row" spacing={2}>
				<LineChart
					xAxis={[{ scaleType: 'point', data: this.props.xLabels }]}
					yAxis={[
						{
							scaleType: 'linear',
							min: this.props.sliderValues[0],
							max: this.props.sliderValues[1],
						},
					]}
					series={this.props.series}
					height={400}
					margin={{ top: 10, bottom: 20 }}
					tooltip={{ trigger: 'item' }}
					slotProps={{ legend: { hidden: true } }}
					onMarkClick={this.props.handleMarkClick}
					skipAnimation
				/>
			</Stack>
		);
	}
}

CustomLineWrapper.propTypes = {
	handleMarkClick: PropTypes.func.isRequired,
	xLabels: PropTypes.array.isRequired,
	sliderValues: PropTypes.array.isRequired,
	series: PropTypes.array.isRequired,
};

const DynamicViewingGraph = () => {
	const [loading, setLoading] = useState(false);
	const [pulledCruises, setPulledCruises] = useState([]);
	const [series, setSeries] = useState([]);
	const [xLabels, setXLabels] = useState([]);
	const [sliderValues, setSliderValues] = useState([5000, 50000]);
	const [modalViewItem, setModalViewItem] = useState(null);
	const [filters, setFilters] = useState({
		flat: true,
		groupCalculationFocus: 'lowest',
		groupBy: 'collectionDate',
		focusOption: 'cheapestPrice',
	});
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
		try {
			const response = await fetchGraphData(cleanedFilters);
			setPulledCruises(response.data);
			setSeries(response.graphData?.series);
			setXLabels(response.graphData?.xlabels);
			setCruiseNames(response.filterOptions?.cruiseNames);
			setSliderValues([response.graphData?.min - 1000, response.graphData?.max + 1000]);
		} catch (error) {
			console.error('Error getting entries:', error);
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchData();
	}, []);

	useEffect(() => {
		fetchData();
	}, [filters]);

	const handleChange = (property) => (event, newFocusOption) => {
		if (newFocusOption) {
			setFilters({
				...filters,
				[property]: newFocusOption,
			});
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

	const handleMinValueChange = (event) => {
		const value = parseInt(event.target.value, 10);
		setSliderValues([value, sliderValues[1]]);
	};

	const handleMaxValueChange = (event) => {
		const value = parseInt(event.target.value, 10);
		setSliderValues([sliderValues[0], value]);
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
				<Box>
					<Typography>Select which property to view in graph.</Typography>
					<ToggleButtonGroup
						color="primary"
						value={filters.focusOption}
						exclusive
						onChange={handleChange('focusOption')}
						aria-label="Platform"
					>
						{FOCUS_OPTIONS.map((option) => (
							<ToggleButton key={option} value={option} aria-label={option}>
								{FOCUS_OPTIONS_NAME_MAPPING[option]}
							</ToggleButton>
						))}
					</ToggleButtonGroup>
				</Box>
				<Box>
					<Typography sx={{ mt: 3 }}>Select how you want the data to be grouped.</Typography>
					<ToggleButtonGroup
						color="primary"
						value={filters.groupBy}
						exclusive
						onChange={handleChange('groupBy')}
						aria-label="Platform"
					>
						{GROUP_BY_OPTIONS.map((option) => (
							<ToggleButton key={option} value={option} aria-label={option}>
								{GROUP_OPTIONS_NAME_MAPPING[option]}
							</ToggleButton>
						))}
					</ToggleButtonGroup>
				</Box>
				<Box>
					<Typography sx={{ mt: 3 }}>Select How to calculate properties.</Typography>
					<ToggleButtonGroup
						color="primary"
						value={filters.groupCalculationFocus}
						exclusive
						onChange={handleChange('groupCalculationFocus')}
						aria-label="Platform"
					>
						{X_AXIS_OPTIONS_VARIATIONS.map((option) => (
							<ToggleButton key={option} value={option} aria-label={option}>
								{option}
							</ToggleButton>
						))}
					</ToggleButtonGroup>
				</Box>
				<Box>
					<Typography sx={{ mt: 3 }}>Select Filters to apply.</Typography>
					{renderFilteringOptions()}
				</Box>
			</Paper>
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
