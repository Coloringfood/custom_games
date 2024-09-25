import React from 'react';
import { Button, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { initialState, dateStringModifiers, flatDataColumns } from '#/pages/Cruise/cruiseUtils.js';
import PropTypes from 'prop-types';

class EventsGraph extends React.PureComponent {
	lazyLoadCurrentCount = 5;
	addLazyLoadCurrentCount = () => {
		this.lazyLoadCurrentCount += 5;
		this.forceUpdate();
	};
	render() {
		return (
			<Paper>
				{this.props.pulledEvents.slice(0, this.lazyLoadCurrentCount).map((event) => {
					const rows = event.indexes.map((index) => this.props.data[index] || {});
					return (
						<div key={event.dateCollected} className="event">
							<h3>{new Date(event.dateCollected).toLocaleDateString(...dateStringModifiers)}</h3>
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
				{this.lazyLoadCurrentCount < this.props.pulledEvents.length && (
					<Button onClick={() => this.addLazyLoadCurrentCount((props) => props + 5)}>
						Show More
					</Button>
				)}
			</Paper>
		);
	}
}

EventsGraph.propTypes = {
	pulledEvents: PropTypes.array.isRequired,
	data: PropTypes.array.isRequired,
};

export default EventsGraph;
