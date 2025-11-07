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
import PropTypes from 'prop-types';
import { get } from 'lodash';

import dataStore from '#/Utilities/dataStore.js';
import MulitDropdown from '#/components/MulitDropdown.jsx';
import AdjustPlayersModal from '#/components/AdjustPlayersModal.jsx';

import { CheckBox } from '@mui/icons-material';
import { style, ButtonWrapper } from '#/components/styledComponents.jsx';

const AdjustWrapper = styledC.span`
	float: right;
`;

/**
 * @typedef {object} CustomRules
 * @type {object}
 * @property {Array<string>} booleans - A list of boolean based options
 * @property {Array<object>} numbers - A list of number based options
 * @property {string} numbers.name - The name of the number option
 * @property {number} numbers.min - The minimum number allowed
 * @property {number} numbers.max - The maximum number allowed
 * @property {number} numbers.step - The step for the number
 * @property {Array<object>} options - A list of number option options
 * @property {Array<string>} options.option - a list of the options allowed
 * @property {string} options.name - The name of the option
 * @property {boolean} options.multiple - If multiple options can be selected
 *
 * @example {
 * booleans: ['lowest', 'reverse'],
 * numbers: [
 *   {
 *     name: 'Max Score',
 *     min: 1,
 *     max: 1000,
 *     step: 1,
 *   }
 * ],
 * options: [
 * 	{
 * 		option: ['option1', 'option2'],
 * 		name: 'Option Name',
 * 		multiple: false,
 * 		},
 * ]
 */

/**
 *
 * @param onStartGame
 * @param setModalOpen
 * @param modalOpen
 * @param {CustomRules} customRules - Custom rules object.
 * @returns {JSX.Element}
 * @constructor
 */
function GameModal({ onStartGame, setModalOpen, modalOpen, customRules }) {
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

	const renderCustomRules = () => {
		if (!customRules || typeof cutsomRules !== 'object') return null;
		const booleanOptions = get(customRules, 'boolean', []).map((option, index) => {
			return (
				<FormControlLabel
					key={'boolean_options+' + index}
					labelPlacement="end"
					control={
						<CheckBox name={option} checked={false} onChange={(e) => console.log(e.target.value)} />
					}
					label={option}
				/>
			);
		});
		// TODO: Look at enforcing the other option values
		const numberOptions = get(customRules, 'numbers', []).map((option, index) => {
			return (
				<TextField
					key={'number_options+' + index}
					value={option.min}
					type="number"
					label={option.name}
					onChange={(e) => console.log(e.target.value)}
				/>
			);
		});

		//If no options exist, return nothing
		if (!booleanOptions.length && !numberOptions.length) return null;

		return [<Divider key="custom_options_divider" />, booleanOptions, numberOptions];
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
				{renderCustomRules()}

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
	customRules: PropTypes.object,
};

export default GameModal;
