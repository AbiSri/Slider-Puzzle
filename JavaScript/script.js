//JavaScript

//Link to table and values
var items = [];
items[0] = document.getElementById('s0');
items[1] = document.getElementById('s1');
items[2] = document.getElementById('s2');
items[3] = document.getElementById('s3');
items[4] = document.getElementById('s4');
items[5] = document.getElementById('s5');
items[6] = document.getElementById('s6');
items[7] = document.getElementById('s7');
items[8] = document.getElementById('s8');
var clickables = [items[5], items[7], items[0], items[1]];
var space = 8;
var slen = 2, size = 10;

function isDone() {
	for (var i = 0; i < 8; ++i) {
		if (items[i].innerHTML != (i + 1)) {
			return false;
		}
	}
	return true;
}

/**
 * Count the number of inversions in the board.
 * Inversion defined as: pair{i, j} such that i < j but a[i] > a[j]
 * -1 (the space) is greater than any other number.
 */
function inversionCounter() {
	var inversions = 0;
	for (var i = 0; i < 9; ++i) {
		if (board[i] == -1) {
			continue;
		}
		for (var j = i + 1; j < 9; ++j) {
			if (board[i] > board[j] && board[j] != -1) {
				++inversions;
			}
		}
	}
	return inversions;
}

/**
 * Generate random permutation of [1...9]
 Using Fisher-Yates shuffle algorithm in O(N) time
 */
function onLoad() {
	for (var i = items.length - 1; i > 0; --i) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = board[i];
		board[i] = board[j];
		board[j] = temp;
	}

	// If # of inversions is odd, swap the first or last two tiles
	if (inversionCounter() % 2 != 0) {
		if (board[0] == -1 || board[1] == -1) {
			var temp = board[8];
			board[8] = board[7];
			board[7] = temp;
		}
		else {
			var temp = board[0];
			board[0] = board[1];
			board[1] = temp;
		}
	}

	for (var i = 0; i < 9; ++i) {
		if (board[i] == -1) {
			items[8].parentNode.style.top = Math.floor(i / 3) * size + 10 + 'em';
			items[8].parentNode.style.left = (i % 3) * size + 'em';
			items[8].parentNode.style.zIndex = i;
			alert(items[8].parentNode.style.top + ' ' + items[8].parentNode.style.left);
			continue;
		}
		items[board[i] - 1].parentNode.style.top = Math.floor(i / 3) * size + 10 + 'em';
		items[board[i] - 1].parentNode.style.left = (i % 3) * size + 'em';
		items[board[i] - 1].parentNode.style.zIndex = i;
		alert(items[board[i] - 1].parentNode.style.top + ' ' + items[board[i] - 1].parentNode.style.left);
	}

	updateClickable();
}

// Keep track of all the moveable items
function updateClickable() {
	slen = 0;
	if (spaceID % 3 < 2) { // check item on right
		clickables[slen] = items[spaceID + 1];
		++slen;
	}
	if (spaceID % 3 > 0) { // check item on left
		clickables[slen] = items[spaceID - 1];
		++slen;
	}
	if (spaceID / 3 >= 1) { // check item on top
		clickables[slen] = items[spaceID - 3];
		++slen;
	}

	if (spaceID / 3 < 2) { // check item on bottom
		clickables[slen] = items[spaceID + 3];
		++slen;
	}
}

// Move piece if moveable
function onClick(clicked_id) {
	for (var i = 0; i < slen; ++i) {
		if (clickables[i].id == clicked_id) {
			var spaceID = parseInt(space.id[1]), clickID = parseInt(clickables[i].id[1]);
			items[spaceID].innerHTML = clickables[i].innerHTML;
			items[clickID].innerHTML = '';
			space = items[clickID];
			updateClickable();
			var temp = board[spaceID];
			board[spaceID] = board[clickID];
			board[clickID] = temp;
			if (isDone()) {
				alert('You solved it!');
			}
			return;
		}
	}
}

/************************************************
 *
 * Algorithm for solver starts here. Uses IDA* (Iterated Deepening A*) algorithm.
 *
 ************************************************/

var threshold, newthreshold, INT_MAX = 1000000000;
var finished = false;
var board = [1, 2, 3, 4, 5, 6, 7, 8, -1];
var sol = '';

/**
 * Heuristic function to determine how close a state is to completion.
 * Determined by Manhattan distance for each piece to its final position,
 * plus double the number of conflicts. Conflicts are defined as two adjacent
 * pieces that are in each other's spot.
 */
function heuristic(field) {
	var heur = 0;
	for (var i = 0; i < 9; ++i) {
		if (field[i] == -1) {
			heur += Math.floor(8 / 3) - Math.floor(i / 3) + 8 % 3 - i % 3;
		}
		else {
			heur += Math.abs(Math.floor(i / 3) - Math.floor((field[i] - 1) / 3));
			heur += Math.abs(i % 3 - (field[i] - 1) % 3);
		}
	}
	for (var i = 0; i < 9; ++i) {
		if (Math.floor(i / 3) % 3 < 2) {
			if (field[i] == i + 4) {
				heur += 2;
			}
		}
		if (i % 3 < 2) {
			if ((field[i] == i + 2) && (field[i + 1] == i + 1)) {
				heur += 2;
			}
		}
	}
	return heur;
}

/**
 * Moves the board along the path given.
 */
function move(path, board) {
	var pos = -5;
	for (var i = 0; i < 9; ++i) {
		if (board[i] == -1) {
			pos = i;
		}
	}
	if (pos == -5) alert('I FAILED');
	for (var i = 0; i < path.length; ++i) {
		if (path[i] == 'W') {
			board[pos] = board[pos - 1];
			board[pos - 1] = -1;
			--pos;
		}
		else if (path[i] == 'E') {
			board[pos] = board[pos + 1];
			board[pos + 1] = -1;
			++pos;
		}
		else if (path[i] == 'N') {
			board[pos] = board[pos - 3];
			board[pos - 3] = -1;
			pos -= 3;
		}
		else if (path[i] == 'S') {
			board[pos] = board[pos + 3];
			board[pos + 3] = -1;
			pos += 3;
		}
	}
	if (!(pos >= 0 && pos <= 8)) alert('I ALSO FAILED');
}

/**
 * DFS algorithm to search for a solution under the current threshold.
 */
function dfs(path) {
	var nextboard = board.slice(0);
	move(path, nextboard);
	nheuristic = heuristic(nextboard);
	if (finished && path.length > sol.length) {
		return;
	}
	if (nheuristic + path.length > threshold) {
		if (nheuristic + path.length < newthreshold) {
			newthreshold = nheuristic + path.length;
		}
		return;
	}
	if (nheuristic == 0) {
		if (sol == '' || path.length < sol.length) {
			sol = path;
		}
		finished = true;
		return;
	}
	var pos = -5;
	for (var i = 0; i < 9; ++i) {
		if (nextboard[i] == -1) {
			pos = i;
		}
	}
	if (path.length > 0) {
		if (path[path.length - 1] != 'W' && pos % 3 < 2) {
			dfs(path + 'E');
		}
		if (path[path.length - 1] != 'E' && pos % 3 > 0) {
			dfs(path + 'W');
		}
		if (path[path.length - 1] != 'N' && Math.floor(pos / 3) < 2) {
			dfs(path + 'S');
		}
		if (path[path.length - 1] != 'S' && Math.floor(pos / 3) > 0) {
			dfs(path + 'N');
		}
	}
	else {
		if (pos % 3 < 2) {
			dfs(path + 'E');
		}
		if (pos % 3 > 0) {
			dfs(path + 'W');
		}
		if (Math.floor(pos / 3) < 2) {
			dfs(path + 'S');
		}
		if (Math.floor(pos / 3) > 0) {
			dfs(path + 'N');
		}
	}
}

/**
 * Iterated Depeening A* search algorithm. Checks for a solution under the 
 * current threshold, and if none is found, it increases it and checks again.
 */
function IDA() {
	finished = false;
	sol = '';
	threshold = heuristic(board);
	newthreshold = INT_MAX;
	while (!finished) {
		dfs('');
		threshold = newthreshold;
		newthreshold = INT_MAX;
	}
	solve();
}

/**
 * This function makes the computer solve the puzzle after it finds the path.
 */
var timer;
var counter;
function solve() {
	counter = 0;
	timer = setInterval(simulate, 500);
}

var simulate = function() {
	if (counter < sol.length) {
		var spaceID = parseInt(space.id[1]), clickID;
		if (sol[counter] == 'W') {
			clickID = spaceID - 1;
		}
		else if (sol[counter] == 'E') {
			clickID = spaceID + 1;
		}
		else if (sol[counter] == 'N') {
			clickID = spaceID - 3;
		}
		else if (sol[counter] == 'S') {
			clickID = spaceID + 3;
		}
		items[spaceID].innerHTML = items[clickID].innerHTML;
		items[clickID].innerHTML = '';
		space = items[clickID];
		//updateClickable();
		var temp = board[spaceID];
		board[spaceID] = board[clickID];
		board[clickID] = temp;
		++counter;
	}
	else {
		clearInterval(timer);
		updateClickable();
		alert('DONE');
	}
}