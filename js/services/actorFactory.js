angular.module('app')
    .factory('actorFactory', actorFactory);
actorFactory.$inject = ['physicsFactory'];
function actorFactory(physicsFactory) {
    var vm = this;
    vm.actorChars = {
        "i": Player,
        "x": Enemy,
        "o": Bullet
    };

    function Player(position) {
        this.position = position.plus(new physicsFactory.Vector(0, -.5));
        this.size = new physicsFactory.Vector(0.8, 1.5);
        this.speed = new physicsFactory.Vector(0, 0);
        this.XSpeed = 7;
        this.YSpeed = 17;
        this.dying = false;
        this.xDirection = 1;
    }
    Player.prototype.type = "player";
    Player.prototype.moveX = function (step, level, keys) {
        this.speed.x = 0;
        if (keys.left){
            this.speed.x -= this.XSpeed;
            this.xDirection = 0;
        } 
        if (keys.right){
            this.speed.x += this.XSpeed;
            this.xDirection = 1;
        } 

        var motion = new physicsFactory.Vector(this.speed.x * step, 0);
        var newPos = this.position.plus(motion);
        var obstacle = level.obstacleAt(newPos, this.size);
        if (obstacle)
            level.playerTouched(obstacle);
        else
            this.position = newPos;
    };
    Player.prototype.moveY = function (step, level, keys) {
        this.speed.y += step * physicsFactory.gravity;
        var motion = new physicsFactory.Vector(0, this.speed.y * step);
        var newPos = this.position.plus(motion);
        var obstacle = level.obstacleAt(newPos, this.size);
        if (obstacle) {
            level.playerTouched(obstacle);
            if (keys.up && this.speed.y > 0)
                this.speed.y = -this.YSpeed;
            else
                this.speed.y = 0;
        } else {
            this.position = newPos;
        }
    };
    Player.prototype.fireBullet = function(level){            
            if (this.xDirection == 1){
                var bullet = new Bullet(this.position.plus(new physicsFactory.Vector(.8,0)));
                bullet.speed = new physicsFactory.Vector(12, 0);
            } 
            else {
                var bullet = new Bullet(this.position.plus(new physicsFactory.Vector(-1.5,0)));
                bullet.speed = new physicsFactory.Vector(-12, 0);
            }
            level.createActor(bullet,"o");
    };
    Player.prototype.act = function (step, level, staticKeys, pressKeys) {
        this.moveX(step, level, staticKeys);
        this.moveY(step, level, staticKeys);
        if (pressKeys.indexOf("space") > -1) this.fireBullet(level);

        var otherActor = level.actorAt(this);
        if (otherActor)
            level.playerTouched(otherActor.type, otherActor);

        if (level.status == "lost") {
            this.position.y += step;
            this.size.y -= step;
        }
    };

    function Enemy(position) {
        this.position = position.plus(new physicsFactory.Vector(0, -.5));
        this.size = new physicsFactory.Vector(0.8, 1.5);
        this.speed = new physicsFactory.Vector(0, 0);
        this.dyingCounter = 1;
        
    }
    Enemy.prototype.type = "enemy";
    Enemy.prototype.kill = function(){
        this.dying = true;
    }
    Enemy.prototype.act = function(step, level){
        if (this.dying){
            if (this.dyingCounter == 0) level.removeActor(this);
            this.position.y += step;
            this.size.y -= step;
            this.dyingCounter -= step;
        }        
    }

    function Bullet(position) {
        this.position = position.plus(new physicsFactory.Vector(0.2, 0.1));
        this.size = new physicsFactory.Vector(0.6, 0.6);
        this.speed = new physicsFactory.Vector(8, 0);
    }
    Bullet.prototype.type = "bullet";
    Bullet.prototype.act = function(step,level){
        var motion = new physicsFactory.Vector(this.speed.x * step, 0);
        var newPos = this.position.plus(motion);
        this.position = newPos;
        var obstacle = level.obstacleAt(newPos, this.size);
        if (obstacle) level.removeActor(this);
        else{
            var actor = level.actorAt(this);
            if (actor) level.bulletTouchedActor(this,actor);
        }
    }

    
    return {
        Player: Player,
        Enemy: Enemy,
        Bullet: Bullet,
        actorChars: vm.actorChars
    };
}