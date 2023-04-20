import React, { useState, useEffect } from 'react';
import {
	Box,
	Button,
	Typography,
	Modal,
	FormControl,
	Divider,
	TextField,
	FormControlLabel,
	FormGroup,
} from '@mui/material';
import styledC from 'styled-components';
import dataStore from '@/Utilities/dataStore.js';
import MulitDropdown from '@/components/MulitDropdown.jsx';
import PropTypes from 'prop-types';
import AdjustPlayersModal from '@/components/AdjustPlayersModal.jsx';
import { CheckBox } from '@mui/icons-material';

export const style = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 500,
	bgcolor: 'background.paper',
	border: '2px solid #000',
	boxShadow: 24,
	p: 4,
};

const AdjustWrapper = styledC.span`
	float: right;
`;
export const ButtonWrapper = styledC.span`
	float: right;
	margin-top: 20px;
	& > button {
		margin-left: 10px;
	}
`;

function GameModal({ onStartGame, setModalOpen, modalOpen }) {
	const [knownCharacters, setKnownCharacters] = useState([]);
	const [selectedPlayers, setSelectedPlayers] = useState([]);
	const [gameName, setGameName] = useState('');
	const [maxScore, setMaxScore] = useState('');
	const [maxRounds, setMaxRounds] = useState('');

	const updatePlayers = () => {
		dataStore.loadCharacters().then((characters) => {
			if (characters) {
				setKnownCharacters(characters);
			}
		});
	};

	useEffect(() => {
		updatePlayers();
	}, []);

	useEffect(() => {
		setSelectedPlayers([]);
		setGameName('');
		setMaxScore('');
		setMaxRounds('');
	}, [modalOpen]);

	const startGame = () => {
		setModalOpen(false);
		onStartGame({
			players: selectedPlayers,
			name: gameName,
			maxScore: maxScore ? parseInt(maxScore) : 0,
			maxRounds: maxRounds ? parseInt(maxRounds) : 0,
		});
	};
	const handleClose = () => {
		setModalOpen(false);
	};
	const requireNumber = (setFunction) => (e) => {
		setFunction(e.target.value);
	};

	return (
		<Modal
			open={modalOpen}
			onClose={handleClose}
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-description"
		>
			<Box sx={style}>
				<Typography id="modal-modal-title" variant="h6" component="h2">
					Select Characters
					<AdjustWrapper>
						<AdjustPlayersModal updatePlayers={updatePlayers} />
					</AdjustWrapper>
				</Typography>

				<Typography id="modal-modal-description" sx={{ mt: 2 }}>
					Select Players for this game:
				</Typography>
				<MulitDropdown names={knownCharacters} onSelect={setSelectedPlayers} />
				<Divider />

				<FormGroup>
					<FormControl fullWidth>
						<TextField
							value={gameName}
							label="Game Title"
							onChange={(e) => setGameName(e.target.value)}
						/>
						<TextField
							value={maxScore}
							type="number"
							label="Max score"
							onChange={requireNumber(setMaxScore)}
						/>
						<TextField
							value={maxRounds}
							type="number"
							label="Count of Max Rounds"
							onChange={requireNumber(setMaxRounds)}
						/>
					</FormControl>

					<FormControlLabel
						labelPlacement="end"
						control={
							<CheckBox
								name="lowest"
								checked={false}
								onChange={(e) => console.log(e.target.value)}
							/>
						}
						label="Lowest score wins"
					/>
					<FormControlLabel
						labelPlacement="end"
						control={
							<CheckBox
								name="reverse"
								checked={false}
								onChange={(e) => console.log(e.target.value)}
							/>
						}
						label="Count Down From Max Score(0 ends game)"
					/>
				</FormGroup>

				<Divider />
				<ButtonWrapper>
					<Button onClick={handleClose}>Cancel</Button>
					<Button variant="contained" onClick={startGame}>
						Start!
					</Button>
				</ButtonWrapper>
			</Box>
		</Modal>
	);
}

GameModal.propTypes = {
	onStartGame: PropTypes.func.isRequired,
	modalOpen: PropTypes.bool.isRequired,
	setModalOpen: PropTypes.func.isRequired,
};

export default GameModal;
