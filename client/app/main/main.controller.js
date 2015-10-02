'use strict';

angular.module('fcc3StockStreamApp')
  .controller('MainCtrl', function ($scope, $http, socket, $filter) {

    var date = new Date(),
      year = date.getFullYear(),
      startDate = year + '-01-01',
      endDate = date.toLocaleDateString().split('/').join('-');

    var quandlAPI = 'https://www.quandl.com/api/v1/datasets/WIKI/',
      quandlAuthToken = 'PwyZscKorv3wCa-dEbtX';

    function showStocks() {
      $http.get('/api/stocks/').success(function (stocks) {
        $scope.stocks = stocks;
        socket.syncUpdates('stock', $scope.stocks, function (event, stock, stocks) {
          setTimeout(function () {
            $scope.refreshChart();
          }, 500);
        });
        $scope.refreshChart();
      });
    }

    // need to remove more code
    $scope.stocks = [];

    $scope.refreshChart = function () {
      $('#chart').highcharts({
        chart: {
          type: 'line',
          alignTicks: false,
        },
        navigator: {
          enabled: !1
        },
        rangeSelector: {
          enabled: !1
        },
        exporting: {
          enabled: !1
        },
        scrollbar: {
          enabled: !1
        },
        legend: {
          enabled: true
        },
        title: "",
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
      $scope.arrayLength = $scope.stocks.length
    }

    $scope.addStock = function () {
      if ($scope.newStock === '') {
        return;
      }

      $http.get(quandlAPI + $scope.newStock + '.json', {
        params: {
          sort_order: 'asc',
          exclude_headers: true,
          trim_start: startDate,
          trim_end: endDate,
          auth_token: quandlAuthToken
        }
      }).success(function (stockData) {
        var newStockInfo = {
          type: "line",
          name: $scope.newStock,
          data: stockData.data.map(function (arr) {
            return [$filter('date')(arr[0], 'longDate'), arr[4]]
          }),
          marker: {
            enabled: false
          },
          color: $scope.getRandomColor()
        };

        $http.post('/api/stocks', newStockInfo).success(function () {
          $scope.newStock = '';
          showStocks();
        })
      });
    };

    $scope.deleteStock = function (stock) {
      $http.delete('/api/stocks/' + stock._id).success(function () {
        showStocks();
      });
    };

    $scope.getRandomColor = function () {
      var letters = '0123456789ABCDEF'.split('');
      var color = '#';
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });

  });
