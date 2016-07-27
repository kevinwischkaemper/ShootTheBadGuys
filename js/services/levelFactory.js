angular.module('app')
    .factory('levelFactory', levelFactory);
levelFactory.$inject = ['physicsFactory', 'actorFactory'];
function levelFactory(physicsFactory, actorFactory) {
    var vm = this;
    vm.maxStep = 0.05;
    

    function Level(plan) {
        this.width = plan[0].length;
        this.height = plan.length;
        this.grid = [];
        this.actors = [];
        for (var y = 0; y < this.height; y++) {
            var line = plan[y];
            var gridLine = [];
            for (var x = 0; x < this.width; x++) {
                var char = line[x];
                var terrainType = null;
                var Actor = actorFactory.actorChars[char];
                if (Actor) {
                    this.actors.push(new Actor(new physicsFactory.Vector(x, y)));
                }
                else if (char == "#")
                    terrainType = "rock";
                gridLine.push(terrainType);
            }
            this.grid.push(gridLine);
        }
        this.player = this.actors.filter(function (actor) {
            return actor.type == "player";
        })[0];
        this.status = this.finishDelay = null;
    };

    Level.prototype.isFinished = function () {
        return this.status != null && this.finishDelay < 0;
    };

    Level.prototype.obstacleAt = function (position, size) {
        var xStart = Math.floor(position.x);
        var xEnd = Math.ceil(position.x + size.x);
        var yStart = Math.floor(position.y);
        var yEnd = Math.ceil(position.y + size.y);

        if (xStart < 0 || xEnd > this.width || yStart < 0 || yEnd > this.height)
            return "rock";
        for (var y = yStart; y < yEnd; y++) {
            for (var x = xStart; x < xEnd; x++) {
                var fieldType = this.grid[y][x];
                if (fieldType) return fieldType;
            }
        }
    };

    Level.prototype.actorAt = function (actor) {
        for (var i = 0; i < this.actors.length; i++) {
            var other = this.actors[i];
            if (other != actor &&
                actor.position.x + actor.size.x > other.position.x &&
                actor.position.x < other.position.x + other.size.x &&
                actor.position.y + actor.size.y > other.position.y &&
                actor.position.y < other.position.y + other.size.y)
                return other;
        }
    };

    Level.prototype.animate = function (step, staticKeys, pressKeys) {
        if (this.status != null)
            this.finishDelay -= step;
        if (this.actors.filter(function(actor){return actor.type == "enemy"}).length == 0){
            if (this.status != "won")
                this.finishDelay = 1;
            this.status = "won";
            
        }
        while (step > 0) {
            var thisStep = Math.min(step, vm.maxStep);
            this.actors.forEach(function (actor) {
                actor.act(thisStep, this, staticKeys, pressKeys);
            }, this);
            step -= thisStep;
        }
    };

    Level.prototype.playerTouched = function (type, actor) {
        if (type == "bullet" && this.status == null) {
            this.status = "lost";
            this.finishDelay = 1;
        } 
        // else if (type == "enemy") {
        //     this.actors = this.actors.filter(function (other) {
        //         return other != actor;
        //     });
        //     if (!this.actors.some(function (actor) {
        //         return actor.type == "coin";
        //     })) {
        //         this.status = "won";
        //         this.finishDelay = 1;
        //     }
        // }
    };

    Level.prototype.createActor = function(actor){
        this.actors.push(actor);
    }
    Level.prototype.removeActor = function(actor){
        this.actors = this.actors.filter(function (other) {
                 return other != actor;
             });
             
    }
    Level.prototype.bulletTouchedActor = function(bullet,actor){
        if (actor.type == "player" || actor.type == "enemy"){
            actor.kill(this);
        }
        this.removeActor(bullet);
    }

    return {
        Level: Level
    };
};