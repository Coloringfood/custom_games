function generateMaze3D(width, height, depth) {
	if (width < 2 || height < 2 || depth < 2) {
		throw new Error('Width, height, and depth must be at least 2');
	}

	const maze = [];
	for (let y = 0; y < height; y++) {
		maze.push([]);
		for (let x = 0; x < width; x++) {
			maze[y].push([]);
			for (let z = 0; z < depth; z++) {
				maze[y][x].push({
					x,
					y,
					z,
					north: true,
					south: true,
					east: true,
					west: true,
					up: true,
					down: true,
					visited: false,
				});
			}
		}
	}
	const stack = [];

	const currentCell = maze[0][0][0];
	stack.push(currentCell);
	while (stack.length > 0) {
		const currentCell = stack[stack.length - 1];
		const neighbors = [];
		if (currentCell.north && currentCell.y > 0) {
			neighbors.push(maze[currentCell.y - 1][currentCell.x][currentCell.z]);
		}
		if (currentCell.south && currentCell.y < height - 1) {
			neighbors.push(maze[currentCell.y + 1][currentCell.x][currentCell.z]);
		}
		if (currentCell.east && currentCell.x < width - 1) {
			neighbors.push(maze[currentCell.y][currentCell.x + 1][currentCell.z]);
		}
		if (currentCell.west && currentCell.x > 0) {
			neighbors.push(maze[currentCell.y][currentCell.x - 1][currentCell.z]);
		}
		if (currentCell.up && currentCell.z > 0) {
			neighbors.push(maze[currentCell.y][currentCell.x][currentCell.z - 1]);
		}
		if (currentCell.down && currentCell.z < depth - 1) {
			neighbors.push(maze[currentCell.y][currentCell.x][currentCell.z + 1]);
		}
		if (neighbors.length > 0) {
			const nextCell = neighbors[Math.floor(Math.random() * neighbors.length)];
			if (nextCell.visited) {
				stack.pop();
			} else {
				if (nextCell.x === currentCell.x) {
					if (nextCell.y === currentCell.y) {
						if (nextCell.z > currentCell.z) {
							currentCell.up = false;
							nextCell.down = false;
						} else {
							currentCell.down = false;
							nextCell.up = false;
						}
					} else {
						if (nextCell.y > currentCell.y) {
							currentCell.south = false;
							nextCell.north = false;
						} else {
							currentCell.north = false;
							nextCell.south = false;
						}
					}
				} else {
					if (nextCell.x > currentCell.x) {
						currentCell.east = false;
						nextCell.west = false;
					} else {
						currentCell.west = false;
						nextCell.east = false;
					}
				}
				nextCell.visited = true;
				stack.push(nextCell);
			}
		} else {
			stack.pop();
		}
	}
	return maze;
}

export default generateMaze3D;
