import React from 'react';
import { Box, Button, Paper, Typography, Stack, Divider } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import PropTypes from 'prop-types';

const DynamicViewingGraph = ({ data = [] }) => {
	console.log('BBBB data: ', data);
	return (
		<Box>
			<Paper>
				<Typography d="modal-modal-description" sx={{ mt: 2 }}>
					Select how you want the graphs displayed.
				</Typography>
				<Button>Test</Button>
			</Paper>
			<Divider />
			<Paper>
				<Stack direction="row" spacing={2}>
					<LineChart data={[]} series={[]} xLabels={[]} height={400} width={600} />
				</Stack>
			</Paper>
		</Box>
	);
};

DynamicViewingGraph.propTypes = {
	data: PropTypes.array,
};

export default DynamicViewingGraph;
