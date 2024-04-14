import { Component, OnInit, Input, Output, EventEmitter, input, effect } from '@angular/core';
import Chart, { ChartItem, ChartData, ChartDataset, ChartConfiguration } from 'chart.js/auto';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CollisionModel } from '../../collision-model';
import { LineChartModel, DataSets } from '../chart-model';
import { FilterModel } from '../../config-model';
import { ListData } from '../../config-model';
import { IndividualModel } from '../../individual-model';


@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss'
})
export class LineChartComponent implements OnInit {
  constructor() {
    //this is required because the listData gets initialized before it loads, so it has to rerun it.  Not ideal.
    //this results in the chart being rendered twice at the beginning.
    effect(() => {
      if (this.listData().citiesList) {
        this.setSeries()
      }
    })
  }
  @Input() datas!: CollisionModel[]
  @Input() filter!: FilterModel
  driverData = input.required<IndividualModel[]>({ alias: 'i' })
  listData = input.required<ListData>({ alias: 'l' })
  public duration: string = 'year'
  public series: string = 'jurisdiction'
  public lineChartModel!: Chart
  public chartData = {} as ChartData
  public chartDataSet = {} as ChartDataset
  public chartConfig = {} as ChartConfiguration
  public chart: any

  ngOnInit(): void {
    this.chartData.labels = []
    this.createChart();
  }

  setDuration(label: string = 'All Records', seriesData: CollisionModel[] = this.datas, setLabels: boolean = true) {
    const chartDataSet = {} as ChartDataset
    chartDataSet.data = []
    if (this.duration == 'none') {
      this.chartData.labels = ['Total']
      chartDataSet.label = label
      chartDataSet.data.push(seriesData.length)
      this.chartData.datasets.push(chartDataSet)
      this.chartConfig.data = this.chartData
    }
    if (this.duration == 'year') {
      this.chartData.labels = Array.from(new Set(this.datas.map((item) => new Date(item.colldte).getFullYear().toString())))
      this.chartData.labels = this.chartData.labels!.sort((n1: any, n2: any) => n1 - n2)
      this.chartData.labels!.forEach((item) => {
        let list = seriesData.filter((it) => {
          return (new Date(it.colldte).getFullYear().toString() == item)
        })
        chartDataSet.label = label
        chartDataSet.data.push(list.length)
        this.chartData.datasets.push(chartDataSet)
        this.chartConfig.data = this.chartData
      })

    }
    if (this.duration == 'month') {
      let labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      this.chartData.labels = labels
      let ar = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      ar.forEach((ari) => {
        let list = seriesData.filter((it) => {
          return (new Date(it.colldte).getMonth() == ari)
        })
        chartDataSet.label = label
        chartDataSet.data.push(list.length)
      })
      // console.log(chartDataSet)
      this.chartData.datasets.push(chartDataSet)
      this.chartConfig.data = this.chartData
    }
    if (this.duration == 'dow') {
      let labels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      this.chartData.labels = labels
      let ar = [0, 1, 2, 3, 4, 5, 6]
      ar.forEach((ari) => {
        let list = seriesData.filter((it) => {
          return (new Date(it.colldte).getDay() == ari)
        })
        chartDataSet.label = label
        chartDataSet.data.push(list.length)
      })
      // console.log(chartDataSet)
      this.chartData.datasets.push(chartDataSet)
      this.chartConfig.data = this.chartData
    }
    if (this.duration == 'tod') {
      let labels = ['12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm']
      this.chartData.labels = labels
      let ar = ['12AM', '01AM', '02AM', '03AM', '04AM', '05AM', '06AM', '07AM', '08AM', '09AM', '10AM', '11AM', '12PM', '01PM', '02PM', '03PM', '04PM', '05PM', '06PM', '07PM', '08PM', '09PM', '10PM', '11PM']
      ar.forEach((ari) => {
        let list = seriesData.filter((it) => {
          if (it.collision_time.endsWith(' M')) {
            if (ari.slice(2, 4) == 'AM') {
              return (it.collision_time.split(':')[0] == ari.slice(0, 2))
            }
            else {
              return (it.collision_time.split(':')[0] == ari.slice(0, 2) + 12)
            }
          }
          else {
            return (it.collision_time.split(':')[0] == ari.slice(0, 2) && it.collision_time.slice(6, 8) == ari.slice(2, 4))
          }
        })
        chartDataSet.label = label
        chartDataSet.data.push(list.length)
      })
      this.chartData.datasets.push(chartDataSet)
      this.chartConfig.data = this.chartData
    }
    if (this.duration == 'age') {
      let ddArray:number[] = this.driverData().map(item => +item.age).sort((a,b) => a-b).filter(x => x>0)
      this.chartData.labels = Array.from(new Set (ddArray))
      this.chartData.labels.forEach((clabel) => {
        if (clabel != 0) {
          let driverAge: IndividualModel[] = this.driverData().filter((dd) => dd.age == clabel)
          // let d1Age: IndividualModel[] = driverAge.filter((ea) => ea.person_number == 1)
          let AgeMRN: number[] = driverAge.map((each) => Number(each.mrn))
          let mrns = seriesData.map(item => +item.mrn).filter(it => AgeMRN.includes(it))
          chartDataSet.label = label
          chartDataSet.data.push(mrns.length)
        }
      })
      this.chartData.datasets.push(chartDataSet)
      this.chartConfig.data = this.chartData
    }
    if (this.duration == 'agedriver') {
      let ddArray:number[] = this.driverData().map(item => +item.age).sort((a,b) => a-b).filter(x => x>0)
      this.chartData.labels = Array.from(new Set (ddArray))
      this.chartData.labels.forEach((clabel) => {
        if (clabel != 0) {
          let driverAge: IndividualModel[] = this.driverData().filter((dd) => dd.age == clabel)
          let d1Age: IndividualModel[] = driverAge.filter((ea) => ea.vehicle_number == 1)
          let AgeMRN: number[] = d1Age.map((each) => Number(each.mrn))
          let mrns = seriesData.map(item => +item.mrn).filter(it => AgeMRN.includes(it))
          if (label == 'All Records') {label = ''}
          chartDataSet.label = label + ' Driver 1'
          chartDataSet.data.push(mrns.length)
        }
      })
      this.chartData.datasets.push(chartDataSet)
      this.chartConfig.data = this.chartData

      const chartDataSet2 = {} as ChartDataset
      chartDataSet2.data = []
      this.chartData.labels.forEach((clabel) => {
        if (clabel != 0) {
          let driverAge: IndividualModel[] = this.driverData().filter((dd) => dd.age == clabel)
          let d2Age: IndividualModel[] = driverAge.filter((ea) => ea.vehicle_number > 1)
          let AgeMRN: number[] = d2Age.map((each) => Number(each.mrn))
          let mrns = seriesData.map(item => +item.mrn).filter(it => AgeMRN.includes(it))
          if (label == 'All Records') {label = ''}
          chartDataSet2.label = label + ' Driver 2+'
          chartDataSet2.data.push(mrns.length)
        }
      })
      this.chartData.datasets.push(chartDataSet2)
      this.chartConfig.data = this.chartData
    }
  }

  setSeries() {
    this.chartData.labels = []
    if (this.series == 'jurisdiction') {
      if (this.filter.jurisdition?.length == 0) {
        this.listData().citiesList.forEach((jurisdication) => {
          let seriesData: CollisionModel[] = this.datas.filter((item) => {
            return (item.city == jurisdication)
          })
          if (seriesData.length > 0) {
            this.setDuration(jurisdication, seriesData)
          }
        })
      }
      else {
        this.filter.jurisdition?.forEach((jurisdication) => {
          let seriesData: CollisionModel[] = this.datas.filter((item) => {
            return (item.city == jurisdication)
          })
          if (seriesData.length > 0) {
            this.setDuration(jurisdication, seriesData)
          }
        })
      }
    }
    else if (this.series == 'manner_of_collision') {
      if (this.filter.manner_of_collision?.length == 0) {
        this.listData().mannerOfCollisionList?.forEach((manner) => {
          let seriesData: CollisionModel[] = this.datas.filter((item) => {
            return (item.manner_of_collision == manner)
          })
          // if(seriesData.length > 0) {
          this.setDuration(manner, seriesData, false)
          // }
        })
      }
      else {
        this.filter.manner_of_collision?.forEach((manner) => {
          let seriesData: CollisionModel[] = this.datas.filter((item) => {
            return (item.manner_of_collision == manner)
          })
          // if(seriesData.length > 0) {
          this.setDuration(manner, seriesData, false)
          // }
        })
      }
    }
      else if (this.series == 'primary_factor') {
        if (this.filter.primary_factor?.length == 0) {
          this.listData().primaryFactorList?.forEach((factor) => {
            let seriesData: CollisionModel[] = this.datas.filter((item) => {
              return (item.primary_factor == factor)
            })
            // if(seriesData.length > 0) {
            this.setDuration(factor, seriesData, false)
            // }
          })
        }
        else {
          this.filter.primary_factor?.forEach((factor) => {
            let seriesData: CollisionModel[] = this.datas.filter((item) => {
              return (item.primary_factor == factor)
            })
            // if(seriesData.length > 0) {
            this.setDuration(factor, seriesData, false)
            // }
          })
        }
  
    }
    else if (this.series == 'severity') {
      let seriesData: CollisionModel[] = this.datas.filter((item) => {
        return (item.vehicles_involved > 0 && item.number_dead == 0 && item.number_injured == 0)
      })
      if (seriesData.length > 0) {
        this.setDuration('Property Damage', seriesData)
      }
      seriesData = this.datas.filter((item) => {
        return (item.number_dead == 0 && item.number_injured > 0)
      })
      if (seriesData.length > 0) {
        this.setDuration('Injury', seriesData, false)
      }
      seriesData = this.datas.filter((item) => {
        return (item.number_dead > 0)
      })
      if (seriesData.length > 0) {
        this.setDuration('Fatal', seriesData, false)
      }
    }
    else if (this.series == 'driver') {
      console.log('splitting by driver')
        this.setDuration('By Driver', this.datas)
    }
    else {
      // console.log('total')
      this.setDuration()
    }
    this.renderChart()
  }

  updateChart(datas?: CollisionModel[]) {
    this.chartData.datasets = []
    if (datas) { this.datas = datas }
    this.setSeries()
  }

  renderChart() {
    this.chart.destroy()
    this.chartConfig.options = {}
    this.chartConfig.options.aspectRatio = 2.5
    this.chartConfig.type = 'bar'
    this.chart = new Chart("MyChart", this.chartConfig)
    this.chart.update()
  }

  createChart() {
    this.chart = new Chart("MyChart", {
      type: 'line', //this denotes tha type of chart

      data: {// values on X-Axis
        labels: ['2022-05-10', '2022-05-11', '2022-05-12', '2022-05-13',
          '2022-05-14', '2022-05-15', '2022-05-16', '2022-05-17',],
        datasets: [
          {
            label: "Sales",
            data: ['467', '576', '572', '79', '92',
              '574', '573', '576']
          },
          {
            label: "Profit",
            data: ['542', '542', '536', '327', '17',
              '0.00', '538', '541']
          }
        ]
      },
      options: {
        aspectRatio: 2.5
      }
    });
  }
}
