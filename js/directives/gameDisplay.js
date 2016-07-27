app.directive('gameDisplay', gameDisplay);
gameDisplay.$inject = ['gameService'];
function gameDisplay(gameService) {
    var vm = this;
    function link(scope,element){
        gameService.runOnElement(angular.element(element));
    }
    return {
        link: link                        
    }
}