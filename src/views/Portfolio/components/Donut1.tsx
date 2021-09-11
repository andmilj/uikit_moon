import { Button } from '@pancakeswap-libs/uikit'
import React, { useState } from 'react'
import Chart from 'react-apexcharts'

interface Donut1props {
  data: any[]
}
const Donut1: React.FC<Donut1props> = ({ data }) => {
  const options = {
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              show: true,
              color: '#888888',
            },
            value: {
              show: true,
              color: '#888888',
            },
            total: {
              show: true,
              color: '#888888',
            },
          },
        },
      },
    },
    states: {
      normal: {
        allowMultipleDataPointsSelection: true,
        filter: {
          type: 'none',
          value: 0,
        },
      },
      hover: {
        filter: {
          type: 'lighten',
          value: 0.15,
        },
      },
      active: {
        filter: {
          type: 'darken',
          value: 0.35,
        },
      },
    },
    chart: {
      redrawOnParentResize: true,
      // width: 380,
      id: 'chart',
      events: {
        dataPointSelection: (event, chartContext, config) => {
          console.log(event, chartContext, config)
        },
      },
    },
    labels: data.map((s) => s.name),
    dataLabels: {
      enabled: true,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            show: false,
          },
        },
      },
    ],
    legend: {
      show: true,
      labels: {
        // colors: ["#991122","#991122","#991122","#991122"],
        useSeriesColors: true,
      },
      // position: 'right',
      // offsetY: 0,
      // height: 230,
    },
  }

  // function appendData() {
  //   const arr = series.slice()
  //   arr.push(Math.floor(Math.random() * (100 - 1 + 1)) + 1)
  //   setSeries(arr)
  // }

  // function removeData() {
  //   if(series.length === 1) return

  //   const arr = series.slice()
  //   arr.pop()

  //   setSeries(arr);
  // }

  // function randomize() {
  //     setSeries(series.map(function() {
  //         return Math.floor(Math.random() * (100 - 1 + 1)) + 1
  //       }));
  // }

  // function reset() {
  //   setSeries([44, 55, 13, 33])
  // }

  return <Chart options={options} series={data.map((s) => s.value)} type="donut" />
}
export default Donut1
