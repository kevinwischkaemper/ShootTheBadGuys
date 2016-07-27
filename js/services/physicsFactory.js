angular.module('app')
    .factory('physicsFactory',physicsFactory);
physicsFactory.$inject=[];
function physicsFactory(){
    var vm = this;
    vm.gravity = 30;

    function Vector(x, y) {
        this.x = x; this.y = y;
    }
    Vector.prototype.plus = function(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    };
    Vector.prototype.times = function(factor) {
        return new Vector(this.x * factor, this.y * factor);
    };

    return{
        Vector:Vector,
        gravity:vm.gravity
    }
}