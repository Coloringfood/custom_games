import React from 'react';
import styled from 'styled-components';
import Collapse from '@mui/material/Collapse';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Fab from '@mui/material/Fab';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import TextField from '@mui/material/TextField';
import _ from 'lodash';

const DefaultColorMapping = {
	1: 'darkgreen',
	2: '#FFFFE0',
	3: 'lightblue',
	4: '#AD4F3D',
	5: '#7FAE90',
	6: '#F2C0C0',
	7: '#FFC057',
	8: '#81CCCF',
	9: '#D2A0A0',
	// 10: 'purple',
};
const ColorMapping = { ...DefaultColorMapping };
const defaultOptions = Object.keys(DefaultColorMapping);
const defaultUniquePairs = [];
// map each option to each other option
defaultOptions.forEach((option, index) => {
	// start at the next option
	for (let i = index + 1; i < defaultOptions.length; i++) {
		// push the pair
		defaultUniquePairs.push([option, defaultOptions[i]]);
	}
});

const width = 12;
const height = 18;
const boxSize = 60;

const Quilt = styled.div`
	display: flex;
	flex-wrap: wrap;
	padding-top: 50px;
	width: 720px;
	height: 1080px;
	margin: 0 auto;
`;
const Quilt2 = styled.div`
	display: flex;
	flex-wrap: wrap;
	padding-top: 50px;
	height: ${height * boxSize}px;
	//height: 300px;
	width: ${width * boxSize}px;
	margin: 0 auto;
`;
const Pairing = styled.div`
	width: ${boxSize - 2}px;
	height: ${boxSize - 2}px;
	border: 1px solid black;
	display: inline-block;
	background-color: #013a6b;
	background-image: -webkit-linear-gradient(
		${({ angle }) => (angle ? '45' : '-45')}deg,
		${({ A }) => ColorMapping[A]} 50%,
		${({ B }) => ColorMapping[B]} 50%
	);
`;
const PairCount = styled.div`
	display: inline-block;
	text-align: left;
	width: 150px;
`;

function unsecuredCopyToClipboard(text) {
	const textArea = document.createElement('textarea');
	textArea.value = text;
	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();
	try {
		document.execCommand('copy');
		alert('Copied to clipboard');
	} catch (err) {
		console.error('Unable to copy to clipboard', err);
	}
	document.body.removeChild(textArea);
}

const calculateScore = (mappingValues) => {
	let score = mappingValues.length;
	// const lowest = _.min(mappingValues);
	// const highest = _.max(mappingValues);
	// score += highest - lowest;
	// switch (lowest) {
	// 	case 0:
	// 		score += 100;
	// 		break;
	// 	case 1:
	// 		score += 50;
	// 		break;
	// 	case 2:
	// 		score += 25;
	// 		break;
	// 	case 3:
	// 		score += 10;
	// 		break;
	// }
	return score;
};

const generatePairings = () => {
	const options = [1, 2, 3, 4, 5, 6, 7, 8];
	const uniquePairs = [];
	// map each option to each other option
	options.forEach((option, index) => {
		// start at the next option
		for (let i = index + 1; i < options.length; i++) {
			// push the pair
			uniquePairs.push([option, options[i]]);
		}
	});

	// 12 width
	// 18 down
	// 216 Options max in pairings
	const pairings = [[...uniquePairs[0]]];

	while (pairings.length < 216) {
		const shuffledRowOptions = [...uniquePairs];
		const currentLength = pairings.length;
		const currentRow = Math.floor(currentLength / 12);
		const [A] = pairings[currentLength - 1];
		const isEvenRow = currentRow % 2 === 0;

		let nextPair;
		let matchingValue = A;
		if (currentLength % 12 >= 8) {
			nextPair = pairings[currentLength - 8];
		} else if (currentRow === 0) {
			const start = currentLength > 6 ? currentLength - 6 : 0;
			const usedColors = pairings
				.slice(start, currentLength)
				.reduce((acc, [C, D]) => [...acc, C, D], []);
			// find next pair that has a slot matching previous pairing's B
			nextPair = shuffledRowOptions.find(
				([C, D]) =>
					(D === matchingValue && !usedColors.includes(C)) ||
					(C === matchingValue && !usedColors.includes(D)),
			);

			// Reorder so matching slot is 2nd if needed
			nextPair = nextPair[1] === matchingValue ? nextPair : [nextPair[1], nextPair[0]];
		} else {
			const [E, F] = pairings[currentLength - 12];
			const [G, H] = pairings[currentLength - 8];
			const secondaryValue = (currentLength + isEvenRow) % 2 === 0 ? F : E;
			matchingValue = (currentLength + isEvenRow) % 2 === 0 ? G : H;
			nextPair =
				(currentLength + isEvenRow) % 2
					? [secondaryValue, matchingValue]
					: [matchingValue, secondaryValue];
		}

		if (!nextPair) {
			console.error("somehow didn't find a next pair");
			break;
		}

		pairings.push(nextPair);
	}

	return pairings;
};

const generatePairings2 = (uniquePairs) => {
	// 28 width
	// 18 down
	// 504 Options max in pairings
	const pairings = [];

	const findNextUniquePairForRow = (
		currentPairings,
		unUsedPairs,
		priority,
		previousRow = [],
		oddRow = false,
		row,
	) => {
		if (currentPairings.length === width) {
			return [currentPairings, unUsedPairs];
		}
		const [A] = currentPairings[currentPairings.length - 1];
		const pairFromRowAbove = previousRow[currentPairings.length];

		const tryWithPair = (pair) => {
			const thisAttempt = [...currentPairings, pair];
			const remainingOptions = unUsedPairs.filter(([a, b]) => !(a === pair[0] && b === pair[1]));
			const remainingPriority = priority.filter(([a, b]) => !(a === pair[0] && b === pair[1]));
			return findNextUniquePairForRow(
				thisAttempt,
				remainingOptions,
				remainingPriority,
				previousRow,
				oddRow,
				row,
			);
		};

		if (currentPairings.length % 2 === (oddRow ? 1 : 0) && pairFromRowAbove) {
			return tryWithPair([pairFromRowAbove[0], A]);
		}
		const matchingValue = A;

		const recentlyUsedColors = currentPairings
			.slice(-3)
			.reduce((acc, [C, D]) => [...acc, C, D], [matchingValue])
			.concat(previousRow[currentPairings.length + 1]);

		let bestAttempt = currentPairings;
		let bestRemaining = unUsedPairs;
		const getValidOptionsLeft = (options) => {
			return options.filter(
				([a, b]) =>
					(a === matchingValue && !recentlyUsedColors.includes(b)) ||
					(b === matchingValue && !recentlyUsedColors.includes(a)),
			);
		};
		const checkOptions = (leftOptions) => {
			const length = leftOptions.length;
			for (let i = 0; i < length; i++) {
				// Check if pairing uses a recently used color
				const [C, D] = leftOptions[i];
				// Reorder so matching slot is 2nd if needed
				const toAdd = D === matchingValue ? [C, D] : [D, C];

				const [solution, remaining] = tryWithPair(toAdd);

				if (solution.length >= bestAttempt.length) {
					bestAttempt = solution;
					bestRemaining = remaining;
				}
				if (solution.length === width) {
					return;
				}
			}
		};

		checkOptions(getValidOptionsLeft(priority));
		if (bestAttempt.length === width) return [bestAttempt, bestRemaining];
		checkOptions(getValidOptionsLeft(unUsedPairs));

		return [bestAttempt, bestRemaining];
	};

	let remainingPairs = [...uniquePairs];
	const findStartingPairing = (previousRow, isRowEven) => {
		if (previousRow.length === 0) return uniquePairs[0];
		const start = previousRow[0];
		const matchingIndex = isRowEven ? 0 : 1;
		const matchingValue = start[matchingIndex];
		const notMatchingValues = [start[(matchingIndex + 1) % 2], ...previousRow[1]];
		let startingPair = remainingPairs.find(
			([a, b]) =>
				(a === matchingValue && !notMatchingValues.includes(b)) ||
				(b === matchingValue && !notMatchingValues.includes(a)),
		);
		if (!startingPair) {
			startingPair = uniquePairs.find(
				([a, b]) =>
					(a === matchingValue || b === matchingValue) && !(a === start[0] && b === start[1]),
			);
		}
		// Reorder so matching slot is 2nd if needed
		startingPair =
			startingPair[matchingIndex] === matchingValue
				? startingPair
				: [startingPair[1], startingPair[0]];
		return startingPair;
	};
	while (pairings.length < width * height) {
		const rowCount = Math.floor(pairings.length / width);
		const previousRow = pairings.length >= width ? pairings.slice(pairings.length - width) : [];
		const startPairing = findStartingPairing(previousRow, rowCount % 2 === 0);
		const remainingPairings = [
			...uniquePairs.filter(([a, b]) => !(a === startPairing[0] && b === startPairing[1])),
		];

		const [row, remaining] = findNextUniquePairForRow(
			[startPairing],
			_.shuffle(remainingPairings),
			remainingPairs,
			previousRow,
			rowCount % 2 === 1,
			rowCount,
		);
		if (!row) {
			console.error("somehow didn't find a valid row");
			break;
		}
		remainingPairs = remaining;

		pairings.push(...row);
		if (row.length < width) {
			console.error("somehow didn't finish a row");
			break;
		}

		if (remainingPairs.length === 0) {
			remainingPairs = _.shuffle(uniquePairs);
		}
	}

	return [...pairings];
};

const countUniquePairings = (pairings, options, uniquePairs) => {
	const pairsMapping = {};
	// map each option to each other option
	options.forEach((option, index) => {
		// start at the next option
		for (let i = index + 1; i < options.length; i++) {
			// push the mapping
			pairsMapping[`${option} - ${options[i]}`] = 0;
		}
	});

	pairings.forEach(([A, B]) => {
		try {
			const one = uniquePairs.find(([a, b]) => a === A && b === B);
			const two = uniquePairs.find(([a, b]) => a === B && b === A);
			const keySet = one || two;
			const key = `${keySet[0]} - ${keySet[1]}`;
			pairsMapping[key] += 1;
		} catch (e) {
			console.error('Error counting pairings', e);
		}
	});

	return pairsMapping;
};

const countMapping = (pairings) => {
	const mapping = {};
	Object.entries(pairings).forEach(([, value]) => {
		if (!mapping[value]) mapping[value] = 0;
		mapping[value] += 1;
	});
	return mapping;
};

const Test = () => {
	const [pairs, setPairs] = React.useState([]);
	const [pairs2, setPairs2] = React.useState([]);
	const [options, setOptions] = React.useState(defaultOptions);
	const [uniquePairs, setUniquePairs] = React.useState(defaultUniquePairs);
	const [showCustomOptions, setShowCustomOptions] = React.useState(false);
	const [showPairings, setShowPairings] = React.useState(false);
	const [showQuantityCount, setShowQuantityCount] = React.useState(false);
	const [attemptsCount, setAttemptsCount] = React.useState(10);
	const [importing, setImporting] = React.useState(false);

	const toggleValue = (setFunc) => () => {
		setFunc((prev) => !prev);
	};

	const handleChange = (setFunc) => (event) => {
		setFunc(event.target.value);
	};

	React.useEffect(() => {
		const pairsResult = generatePairings();
		setPairs(pairsResult);
		const pairsResult2 = generatePairings2(uniquePairs);
		setPairs2(pairsResult2);
	}, []);

	React.useEffect(() => {
		const newPairs = [];
		options.forEach((option, index) => {
			// start at the next option
			for (let i = index + 1; i < options.length; i++) {
				// push the pair
				newPairs.push([option, options[i]]);
			}
		});
		setUniquePairs(newPairs);

		if (!importing) {
			const pairsResult2 = generatePairings2(newPairs);
			setPairs2(pairsResult2);
		}
		setImporting(false);
	}, [options]);

	const exportPattern = () => {
		setImporting(true);
		const patternString = pairs2.map(([A, B]) => `${A}:${B}-`).join('');
		const exportData = {
			patternString,
			options,
			ColorMapping,
		};
		const exportString = JSON.stringify(exportData);
		console.log(exportString);
		try {
			navigator.clipboard.writeText(exportString);
			alert('Copied to clipboard');
		} catch (e) {
			console.error('Unable to copy to clipboard trying backup method', e);
			unsecuredCopyToClipboard(exportString);
		}
	};
	const importPattern = () => {
		// const pattern =
		// 	'123143542512314354651631423483587517614624625635471481287257658628725715871861263253458468762712827867163123427467362382527537134124527517314384581531234284586516214284481471276286486436231281432472176156457437831851832852154154257267863853876856354384281261463473176126327387481431435475123123427467462432735785623673478468562512713783612672578548543513613683812832536546743723625685864834136186785725425485364354152182685635431481';
		const pattern = prompt('Enter Pattern');
		const pairsResult = [];

		const parsedObject = JSON.parse(pattern);

		if (typeof parsedObject === 'object') {
			const { patternString, options: optionsObj, ColorMapping: ColorMappingObj } = parsedObject;

			Object.entries(ColorMappingObj).forEach(([key, value]) => {
				ColorMapping[key] = value;
			});

			setOptions(optionsObj);
			const parsed = patternString.match(/(\d+):(\d+)-/g);
			parsed.forEach((pair) => {
				const [A, B] = pair.split(':');
				pairsResult.push([A, B.split('-')[0]]);
			});
		} else {
			for (let i = 0; i < pattern.length; i += 2) {
				pairsResult.push([pattern[i], pattern[i + 1]]);
			}
		}
		setPairs2(pairsResult);
	};
	const shufflePattern = () => {
		const pairsResult2 = generatePairings2(uniquePairs);
		setPairs2(pairsResult2);
	};
	const addOption = () => {
		const newOption = `${options.length + 1}`;
		setOptions((previous) => [...previous, newOption]);
		if (!ColorMapping[newOption]) ColorMapping[newOption] = 'orange';
	};
	const removeOption = () => {
		setOptions((previous) => previous.slice(0, -1));
		delete ColorMapping[options.length];
	};

	const setColor = (index) => (event) => {
		ColorMapping[index] = event.target.value;
		setOptions((previous) => [...previous]);
	};

	const colorCount = countUniquePairings(pairs2, options, uniquePairs);
	const mappingCount = countMapping(colorCount);

	const findBestOf = (count) => {
		let best = calculateScore(Object.values(mappingCount)) || 100000;
		if (isNaN(best)) best = 100000;
		let bestPairs = [...pairs2];
		for (let i = 0; i < count; i++) {
			const currentPairings = generatePairings2(uniquePairs);
			const currentColorCount = countUniquePairings(currentPairings, options, uniquePairs);
			const currentMappingCount = countMapping(currentColorCount);
			const mappingValues = Object.values(currentMappingCount);
			let score = calculateScore(mappingValues);
			if (score < best) {
				best = score;
				bestPairs = currentPairings;
			}
		}
		setPairs2(bestPairs);
	};

	return (
		<div>
			<div>
				<p>Key</p>
				{Object.entries(ColorMapping).map(([key, value]) => (
					<div
						key={key}
						style={{ display: 'inline-block', width: '100px', backgroundColor: ColorMapping[key] }}
					>
						{key}: {value}
					</div>
				))}
			</div>

			<FormControlLabel
				control={
					<Switch checked={showCustomOptions} onChange={toggleValue(setShowCustomOptions)} />
				}
				label="Show Customization Options"
			/>
			<Collapse in={showCustomOptions}>
				<div>
					<button onClick={exportPattern}>Export Pattern</button>
					<button onClick={importPattern}>Import Pattern</button>
					<button onClick={shufflePattern}>Shuffle Pattern</button>
				</div>
				<div>
					<p>Colors</p>
					<Fab color="primary" aria-label="remove">
						<RemoveIcon onClick={removeOption} />
					</Fab>
					<Fab color="primary" aria-label="add">
						<AddIcon onClick={addOption} />
					</Fab>
				</div>
				<div>
					<br />
					{options.map((option) => (
						<TextField
							key={option}
							value={ColorMapping[option]}
							onChange={setColor(option)}
							label={`Color ${option}`}
							variant="outlined"
						/>
					))}
				</div>
			</Collapse>
			<div>
				<p></p>
				<FormControlLabel
					control={<Switch checked={showPairings} onChange={toggleValue(setShowPairings)} />}
					label="Show Unique Pairings"
				/>
				<Collapse in={showPairings}>
					{Object.entries(colorCount).map(([key, value]) => (
						<PairCount key={key}>
							<Pairing A={key.split(' - ')[0]} B={key.split(' - ')[1]} />
							<b style={{ marginLeft: 10 }}>{key}</b>: {value}
						</PairCount>
					))}
				</Collapse>
				<FormControlLabel
					control={
						<Switch checked={showQuantityCount} onChange={toggleValue(setShowQuantityCount)} />
					}
					label="Show Quantity Count"
				/>

				<Collapse in={showQuantityCount}>
					{Object.entries(mappingCount).map(([key, value]) => (
						<div key={key}>
							<b style={{ marginLeft: 10 }}>{key}</b>: {value}
						</div>
					))}
					<Button onClick={() => findBestOf(attemptsCount)}>Optimize</Button>
					<TextField
						id="standard-number"
						label="Number"
						type="number"
						InputLabelProps={{
							shrink: true,
						}}
						variant="standard"
						value={attemptsCount}
						onChange={handleChange(setAttemptsCount)}
					/>
				</Collapse>
			</div>
			<Quilt2>
				{pairs2.map(([option1, option2], index) => {
					const row = Math.floor(index / 12);
					const swapAngle = row % 2 === 0 ? 1 : 0;
					return <Pairing key={index} A={option1} B={option2} angle={(index + swapAngle) % 2} />;
				})}
			</Quilt2>
			<br />
			<br />
			<div>
				Original attempt&apos;s quilt:
				<Quilt>
					{pairs.map(([option1, option2], index) => {
						const row = Math.floor(index / 12);
						const swapAngle = row % 2 === 0 ? 1 : 0;
						return <Pairing key={index} A={option1} B={option2} angle={(index + swapAngle) % 2} />;
					})}
				</Quilt>
			</div>
		</div>
	);
};

export default Test;
