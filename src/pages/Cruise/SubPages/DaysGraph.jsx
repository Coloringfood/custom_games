import React from 'react';
import { Button, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { initialState } from '#/pages/Cruise/cruiseUtils.js';
import PropTypes from 'prop-types';

class DaysGraph extends React.PureComponent {
	lazyLoadCurrentCount = 5;
	addLazyLoadCurrentCount = () => {
		this.lazyLoadCurrentCount += 5;
		this.forceUpdate();
	};
	render() {
		return (
			<Paper>
				{this.props.pulledDays.slice(0, this.lazyLoadCurrentCount).map((day) => (
					<div key={day.day} className="day">
						<h3>Day {day.day}</h3>
						<div>Ships found: {day.ships.length}</div>
						<Paper>
							<DataGrid
								rows={day.ships}
								columns={this.props.flatDataColumns}
								initialState={initialState}
								pageSizeOptions={[5, 10, 30, 50, 100]}
								sx={{ border: 0 }}
							/>
						</Paper>
					</div>
				))}
				{this.lazyLoadCurrentCount < this.props.pulledDays.length && (
					<Button onClick={() => this.addLazyLoadCurrentCount((props) => props + 5)}>
						Show More
					</Button>
				)}
			</Paper>
		);
	}
}

DaysGraph.propTypes = {
	pulledDays: PropTypes.array.isRequired,
	flatDataColumns: PropTypes.array.isRequired,
};

export default DaysGraph;
