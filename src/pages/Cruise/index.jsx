import React, { useState, useEffect } from 'react';
import { Paper, Box, Button, CircularProgress } from '@mui/material';
import './Default.css';
import PriceHistoryModal from '#/pages/Cruise/PriceHistoryModal.jsx';
import DynamicViewingGraph from '#/pages/Cruise/SubPages/DynamicViewingGraph.jsx';
import {
	mapShipNames,
	flatDataColumns,
	groupData,
	fetchCruiseData,
	fetchTodaysBest,
} from '#/pages/Cruise/cruiseUtils.js';
import DaysTables from '#/pages/Cruise/SubPages/DaysTables.jsx';
import EventsTables from '#/pages/Cruise/SubPages/EventsTables.jsx';
import EventsGraph from '#/pages/Cruise/SubPages/EventsGraph.jsx';
import CruiseTables from '#/pages/Cruise/SubPages/CruiseTables.jsx';
import LLMQuery from '#/pages/Cruise/SubPages/LLMQuery.jsx';

const DisplayOptions = ['query', 'days', 'events', 'cruise', 'graph', 'eventGraph'];

function Default() {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState([]);
	const [viewing, setViewing] = useState(() => {
		const params = new URLSearchParams(window.location.search);
		const viewParam = params.get('viewing');
		return DisplayOptions.includes(viewParam) ? viewParam : 'query';
	});
	const [pulledDays, setPulledDays] = useState([]);
	const [pulledEvents, setPulledEvents] = useState([]);
	const [cruiseData, setCruiseData] = useState([]);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalCruise, setModalCruise] = useState(null);
	const [todaysTop, setTodaysTop] = useState('');

	const loadGraphData = async () => {
		if (loading || data.length) return;
		setLoading(true);
		const newData = await fetchCruiseData({ flat: true });
		setData(newData);
		setLoading(false);
	};

	// whenever data updates, pull out parsed data
	useEffect(() => {
		const {
			days: newPulledDays,
			events: newPulledEvents,
			cruises: newPulledCruises,
		} = groupData(data);

		setPulledDays(newPulledDays);
		setPulledEvents(newPulledEvents);
		setCruiseData(newPulledCruises);
	}, [data]);

	const showPriceHistoryModal = (cruise) => {
		setModalOpen(true);
		setModalCruise(cruise);
	};

	const getTodaysTop = async () => {
		const response = await fetchTodaysBest();
		console.info(`BBBB Today's Best response: ${response}`);
		setTodaysTop(response);
	};

	const renderViewingGraphs = () => {
		switch (viewing) {
			case 'query':
				return <LLMQuery />;
			case 'days':
				loadGraphData();
				return <DaysTables pulledDays={pulledDays} flatDataColumns={flatDataColumns} />;
			case 'events':
				loadGraphData();
				return <EventsTables pulledEvents={pulledEvents} data={data} />;
			case 'cruise':
				loadGraphData();
				return (
					<CruiseTables cruiseData={cruiseData} showPriceHistoryModal={showPriceHistoryModal} />
				);
			case 'eventGraph':
				return <EventsGraph />;
			case 'graph':
				return <DynamicViewingGraph />;
			default:
				return null;
		}
	};

	return (
		<div>
			<PriceHistoryModal cruise={modalCruise} setModalOpen={setModalOpen} modalOpen={modalOpen} />
			<p>This is for me to view the cruise data in pretty graphs</p>
			<Paper sx={{ p: 1 }}>
				<Button variant="contained" onClick={getTodaysTop}>
					Today&apos;s Best
				</Button>
				{todaysTop?.bestDate && (
					<span>
						<br />
						<p>
							{todaysTop?.message
								.split('\n')
								.map((a, i) => [<span key={i}>{a}</span>, <br key={i + '_'} />])}
						</p>
						<p>Ship: {mapShipNames(todaysTop.bestDate.lowestValue.name)}</p>
						<p>Desitnations: {todaysTop.bestDate.destinations}</p>
						<ul>
							<li>Interior: {todaysTop.bestDate.lowestValue.prices.interior}</li>
							<li>Ocean View: {todaysTop.bestDate.lowestValue.prices.oceanView}</li>
							<li>Verandah: {todaysTop.bestDate.lowestValue.prices.verandah}</li>
							<li>Concierge: {todaysTop.bestDate.lowestValue.prices.concierge}</li>
						</ul>
						<Button
							color="secondary"
							variant="outlined"
							onClick={() => {
								setTodaysTop(null);
							}}
						>
							Close Today&apos;s Best
						</Button>
					</span>
				)}
			</Paper>
			<h1>Cruise</h1>
			<div style={{ paddingBottom: '20px' }}>
				{DisplayOptions.map((option) => (
					<Button
						sx={{ m: 1 }}
						variant="contained"
						key={option}
						disabled={viewing === option}
						onClick={() => setViewing(option)}
					>
						{option}
					</Button>
				))}
			</div>
			{loading ? (
				<Box>
					<CircularProgress />
				</Box>
			) : (
				renderViewingGraphs()
			)}
		</div>
	);
}

export default Default;
