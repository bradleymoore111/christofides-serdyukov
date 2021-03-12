function getRandomPoint() {
	return [Math.random() * 200 - 100, Math.random() * 200 - 100];
}

function getRandomPoints(n) {
	if (n < 1 || !n) {
		n = 100;
	}

	const points = [];

	for (let i=0; i<n; i++) {
		points.push(getRandomPoint())
	}

	return points;
}

let matrix = [];

function setAdjacency(points) {
	matrix = [];

	const n = points.length

	for (let i=0; i<n; i++) {
		matrix[i] = [];
		for (let j=0; j<n; j++) {
			matrix[i][j] = Infinity
		}
	}

	for (let i=0; i<n; i++) {
		matrix[i][i] = 0;
		for (let j=i+1; j<n; j++) {
			matrix[i][j] = matrix[j][i] = 
				Math.pow(points[i][0] - points[j][0], 2) + 
				Math.pow(points[i][1] - points[j][1], 2)
		}
	}

	return matrix;
}

function edgeWeight(e) {
	return matrix[e[0]][e[1]];
}

// Technically this is a different algorithm than Prim's.
function getMinimumSpanningTree() {
	// Generate a list of all edges.
	const edges = [];

	for (let i=0; i<matrix.length; i++) {
		for (let j=i+1; j<matrix[i].length; j++) {
			edges.push([i, j]);
		}
	}

	edges.sort((a, b) => edgeWeight(a) - edgeWeight(b));

	function union(setA, setB) {
		const _union = new Set(setA);
		for (const elem of setB) {
			_union.add(elem);
		}
		return _union;
	}

	const tree = [];
	const connections = new Set();

	for (const edge of edges) {
		leftConnection = null;
		rightConnection = null;

		for (const connection of connections) {
			if (connection.has(edge[0])) {
				leftConnection = connection;
			}

			if (connection.has(edge[1])) {
				rightConnection = connection;
			}
		}

		if (leftConnection == null && rightConnection == null) {
			connections.add(new Set(edge));
			tree.push(edge);
		} else if (leftConnection == rightConnection) {
			// Do nothing.
		} else if (leftConnection != null && rightConnection != null) {
			connections.delete(leftConnection);
			connections.delete(rightConnection);
			connections.add(union(leftConnection, rightConnection));

			tree.push(edge);
		} else {
			tree.push(edge);
			if (leftConnection != null) {
				leftConnection.add(edge[1]);
			} else {
				rightConnection.add(edge[0]);
			}
		}
	}

	return tree;
}

function getOddVertexes(spanningTreeEdges) {
	const degree = [];
	for (let i=0; i<matrix.length; i++) {
		degree[i] = 0;
	}

	for (const edge of spanningTreeEdges) {
		degree[edge[0]]++;
		degree[edge[1]]++;
	}

	const oddVertexes = [];
	for (let i=0; i<matrix.length; i++) {
		if (degree[i] % 2 == 1) {
			oddVertexes.push(i);
		}
	}

	return oddVertexes;
}

function getPerfectMatching(vertexList, avoidList) {
	if (!avoidList) {
		avoidList = [];
	}

	// console.log("VertexList/AvoidList", vertexList, avoidList);

	// Generate edges for the blossom solver.
	const oddEdges = [];
	for (let i=0; i<vertexList.length; i++) {
		for (let j=i+1; j<vertexList.length; j++) {
			// Actually, if the edge is in the spanning tree, don't include it.
			let inAvoid = false;
			for (const edge of avoidList) {
				if (edge[0] == vertexList[i] && edge[1] == vertexList[j]) {
					inAvoid = true;
				}
			}

			if (!inAvoid) {
				oddEdges.push(
					[vertexList[i], vertexList[j], 1 / matrix[i][j]]);
			}
		}
	}

	const e = new Edmonds(oddEdges);
	const results = e.maxWeightMatching();

	const perfectMatching = [];
	for (let i=0; i<results.length; i++) {
		const r = results[i];
		if (r < i) {
			continue;
		}

		perfectMatching.push([i, r]);
	}

	return perfectMatching;
}

function getEulerTour(edges) {
	return eulerian({
		edges: edges
	});
}

function skipRepeated(vertexes) {
	const seen = new Set();

	const newPath = [];
	for (const v of vertexes) {
		if (seen.has(v)) {
			continue;
		} else {
			newPath.push(v);
			seen.add(v);
		}
	}

	return newPath;
}

function ChristofidesSerdyukovApproximate(points) {
	if (points == undefined) {
		points = getRandomPoints();
	}

	if (points.length == 0) {
		return [];
	}

	if (points.length == 1) {
		return [0];
	}
	matrix = setAdjacency(points);

	const spanningTreeEdges = getMinimumSpanningTree();

	// console.log("Spanning tree:", spanningTreeEdges);

	const oddVertexes = getOddVertexes(spanningTreeEdges);

	// console.log("Odd vertexes:", oddVertexes);

	const oddMatching = getPerfectMatching(oddVertexes, spanningTreeEdges);

	const unionEdges = spanningTreeEdges.concat(oddMatching);

	// Quickly make sure that an edge isn't in both.
	for (const sEdge of spanningTreeEdges)
		for (const oEdge of oddMatching)
			if (sEdge[0] == oEdge[0] && sEdge[1] == oEdge[1])
				console.log("Solve that plz.", sEdge);

	const tour = skipRepeated(getEulerTour(unionEdges));

	// console.log(tour);

	return tour;
}

// ChristofidesSerdyukovApproximate(getRandomPoints(10));