'use strict';

angular.module('fcc3StockStreamApp')
  .controller('MainCtrl', function ($scope, $http, socket, $filter) {

    var date = new Date(),
      year = date.getFullYear(),
      startDate = year + '-01-01',
      endDate = date.toLocaleDateString().split('/').join('-');

    var quandlAPI = 'https://www.quandl.com/api/v1/datasets/WIKI/';

    function refreshChart() {
      $('#chart').highcharts({
        chart: {
          type: 'line',
          alignTicks: false
        },
        navigator: {
          enabled: false
        },
        rangeSelector: {
          enabled: false
        },
        exporting: {
          enabled: false
        },
        scrollbar: {
          enabled: false
        },
        legend: {
          enabled: true
        },
        title: '',
        series: $scope.stocks,
        xAxis: {
          showFirstLabel: false,
          showLastLabel: false,
          tickLength: 0,
          labels: {
            enabled: false
          }
        },
        yAxis: {
          gridLineWidth: 0,
          labels: {},
          title: {
            enabled: false
          }
        },
        tooltip: {
          followPointer: true,
          crosshairs: true
        },
        credits: {
          enabled: false
        }
      });
    }


    $http.get('/api/stocks/').success(function (stocks) {
      $scope.stocks = stocks;
      socket.syncUpdates('stock', $scope.stocks, function () {
        setTimeout(function () {
          refreshChart();
        }, 500);
      });
      refreshChart();
    });


    $scope.stocks = [];

    $scope.addStock = function () {
      if ($scope.newStock === '') {
        return;
      }

      $http.get(quandlAPI + $scope.newStock + '.json', {
        params: {
          sort_order: 'asc',
          exclude_headers: true,
          trim_start: startDate,
          trim_end: endDate
        }
      }).success(function (stockData) {
        var newStockInfo = {
          type: 'line',
          name: $scope.newStock,
          data: stockData.data.map(function (arr) {
            return [$filter('date')(arr[0], 'longDate'), arr[4]];
          }),
          marker: {
            enabled: false
          },
          color: $scope.getRandomColor()
        };

        $http.post('/api/stocks', newStockInfo).success(function () {
          $scope.newStock = '';
          refreshChart();
        });
      });
    };

    $scope.deleteStock = function (stock) {
      $http.delete('/api/stocks/' + stock._id).success(function () {
        refreshChart();
      });
    };

    $scope.getRandomColor = function () {
      var letters = '0123456789ABCDEF'.split('');
      var color = '#';
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });

  });
