'use strict';

var ShortestPath = function(gridSize, startPos, endPos) {
    this.FLOOR_FLAG = 0;
    this.START_FLAG = 1;
    this.FINISH_FLAG = 2;
    this.WALL_FLAG = 3;
    this.grid = [];
    this.gridSize = gridSize;
    this.maxCellIterations = 240 * gridSize * gridSize;
    this.startPos = startPos;
    this.endPos = endPos;
    for (var y = 0; y < gridSize; y++) {
        var row = [];
        for (var x = 0; x < gridSize; x++) {
            row[x] = {
                flag: this.FLOOR_FLAG,
                distanceFromStart: 0,
                hasDistance: false,
                iterations: 0
            }
        }
        this.grid[y] = row;
        this.path = new Array();
    }

    this.iterations = 0;

    this.grid[startPos.y][startPos.x] = {
        flag: this.START_FLAG,
        distanceFromStart: 0,
        hasDistance: false,
        iterations: 0
    };

    this.grid[endPos.y][endPos.x] = {
        flag: this.FINISH_FLAG,
        distanceFromStart: 0,
        hasDistance: false,
        iterations: 0
    };


};

ShortestPath.prototype.addWalls = function(walls) {
    var self = this;
    walls.forEach(function(wall) {
        self.grid[wall.y][wall.x].flag = self.WALL_FLAG;
    });
};

ShortestPath.prototype.render = function(id) {
    var table = document.createElement("table");
    for (var y = 0; y < this.gridSize; y++) {
        var row = document.createElement("tr");
        row.className = "row";
        for (var x = 0; x < this.gridSize; x++) {
            var cell = document.createElement("td");
            cell.className = "cell";
            row.appendChild(cell);
            if (y == this.startPos.y && x == this.startPos.x) {
                cell.className += " start";
            } else if (y == this.endPos.y && x == this.endPos.x) {
                cell.className += " finish";
            } else if (this.grid[y][x].flag == this.WALL_FLAG) {
                cell.className += " wall";
            } else if (_.find(this.path, { x: x, y: y })) {
                cell.className += " path";
            }

            if (this.grid[y][x].hasDistance) {
                var cellText = document.createElement("span");
                cellText.innerHTML = this.grid[y][x].distanceFromStart;
                cell.appendChild(cellText);
            }
        }

        table.appendChild(row);
    }

    var grid = document.getElementById(id);
    grid.innerHTML = "";
    grid.appendChild(table);
};

ShortestPath.prototype.isOutOfBounds = function(pos) {
    var self = this;
    return (pos.x < 0 || pos.y < 0 || pos.x >= self.gridSize || pos.y >= self.gridSize);
};

ShortestPath.prototype.calcDistance = function (fromPos, dist) {
    var self = this;

    if (self.isOutOfBounds(fromPos)) {
        return;
    }

    for (var y = -1; y <= 1; y++) {
        for (var x = -1; x <= 1; x++) {
            this.iterations += 1;

            var toPos = { x: fromPos.x + x, y: fromPos.y + y };

            if (self.isOutOfBounds(toPos)) {
                continue;
            }

            if (fromPos.x == toPos.x && fromPos.y == toPos.y) {
                continue;
            }

            var toCell = self.grid[toPos.y][toPos.x];
            toCell.iterations += 1;
            if (toCell.iterations > self.maxCellIterations) {
                continue;
            }

            if (toCell.hasDistance && toCell.distanceFromStart - dist < 2) {
                continue;
            }

            if (toCell.flag == self.WALL_FLAG) {
                continue;
            }

            toCell.distanceFromStart = dist;
            toCell.hasDistance = true;

            if (toPos.x == self.endPos.x && toPos.y == self.endPos.y) {
                return;
            }

            self.calcDistance(toPos, 1 + dist);
        }
    }


};

ShortestPath.prototype.findPath = function (fromPos) {
    var self = this;
    for (var y = -1; y <= 1; y++) {
        for (var x = -1; x <= 1; x++) {
            var toPos = { x: fromPos.x + x, y: fromPos.y + y };

            if (toPos.x == self.startPos.x && toPos.y == self.startPos.y) {
                return;
            }

            if (self.isOutOfBounds(toPos)) {
                continue;
            }

            if (fromPos.x == toPos.x && fromPos.y == toPos.y) {
                continue;
            }

            var fromCell = self.grid[fromPos.y][fromPos.x];
            var toCell = self.grid[toPos.y][toPos.x];

            if (!toCell.hasDistance) {
                continue;
            }

            if (toCell.distanceFromStart < fromCell.distanceFromStart) {
                self.path.push(toPos);
                self.findPath(toPos);
                return;
            }

        }
    }

}

ShortestPath.prototype.start = function() {
    var self = this;
    var startMoment = moment();
    this.grid[self.startPos.y][self.startPos.x].distanceFromStart = 0;
    this.grid[self.startPos.y][self.startPos.x].hasDistance = true;
    self.calcDistance(self.startPos, 1);
    self.findPath(self.endPos);
    var timestamp = moment().subtract(startMoment);
    console.log("Took " + timestamp.millisecond() + "ms with " + self.iterations + " iterations to find distances");
};