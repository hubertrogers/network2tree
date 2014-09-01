'use strict';

/* Controllers */

var careerNetwork = angular.module('careerNetwork', []);


careerNetwork.controller('RoleListCtrl', ['$scope', '$http',
  function($scope, $http) {
    $http.get('data/miserables.json').success(function(data) {
      $scope.query = "va";
      $scope.roles = data.nodes;
    });

    $scope.orderProp = 'name';
    $scope.selectedRole = {
      "name": "Valjean",
      "group": 2
    };

    $scope.setRole = function(role) {
      $scope.selectedRole = role;
    }

    $scope.isSelected = function(role) {
      return $scope.selectedRole.name === role.name;
    }

  }
]);