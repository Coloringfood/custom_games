import React, { useEffect, useState } from 'react';
import { Paper } from '@mui/material';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { fetchEventsGraph } from '../cruiseUtils.js';

const LINE_COLORS = [
	'#8884d8',
	'#82ca9d',
	'#9c27b0',
	'#ff7300',
	'#ffbb28',
	'#00c49f',
	'#ff8042',
	'#0088fe',
	'#00c49f',
	'#ffbb28',
	'#ff7300',
	'#ff8042',
	'#0088fe',
	'#00c49f',
	'#ffbb28',
	'#ff7300',
	'#ff8042',
	'#0088fe',
	'#00c49f',
	'#ffbb28',
];

function CustomTooltip({ payload, label, active }) {
	if (active) {
		return (
			<Paper className="custom-tooltip">
				<p className="label">{`${label} : ${payload[0].value}`}</p>
				<p className="intro">Now it is: {label}</p>
				<p className="desc">Anything you want can be displayed here.</p>
			</Paper>
		);
	}

	return null;
}

const EventsGraph = () => {
	//region state
	const [graphData, setGraphData] = useState({
		labels: [],
		series: [],
		sliderValues: [],
	});
	const [zoomLevel, setZoomLevel] = useState(0);
	const [sliderValues, setSliderValues] = useState([0, 50]);
	//endregion

	//region effects
	const loadData = () => {
		//fetch data
		fetchEventsGraph(zoomLevel).then((data) => {
			console.log('BBBB data.graphData: ', data.graphData);
			setSliderValues([data.graphData.min, data.graphData.max]);
			setGraphData(data.graphData);
		});
	};
	useEffect(() => {
		loadData();
	}, []);

	useEffect(() => {
		loadData();
	}, [zoomLevel]);

	//region functions
	const handleClick = (clickType) => (event) => {
		console.log(clickType, event);
		if (zoomLevel < 3) {
			setZoomLevel(zoomLevel + 1);
		} else {
			setZoomLevel(0);
		}
	};
	//endregion

	return (
		<div>
			<h1>Event Graph</h1>
			<Paper>
				<LineChart
					width={900}
					height={400}
					data={graphData.series}
					margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
				>
					{graphData.labels.map((label, index) => (
						<Line
							key={index}
							connectNulls
							type="monotone"
							dataKey={label.key}
							stroke={LINE_COLORS[index % LINE_COLORS.length]}
							activeDot={{ onClick: handleClick('dot'), label: label }}
							onClick={handleClick('line')}
						/>
					))}
					<CartesianGrid stroke="#ccc" />
					<XAxis dataKey="name" />
					<YAxis />
					{/*<Tooltip content={<CustomTooltip />} />*/}
					<Tooltip />
				</LineChart>
			</Paper>
		</div>
	);
};

EventsGraph.propTypes = {};

export default EventsGraph;
