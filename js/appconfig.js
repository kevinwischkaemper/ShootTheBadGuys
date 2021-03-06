angular.module('app')
    .config(Config);

Config.$inject = ['$stateProvider','$urlRouterProvider'];
function Config($stateProvider, $urlRouterProvider){
    $stateProvider.state('home',{
        url:'/home',
        controller:'HomeController',
        controllerAs:'hc',
        templateUrl:'templates/Home.html'
    });
    $stateProvider.state('game',{
        url:'/game',
        controller:'GameController',
        controllerAs:'gc',
        templateUrl:'templates/Game.html'
    });
    $urlRouterProvider.otherwise('/game');
};

angular.module('app')
    .run(Run);
Run.$inject=['$rootScope','$log'];
function Run($rootScope,$log){
}
