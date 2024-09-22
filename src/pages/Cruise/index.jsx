import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Paper, Box, Button, CircularProgress } from '@mui/material';
import './Default.css';
import PriceHistoryModal from '#/pages/Cruise/PriceHistoryModal.jsx';
import DynamicViewingGraph from '#/pages/Cruise/DynamicViewingGraph.jsx';
import {
	mapShipNames,
	flatDataColumns,
	initialState,
	dateStringModifiers,
	groupData,
	fetchCruiseData,
} from '#/pages/Cruise/cruiseUtils.js';

const DisplayOptions = ['days', 'events', 'cruise', 'graph'];

function Default() {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState([]);
	const [viewing, setViewing] = useState('graph');
	const [pulledDays, setPulledDays] = useState([]);
	const [pulledEvents, setPulledEvents] = useState([]);
	const [cruiseData, setCruiseData] = useState([]);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalCruise, setModalCruise] = useState(null);

	// on page load get data from API
	useEffect(() => {
		(async () => {
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
									valueFormatter: (value) => mapShipNames(value.split(' - ')[0]),
								},
								{
									field: 'startDate',
									headerName: 'Sailing Date',
									width: 200,
									valueGetter: (value) => new Date(value),
									valueFormatter: (value) => value.toLocaleDateString(),
									type: 'dateTime',
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
			case 'graph':
				return (
					<div>
						<DynamicViewingGraph
							data={data}
							pulledCruises={cruiseData}
							pulledDays={pulledDays}
							pulledEvents={pulledEvents}
						/>
					</div>
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
