angular.module('app')
    .factory('gameService', gameService);
gameService.$inject = ['dataStore','levelFactory'];
function gameService(dataStore,levelFactory) {
    var vm = this;
    vm.staticCodes = { 37: "left", 38: "up", 39: "right"};
    vm.pressCodes = { 32: "space" };
    vm.staticKeys = trackStaticKeys(vm.staticCodes);
    trackPressKeys(vm.pressCodes);
    vm.pressKeys = [];
    vm.plans = dataStore.getLevelPlans();
    vm.display = dataStore.getDisplay();

    function trackStaticKeys(codes) {
        var pressed = Object.create(null);
        function handler(event) {
            if (codes.hasOwnProperty(event.keyCode)) {
                var down = event.type == "keydown";
                pressed[codes[event.keyCode]] = down;
                event.preventDefault();
            }
        }
        addEventListener("keydown", handler);
        addEventListener("keyup", handler);
        return pressed;
    }

    function trackPressKeys(codes){
        function handler(event) {
            if (codes.hasOwnProperty(event.keyCode)) {
                vm.pressKeys.push(codes[event.keyCode]);
            }
        }
        addEventListener("keypress", handler);
    }

    function runAnimation(frameFunc) {
        var lastTime = null;
        function frame(time) {
            var stop = false;
            if (lastTime != null) {
                var timeStep = Math.min(time - lastTime, 100) / 1000;
                stop = frameFunc(timeStep) === false;
            }
            lastTime = time;
            if (!stop)
                requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }

    function runLevel(level, Display, andThen, element) {
        var display = new Display(element, level);
        runAnimation(function (step) {
            level.animate(step, vm.staticKeys, vm.pressKeys);
            vm.pressKeys = [];
            display.drawFrame(step);
            if (level.isFinished()) {
                display.clear();
                if (andThen)
                    andThen(level.status);
                return false;
            }
        });
    }

    function runOnElement(element) {
        function startLevel(n) {
            runLevel(new levelFactory.Level(vm.plans[n]), vm.display, function (status) {
                if (status == "lost")
                    startLevel(n);
                else if (n < plans.length - 1)
                    startLevel(n + 1);
                else
                    console.log("You win!");
            },element);
        }
        startLevel(0);
    }

    return {
        runOnElement : runOnElement,
        pressKeys : vm.pressKeys
    };
}
