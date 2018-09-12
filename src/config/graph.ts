export const BarOption = {
  legend: {
    show: false,
    bottom: '0'
  },
  tooltip: {},
  dataset: {
    source: []
  },
  xAxis: { type: 'category' },
  yAxis: {},
  series: [{ type: 'bar' }]
}
export const LineOption = {
  legend: {
    show: false,
    bottom: '0'
  },
  tooltip: {},
  dataset: {
    source: []
  },
  xAxis: { type: 'category' },
  yAxis: {},
  series: [{ type: 'line' }],
  backgroundColor: {
    type: 'linear',
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      {
        offset: 0,
        color: 'red'
      },
      {
        offset: 1,
        color: 'blue'
      }
    ],
    globalCoord: false
  }
}
export const PieOption = {
  legend: { show: false, bottom: '0' },
  tooltip: {},
  dataset: { source: [] },
  xAxis: { show: false },
  yAxis: { show: false },
  series: [
    {
      type: 'pie',
      radius: ['50%', '70%'],
      emphasis: {
        itemStyle: {
          shadowColor: 'rgba(0,0,0,0.5)',
          shadowBlur: 20
        }
      }
    }
  ]
}

export default {
  BarOption,
  PieOption,
  LineOption
}
