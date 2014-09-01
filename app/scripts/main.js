'use strict';

/* Controllers */

var treeNetwork = angular.module('treeNetwork', []);


treeNetwork.controller('NodeListCtrl', ['$scope', '$http',
  function($scope, $http) {
    $http.get('data/movie-network-25-7-3.json').success(function(data) {
      $scope.query = "dar";
      $scope.nodes = data.nodes;
    });

    $scope.orderProp = 'name';
    $scope.selectedNode = {
      "label": "The Dark Knight (2008)",
      "director": "Christopher Nolan"
    };

    $scope.setNode = function(node) {
      $scope.selectedNode = node;
    }

    $scope.isSelected = function(node) {
      return $scope.selectedNode.label === node.label;
    }

  }
]);