angular.module('app')
    .factory('dataStore', dataStore);
dataStore.$inject = ['drawingFactory'];
function dataStore(drawingFactory) {
    var vm = this;

   
    vm.simplePlan = [
        "                                                                        ",
        "                                                                        ",
        "                                                                        ",
        "                                     #                                  ",
        "  #                                x##                                  ",
        "  #                             #######                                 ",
        "  #          #                                                          ",
        "  #         ###             ##                                          ",
        "  #   x    #####    i       ##           x                x             ",
        "  ####################################################################  ",
    ];

    vm.levelPlans = [vm.simplePlan];
    vm.display = drawingFactory.DOMDisplay;

    function getLevelPlans() { return vm.levelPlans };
    function getDisplay() { return vm.display };

    return {
        getLevelPlans: getLevelPlans,
        getDisplay: getDisplay
    }
}