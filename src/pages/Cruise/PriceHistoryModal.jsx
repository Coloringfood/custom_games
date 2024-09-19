import React, { useState, useEffect } from 'react';
import { Box, Button, Modal, Divider, Paper, Typography, Stack } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { LineChart } from '@mui/x-charts/LineChart';
import PropTypes from 'prop-types';
import { style, ButtonWrapper } from '#/components/styledComponents.jsx';
import _ from 'lodash';
import { mapShipNames } from '#/pages/Cruise/cruiseUtils.js';

const paginationModel = { page: 0, pageSize: 3 };
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

const flatDataColumns = [
	{ field: 'name', headerName: 'Name', width: 300 },
	{ field: 'shipName', headerName: 'Ship Name', width: 200, valueFormatter: mapShipNames },
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

function GameModal({ cruise = {}, setModalOpen, modalOpen }) {
	const [series, setSeries] = useState([]);
	const [xLabels, setXLabels] = useState([]);

	useEffect(() => {
		if (!_.get(cruise, 'priceHistory', false)) {
			setSeries([]);
			setXLabels([]);
			return;
		}
		const newSeries = [];
		const newXLabels = [];
		const history = cruise.priceHistory
			.slice()
			.sort((a, b) => new Date(a.dateCollected) - new Date(b.dateCollected));
		history.forEach((entry) => {
			newSeries.push(parseInt(entry.cheapestPrice));
			newXLabels.push(
				new Date(entry.dateCollected).toLocaleDateString('en-us', {
					hour: '2-digit',
					minute: '2-digit',
				}),
			);
		});

		setSeries(newSeries);
		setXLabels(newXLabels);
	}, [cruise]);

	const handleClose = () => {
		setModalOpen(false);
	};

	return (
		<Modal
			open={modalOpen}
			onClose={handleClose}
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-description"
		>
			<Box sx={{ ...style, width: 800 }}>
				<Typography id="modal-modal-title" variant="h6" component="h2">
					Viewing Cruise: {_.get(cruise, 'cruiseName', 'Unknown')}
				</Typography>
				<Typography d="modal-modal-description" sx={{ mt: 2 }}>
					Lowest price: {_.get(cruise, 'cheapestPrice', 'Unknown')}
				</Typography>
				<Divider />
				<Paper>
					<DataGrid
						rows={_.get(cruise, 'priceHistory', [])}
						columns={flatDataColumns}
						initialState={initialState}
						pageSizeOptions={[3, 5, 10, 30, 50, 100]}
						checkboxSelection
						sx={{ border: 0 }}
					/>
				</Paper>
				<Divider />
				<Stack sx={{ width: '100%' }}>
					<LineChart
						xAxis={[{ scaleType: 'point', data: xLabels }]}
						series={[{ data: series, label: 'Price' }]}
						height={200}
						margin={{ top: 10, bottom: 20 }}
						skipAnimation
					/>
				</Stack>
				<Divider />
				<ButtonWrapper>
					<Button onClick={handleClose}>Close</Button>
				</ButtonWrapper>
			</Box>
		</Modal>
	);
}

GameModal.propTypes = {
	cruise: PropTypes.object,
	modalOpen: PropTypes.bool.isRequired,
	setModalOpen: PropTypes.func.isRequired,
};

export default GameModal;
