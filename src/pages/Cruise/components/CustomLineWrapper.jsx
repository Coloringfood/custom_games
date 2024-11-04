import React from 'react';
import { isEqual } from 'lodash';
import { Stack } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import PropTypes from 'prop-types';

class CustomLineWrapper extends React.Component {
	shouldComponentUpdate(nextProps) {
		if (
			!isEqual(this.props.xLabels, nextProps.xLabels) ||
			!isEqual(this.props.sliderValues, nextProps.sliderValues) ||
			!isEqual(this.props.series, nextProps.series)
		) {
			return true;
		}
		return false;
	}

	render() {
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
					onLineClick={this.props.handleLineClick}
					skipAnimation
				/>
			</Stack>
		);
	}
}

CustomLineWrapper.propTypes = {
	handleMarkClick: PropTypes.func.isRequired,
	handleLineClick: PropTypes.func,
	xLabels: PropTypes.array.isRequired,
	sliderValues: PropTypes.array.isRequired,
	series: PropTypes.array.isRequired,
};

export default CustomLineWrapper;
