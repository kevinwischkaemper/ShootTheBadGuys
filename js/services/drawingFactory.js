angular.module('app')
    .factory('drawingFactory',drawingFactory);
drawingFactory.$inject=[];
function drawingFactory(){
    var vm = this;
    vm.scale = 25;
    function element(name,className){
        var element = document.createElement(name);
        if(className) element.className = className;
        return element;
    };

    function DOMDisplay(parent,level){
        this.wrapper = parent.html(element("div","game"));
        this.level = level;
        this.drawFrame();
    };
    DOMDisplay.prototype.drawBackground = function(){
        var table = element("table","background");
        table.style.width = this.level.width * vm.scale + "px";
        this.level.grid.forEach(function(row) {
            var rowElement = table.appendChild(element("tr"));
            rowElement.style.height = vm.scale + "px";
            row.forEach(function(type){
                rowElement.appendChild(element("td",type));
            });
        });
        return table;
    };
    DOMDisplay.prototype.drawActors = function(){
        var wrapper = element("div");
        this.level.actors.forEach(function(actor){
            var rectangle = wrapper.appendChild(element("div","actor " + actor.type));
            rectangle.style.width = actor.size.x * vm.scale + "px";
            rectangle.style.height = actor.size.y * vm.scale + "px";
            rectangle.style.left = actor.position.x * vm.scale + "px";
            rectangle.style.top = actor.position.y * vm.scale + "px";
        });
        return wrapper;
    };
    DOMDisplay.prototype.drawFrame = function(){
        this.wrapper.html(this.drawBackground());
        this.actorLayer = this.wrapper.append(this.drawActors());
        this.wrapper.className = "game " + (this.level.status || "");
        this.scrollPlayerIntoView();        
    };
    DOMDisplay.prototype.scrollPlayerIntoView = function(){
        var width = this.wrapper.clientWidth;
        var height = this.wrapper.clientHeight;
        var margin = width / 3;

        var left = this.wrapper.scrollLeft;
        var right = left + width;
        var top = this.wrapper.scrollTop;
        var bottom = top + height;
        var player = this.level.player;
        var center = player.position.plus(player.size.times(0.5)).times(vm.scale);
        if (center.x < left + margin)
            this.wrapper.scrollLeft = center.x - margin;
        else if (center.x > right - margin)
            this.wrapper.scrollLeft = center.x + margin - width;
        if (center.y < top + margin)
            this.wrapper.scrollTop = center.y - margin;
        else if (center.y > bottom - margin)
            this.wrap.scrollTop = center.y + margin - height;
    };
    DOMDisplay.prototype.clear = function(){
        this.wrapper.html('');
    };

    return {
        DOMDisplay:DOMDisplay
  }  
};