// IRO stands for Intelligent Rocket Organism.


// <-------------------------------IRO Variables------------------------------->

// number by which the strength of an engine is multiplied to get its radius
var sizeToStrengthRatio,

maxSize, // maximum distance between any two vertices on every IRO
// (prevents the evolution of an IRO that will just cover the entire world and
// destroy everything)

// number by which the strength of an engine is multiplied to get the amount of
// fuel it consumes each time it is fired
fuelToStrengthRatio = 0.005,

// number by which the fuel an engine requires is multiplied to get the decrease
// in an IRO's health it causes
healthToFuelRatio = 1,

hungerHealthLoss = 1, // amount of health an IRO loses when hungry

eatingRestTime = 100, // time that can pass before an IRO becomes hungry

minMatingAge = 20, // minimum age an IRO must reach before it can mate

matingRestTime = 1, // time that must pass before an IRO can mate again

// amount by which the vector from an IRO to its target is scaled when it is
// choosing an engine to fire
targetScaling = 10000,

// number by which the x- or y-component of an IRO's acceleration is multiplied
// when determining the velocity with which it bounces off a wall
minVelocityCoeff = 3.,
// (If component of the velocity orthogonal to the wall has an absolute value
// less than the absolute value of that component of the acceleration times the
// minVelocityCoeff, that component of the velocity is multiplied by 0 instead
// of the minVelocityCoeff in order to stop objects from jittering after they
// push against a wall for too long.)

// number by which the x- or y-component of an IRO's velocity is multiplied when
// the IRO hits a wall
wallBounceCoeff = -0.2,

// Healthy Pop 0 Color: rgb(50,205,50) - limegreen
// Healthy Pop 1 Color: rgb(0,191,255) - deepskyblue
// Healthy Pop 2 Color: rgb(147,112,219) - mediumpurple
// Healthy Pop 3 Color: rgb(210,105,30) - chocolate
rValues = [ 50,   0, 147, 210],
gValues = [205, 191, 112, 105],
bValues = [ 50, 255, 219,  30],

// Full Inactive Engine Color: rgb(192,192,192) - silver
inactRValue = 192,
inactGValue = 192,
inactBValue = 192,

// Full Active Engine Color: rgb(206,32,41) - fire engine red
// (Yes, that is the actual name of the color.)
actRValue = 206,
actGValue =  32,
actBValue =  41;


// <---------------------------Bin-Lattice Variables--------------------------->

// The bin-lattice is used to drastically improve efficiecy by splitting the
// world into numCols * numRows "bins", where each bin contains at most
// binCapacity elements. A bin will consist of anything that lies within that
// bin, as well as anything that lies within an adjacent bin. Any IRO will only
// have to look at elements of its own bin in order to decide on an action,
// instead of having to loop over everything in the world. (Note:
// defaultBinCapacity and targetBinFill may be tweaked to improve performance.)

var lattice, // array containing pointers to all the bins

binLengths, // array containing the lengths of all the bins

numCols, numRows, // the lattice's resolution
// (to be adjusted based on the size of the ecosystem)

binCapacity, // maximum length a bin can have before the lattice is resized
// (to be adjusted when the lattice's resolution cannot be increased any
// further, i.e., when an increase in the resolution will result in at least one
// of a bin's sides being shorter than maxSize, which is the maximum length of
// an IRO)

defaultBinCapacity = 900, // default value of binCapacity

// on average, the percentage of a bin that is full at any given time
targetBinFill = 0.1;


// <------------------------------World Variables------------------------------>

var worldWidth, worldHeight, // width and height of the world in pixels
// (These are exactly the same as world.width and world.height, but it's better
// to only use the world variable when actually drawing to the canvas.)

ecosystem, // array containing all the IROs in the world

ecosystemSize, // number of elements in the ecosystem

// array containing IROs that should be removed from the ecosystem
toRemove = [],

// initial number of IROs in each population
initialPop0, initialPop1, initialPop2, initialPop3,

// amount of fuel in a newly-born IRO in each population
startingFuel0, startingFuel1, startingFuel2, startingFuel3,

// health of a newly-born IRO in each population
startingHealth0, startingHealth1, startingHealth2, startingHealth3,

// mutation rate of an IRO's genome in each population
mutationRate0, mutationRate1, mutationRate2, mutationRate3,

// genomes of each IRO population
initialGen0, initialGen1, initialGen2, initialGen3,

// smallest dimensions the world can have in pixels
minWorldWidth = 300, minWorldHeight = 200,

// factor by which the size of the ecosystem is multiplied when it is first
// created to allow for new objects to be inserted
ecosystemExpansionFactor = 10,

// variable that determines how many IROs are deleted from the ecosystem when
// randomly populating the world is taking too long
backstepLength = 10,

// maximum number of times the last several IROs in the ecosystem can be deleted
// before the inital populations are decreased
maxnumBacksteps = 100,

// maximum number of times a new IRO can be assigned new x- and y-coordinates
// and a new angle before the last several IROs in the ecosystem are deleted
maxNumFailures = 1000,

// boolean that denotes whether the size of the world has changed since the last
// time the step function was called
worldResized = false;

// boolean that denotes whether the current simulation is being animated for the
// first time
firstTimeAnimating = true;


// <-----------------------------Drawing Variables----------------------------->

var world = document.getElementById('canvas'), // canvas that covers the screen

ctx = world.getContext('2d'), // drawing context of the canvas

request = null, // current request for an animation frame

// cross-browser requestAnimationFrame method
requestAnimationFrame =
window.requestAnimationFrame || window.mozRequestAnimationFrame ||
window.webkitRequestAnimationFrame || window.msRequestAnimationFrame,

// cross-browser cancelAnimationFrame method
cancelAnimationFrame =
window.cancelAnimationFrame || window.mozCancelAnimationFrame;



// <--------------------------------Useful Math-------------------------------->

// Oxymoronic, of course. Math is never actually useful.

function distSq(x0, y0, x1, y1) {
	return (x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1);
}

function dist(x0, y0, x1, y1) {
	return Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1));
}

function rotatePoints(points, newPoints, theta) {
	// Fill the newPoints array with the old points rotated about the origin by
	// theta radians.
	var pos = 0, s = Math.sin(theta), c = Math.cos(theta), x, y;
	while (pos < points.length) {
		x = points[pos];
		y = points[pos + 1];
		newPoints[pos++] = x * c - y * s;
		newPoints[pos++] = x * s + y * c;
	}
}

function translatePoints(points, dx, dy) {
	// Modify the points array so that each point is translated by dx,dy.
	var pos = 0;
	while (pos < points.length) {
		points[pos++] += dx;
		points[pos++] += dy;
	}
}

function areIntersecting(points1, points2) {
	// Determine if the polygons defined by the two sequences of points are
	// intersecting by checking if any of the edges of the first polygons cross
	// any of the edges of the second. Checking if the edge defined by points
	// x1,y1 and x2, y2 intersects the edge defined by x3,y3 and x4,y4 is done
	// with a variation of the algorithm described at
	// http://www.geeksforgeeks.org/check-if-two-given-line-segments-intersect/
	// (here, any triplet of points is assumed not to be collinear, which is
	// pretty much guaranteed to be true since the coordinates are doubles, not
	// integers).
	var x1 = points1[0], y1 = points1[1], x2, y2, x3, y3, x4, y4,
	pos1 = 2, pos2;
	while (pos1 < points1.length) {
		x2 = points1[pos1++];
		y2 = points1[pos1++];
		x3 = points2[0];
		y3 = points2[1];
		pos2 = 2;
		while (pos2 < points2.length) {
			x4 = points2[pos2++];
			y4 = points2[pos2++];
			if (
				((y2 - y1) * (x3 - x2) - (x2 - x1) * (y3 - y2) > 0) !=
				((y2 - y1) * (x4 - x2) - (x2 - x1) * (y4 - y2) > 0) &&
				((y4 - y3) * (x1 - x4) - (x4 - x3) * (y1 - y4) > 0) !=
				((y4 - y3) * (x2 - x4) - (x4 - x3) * (y2 - y4) > 0)
				) {
				return true;
			}
			x3 = x4;
			y3 = y4;
		}
		x1 = x2;
		y1 = y2;
	}
	return false;
}

// <---------------------------IRO Helping Functions--------------------------->

function getVertices(genome, geneStart, geneStop) {
	// Construct an array that will contain the x- and y-coordinates of the
	// IRO's body relative to vertex 0 (including vertex 0 itself, hence the
	// additional two spaces in the array).
	var vertices = new Array(geneStop - geneStart + 2);
	// Vertex 0 is always at 0,0.
	vertices[0] = 0.;
	vertices[1] = 0.;
	var pos = 2;
	// Go through the rest of the vertices.
	while (geneStart < geneStop) {
		vertices[pos++] = genome[geneStart++];
		vertices[pos++] = genome[geneStart++];
	}
	return vertices;
}

function getPerimeterPositions(vertices) {
	// Construct an array that will contain the perimeter positions of vertex 1,
	// vertex 2, vertex 3, and so on until the last vertex, followed by the
	// perimeter itself. The perimeter position denotes the distance that must
	// be traveled along the IRO's perimeter to get from vertex 0 to another
	// point on the perimeter.
	var perimeterPositions = new Array(vertices.length / 2),
	firstVertexX = vertices[2], firstVertexY = vertices[3],
	secondVertexX, secondVertexY,
	pos = 4, coordNum = 1;
	// Make the first perimeter position the distance from vertex 0 to vertex 1.
	perimeterPositions[0] = dist(0, 0, firstVertexX, firstVertexY);
	// Go through the rest of the vertices.
	while (coordNum < perimeterPositions.length - 1) {
		secondVertexX = vertices[pos++];
		secondVertexY = vertices[pos++];
		perimeterPositions[coordNum] = perimeterPositions[coordNum - 1] +
		dist(firstVertexX, firstVertexY, secondVertexX, secondVertexY);
		firstVertexX = secondVertexX;
		firstVertexY = secondVertexY;
		coordNum++;
	}
	perimeterPositions[coordNum] = perimeterPositions[coordNum - 1] +
	dist(firstVertexX, firstVertexY, 0, 0);
	return perimeterPositions;
}

function getEnginesAndLinAccels(genome, geneStart, geneStop, vertices) {
	// If there are no engines, return two empty arrays.
	if (geneStart == geneStop) {
		return [[], []];
	}

	var linearCoordinates = getPerimeterPositions(vertices),
	// Save the last value in the linearCoordinates array, which is currently
	// the perimeter of the IRO.
	perimeter = linearCoordinates[linearCoordinates.length - 1],
	// Normalize the coordinates by dividing each one by the perimeter.
	pos = 0;
	while (pos < linearCoordinates.length) {
		linearCoordinates[pos++] /= perimeter;
	}

	// Construct one array that will contain the x- and y-coordinates of the
	// IRO's engines and another array that will contain the x- and y-components
	// of the linear acceleration produced when each engine is fired.
	var engines = new Array((geneStop - geneStart) * 2),
	linAccels = new Array((geneStop - geneStart) * 2),
	edgesPassed = 0, edgeLength, coord,
	firstVertexX, firstVertexY, secondVertexX, secondVertexY;

	// Update the engines and linAccels arrays for the first engine.
	coord = genome[geneStart++];
	// Determine the edge on which this engine is located.
	while (coord > linearCoordinates[edgesPassed]) {
		edgesPassed++;
	}
	// Find the vertices and length of the edge on which this engine is located.
	firstVertexX = vertices[2 * edgesPassed];
	firstVertexY = vertices[2 * edgesPassed + 1];
	if (edgesPassed == linearCoordinates.length - 1) {
		secondVertexX = 0;
		secondVertexY = 0;
	}
	else {
		secondVertexX = vertices[2 * edgesPassed + 2];
		secondVertexY = vertices[2 * edgesPassed + 3];
	}
	edgeLength = dist(firstVertexX, firstVertexY, secondVertexX, secondVertexY);
	// Find how far along the edge the engine is located as a fraction of the
	// edge's length.
	if (edgesPassed == 0) {
		coord *= perimeter / edgeLength;
	}
	else {
		coord = (coord - linearCoordinates[edgesPassed - 1]) *
		perimeter / edgeLength;
	}
	// Find the x- and y-coordinates of the engine.
	engines[0] = (1 - coord) * firstVertexX + coord * secondVertexX;
	engines[1] = (1 - coord) * firstVertexY + coord * secondVertexY;
	// Find the vector along which the engine's force will point (the edge on
	// which this engine is located has two normal vectors, and this vector is
	// the normal that points inside the IRO's body).
	linAccels[0] = (firstVertexY - secondVertexY) / edgeLength;
	linAccels[1] = (secondVertexX - firstVertexX) / edgeLength;

	// Go through the rest of the engines.
	pos = 1;
	while (geneStart < geneStop) {
		coord = genome[geneStart++];
		// Check if the linear coordinate denotes a point on a different edge.
		if (coord > linearCoordinates[edgesPassed]) {
			edgesPassed++;
			while (coord > linearCoordinates[edgesPassed]) {
				edgesPassed++;
			}
			firstVertexX = vertices[2 * edgesPassed];
			firstVertexY = vertices[2 * edgesPassed + 1];
			if (edgesPassed == linearCoordinates.length - 1) {
				secondVertexX = 0;
				secondVertexY = 0;
			}
			else {
				secondVertexX = vertices[2 * edgesPassed + 2];
				secondVertexY = vertices[2 * edgesPassed + 3];
			}
			edgeLength =
			dist(firstVertexX, firstVertexY, secondVertexX, secondVertexY);
		}
		if (edgesPassed == 0) {
			coord *= perimeter / edgeLength;
		}
		else {
			coord = (coord - linearCoordinates[edgesPassed - 1]) *
			perimeter / edgeLength;
		}
		engines[2 * pos]     =
		(1 - coord) * firstVertexX + coord * secondVertexX;
		engines[2 * pos + 1] =
		(1 - coord) * firstVertexY + coord * secondVertexY;
		linAccels[2 * pos]     = (firstVertexY - secondVertexY) / edgeLength;
		linAccels[2 * pos + 1] = (secondVertexX - firstVertexX) / edgeLength;
		pos++;
	}

	return [engines, linAccels];
}

function getMassAndCenter(vertices, engines, engineStrengths) {
	// Construct an array that will contain the mass of the IRO, as well as the
	// x- and y-coordinates of its center of mass relative to vertex 0. The mass
	// of an IRO is equal to the area of its body plus the mass of its engines.
	var mass = 0., massTimesCenterX = 0., massTimesCenterY = 0.,
	firstVertexX = vertices[2], firstVertexY = vertices[3],
	secondVertexX, secondVertexY, triangleSignedArea,
	pos = 4;
	// At each step, consider the triangle with vertices 0,1,2, then with
	// vertices 0,2,3, then with vertices 0,3,4, and so on until the end of the
	// vetices array. Use the signed area of this triangle to calculate the mass
	// and the coordinates of the centroid, as per the formula specified at
	// https://en.wikipedia.org/wiki/Centroid#Centroid_of_polygon (the
	// difference between that formula and this algorithm is that it allows
	// vertex 0 to have coordinates other than 0,0, whereas here vertex 0 is
	// ignored).
	while (pos < vertices.length) {
		secondVertexX = vertices[pos++];
		secondVertexY = vertices[pos++];
		triangleSignedArea =
		firstVertexX * secondVertexY - secondVertexX * firstVertexY;
		mass += triangleSignedArea;
		massTimesCenterX += (firstVertexX + secondVertexX) * triangleSignedArea;
		massTimesCenterY += (firstVertexY + secondVertexY) * triangleSignedArea;
		firstVertexX = secondVertexX;
		firstVertexY = secondVertexY;
	}
	// If the vertices were listed in opposite order, negate everything to get
	// the correct values.
	if (mass < 0.) {
		mass *= -1;
		massTimesCenterX *= -1;
		massTimesCenterY *= -1;
	}
	// Halve mass so that it equals the area of the IRO's body, and divide
	// massTimesCenterX and massTimesCenterY by 6 so that they equal the
	// coordinates of the body's centroid times the body's area.
	mass /= 2.;
	massTimesCenterX /= 6.;
	massTimesCenterY /= 6.;

	if (engines.length > 0) {
		// Treat the IRO's body as a point particle, alongside the point
		// particles representing the IRO's engines. Use the formula specified
		// at https://en.wikipedia.org/wiki/Center_of_mass#A_system_of_particles
		// to find the total mass of the IRO and its center of mass.
		var curEngineMass;
		pos = 0;
		while (pos < engines.length) {
			curEngineMass =
			engineStrengths[pos / 2] * engineStrengths[pos / 2] *
			Math.PI * sizeToStrengthRatio * sizeToStrengthRatio;
			mass += curEngineMass;
			massTimesCenterX += curEngineMass * engines[pos++];
			massTimesCenterY += curEngineMass * engines[pos++];
		}
	}

	return [mass, massTimesCenterX / mass, massTimesCenterY / mass];
}

function getMoment(vertices, engines, engineStrengths) {
	// Calculate the moment of inertia of the IRO when rotating about the origin
	// (which should also be its center of mass). Use the area of the IRO's body
	// and of its engines as its total mass. To find the moment of inertia of
	// its body, use numerical integration to approximate the body with a series
	// of rectangles that have dimensions xIncrement,yIncrement. This process
	// involves calculating when a point is inside the IRO's body, which is
	// done using the last algorithm at http://alienryderflex.com/polygon/.
	// This algorithm makes the calculation efficient by using two arrays of
	// precalculated values, which here are named consts and coeffs.
	var consts = new Array(vertices.length / 2),
	coeffs = new Array(vertices.length / 2),
	firstVertexX = vertices[vertices.length - 2],
	firstVertexY = vertices[vertices.length - 1],
	secondVertexX, secondVertexY, deltaY,
	pos = 0, vertexNum;
	for (vertexNum = 0; vertexNum < consts.length; vertexNum++) {
		secondVertexX = vertices[pos++];
		secondVertexY = vertices[pos++];
		if (firstVertexY == secondVertexY) {
			consts[vertexNum] = secondVertexX;
			coeffs[vertexNum] = 0;
		}
		else {
			deltaY = firstVertexY - secondVertexY;
			consts[vertexNum] =
			secondVertexX - (secondVertexY * firstVertexX) / deltaY +
			(secondVertexY * secondVertexX) / deltaY;
			coeffs[vertexNum] =
			(firstVertexX - secondVertexX) / deltaY;
		}
		firstVertexX = secondVertexX;
		firstVertexY = secondVertexY;
	}

	// Get the minimum and maximum x- and y-coordinates of the IRO's body.
	var minX = Number.MAX_VALUE, minY = Number.MAX_VALUE,
	maxX = Number.MIN_VALUE, maxY = Number.MIN_VALUE,
	x, y;
	pos = 0;
	while (pos < vertices.length) {
		x = vertices[pos++];
		y = vertices[pos++];
		if (x < minX) {
			minX = x;
		}
		else if (x > maxX) {
			maxX = x;
		}
		if (y < minY) {
			minY = y;
		}
		else if (y > maxY) {
			maxY = y;
		}
	}

	var width = maxX - minX, height = maxY - minY,
	resolution = 10, xIncrement, yIncrement, areaIncrement, momentIncrement,
	xPos, yPos, x, y, pointInIRO, moment = 0.;
	// If the IRO is extremely thin, the resolution may need to be increased
	// several times in order for the moment to be nonzero.
	while (moment == 0.) {
		resolution *= 10;
		xIncrement = width / resolution;
		yIncrement = height / resolution;
		areaIncrement = xIncrement * yIncrement;
		// Set momentIncrement to the moment of inertia of a rectangle of width
		// xIncrement and height yIncrement rotating about its centroid, using
		// the area of the rectangle as its mass. The formula for the moment of
		// inertia of a rectangle rotating about its centroid can be found at
		// https://en.wikipedia.org/wiki/List_of_moments_of_inertia.
		momentIncrement = areaIncrement / 12 *
		(xIncrement * xIncrement + yIncrement * yIncrement);
		x = minX - xIncrement / 2;
		for (xPos = 0; xPos < resolution; xPos++) {
			x += xIncrement;
			y = minY - yIncrement / 2;
			for (yPos = 0; yPos < resolution; yPos++) {
				y += yIncrement;
				firstVertexY = vertices[vertices.length - 1];
				pointInIRO = false;
				for (vertexNum = 0; vertexNum < consts.length; vertexNum++) {
					secondVertexY = vertices[2 * vertexNum + 1];
					if (
						(
							firstVertexY < y && secondVertexY >= y ||
							secondVertexY < y && firstVertexY >= y
							) &&
						y * coeffs[vertexNum] + consts[vertexNum] < x
						) {
						pointInIRO = !pointInIRO;
					}
					firstVertexY = secondVertexY;
				}
				if (pointInIRO) {
					// Consider the rectangle of width xIncrement and height
					// yIncrement centered at x,y, and add its moment of inertia
					// when rotating about the origin to the IRO's total moment
					// of inertia. By the parallel axis theorem, the rectangle's
					// moment of inertia when rotating about the origin is equal
					// to the sum of its moment of inertia when rotating about
					// its centroid and its mass (which here is set equal to its
					// area) times its distance from the origin squared. A
					// description of the parallel axis theorem can be found at
					// https://en.wikipedia.org/wiki/Parallel_axis_theorem.
					moment += momentIncrement + areaIncrement * (x * x + y * y);
				}
			}
		}
	}

	if (engines.length > 0) {
		// Add the moments of inertia of the engines when rotating about the
		// origin to the IRO's total moment of inertia. This calculation can be
		// made relatively simple by considering the engines to be point
		// particles whose masses are equal to the engines' areas. The formula
		// for the moment of inertia of a point particle can be found at
		// https://en.wikipedia.org/wiki/List_of_moments_of_inertia.
		pos = 0;
		while (pos < engines.length) {
			x = engines[pos++];
			y = engines[pos++];
			moment +=
			engineStrengths[pos / 2 - 1] * engineStrengths[pos / 2 - 1] *
			Math.PI * sizeToStrengthRatio * sizeToStrengthRatio *
			(x * x + y * y);
		}
	}

	return moment;
}

function getEngineStrengths(genome, geneStart, geneStop) {
	// Construct an array that will contain the magnitude of the force each
	// engine produces when fired.
	var engineStrengths = new Array(geneStop - geneStart),
	pos = 0;
	while (geneStart < geneStop) {
		engineStrengths[pos++] = genome[geneStart++];
	}
	return engineStrengths;
}

function getAngAccelsAndScaleLinAccels(
	engines, engineStrengths, linAccels, mass, moment
	) {
	// Construct an array that will contain the angular acceleration each engine
	// produces when fired, and scale the linAccels array so that it contains
	// the magnitude of each linear acceleration vector (as well as the
	// direction, which was there to begin with).
	var angAccels = new Array(engineStrengths.length),
	engineStrength;
	for (var pos = 0; pos < engineStrengths.length; pos++) {
		engineStrength = engineStrengths[pos];
		// angular acceleration = (radiusX * forceY - radiusY * forceX) / moment
		angAccels[pos] = (
			engines[2 * pos] * linAccels[2 * pos + 1] -
			engines[2 * pos + 1] * linAccels[2 * pos]
			) * engineStrength / moment;
		// linear acceleration = force / mass
		linAccels[2 * pos] *= engineStrength / mass;
		linAccels[2 * pos + 1] *= engineStrength / mass;
	}
	return angAccels;
}

function mutateGenome(genome) {
	return genome;
}

function crossGenomes(genome1, genome2) {
	return genome1;
}

function getIROColor(id, health) {
	// Get a string representing the color of an IRO belonging to a given
	// population that has a given health.
	return 'rgb(' + [
	rValues[id] * health | 0, gValues[id] * health | 0, bValues[id] * health | 0
	].join(',') + ')';
}

function getInactiveEngineColor(fuel) {
	// Get a string representing the color of an inactive engine that has a
	// given amount of fuel.
	return 'rgb(' + [
	inactRValue * fuel | 0, inactGValue * fuel | 0, inactBValue * fuel | 0
	].join(',') + ')';
}

function getActiveEngineColor(fuel) {
	// Get a string representing the color of an active engine that has a given
	// amount of fuel.
	return 'rgb(' + [
	actRValue * fuel | 0, actGValue * fuel | 0, actBValue * fuel | 0
	].join(',') + ')';
}


// <------------------------------IRO Constructor------------------------------>

function IRO(genome, x, y, ang) {
	var numVertices = genome[1],
	vertices = getVertices(genome, 3, 2 * numVertices + 1),
	numEngines = genome[2],
	enginesAndLinAccels = getEnginesAndLinAccels(
		genome, 2 * numVertices + 1, 2 * numVertices + numEngines + 1, vertices
		),
	engines = enginesAndLinAccels[0],
	engineStrengths = getEngineStrengths(
		genome,
		2 * numVertices + numEngines + 1, 2 * numVertices + 2 * numEngines + 1
		),
	massAndCenter = getMassAndCenter(vertices, engines, engineStrengths),
	centerX = massAndCenter[1],
	centerY = massAndCenter[2];

	translatePoints(vertices, -centerX, -centerY);
	translatePoints(engines, -centerX, -centerY);

	var mass = massAndCenter[0],
	moment = getMoment(vertices, engines, engineStrengths),
	linAccels = enginesAndLinAccels[1],
	angAccels = getAngAccelsAndScaleLinAccels(
		engines, engineStrengths, linAccels, mass, moment
		),
	drawVertices = vertices.slice(),
	drawEngines = engines.slice();

	var id = genome[0], startingFuel, startingHealth;
	switch(id) {
		case 0:
		startingFuel = startingFuel0;
		startingHealth = startingHealth0;
		break;

		case 1:
		startingFuel = startingFuel1;
		startingHealth = startingHealth1;
		break;

		case 2:
		startingFuel = startingFuel2;
		startingHealth = startingHealth2;
		break;

		default:
		startingFuel = startingFuel3;
		startingHealth = startingHealth3;
	}

	// Constants

	this.genome = genome;
	this.id = id;

	this.vertices = vertices;
	this.engines = engines;
	this.engineStrengths = engineStrengths;

	this.mass = mass;
	this.moment = moment;
	this.linAccels = linAccels;
	this.angAccels = angAccels;

	var genPos = 2 * numVertices + 2 * numEngines + 1;
	this.predictionStep = genome[genPos++];
	this.fleeDesire = genome[genPos++];
	this.feedDesire = genome[genPos++];
	this.mateDesire = genome[genPos++];
	this.restDesire = genome[genPos];

	// Variables

	this.vx = 0;
	this.vy = 0;
	this.angV = 0;

	this.targetX = 0;
	this.targetY = 0;
	this.activeEngine = -1;

	this.age = 0;

	this.lastEating = 0;
	this.fuel = startingFuel;
	this.health = startingHealth;

	this.ableToMate = true;
	this.lastMating = 0;

	this.isBouncing = false;
	this.numBounces = 0;
	this.bounceVels = [];

	this.drawVertices = drawVertices;
	this.drawEngines = drawEngines;
	this.boundingBox = new Array(4);

	this.latticePos = 0;

	// Methods

	this.setXYAng = setXYAng;
	this.isAlive = isAlive;
	this.setBoundingBox = setBoundingBox;
	this.solveIntersections = solveIntersections;
	this.chooseTarget = chooseTarget;
	this.chooseEngine = chooseEngine;
	this.makeDecision = makeDecision;
	this.bounceOffWalls = bounceOffWalls;
	this.move = move;
	this.draw = draw;

	// Methods that need to be run upon initialization.

	this.setXYAng(x, y, ang);
	this.setBoundingBox();
}


// <--------------------------------IRO Methods-------------------------------->

function setXYAng(x, y, ang) {
	// Change the IRO's x- and y-coordinates, along with its heading, and change
	// its drawVertices and drawEngines array accordingly.
	this.x = x;
	this.y = y;
	this.ang = ang;
	rotatePoints(this.vertices, this.drawVertices, ang);
	rotatePoints(this.engines, this.drawEngines, ang);
	translatePoints(this.drawVertices, x, y);
	translatePoints(this.drawEngines, x, y);
}

function isAlive() {
	// Return whether this IRO is still alive. If it isn't, remove it from the
	// world.
	if (this.health <= 0) {
		toRemove.push(this);
		return false;
	}
	return true;
}

function setBoundingBox() {
	// Calculate the minimum and maximum x- and y-coordinates of this IRO and
	// store them in the boundingBox array.
	var drawEngines = this.drawEngines, engineStrengths = this.engineStrengths,
	drawVertices = this.drawVertices, boundingBox = this.boundingBox,
	minX = Number.MAX_VALUE, minY = Number.MAX_VALUE,
	maxX = Number.MIN_VALUE, maxY = Number.MIN_VALUE,
	x, y, r;

	var pos = 0;
	while (pos < drawEngines.length) {
		x = drawEngines[pos++];
		y = drawEngines[pos++];
		r = engineStrengths[pos / 2 - 1] * sizeToStrengthRatio;
		if (x - r < minX) {
			minX = x - r;
		}
		else if (x + r > maxX) {
			maxX = x + r;
		}
		if (y - r < minY) {
			minY = y - r;
		}
		else if (y + r > maxY) {
			maxY = y + r;
		}
	}

	pos = 0;
	while (pos < drawVertices.length) {
		x = drawVertices[pos++];
		y = drawVertices[pos++];
		if (x < minX) {
			minX = x;
		}
		else if (x > maxX) {
			maxX = x;
		}
		if (y < minY) {
			minY = y;
		}
		else if (y > maxY) {
			maxY = y;
		}
	}

	boundingBox[0] = minX;
	boundingBox[1] = minY;
	boundingBox[2] = maxX;
	boundingBox[3] = maxY;
}

function solveIntersections() {
	// Find all IROs with which this one is intersecting, and take appropriate
	// action based on which populations they belong to. Note: this assumes
	// that there is no more than one IRO that this one can mate with or bounce
	// off of.
	var neighbors = lattice[this.latticePos],
	numNeighbors = binLengths[this.latticePos],
	myBoundingBox = this.boundingBox, neighbor, otherBoundingBox,
	pos = 0;
	while (pos < numNeighbors) {
		neighbor = neighbors[pos++];
		otherBoundingBox = neighbor.boundingBox;
		if (!(
			myBoundingBox[0] > otherBoundingBox[2] || // myMinX > otherMaxX
			myBoundingBox[2] < otherBoundingBox[0] || // myMaxX < otherMinX
			myBoundingBox[1] > otherBoundingBox[3] || // myMinY > otherMaxY
			myBoundingBox[3] < otherBoundingBox[1]    // myMaxY < otherMinY
			)) {
			if (areIntersecting(this.drawVertices, neighbor.drawVertices)) {
				switch (neighbor.id) {
					case this.id + 1: // Be Eaten
					toRemove.push(this);
					return false;
					break;

					case this.id - 1: // Eat
					this.fuel = 1.0;
					this.health = Math.min(
						1.0,
						this.health +
						Math.sqrt(neighbor.mass) / Math.sqrt(this.mass)
						);
					this.lastEating = this.age;
					break;

					case this.id: // Mate
					if (
						this.ableToMate && neighbor.ableToMate &&
						this.age >= minMatingAge && neighbor.age >= minMatingAge
						) {
						this.ableToMate = false;
						this.lastMating = this.age;
						neighbor.ableToMate = false;
						neighbor.lastMating = neighbor.age;
						ecosystem[ecosystemSize++] = new IRO(
							mutateGenome(
								crossGenomes(this.genome, neighbor.genome)
							),
							(this.x + neighbor.x) / 2,
							(this.y + neighbor.y) / 2
						);
					}
					break;

					default: // Bounce off
					this.isBouncing = true;
					var coeff =
					2 * neighbor.mass / (this.mass + neighbor.mass) *
					(
						(this.vx - neighbor.vx) * (this.x - neighbor.x) +
						(this.vy - neighbor.vy) * (this.y - neighbor.y)
						) /
					(
						(this.x - neighbor.x) * (this.x - neighbor.x) +
						(this.y - neighbor.y) * (this.y - neighbor.y)
						);
					this.bounceVels[2 * this.numBounces] =
					this.vx - coeff * (this.x - neighbor.x);
					this.bounceVels[2 * this.numBounces + 1] =
					this.vy - coeff * (this.y - neighbor.y);
					this.numBounces++;
				}
			}
		}
	}
	return true;
}

function chooseTarget() {
	var neighbors = lattice[this.latticePos],
	numNeighbors = binLengths[this.latticePos],
	futureX = this.x + this.vx * this.predictionStep,
	futureY = this.y + this.vy * this.predictionStep,
	mySpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy),
	neighborSpeed, distNeighborToFutureMe, distNeighborPathToFutureMe,
	neighborValue, desiredNeighbor = 0, chosenDesireValue = 0,
	pos = 0;
	while (pos < numNeighbors) {
		neighbor = neighbors[pos++];
    if (neighbor == this) {
      continue;
    }
		neighborSpeed = Math.sqrt(
			neighbor.vx * neighbor.vx + neighbor.vy * neighbor.vy
			);
		distNeighborToFutureMe = dist(neighbor.x, neighbor.y, futureX, futureY);
		if (neighborSpeed != 0) {
			distNeighborPathToFutureMe = Math.abs(
				neighbor.vy * futureX - neighbor.vx * futureY -
				neighbor.vy * neighbor.x + neighbor.vx * neighbor.y
				) / neighborSpeed;
			neighborValue = distNeighborPathToFutureMe / mySpeed + Math.abs(
				Math.sqrt(
					distNeighborToFutureMe * distNeighborToFutureMe -
					distNeighborPathToFutureMe * distNeighborPathToFutureMe
					) / neighborSpeed
				);
		}
		else if (mySpeed != 0) {
			neighborValue = distNeighborToFutureMe / mySpeed;
		}
		else {
			neighborValue = distNeighborToFutureMe /
			Math.sqrt(
				this.linAccels[0] * this.linAccels[0] +
				this.linAccels[1] * this.linAccels[1]
				) / this.predictionStep * 2;
		}
		switch (neighbor.id) {
			case this.id + 1: // Flee
			desireValue = this.fleeDesire / neighborValue;
			if (desireValue > Math.abs(chosenDesireValue)) {
				chosenDesireValue = -desireValue;
				desiredNeighbor = pos - 1;
			}
			break;

			case this.id - 1: // Feed
			desireValue = this.feedDesire / neighborValue;
			if (desireValue > Math.abs(chosenDesireValue)) {
				chosenDesireValue = desireValue;
				desiredNeighbor = pos - 1;
			}
			break;

			case this.id: // Mate
			desireValue = this.mateDesire / neighborValue;
			if (
				this.ableToMate && this.age > minMatingAge &&
				desireValue > Math.abs(chosenDesireValue)
				) {
				chosenDesireValue = desireValue;
				desiredNeighbor = pos - 1;
			}
		}
	}
	if (chosenDesireValue == 0 || Math.abs(chosenDesireValue) * this.restDesire > this.fuel) {
		this.targetX = this.x;
		this.targetY = this.y;
	}
	else {
		this.targetX = (neighbors[desiredNeighbor].x - this.x) *
		Math.sign(chosenDesireValue) * targetScaling;
		this.targetY = (neighbors[desiredNeighbor].y - this.y) *
		Math.sign(chosenDesireValue) * targetScaling;
	}
}

function chooseEngine() {
	// Predict where the IRO will be after predictionStep frames depending on
	// which engine it fires, then set the activeEngine to the one that will
	// result in the IRO being closet to the target. If there is not enough fuel
	// to fire the engine that will result in the IRO being closest (or if every
	// engine will result in the IRO being further than if it had not fired any
	// engine) set the activeEngine to -1. If an engine is being fired, decrease
	// the fuel by the strength of the engine times the fuelToStrengthRatio
	// divided by the square root of the IRO's mass, and decrease the health by
	// that amount times the healthToFuelRatio.
	if (this.targetX == this.x && this.targetY == this.y) {
		this.activeEngine = -1;
		return;
	}

	var time, minDistanceSquared,
	x = this.x, y = this.y, ang = this.ang,
	vx = this.vx, vy = this.vy, angV = this.angV;
	for (time = 0; time < this.predictionStep; time++) {
		x += vx;
		y += vy;
		ang += angV;
	}
	this.activeEngine = -1;
	minDistanceSquared = distSq(x, y, this.targetX, this.targetY);

	var linAccels = this.linAccels, angAccels = this.angAccels,
	engine, ax, ay, angA, c, s, axPrime, ayPrime, distanceSquared;
	for (engine = 0; engine < angAccels.length; engine++) {
		ax = linAccels[2 * engine];
		ay = linAccels[2 * engine + 1];
		angA = angAccels[engine];
		x = this.x; y = this.y; ang = this.ang;
		vx = this.vx; vy = this.vy; angV = this.angV;
		for (time = 0; time < this.predictionStep; time++) {
			c = Math.cos(ang);
			s = Math.sin(ang);
			axPrime = ax * c - ay * s;
			ayPrime = ax * s + ay * c;
			vx += axPrime;
			vy += ayPrime;
			angV += angA;
			x += vx;
			y += vy;
			ang += angV;
		}
		distanceSquared = distSq(x, y, this.targetX, this.targetY);
		if (distanceSquared < minDistanceSquared) {
			minDistanceSquared = distanceSquared;
			this.activeEngine = engine;
		}
	}

	if (this.activeEngine > -1) {
		var requiredFuel = this.engineStrengths[this.activeEngine] *
		fuelToStrengthRatio / Math.sqrt(this.mass);
		if (this.fuel < requiredFuel) {
			this.activeEngine = -1;
		}
		else if (this.id > 0) {
			this.fuel -= requiredFuel;
			this.health -= requiredFuel * healthToFuelRatio;
		}
	}
}

function makeDecision() {
	if (this.isAlive() && this.solveIntersections()) {
		this.chooseTarget();
		this.chooseEngine();
	}
}

function bounceOffWalls() {
	// Check if any part of an IRO is outside the boundaries of the world, i.e.
	// the x-coordinate is less than 0 or greater than worldWidth, or the
	// y-coordinate is less than 0 or greater than worldHeight. If an
	// adjustment is required, the IRO is translated so that it is tangent to
	// the boundary of the world, and its velocity is adjusted. If the
	// component of its velocity perpendicular to the boundary it is colliding
	// with is sufficiently small, it is set to 0 (to prevent jittery behavior
	// when IROs push against the walls). Otherwise, it is multiplied by the
	// wallBounceCoeff. Also, if the IRO is colliding with the rightmost or
	// bottommost wall, then it is not translated to be exactly tangent to that
	// wall, as that would result in IRO.x/worldWidth or IRO.y/worldHeight being
	// equal to 1, which would break the lattice's addIRO method. So, in those
	// cases, the IRO is translated to be an Epsilon away from the wall (Epsilon
	// being the number with the smallest magnitude that Javascript can handle).
	var dx = 0., dy = 0., boundingBox = this.boundingBox;

	if (boundingBox[0] < 0) {
		dx = -boundingBox[0];
	}
	else if (boundingBox[2] >= worldWidth) {
		dx = worldWidth * (1 - Number.EPSILON) - boundingBox[2];
	}

	if (boundingBox[1] < 0) {
		dy = -boundingBox[1];
	}
	else if (boundingBox[3] >= worldHeight) {
		dy = worldHeight * (1 - Number.EPSILON) - boundingBox[3];
	}

	if (dx || dy) {
		if (dx) {
			if (Math.abs(this.vx) < minVelocityCoeff * Math.abs(this.ax)) {
				this.vx = 0;
			}
			else {
				this.vx *= wallBounceCoeff;
			}
			this.x += dx;
		}

		if (dy) {
			if (Math.abs(this.vy) < minVelocityCoeff * Math.abs(this.ay)) {
				this.vy = 0;
			}
			else {
				this.vy *= wallBounceCoeff;
			}
			this.y += dy;
		}

		translatePoints(this.drawVertices, dx, dy);
		translatePoints(this.drawEngines, dx, dy);
		this.setBoundingBox();
	}
}

function move() {
	// If too much time has passed since the last time the IRO ate, reduce its
	// health. If enough time has passed since the last time it mated, make it
	// able to mate. If it is bouncing off one or more other IROs, set its
	// velocity to the average of the velocities in the bounceVels array. If it
	// is firing an engine, adjust its linear and angular velocities based on
	// the linear and angular accelerations of that engine. Adjust its x- and
	// y-coordinates, along with its heading, based on its linear and angular
	// velocities. Make adjustments depending on whether it is colliding with
	// the edge of the world. Increment its age by one frame.
	if (this.id > 0 && this.lastEating - this.age > eatingRestTime) {
		this.health -= hungerHealthLoss / Math.sqrt(this.mass);
	}

	if (!this.ableToMate && this.lastMating - this.age > matingRestTime) {
		this.ableToMate = true;
	}

	if (this.isBouncing) {
		var totalBounceVx = 0, totalBounceVy = 0,
		bounceVels = this.bounceVels, endPos = 2 * this.numBounces,
		pos = 0;
		while (pos < endPos) {
			totalBounceVx += bounceVels[pos++];
			totalBounceVy += bounceVels[pos++];
		}
		this.vx = totalBounceVx / this.numBounces;
		this.vy = totalBounceVy / this.numBounces;
		this.isBouncing = false;
		this.numBounces = 0;
	}

	if (this.activeEngine > -1) {
		var c = Math.cos(this.ang), s = Math.sin(this.ang),
		ax = this.linAccels[2 * this.activeEngine],
		ay = this.linAccels[2 * this.activeEngine + 1];
		this.vx += ax * c - ay * s;
		this.vy += ax * s + ay * c;
		this.angV += this.angAccels[this.activeEngine];
	}
	else {
		this.vx *= 0.99;
		this.vy *= 0.99;
		this.angV *= 0.99;
	}

	this.setXYAng(this.x + this.vx, this.y + this.vy, this.ang + this.angV);
	this.setBoundingBox();
	this.bounceOffWalls();

	this.age++;
}

function draw() {
	var array = this.drawEngines,
	engineStrengths = this.engineStrengths, activeEngine = this.activeEngine,
	pos = 0;

	// Draw the engines.
	ctx.fillStyle = getInactiveEngineColor(this.fuel);
	while (pos < array.length) {
		if (pos / 2 == activeEngine) {
			ctx.fillStyle = getActiveEngineColor(this.fuel);
			ctx.beginPath();
			ctx.arc(
				array[pos++], array[pos++],
				engineStrengths[pos / 2 - 1] * sizeToStrengthRatio,
				0, 2 * Math.PI
				);
			ctx.fill();
			ctx.fillStyle = getInactiveEngineColor(this.fuel);
		}
		else {
			ctx.beginPath();
			ctx.arc(
				array[pos++], array[pos++],
				engineStrengths[pos / 2 - 1] * sizeToStrengthRatio,
				0, 2 * Math.PI
				);
			ctx.fill();
		}
	}

	array = this.drawVertices;
	pos = 2;

	// Draw the body.
	ctx.fillStyle = getIROColor(this.id, this.health);
	ctx.beginPath();
	ctx.moveTo(array[0], array[1]);
	while (pos < array.length) {
		ctx.lineTo(array[pos++], array[pos++]);
	}
	ctx.fill();
};


// <---------------------------Bin-Lattice Functions--------------------------->

function calculateLatticeSize() {
	// Set numCols, numRows, and binCapacity to the "optimal" values given the
	// defaultBinCapacity and targetBinFill, as well as the current worldWidth,
	// worldHeight, and ecosystemSize. "Optimal" means making each bin as close
	// to a square as possible, making the binCapacity as close to the
	// defaultBinCapacity as possible, and making the average percentage of a
	// bin that is filled as close to targetBinFill as possible, all while
	// keeping the sides of each bin at least as long as maxSize, which is the
	// maximum length of an IRO.
	binCapacity = defaultBinCapacity;
	var numBins = Math.ceil(9 * ecosystemSize / (binCapacity * targetBinFill));
	if (worldWidth >= worldHeight) {
		numRows = Math.ceil(numBins * worldHeight / (worldHeight + worldWidth));
		numCols = Math.ceil(numBins / numRows);
	}
	else {
		numCols = Math.ceil(numBins * worldWidth / (worldHeight + worldWidth));
		numRows = Math.ceil(numBins / numCols);
	}
	// If there are so many elements in the ecosystem that each bin is less than
	// its minimum size, decrease the resolution and increase the binCapacity.
	if (worldWidth / numCols < maxSize || worldHeight / numRows < maxSize) {
		while (worldWidth / numCols < maxSize) {
			numCols--;
		}
		while (worldHeight / numRows < maxSize) {
			numRows--;
		}
		binCapacity = Math.ceil(
			9 * ecosystemSize / (numCols * numRows * targetBinFill)
			);
	}
}

function makeLattice() {
	// Create a new empty lattice with the current numCols, numRows, and
	// binCapacity.
	var size = numCols * numRows;
	lattice = new Array(size);
	binLengths = new Array(size);
	var pos = 0;
	while (pos < size) {
		lattice[pos++] = new Array(binCapacity);
	}
}

function growLattice() {
	// Attempt to double either numCols or numRows, or both. If neither can be
	// doubled because it will result in the side of a bin being shorter than
	// the maximum length of an IRO (maxSize), double binCapacity.
	var maxColumnsReached = false;
	numCols *= 2;
	if (worldWidth / numCols < maxSize) {
		numCols /= 2;
		maxColumnsReached = true;
	}
	numRows *= 2;
	if (worldHeight / numRows < maxSize) {
		numRows /= 2;
		if (maxColumnsReached) {
			binCapacity *= 2;
		}
	}
	// Make a new lattice using the current values for numCols, numRows, and
	// binCapacity.
	makeLattice();
}

function addIRO(iro) {
	// Add an IRO to the appropriate bins given its x- and y- coordinates. If a
	// bin has reached its capacity, increase either numCols or numRows or
	// binCapacity, and return a value of false. If the IRO can be added, return
	// true. Also, set the IRO's latticePos to the index of its bin. (Note: this
	// assumes that iro.x is a positive number strictly less than worldWidth and
	// that iro.y is a positive number strictly less than worldHeight.)
	var row = iro.y / worldHeight * numRows | 0,
	col = iro.x / worldWidth * numCols | 0,
	pos;

	if (col != 0) {
		if (row != 0) {
			pos = (row - 1) * numCols + (col - 1);
			if (binLengths[pos] == binCapacity) {
				growLattice();
				return false;
			}
			lattice[pos][binLengths[pos]++] = iro;
		}
		if (row != numRows - 1) {
			pos = (row + 1) * numCols + (col - 1);
			if (binLengths[pos] == binCapacity) {
				growLattice();
				return false;
			}
			lattice[pos][binLengths[pos]++] = iro;
		}
		pos = row * numCols + (col - 1);
		if (binLengths[pos] == binCapacity) {
			growLattice();
			return false;
		}
		lattice[pos][binLengths[pos]++] = iro;
	}

	if (col != numCols - 1) {
		if (row != 0) {
			pos = (row - 1) * numCols + (col + 1);
			if (binLengths[pos] == binCapacity) {
				growLattice();
				return false;
			}
			lattice[pos][binLengths[pos]++] = iro;
		}
		if (row != numRows - 1) {
			pos = (row + 1) * numCols + (col + 1);
			if (binLengths[pos] == binCapacity) {
				growLattice();
				return false;
			}
			lattice[pos][binLengths[pos]++] = iro;
		}
		pos = row * numCols + (col + 1);
		if (binLengths[pos] == binCapacity) {
			growLattice();
			return false;
		}
		lattice[pos][binLengths[pos]++] = iro;
	}

	if (row != 0) {
		pos = (row - 1) * numCols + col;
		if (binLengths[pos] == binCapacity) {
			growLattice();
			return false;
		}
		lattice[pos][binLengths[pos]++] = iro;
	}
	if (row != numRows - 1) {
		pos = (row + 1) * numCols + col;
		if (binLengths[pos] == binCapacity) {
			growLattice();
			return false;
		}
		lattice[pos][binLengths[pos]++] = iro;
	}
	pos = row * numCols + col;
	if (binLengths[pos] == binCapacity) {
		growLattice();
		return false;
	}
	lattice[pos][binLengths[pos]++] = iro;

	iro.latticePos = pos;
	return true;
}

function updateLattice() {
	// Set all the binLengths to 0 and place everything in the ecosystem into
	// the appropriate bins.
	binLengths.fill(0);
	var pos = 0;
	while (pos < ecosystemSize) {
		if (!addIRO(ecosystem[pos++])) {
			// If the lattice needed to be resized, restart the while loop.
			binLengths.fill(0);
			pos = 0;
		}
	}
}


// <------------------------------World Functions------------------------------>

function setConstants() {
	// THIS FUNCTION ONLY EXISTS FOR TESTING PURPOSES
	initialPop0 = initialPop1 = initialPop2 = initialPop3 = 100;
	startingFuel0 = startingFuel1 = startingFuel2 = startingFuel3 = 1.0;
	startingHealth0 = startingHealth1 = startingHealth2 = startingHealth3 = 1.0;
	mutationRate0 = mutationRate1 = mutationRate2 = mutationRate3 = 0;
}

function setGenomes() {
	// An IRO genome is laid out as follows (<positions> - <description>):
	// 0 - population id (not subject to mutation); must be an integer
	// 1 - number of vertices (v); must be an integer
	// 2 - number of engines (e); must be an integer
	// 3..2*v - x- and y-coordinates of vertices 1..v-1 with vertex 0 as the origin
	// 2*v+1..2*v+e - "linear coordinate" of each engine (an engine at vertex 0
	// would have a linear coordinate of 0, and the coordinate would increase as
	// the engine moved counter-clockwise along the IRO's perimeter, with a linear
	// coordinate of 1 bringing the engine back to vertex 0)
	// 2*v+e+1..2*v+2*e - strength of each engine (strength is directly proportional
	// the radius)
	// 2*v+2*e+1 - predictionStep (number of frames ahead to look when making a
	// decision); must be an integer
	// 2*v+2*e+2..2*v+2*e+5 - fleeDesire, feedDesire, mateDesire, restDesire
	// (determine which of four actions an IRO is more likely to take)
	var c = worldWidth / 300;
	sizeToStrengthRatio = 0.1 * c;
	maxSize = 10 * c;

	initialGen0 = [
		0,
		4,
		8,
		3. * c, 0. * c, 3. * c, 3. * c, 0. * c, 3. * c,
		0.0625, 0.1875, 0.3125, 0.4375, 0.5625, 0.6875, 0.8125, 0.9375,
		4., 4., 4., 4., 4., 4., 4., 4.,
		10, 0, 10, 2, 0
	]; // a square with 8 equally-spaced engines

	initialGen1 = [
		1,
		18,
		6,
		0. * c, -1. * c, -2. * c, -1. * c, -2. * c, 1. * c, 2. * c, 1. * c,
		2. * c, -3. * c, -4. * c, -3. * c, -4. * c, 3. * c, 3. * c, 3. * c,
		3. * c, 4. * c, -5. * c, 4. * c, -5. * c, -4. * c, 3. * c, -4. * c,
		3. * c, 2. * c, -3. * c, 2. * c, -3. * c, -2. * c, 1. * c, -2. * c,
		1. * c, 0. * c,
		0.05, 0.10, 0.15, 0.85, 0.90, 0.95,
		5., 6., 7., 8., 9., 10.,
		20, 1, 1, 2, 4
	]; // a spiral with 6 engines in the center

	initialGen2 = [
		2,
		8,
		5,
		-1. * c, -2. * c, -3. * c, -3. * c, -1. * c, -4. * c, 0. * c, -6. * c,
		1. * c, -4. * c, 3. * c, -3. * c, 1. * c, -2. * c,
		0.00, 0.20, 0.40, 0.60, 0.80,
		1., 4., 8., 4., 1.,
		50, 1, 5, 1, 8
	]; // a star with 5, equally-spaced engines

	initialGen3 = [
		3,
		11,
		5,
		-1. * c, -1. * c, -1.25 * c, -5. * c, -3. * c, -9. * c, -1.2 * c,
		-8. * c, -1. * c, -9. * c, 1. * c, -9. * c, 1.2 * c, -8. * c, 3. * c,
		-9. * c, 1.25 * c, -5. * c, 1. * c, -1. * c,
		0.40, 0.49, 0.50, 0.51, 0.60,
		1., 1., 1., 1., 1.,
		10, 1, 1, 1, 1
	]; // a rocket with 3 big engines at the back and 2 small ones on the sides
}

function setWorld() {
	// Set the width and height of the world to the width and height of the
	// browser window, so long as the width is at least minWorldWidth and the
	// height is at least minWorldHeight.
	if (window.innerWidth < minWorldWidth) {
		if (worldWidth != minWorldWidth) {
			worldWidth = world.width = minWorldWidth;
		}
	}
	else {
		worldWidth = world.width = window.innerWidth;
	}

	if (window.innerHeight < minWorldHeight) {
		if (worldHeight != minWorldHeight) {
			worldHeight = world.height = minWorldHeight;
		}
	}
	else {
		worldHeight = world.height = window.innerHeight;
	}
}

function makeIROs() {
	// Try to insert the desired number of new IROs into the ecosystem without
	// any of them colliding. Each new IRO is given random x- and y-coordinates
	// and a random angle, and then it is compared with every IRO already
	// present to ensure that there are no collisions. If there is a collision,
	// the IRO is given new random values. If this process takes too long,
	// the last several IROs are deleted from the ecosystem. The number of IROs
	// deleted depends on how much time has already passed, i.e., with every
	// deletion, more IROs are removed. If even this takes too long, the
	// initial populations are all decreased by backstepLength/4.
	ecosystem = new Array(
		(initialPop0 + initialPop1 + initialPop2 + initialPop3) *
		ecosystemExpansionFactor
		);
	var totalPop = initialPop0 + initialPop1 + initialPop2 + initialPop3,
	numBacksteps = 0,
	curGen, newIRO, otherIROPos, numFailures;
	ecosystemSize = 0;
	while (ecosystemSize < totalPop) {
		if (ecosystemSize < initialPop0) {
			curGen = initialGen0;
		}
		else if (ecosystemSize < initialPop0 + initialPop1) {
			curGen = initialGen1;
		}
		else if (ecosystemSize < initialPop0 + initialPop1 + initialPop2) {
			curGen = initialGen2;
		}
		else {
			curGen = initialGen3;
		}
		newIRO = new IRO(
			mutateGenome(curGen),
			Math.random() * worldWidth, Math.random() * worldHeight,
			Math.random() * 2 * Math.PI
			);
		otherIROPos = 0;
		numFailures = 0;
		while (otherIROPos < ecosystemSize) {
			if (
				areIntersecting(
					newIRO.drawVertices, ecosystem[otherIROPos++].drawVertices
					)
				) {
				numFailures++;
				if (numFailures == maxNumFailures) {
					break;
				}
				newIRO.setXYAng(
					Math.random() * worldWidth, Math.random() * worldHeight,
					Math.random() * 2 * Math.PI
					);
				otherIROPos = 0;
			}
		}
		if (numFailures == maxNumFailures) {
			numBacksteps++;
			if (numBacksteps == maxnumBacksteps) {
				initialPop0 = Math.max(
					0, initialPop0 - Math.ceil(backstepLength / 4)
					);
				initialPop1 = Math.max(
					0, initialPop1 - Math.ceil(backstepLength / 4)
					);
				initialPop2 = Math.max(
					0, initialPop2 - Math.ceil(backstepLength / 4)
					);
				initialPop3 = Math.max(
					0, initialPop3 - Math.ceil(backstepLength / 4)
					);
				totalPop =
				initialPop0 + initialPop1 + initialPop2 + initialPop3;
				ecosystemSize = 0;
				numBacksteps = 0;
				continue;
			}
			ecosystemSize =
			Math.max(0, ecosystemSize - numBacksteps * backstepLength);
		}
		else {
			ecosystem[ecosystemSize++] = newIRO;
		}
	}
}

function setup() {
	makeIROs();
	calculateLatticeSize();
	makeLattice();
	updateLattice();
}

function removeTheDead() {
	// Removes all IROs in the toRemove array from the ecosystem and empties
	// out the toRemove array.
	if (toRemove.length == 0) {
		return;
	}
	var ecosystemPos, removePos, shiftStep = 0, moreToRemove = true;
	for (ecosystemPos = 0; ecosystemPos < ecosystemSize; ecosystemPos++) {
		if (shiftStep != 0) {
			ecosystem[ecosystemPos] = ecosystem[ecosystemPos + shiftStep];
		}
		if (moreToRemove) {
			for (removePos = 0; removePos < toRemove.length; removePos++) {
				if (ecosystem[ecosystemPos] == toRemove[removePos]) {
					if (toRemove.length > 1) {
						toRemove[removePos] = toRemove[--toRemove.length];
					}
					else {
						toRemove.length = 0;
						moreToRemove = false;
					}
					shiftStep++;
					ecosystemPos--;
					ecosystemSize--;
					break;
				}
			}
		}
	}
}

function step() {
	var worldResizedAtStart = worldResized;
	if (worldResizedAtStart) {
		setWorld();
	}
	var pos = 0;
	while (pos < ecosystemSize) {
		ecosystem[pos++].makeDecision();
	}
	pos = 0;
	while (pos < ecosystemSize) {
		ecosystem[pos++].move();
	}
	removeTheDead();
	ctx.clearRect(0, 0, worldWidth, worldHeight);
	pos = 0;
	while (pos < ecosystemSize) {
		ecosystem[pos++].draw();
	}
	if (worldResizedAtStart) {
		calculateLatticeSize();
		makeLattice();
		worldResized = false;
	}
	updateLattice();
	request = requestAnimationFrame(step);
}

function start() {
	if (firstTimeAnimating) {
		setup();
		firstTimeAnimating = false;
	}
	request = requestAnimationFrame(step);
}

function pause() {
	if (request) {
		cancelAnimationFrame(request);
		request = null;
	}
}

function reset() {
	pause();
	firstTimeAnimating = true;
	ctx.clearRect(0, 0, worldWidth, worldHeight);
}


// <-----------------------Functions Run when Page Loads----------------------->

setWorld();
setGenomes();
window.addEventListener('resize', function() {worldResized = true;}, false);
