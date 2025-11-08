import React, { useEffect, useState } from 'react';
import {
	Box,
	Button,
	TextField,
	Checkbox,
	FormControlLabel,
	Typography,
	Paper,
	IconButton,
	List,
	ListItem,
	ListItemText,
	Divider,
	Stack,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const STORAGE_KEY = 'who_records_v1';
const PART_KEY = 'who_participants_v1';

// function formatTimestamp(ts) {
// 	try {
// 		return new Date(ts).toLocaleString();
// 	} catch (e) {
// 		return String(ts);
// 	}
// }

function groupHistory(history) {
	if (!history || history.length === 0) return [];

	// Count entries per date
	const counts = {};
	history.forEach((h) => {
		const d = new Date(h.timestamp);
		const key = d.toISOString().split('T')[0]; // YYYY-MM-DD
		counts[key] = (counts[key] || 0) + 1;
	});

	const multiplePerDay = Object.values(counts).some((c) => c > 1);

	// GROUP MODE A: Human-friendly daily mode
	if (multiplePerDay) {
		return Object.entries(
			history.reduce((acc, h) => {
				const date = new Date(h.timestamp);
				const key = date.toISOString().split('T')[0];
				acc[key] = acc[key] || [];
				acc[key].push(h);
				return acc;
			}, {}),
		).map(([dateKey, entries]) => ({
			label: humanDateLabel(dateKey),
			entries,
		}));
	}

	// GROUP MODE B: Weekly mode
	const weekGroups = {};
	history.forEach((h) => {
		const d = new Date(h.timestamp);
		const day = d.getDay();
		const monday = new Date(d);
		monday.setDate(d.getDate() - ((day + 6) % 7));
		const weekKey = monday.toISOString().split('T')[0];
		weekGroups[weekKey] = weekGroups[weekKey] || [];
		weekGroups[weekKey].push(h);
	});

	return Object.entries(weekGroups).map(([weekStart, entries]) => {
		const start = new Date(weekStart);
		const end = new Date(start);
		end.setDate(start.getDate() + 6);
		return {
			label: `Week of ${start.toLocaleDateString(undefined, {
				month: 'short',
				day: 'numeric',
			})} – ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
			entries,
		};
	});
}

function humanDateLabel(dateKey) {
	const d = new Date(dateKey + 'T00:00:00');
	const today = new Date();
	const yesterday = new Date();
	yesterday.setDate(today.getDate() - 1);

	if (d.toDateString() === today.toDateString()) return 'Today';
	if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

	return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function WhoDidItLast() {
	const theme = useTheme();
	const isCompact = useMediaQuery(theme.breakpoints.down('sm'));

	const [records, setRecords] = useState([]);
	const [participants, setParticipants] = useState([]);
	const [showForm, setShowForm] = useState(false);
	const [editMode, setEditMode] = useState(false);

	// Edit record state
	const [editRecord, setEditRecord] = useState(null);
	const [editName, setEditName] = useState('');
	const [editSelectedMap, setEditSelectedMap] = useState({});
	const [editNewNames, setEditNewNames] = useState('');

	// Form state
	const [name, setName] = useState('');
	const [selectedMap, setSelectedMap] = useState({});
	const [newNames, setNewNames] = useState('');

	const [openHistoryId, setOpenHistoryId] = useState(null);

	useEffect(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			const rawP = localStorage.getItem(PART_KEY);
			const loaded = raw ? JSON.parse(raw) : [];
			// Ensure every record has an orderIndex
			loaded.forEach((r, i) => {
				if (typeof r.orderIndex !== 'number') r.orderIndex = i + 1;
			});
			// Sort on load
			loaded.sort((a, b) => a.orderIndex - b.orderIndex);
			setRecords(loaded);

			setParticipants(rawP ? JSON.parse(rawP) : []);
		} catch (e) {
			console.error('Failed to read storage', e);
			setRecords([]);
			setParticipants([]);
		}
	}, []);

	const persistRecords = (next) => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
		setRecords(next);
	};

	const persistParticipants = (next) => {
		localStorage.setItem(PART_KEY, JSON.stringify(next));
		setParticipants(next);
	};

	const toggleSelect = (p) => {
		setSelectedMap((s) => ({ ...s, [p]: !s[p] }));
	};

	const handleAddRecord = () => {
		const entered = newNames
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		const chosen = Object.keys(selectedMap).filter((k) => selectedMap[k]);

		if (!name.trim()) return alert('Please enter a name for the record.');
		if (chosen.length === 0 && entered.length === 0)
			return alert('Please select or add at least one participant.');

		const mergedParticipants = Array.from(new Set([...participants, ...entered]));
		const recordParticipants = Array.from(new Set([...chosen, ...entered]));

		const newRecord = {
			id: Date.now().toString(),
			name: name.trim(),
			participants: recordParticipants,
			history: [],
			orderIndex: records.length ? Math.max(...records.map((r) => r.orderIndex)) + 1 : 1,
		};

		persistRecords([newRecord, ...records]);
		persistParticipants(mergedParticipants);

		// reset form
		setName('');
		setSelectedMap({});
		setNewNames('');
		setShowForm(false);
	};

	const handleDeleteRecord = (recordId) => {
		const next = records.filter((r) => r.id !== recordId);
		persistRecords(next);
	};

	const handleEditRecord = (record) => {
		setEditRecord(record);
		setEditName(record.name);
		const initialSelectedMap = record.participants.reduce((acc, p) => ({ ...acc, [p]: true }), {});
		setEditSelectedMap(initialSelectedMap);
		setEditNewNames('');
	};

	const handleSaveEdit = () => {
		const entered = editNewNames
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		const chosen = Object.keys(editSelectedMap).filter((k) => editSelectedMap[k]);

		if (!editName.trim()) return alert('Please enter a name for the record.');
		if (chosen.length === 0 && entered.length === 0)
			return alert('Please select or add at least one participant.');

		const mergedParticipants = Array.from(new Set([...participants, ...entered]));
		const recordParticipants = Array.from(new Set([...chosen, ...entered]));

		const next = records.map((r) => {
			if (r.id !== editRecord.id) return r;
			return {
				...r,
				name: editName.trim(),
				participants: recordParticipants,
			};
		});

		persistRecords(next);
		persistParticipants(mergedParticipants);
		setEditRecord(null);
	};

	const handleExport = () => {
		const data = {
			records,
			participants,
			exportDate: new Date().toISOString(),
			version: '1.0',
		};

		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `who-did-it-last-export-${new Date().toISOString().split('T')[0]}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const handleImport = (event) => {
		const file = event.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const data = JSON.parse(e.target.result);
				if (!data.records || !data.participants) {
					throw new Error('Invalid file format');
				}

				// Merge existing and imported data
				const mergedRecords = [...records, ...data.records];
				const mergedParticipants = Array.from(new Set([...participants, ...data.participants]));

				persistRecords(mergedRecords);
				persistParticipants(mergedParticipants);

				// Reset the file input
				event.target.value = '';

				alert('Import successful!');
			} catch (error) {
				alert('Error importing file: ' + error.message);
			}
		};
		reader.readAsText(file);
	};

	const toggleEditSelect = (p) => {
		setEditSelectedMap((s) => ({ ...s, [p]: !s[p] }));
	};

	const recordAction = (recordId, person) => {
		const next = records.map((r) => {
			if (r.id !== recordId) return r;
			const nextHistory = [{ person, timestamp: Date.now() }, ...(r.history || [])];
			return { ...r, history: nextHistory };
		});
		persistRecords(next);
	};

	const deleteHistoryEntry = (recordId, index) => {
		const next = records.map((r) => {
			if (r.id !== recordId) return r;
			const nextHistory = (r.history || []).slice();
			// index corresponds to the position in the history array (0 = most recent)
			nextHistory.splice(index, 1);
			return { ...r, history: nextHistory };
		});
		persistRecords(next);
	};

	return (
		<Box sx={{ p: 2 }}>
			<Typography variant="h5" gutterBottom>
				Who Did It Last — Tracker
			</Typography>

			{/* Edit Record Dialog */}
			<Dialog open={!!editRecord} onClose={() => setEditRecord(null)} maxWidth="sm" fullWidth>
				<DialogTitle>Edit Record</DialogTitle>
				<DialogContent>
					<Stack spacing={2} sx={{ mt: 1 }}>
						<TextField
							fullWidth
							label="Record name"
							value={editName}
							onChange={(e) => setEditName(e.target.value)}
							size={isCompact ? 'small' : 'medium'}
						/>

						<Box>
							<Typography variant="subtitle2" sx={{ mb: 1 }}>
								Choose participants:
							</Typography>
							<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
								{participants.map((p) => (
									<FormControlLabel
										key={p}
										control={
											<Checkbox
												size={isCompact ? 'small' : 'medium'}
												checked={!!editSelectedMap[p]}
												onChange={() => toggleEditSelect(p)}
											/>
										}
										label={p}
									/>
								))}
							</Box>
						</Box>

						<TextField
							fullWidth
							label="Add new participants (comma separated)"
							value={editNewNames}
							onChange={(e) => setEditNewNames(e.target.value)}
							placeholder="Alice, Ben, Cara"
							size={isCompact ? 'small' : 'medium'}
						/>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setEditRecord(null)}>Cancel</Button>
					<Button onClick={handleSaveEdit} variant="contained">
						Save Changes
					</Button>
				</DialogActions>
			</Dialog>

			<Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
				<Button variant="contained" onClick={() => setShowForm((s) => !s)}>
					{showForm ? 'Cancel' : 'Add Record'}
				</Button>
				<Button
					variant={editMode ? 'contained' : 'outlined'}
					color={editMode ? 'secondary' : 'primary'}
					onClick={() => setEditMode((m) => !m)}
				>
					{editMode ? 'Done Editing' : 'Edit Mode'}
				</Button>
				<Box sx={{ display: 'flex', gap: 1 }}>
					<Button variant="outlined" component="label" size={isCompact ? 'small' : 'medium'}>
						Import
						<input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
					</Button>
					<Button variant="outlined" onClick={handleExport} size={isCompact ? 'small' : 'medium'}>
						Export
					</Button>
				</Box>
			</Box>

			{showForm && (
				<Paper sx={{ p: 2, mb: 2 }} elevation={1}>
					<Stack spacing={2}>
						<TextField
							fullWidth
							label="Record name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g. Pick the movie"
							size={isCompact ? 'small' : 'medium'}
						/>

						<Box>
							<Typography variant="subtitle2" sx={{ mb: 1 }}>
								Choose participants (existing):
							</Typography>
							<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
								{participants.length === 0 && (
									<Typography variant="body2" color="text.secondary">
										No participants yet
									</Typography>
								)}
								{participants.map((p) => (
									<FormControlLabel
										key={p}
										control={
											<Checkbox
												size={isCompact ? 'small' : 'medium'}
												checked={!!selectedMap[p]}
												onChange={() => toggleSelect(p)}
											/>
										}
										label={p}
									/>
								))}
							</Box>
						</Box>

						<TextField
							fullWidth
							label="Add new participants (comma separated)"
							value={newNames}
							onChange={(e) => setNewNames(e.target.value)}
							placeholder="Alice, Ben, Cara"
							size={isCompact ? 'small' : 'medium'}
						/>

						<Box>
							<Button
								variant="contained"
								onClick={handleAddRecord}
								size={isCompact ? 'small' : 'medium'}
							>
								Save Record
							</Button>
						</Box>
					</Stack>
				</Paper>
			)}

			<Box>
				{records.length === 0 && (
					<Typography variant="body1">No records yet. Add one to get started.</Typography>
				)}

				<Stack spacing={2}>
					{[...records]
						.sort((a, b) => a.orderIndex - b.orderIndex)
						.map((r) => {
							const last = (r.history && r.history[0] && r.history[0].person) || '—';
							return (
								<Paper key={r.id} sx={{ p: 2 }} elevation={0}>
									<Box
										sx={{
											display: 'flex',
											flexDirection: isCompact ? 'column' : 'row',
											alignItems: isCompact ? 'stretch' : 'center',
											justifyContent: 'space-between',
										}}
									>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											<Box>
												<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
													{r.name}
												</Typography>
												<Typography variant="caption" color="text.secondary">
													Last: {last}
													{r.history?.length > 0 && (
														<>
															{' '}
															—{' '}
															{new Date(r.history[0].timestamp).toLocaleString(undefined, {
																hour: 'numeric',
																minute: 'numeric',
																hour12: true,
																month: 'short',
																day: 'numeric',
															})}
														</>
													)}
												</Typography>
											</Box>
											{editMode && (
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
													<TextField
														type="number"
														size="small"
														label="Order"
														value={r.orderIndex}
														onChange={(e) => {
															const value = parseInt(e.target.value, 10);
															if (isNaN(value)) return;
															const next = records.map((rec) =>
																rec.id === r.id ? { ...rec, orderIndex: value } : rec,
															);
															// Re-sort and persist
															next.sort((a, b) => a.orderIndex - b.orderIndex);
															persistRecords(next);
														}}
														sx={{ width: 75 }}
													/>
													<IconButton size="small" onClick={() => handleEditRecord(r)}>
														<EditIcon fontSize="small" />
													</IconButton>
													<IconButton size="small" onClick={() => handleDeleteRecord(r.id)}>
														<DeleteIcon fontSize="small" />
													</IconButton>
												</Box>
											)}
										</Box>

										<Box sx={{ mt: isCompact ? 1 : 0 }}>
											<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
												{r.participants.map((p) => (
													<Button
														key={p}
														variant="outlined"
														size={isCompact ? 'small' : 'medium'}
														onClick={() => recordAction(r.id, p)}
													>
														{p}
													</Button>
												))}
											</Box>
										</Box>
									</Box>

									<Box sx={{ mt: 1 }}>
										<Button
											size="small"
											onClick={() => setOpenHistoryId(openHistoryId === r.id ? null : r.id)}
										>
											{openHistoryId === r.id ? 'Hide History' : 'Show History'}
										</Button>

										{openHistoryId === r.id && (
											<Box sx={{ mt: 1 }}>
												{r.history && r.history.length > 0 ? (
													<Box sx={{ maxHeight: 250, overflowY: 'auto', pr: 1 }}>
														{groupHistory(r.history).map((section, sIdx) => (
															<Box key={sIdx} sx={{ mb: 2 }}>
																<Typography variant="subtitle2" sx={{ mb: 1 }}>
																	{section.label}
																</Typography>
																<List dense>
																	{section.entries.map((h, idx) => (
																		<React.Fragment key={h.timestamp + '_' + idx}>
																			<ListItem
																				secondaryAction={
																					editMode ? (
																						<IconButton
																							edge="end"
																							aria-label="delete"
																							onClick={() => deleteHistoryEntry(r.id, idx)}
																							size={isCompact ? 'small' : 'medium'}
																						>
																							<DeleteIcon
																								fontSize={isCompact ? 'small' : 'medium'}
																							/>
																						</IconButton>
																					) : null
																				}
																			>
																				<ListItemText
																					primary={h.person}
																					secondary={new Date(h.timestamp).toLocaleString(
																						undefined,
																						{
																							hour: 'numeric',
																							minute: 'numeric',
																							hour12: true,
																							month: 'short',
																							day: 'numeric',
																						},
																					)}
																				/>
																			</ListItem>
																			<Divider component="li" />
																		</React.Fragment>
																	))}
																</List>
															</Box>
														))}
													</Box>
												) : (
													<Typography variant="body2" color="text.secondary">
														No history yet
													</Typography>
												)}
											</Box>
										)}
									</Box>
								</Paper>
							);
						})}
				</Stack>
			</Box>
		</Box>
	);
}
