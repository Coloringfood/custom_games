import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import './Default.css';
import PriceHistoryModal from '#/pages/Cruise/PriceHistoryModal.jsx';

const flatDataColumns = [
	{ field: 'name', headerName: 'Name', width: 300 },
	{ field: 'shipName', headerName: 'Ship Name', width: 200 },
	{ field: 'dateCollected', headerName: 'Date Collected', width: 200 },
	{ field: 'startDate', headerName: 'Start Date', width: 200 },
	{ field: 'cheapestPrice', headerName: 'Cheapest Price', width: 100 },
	{ field: 'endDate', headerName: 'End Date', width: 200 },
	{ field: 'interiorPrice', headerName: 'Interior Price', width: 100 },
	{ field: 'oceanViewPrice', headerName: 'Ocean View Price', width: 100 },
	{ field: 'verandahPrice', headerName: 'Verandah Price', width: 100 },
	{ field: 'conciergePrice', headerName: 'Concierge Price', width: 100 },
	{ field: 'destinations', headerName: 'Destinations', width: 400 },
];
const paginationModel = { page: 0, pageSize: 5 };
const sortModel = [{ field: 'cheapestPrice', sort: 'asc' }];
const columnVisibilityModel = {
	endDate: false,
	interiorPrice: false,
	oceanViewPrice: false,
	verandahPrice: false,
	conciergePrice: false,
};
const initialState = {
	pagination: { paginationModel },
	sorting: { sortModel },
	columns: { columnVisibilityModel },
};
const dateStringModifiers = ['en-us', { hour: '2-digit', minute: '2-digit' }];
const DisplayOptions = ['days', 'events', 'cruise'];

function Default() {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState([]);
	const [viewing, setViewing] = useState('cruise');
	const [pulledDays, setPulledDays] = useState([]);
	const [pulledEvents, setPulledEvents] = useState([]);
	const [cruiseData, setCruiseData] = useState([]);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalCruise, setModalCruise] = useState(null);

	// on page load get data from API
	useEffect(() => {
		fetch('http://api.timaeustech.com/cruise?flat=true')
			.then((res) => res.json())
			.then((response) => {
				setData(response.data.entries);
				setLoading(false);
			});
	}, []);

	// whenever data updates, pull out parsed data
	useEffect(() => {
		const days = {};
		const events = [];
		const cruises = {};

		data.forEach((entry, index) => {
			entry.id = index;
			const {
				name,
				shipName,
				dateCollected,
				startDate,
				endDate,
				interiorPrice,
				oceanViewPrice,
				verandahPrice,
				conciergePrice,
				destinations,
			} = entry;
			const day = new Date(dateCollected).toLocaleDateString();
			const cheapestPrice = Math.min(
				interiorPrice || 99999,
				oceanViewPrice || 99999,
				verandahPrice || 99999,
				conciergePrice || 99999,
			);
			const cruiseData = {
				name,
				shipName,
				dateCollected: new Date(dateCollected).toLocaleDateString(...dateStringModifiers),
				startDate: new Date(startDate).toLocaleDateString(...dateStringModifiers),
				cheapestPrice,
				endDate: new Date(endDate).toLocaleDateString(...dateStringModifiers),
				interiorPrice,
				oceanViewPrice,
				verandahPrice,
				conciergePrice,
				destinations,
				id: index,
			};

			// check if this event is already added, if not add it
			const eventIndex = events.findIndex((event) => event.dateCollected === dateCollected);
			if (eventIndex === -1) {
				events.push({
					dateCollected,
					indexes: [index],
				});
			} else {
				events[eventIndex].indexes.push(index);
			}

			// Check if this day is already in the days array
			if (days[day] === undefined) {
				days[day] = {
					day,
					ships: [],
				};
			}
			days[day].ships.push(cruiseData);

			const cruiseName = `${shipName} - ${new Date(startDate).toLocaleDateString()}`;
			if (cruises[cruiseName] === undefined) {
				cruises[cruiseName] = {
					id: cruiseName,
					cruiseName,
					startDate: new Date(startDate).toLocaleDateString(),
					events: 0,
					changes: 0,
					cheapestPrice: 99999,
					priceHistory: [],
				};
			}
			cruises[cruiseName].priceHistory.push(cruiseData);
			cruises[cruiseName].events += 1;
			cruises[cruiseName].cheapestPrice = Math.min(
				cruises[cruiseName].cheapestPrice,
				cheapestPrice,
			);
			cruises[cruiseName].changes = calculatePriceHistoryChanges(cruises[cruiseName].priceHistory);
		});

		const daysArray = Object.keys(days).map((key) => days[key]);
		setPulledDays(daysArray.sort((a, b) => new Date(b.day) - new Date(a.day)));
		setPulledEvents(events.sort((a, b) => new Date(b.dateCollected) - new Date(a.dateCollected)));
		const cruiseArray = Object.keys(cruises).map((key) => cruises[key]);
		setCruiseData(cruiseArray.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)));
	}, [data]);

	const showPriceHistoryModal = (cruise) => {
		setModalOpen(true);
		setModalCruise(cruise);
	};

	const calculatePriceHistoryChanges = (priceHistory) => {
		const values = new Set();
		priceHistory.reduce((acc, cruise) => {
			values.add(cruise.cheapestPrice);
		});
		return values.size;
	};

	const renderViewingGraphs = () => {
		switch (viewing) {
			case 'days':
				return (
					<div>
						{pulledDays.map((day) => (
							<div key={day.day} className="day">
								<h3>Day {day.day}</h3>
								<div>Ships found: {day.ships.length}</div>
								<Paper>
									<DataGrid
										rows={day.ships}
										columns={flatDataColumns}
										initialState={initialState}
										pageSizeOptions={[5, 10, 30, 50, 100]}
										sx={{ border: 0 }}
									/>
								</Paper>
							</div>
						))}
					</div>
				);
			case 'events':
				return (
					<div>
						{pulledEvents.map((event) => {
							const rows = event.indexes.map((index) => data[index] || {});
							console.log('BBBB rows: ', rows);
							return (
								<div key={event.dateCollected} className="event">
									<h3>
										{new Date(event.dateCollected).toLocaleDateString(...dateStringModifiers)}
									</h3>
									<div>Events found: {event.indexes.length}</div>
									<Paper>
										<DataGrid
											columns={flatDataColumns}
											rows={rows}
											initialState={initialState}
											pageSizeOptions={[5, 10, 30, 50, 100]}
											sx={{ border: 0 }}
										/>
									</Paper>
								</div>
							);
						})}
					</div>
				);
			case 'cruise':
				return (
					<Paper>
						<DataGrid
							columns={[
								{
									field: 'cruiseName',
									headerName: 'Cruise Ship',
									width: 300,
									valueFormatter: (value) => value.split(' - ')[0],
								},
								{
									field: 'startDate',
									headerName: 'Sailing Date',
									width: 200,
								},
								{
									field: 'events',
									headerName: 'Events',
									width: 100,
								},
								{
									field: 'changes',
									headerName: 'Changes',
									width: 100,
								},
								{
									field: 'cheapestPrice',
									headerName: 'Cheapest Price',
									width: 200,
								},
								{
									field: 'actions',
									headerName: 'Actions',
									width: 200,
									renderCell: (params) => (
										<button onClick={() => showPriceHistoryModal(params.row)}>
											View price history
										</button>
									),
								},
							]}
							rows={cruiseData}
							pageSizeOptions={[5, 10, 30, 50, 100]}
							initialState={{
								sorting: { sortModel: [{ field: 'startDate', sort: 'desc' }] },
							}}
							sx={{ border: 0 }}
						/>
					</Paper>
				);
			default:
				return null;
		}
	};

	return (
		<div>
			<PriceHistoryModal cruise={modalCruise} setModalOpen={setModalOpen} modalOpen={modalOpen} />
			<p>This is for me to view the cruise data in pretty graphs</p>
			<h1>Cruise</h1>
			<div>
				{DisplayOptions.map((option) => (
					<button key={option} disabled={viewing === option} onClick={() => setViewing(option)}>
						{option}
					</button>
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
