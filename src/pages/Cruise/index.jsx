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
import DaysGraph from '#/pages/Cruise/SubPages/DaysGraph.jsx';
import EventsGraph from '#/pages/Cruise/SubPages/EventsGraph.jsx';
import CruiseGraph from '#/pages/Cruise/SubPages/CruiseGraph.jsx';

const DisplayOptions = ['days', 'events', 'cruise', 'graph'];

function Default() {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState([]);
	const [viewing, setViewing] = useState('graph');
	const [pulledDays, setPulledDays] = useState([]);
	const [pulledEvents, setPulledEvents] = useState([]);
	const [cruiseData, setCruiseData] = useState([]);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalCruise, setModalCruise] = useState(null);
	const [todaysTop, setTodaysTop] = useState('');

	// on page load get data from API
	useEffect(() => {
		(async () => {
			if (loading) return;
			setLoading(true);
			const newData = await fetchCruiseData({ flat: true });
			setData(newData);
			setLoading(false);
		})();
	}, []);

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
			case 'days':
				return <DaysGraph pulledDays={pulledDays} flatDataColumns={flatDataColumns} />;
			case 'events':
				return <EventsGraph pulledEvents={pulledEvents} data={data} />;
			case 'cruise':
				return (
					<CruiseGraph cruiseData={cruiseData} showPriceHistoryModal={showPriceHistoryModal} />
				);
			case 'graph':
				return (
					<DynamicViewingGraph
						data={data}
						pulledCruises={cruiseData}
						pulledDays={pulledDays}
						pulledEvents={pulledEvents}
					/>
				);
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
