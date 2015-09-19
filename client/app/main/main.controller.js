'use strict';

angular.module('stockStreamApp')
  .controller('MainCtrl', function ($scope, $http, $timeout, socket, $filter) {
    var date = new Date(),
      year = date.getFullYear(),
      dateStr = date.toLocaleDateString().split('/').join('-');

    function showStocks() {
      $http.get('/api/stocks').success(function (stocks) {
        $scope.stocks = stocks;
        socket.syncUpdates('stocks', $scope.stocks, function (event, stock, stocks) {
          setTimeout(function () {
            $scope.refeshChart();
          }, 600);
        });
        $scope.refeshChart();
      });
    }

    $scope.refeshChart = function () {
      $('#container').highcharts({
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
      $http.get('https://www.quandl.com/api/v1/datasets/WIKI/' + $scope.newStock + '.json?sort_order=asc&exclude_headers=true&trim_start=' + year + '-01-01&trim_end=' + dateStr + '&auth_token=PwyZscKorv3wCa-dEbtX')
        .success(function (stockData) {
          var stockInfo = {
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
          console.log('stockInfo:', stockInfo);

          $http.post('/api/stocks', stockInfo).success(function () {
            $scope.newStock = '';
            // refresh page
            showStocks();
          })


        })
      $http.post('/api/things', {
        name: $scope.newThing
      });
      $scope.newThing = '';
    };

    $scope.deleteStock = function (stock) {
      $http.delete('/api/stocks/' + stock._id).success(function () {
        $http.get('/api/stocks/').success(function (stocks) {
          $scope.stocks = stocks;
          //
          socket.syncUpdates('stock', $scope.stocks, function (event, stock, stocks) {
            $scope.refreshChart();
          });
          $scope.refreshChart();
        })
      });
    };

    $scope.getRandomColor = function () {
      var i,
        l = "0123456789abcdef".split(""),
        color = "#";
      for (i = 0; i < 6; i++) {
        color = color + l[Math.floor(Math.random() * 16)];
      }
      return color;
    }

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('stock');
    });
  });
