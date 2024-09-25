import React from 'react';
import { Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { mapShipNames } from '#/pages/Cruise/cruiseUtils.js';
import PropTypes from 'prop-types';

class CruiseGraph extends React.PureComponent {
	render() {
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
								<button onClick={() => this.props.showPriceHistoryModal(params.row)}>
									View price history
								</button>
							),
						},
					]}
					rows={this.props.cruiseData}
					pageSizeOptions={[5, 10, 20, 30, 50, 100]}
					initialState={{
						sorting: { sortModel: [{ field: 'startDate', sort: 'desc' }] },
						pagination: { paginationModel: { page: 0, pageSize: 20 } },
					}}
					sx={{ border: 0 }}
				/>
			</Paper>
		);
	}
}

CruiseGraph.propTypes = {
	showPriceHistoryModal: PropTypes.func.isRequired,
	cruiseData: PropTypes.array.isRequired,
};

export default CruiseGraph;
