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
        this.XSpeed = 10;
        this.YSpeed = 17;
        this.dying = false;
        this.xDirection = 1;
        this.lastFired = 1.5;
    }
    Player.prototype.type = "player";
    Player.prototype.moveX = function (step, level, keys) {
        this.speed.x = 0;
        if (keys.left) {
            this.speed.x -= this.XSpeed;
            this.xDirection = 0;
        }
        if (keys.right) {
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
    Player.prototype.fireBullet = function (level) {
        if (this.xDirection == 1) {
            var bullet = new Bullet(this.position.plus(new physicsFactory.Vector(.8, 0)));
            bullet.speed = new physicsFactory.Vector(12, 0);
        }
        else {
            var bullet = new Bullet(this.position.plus(new physicsFactory.Vector(-1.4, 0)));
            bullet.speed = new physicsFactory.Vector(-12, 0);
        }
        level.createActor(bullet, "o");
    };
    Player.prototype.kill = function (level) {
        this.dying = true;
        level.status = "lost";
        level.finishDelay = 1;
    }
    Player.prototype.act = function (step, level, staticKeys, pressKeys) {
        if (level.status == "lost") {
            this.position.y += step;
            this.size.y -= step;
        }
        else {
            this.moveX(step, level, staticKeys);
            this.moveY(step, level, staticKeys);
            if (pressKeys.indexOf("space") > -1 && this.lastFired >= .6) {
                this.lastFired = 0;
                this.fireBullet(level);
            }
            this.lastFired += step;
            var otherActor = level.actorAt(this);
            if (otherActor)
                level.playerTouched(otherActor.type, otherActor);
        }




    };

    function Enemy(position) {
        this.position = position.plus(new physicsFactory.Vector(0, -.5));
        this.size = new physicsFactory.Vector(0.8, 1.5);
        this.speed = new physicsFactory.Vector(0, 0);
        this.dyingCounter = 1;
        this.YSpeed = 17;
        this.jumping = false;
        this.jumpProximity = 3;
        this.shooting = false;
        this.lastFired = 0;
    }
    Enemy.prototype.type = "enemy";
    Enemy.prototype.moveY = function (step, level) {
        this.speed.y += step * physicsFactory.gravity;
        var motion = new physicsFactory.Vector(0, this.speed.y * step);
        var newPos = this.position.plus(motion);
        var obstacle = level.obstacleAt(newPos, this.size);
        if (obstacle) {
            level.playerTouched(obstacle);
            if (this.jumping && this.speed.y > 0)
                this.speed.y = -this.YSpeed;
            else
                this.speed.y = 0;
        } else {
            this.position = newPos;
        }
    };
    Enemy.prototype.kill = function () {
        this.dying = true;
    };
    Enemy.prototype.fireBullet = function (direction, level) {
        if (direction == 1) {
            var bullet = new Bullet(this.position.plus(new physicsFactory.Vector(.8, 0)));
            bullet.speed = new physicsFactory.Vector(12, 0);
        }
        else {
            var bullet = new Bullet(this.position.plus(new physicsFactory.Vector(-1.4, 0)));
            bullet.speed = new physicsFactory.Vector(-12, 0);
        }
        level.createActor(bullet, "o");
    }

    Enemy.prototype.act = function (step, level) {
        var vm = this;
        vm.level = level;
        var bulletThreats = level.actors.filter(function (actor) {
            return actor.type == "bullet" &&
                ((actor.position.x > vm.position.x) == (actor.speed.x < 0)) &&
                ((actor.position.y > vm.position.y) && (actor.position.y < vm.position.y + vm.size.y)) &&
                Math.abs(actor.position.x - vm.position.x) < vm.jumpProximity
        });
        if (bulletThreats.length > 0)
            this.jumping = true;
        else
            this.jumping = false;
        var targets = level.actors.filter(function (actor) {
            return actor.type == "player" &&
                ((actor.position.y <= vm.position.y + vm.size.y) && (actor.position.y + actor.size.y >= vm.position.y))
        });

        if (this.lastFired >= 1) {
            this.lastFired = 0;

            targets.forEach(function (target) {
                if (target.position.x > vm.position.x) vm.fireBullet(1, vm.level)
                else vm.fireBullet(0, vm.level)
            })

        }

        this.moveY(step, level);
        this.lastFired += step;
        if (this.dying) {
            if (this.dyingCounter <= 0)
                level.removeActor(this);
            this.position.y += step;
            this.size.y -= step;
            this.dyingCounter -= step;
        }

    }

    function Bullet(position) {
        this.position = position.plus(new physicsFactory.Vector(0.2, 0.1));
        this.size = new physicsFactory.Vector(0.6, 0.6);
        this.speed = new physicsFactory.Vector(12, 0);
    }
    Bullet.prototype.type = "bullet";
    Bullet.prototype.act = function (step, level) {
        var motion = new physicsFactory.Vector(this.speed.x * step, 0);
        var newPos = this.position.plus(motion);
        this.position = newPos;
        var obstacle = level.obstacleAt(newPos, this.size);
        if (obstacle) level.removeActor(this);
        else {
            var actor = level.actorAt(this);
            if (actor) level.bulletTouchedActor(this, actor);
        }
    }


    return {
        Player: Player,
        Enemy: Enemy,
        Bullet: Bullet,
        actorChars: vm.actorChars
    };
}