// take a maze and return a path through it

/**
 *
 * @param {[[{north: boolean, south: boolean, east: boolean, west: boolean}]]} maze A 2D array of cells
 * @returns {string[]} An array of coordinates that represent a path through the maze
 */
export default function traverseMaze3D(maze) {
	const end = `${maze[0].length - 1},${maze.length - 1},${maze[0][0].length - 1}`;
	console.log('BBBB ---------3D-----------');

	//TODO: traverse the maze and return a path through it
	const traverseMaze = (x, y, z, previousLocations = []) => {
		const currentLocation = `${x},${y},${z}`;
		const {
			north: northWall,
			south: southWall,
			east: eastWall,
			west: westWall,
			up: upWall,
			down: downWall,
		} = maze[y][x][z];
		if (currentLocation === end) {
			console.log('Made it to the end of the maze!');
			return previousLocations;
		}
		console.log(`BBBB currentLocation ${currentLocation}: previousLocations: ${previousLocations}`);
		console.log(
			`BBBB northWall: ${northWall}, southWall: ${southWall}, eastWall: ${eastWall}, westWall: ${westWall}, upWall: ${upWall}, downWall: ${downWall}`,
		);

		let path = [];
		if (!northWall && !previousLocations.includes(`${x},${y - 1},${z}`)) {
			const pathn = traverseMaze(x, y - 1, z, [...previousLocations, currentLocation]);
			if (pathn.length) path = pathn;
		}
		if (!southWall && !previousLocations.includes(`${x},${y + 1},${z}`)) {
			const paths = traverseMaze(x, y + 1, z, [...previousLocations, currentLocation]);
			if (paths.length) path = paths;
		}
		if (!eastWall && !previousLocations.includes(`${x + 1},${y},${z}`)) {
			const pathe = traverseMaze(x + 1, y, z, [...previousLocations, currentLocation]);
			if (pathe.length) path = pathe;
		}
		if (!westWall && !previousLocations.includes(`${x - 1},${y},${z}`)) {
			const pathw = traverseMaze(x - 1, y, z, [...previousLocations, currentLocation]);
			if (pathw.length) path = pathw;
		}
		if (!upWall && !previousLocations.includes(`${x},${y},${z + 1}`)) {
			const pathu = traverseMaze(x, y, z + 1, [...previousLocations, currentLocation]);
			if (pathu.length) path = pathu;
		}
		if (!downWall && !previousLocations.includes(`${x},${y},${z - 1}`)) {
			const pathd = traverseMaze(x, y, z - 1, [...previousLocations, currentLocation]);
			if (pathd.length) path = pathd;
		}

		return path;
	};
	const path = traverseMaze(0, 0, 0, []);

	// Example return array = ['0,0', '0,1', '1,1'] = ['x,y', 'x,y', 'x,y']
	return path;
}
