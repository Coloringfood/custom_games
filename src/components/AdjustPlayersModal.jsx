import React, { useEffect, useState } from 'react';
import dataStore from '#/Utilities/dataStore.js';
import { Box, Button, Divider, Modal, TextField, Typography } from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2';
import DeleteIcon from '@mui/icons-material/Delete.js';
import PropTypes from 'prop-types';
import { ButtonWrapper, style } from '#/components/styledComponents.jsx';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)`
	margin-top: 12px;
	margin-left: 20px;
`;
const StyledGrid = styled(Grid2)`
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
	padding-right: 30px;
	position: relative;
	&:hover {
		background-color: ${({ theme }) => theme.palette.primary.light};
	}
	& > svg {
		cursor: pointer;
		position: absolute;
		right: 5px;
	}
`;

function AdjustPlayersModal({ updatePlayers }) {
	const [knownCharacters, setKnownCharacters] = useState([]);
	const [newCharacterName, setNewCharacterName] = useState('');
	const [open, setOpen] = React.useState(false);

	useEffect(() => {
		dataStore.loadCharacters().then((characters) => {
			if (characters) {
				setKnownCharacters(characters);
			}
		});
	}, []);

	const handleOpen = () => {
		setOpen(true);
	};
	const handleClose = () => {
		setOpen(false);
		updatePlayers();
	};

	const addCharacter = () => {
		setKnownCharacters([...knownCharacters, newCharacterName]);
		setNewCharacterName('');
	};
	const deleteCharacter = (character) => () => {
		setKnownCharacters((prevState) => prevState.filter((e) => e !== character));
	};
	const save = () => {
		// Save to storage
		dataStore.saveCharacters(knownCharacters);
		handleClose();
	};

	return (
		<React.Fragment>
			<Button variant="outlined" color="secondary" onClick={handleOpen}>
				Adjust Players
			</Button>
			<Modal open={open} onClose={handleClose} aria-labelledby="child-modal-title">
				<Box sx={{ ...style, width: 700 }}>
					<Typography id="child-modal-title" variant="h6" component="h2">
						Adjust Players
					</Typography>
					<Divider />
					<Typography sx={{ mt: 2 }}>Known Characters:</Typography>
					<Grid2 container spacing={2}>
						{knownCharacters.map((c) => (
							<StyledGrid xs={4} key={'character_' + c}>
								{c}
								<DeleteIcon onClick={deleteCharacter(c)} />
							</StyledGrid>
						))}
					</Grid2>
					<Divider />
					<TextField
						label="New player's Name"
						value={newCharacterName}
						onChange={(e) => setNewCharacterName(e.target.value)}
					/>
					<StyledButton variant="outlined" color="secondary" onClick={addCharacter}>
						Add Character
					</StyledButton>
					<Divider />
					<ButtonWrapper>
						<Button onClick={handleClose}>Cancel</Button>
						<Button variant="contained" onClick={save}>
							Save
						</Button>
					</ButtonWrapper>
				</Box>
			</Modal>
		</React.Fragment>
	);
}

AdjustPlayersModal.propTypes = {
	updatePlayers: PropTypes.func.isRequired,
};

export default AdjustPlayersModal;
