import { Component, OnInit, Input, Output, EventEmitter, input, effect, computed, model } from '@angular/core';
import Chart, { ChartItem, ChartData, ChartDataset, ChartConfiguration } from 'chart.js/auto';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CollisionModel, TrafficChange } from '../../collision-model';
import { LineChartModel, DataSets } from '../chart-model';
import { FilterModel } from '../../config-model';
import { ListData } from '../../config-model';
import { IndividualModel } from '../../individual-model';
import { ColorLike } from 'ol/colorlike';

interface LinearRegressionResult {
  slope: number;
  intercept: number;
}

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss'
})
export class LineChartComponent implements OnInit {
  constructor() {
    effect(() => {
      if (this.filteredCollisions()) {
        console.log('filteredCollisions updated', this.filteredCollisions().length, this.filteredCollisionLength)
        if (this.filteredCollisions().length != this.filteredCollisionLength) {
          this.filteredCollisionLength = this.filteredCollisions().length
          this.updateChart()
        }
        else {
          console.log('not running updateChart')
        }
      }
    })
    effect(() => {
      // if (this.trafficChange()) {  //This thing runs even when it doesn't change.
        console.log('trafficChange effect')
       if (this.trafficChange() != this.tempTC) {
          this.tempTC = this.trafficChange() 
          this.updateChart()
        }
          console.log('not running trafficChange effect')
      }
      
    // }
  )
  }
  filteredCollisions = model.required<CollisionModel[]>()  //for some reason, making this a model makes it go automatically.
  filter = input.required<FilterModel>()
  driverData = input.required<IndividualModel[]>({ alias: 'i' })
  listData = input.required<ListData>({ alias: 'l' })
  startDate = input.required<Date>()
  endDate = input.required<Date>()
  trafficChange = input.required<TrafficChange>({ alias: 'tc' })
  tempTC!: TrafficChange

  public duration: string = 'year'
  public series: string = 'jurisdiction'
  public measure: string = 'number'
  public type: string = 'bar'
  public lineChartModel!: Chart
  public chartData = {} as ChartData
  public chartDataSet = {} as ChartDataset
  public chartConfig = {} as ChartConfiguration
  public chart: any
  public filteredCollision: CollisionModel[] = []
  public filteredCollisionLength: number = 0
  

  ngOnInit(): void {
    this.chartData.labels = []
    this.createChart();
    // this.filteredCollision = this.filteredCollisions()
  }

  setDuration(label: string = 'All Records', seriesData: CollisionModel[] = this.filteredCollisions(), setLabels: boolean = true) {
    if (this.trafficChange()) { this.duration = '6monthmovingsum' }
    const chartDataSet = {} as ChartDataset
    chartDataSet.data = []
    if (this.duration == 'none') {
      this.chartData.labels = ['Total']
      chartDataSet.label = label
      if(this.measure == 'cost') {
        if (seriesData.length > 0) {
          chartDataSet.data.push(seriesData.map((collision) => collision.cost).reduce((a,b) => a+b))
        }
        else {
          chartDataSet.data.push(0)
        }
      }
      
      else {
        chartDataSet.data.push(seriesData.length)
      }
      this.chartData.datasets.push(chartDataSet)
      this.chartConfig.data = this.chartData
    }
    if (this.duration == 'year') {
      this.chartData.labels = Array.from(new Set(this.filteredCollisions().map((item) => this.parseDateString(item.collision_date).getFullYear().toString())))
      this.chartData.labels = this.chartData.labels!.sort((n1: any, n2: any) => n1 - n2)
      this.chartData.labels!.forEach((item) => {
        let list = seriesData.filter((it) => {
          return (this.parseDateString(it.collision_date).getFullYear().toString() == item)
        })
        chartDataSet.label = label
        if(this.measure == 'cost') {
          if (list.length > 0) {
            chartDataSet.data.push(list.map((collision) => collision.cost).reduce((a,b) => a+b))
          }
          else {
            chartDataSet.data.push(0)
          }
        }
        else {
          chartDataSet.data.push(list.length)
        }
        if (!this.chartData.datasets) { this.chartData.datasets = [] }  //needs to be here just for switching between crashbox/no crashbox
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
          return (this.parseDateString(it.collision_date).getMonth() == ari)
        })
        chartDataSet.label = label
        if(this.measure == 'cost') {
          if (list.length > 0) {
            chartDataSet.data.push(list.map((collision) => collision.cost).reduce((a,b) => a+b))
          }
          else {
            chartDataSet.data.push(0)
          }
        }
        else {
          chartDataSet.data.push(list.length)
        }
      })
      this.chartData.datasets.push(chartDataSet)
      this.chartConfig.data = this.chartData
    }
    if (this.duration == 'dow') {
      let labels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      this.chartData.labels = labels
      let ar = [0, 1, 2, 3, 4, 5, 6]
      ar.forEach((ari) => {
        let list = seriesData.filter((it) => {
          return (this.parseDateString(it.collision_date).getDay() == ari)
        })
        chartDataSet.label = label
        if(this.measure == 'cost') {
          if (list.length > 0) {
            chartDataSet.data.push(list.map((collision) => collision.cost).reduce((a,b) => a+b))
          }
          else {
            chartDataSet.data.push(0)
          }
        }
        else {
          chartDataSet.data.push(list.length)
        }
      })
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
        if(this.measure == 'cost') {
          if (list.length > 0) {
            chartDataSet.data.push(list.map((collision) => collision.cost).reduce((a,b) => a+b))
          }
          else {
            chartDataSet.data.push(0)
          }
        }
        else {
          chartDataSet.data.push(list.length)
        }
      })
      this.chartData.datasets.push(chartDataSet)
      this.chartConfig.data = this.chartData
    }
    if (this.duration == 'age') {
      let ddArray: number[] = this.driverData().map(item => +item.age).sort((a, b) => a - b).filter(x => x > 0)
      this.chartData.labels = Array.from(new Set(ddArray))
      this.chartData.labels.forEach((clabel) => {
        if (clabel != 0) {
          let driverAge: IndividualModel[] = this.driverData().filter((dd) => dd.age == clabel)
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
      let ddArray: number[] = this.driverData().map(item => +item.age).sort((a, b) => a - b).filter(x => x > 0)
      this.chartData.labels = Array.from(new Set(ddArray))
      this.chartData.labels.forEach((clabel) => {
        if (clabel != 0) {
          let driverAge: IndividualModel[] = this.driverData().filter((dd) => dd.age == clabel)
          let d1Age: IndividualModel[] = driverAge.filter((ea) => ea.vehicle_number == 1)
          let AgeMRN: number[] = d1Age.map((each) => Number(each.mrn))
          let mrns = seriesData.map(item => +item.mrn).filter(it => AgeMRN.includes(it))
          if (label == 'All Records') { label = '' }
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
          if (label == 'All Records') { label = '' }
          chartDataSet2.label = label + ' Driver 2+'
          chartDataSet2.data.push(mrns.length)
        }
      })
      this.chartData.datasets.push(chartDataSet2)
      this.chartConfig.data = this.chartData
    }
    ///Trying this
    if (this.duration == '6monthmovingsum') {
      let fC: CollisionModel[] = this.filteredCollisions().sort((a, b) => { return this.parseDateString(a.collision_date).getTime() - this.parseDateString(b.collision_date).getTime() })
      let sortedCollisions: CollisionModel[] = seriesData.sort((a, b) => { return this.parseDateString(a.collision_date).getTime() - this.parseDateString(b.collision_date).getTime() })
      let start_date: Date = this.startDate()
      let end_date: Date = this.endDate()
      let currentDate = new Date(start_date)
      let sixmonthsDate = new Date(start_date)
      currentDate.setMonth(currentDate.getMonth() + 6)
      let chartDataSet = {} as ChartDataset
      chartDataSet.data = []
      let lrx: number[] = []
      let lry: number[] = []
      let lrDataSet = {} as ChartDataset
      lrDataSet.data = []
      let i: number = 1
      while (currentDate <= end_date) {
        lrx.push(i)
        i++
        let lbl = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })
        if (!this.chartData.labels!.includes(lbl)) {
          this.chartData.labels?.push(currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' }))
        }
        chartDataSet.label = label
        lrDataSet.label = label + ' Trend'
        if(this.measure == 'cost') {
          chartDataSet.data.push(sortedCollisions.filter((collision) => {
            if (this.parseDateString(collision.collision_date) < currentDate && this.parseDateString(collision.collision_date) >= sixmonthsDate) {
              return true
            }
            else {
              return false
            }
          }).map((c) => c.cost).reduce((a,b) => a+b))
          lry.push(sortedCollisions.filter((collision) => {
            if (this.parseDateString(collision.collision_date) < currentDate && new Date(collision.collision_date) >= sixmonthsDate) {
              return true
            }
            else {
              return false
            }
          }).map((c) => c.cost).reduce((a,b) => a+b))
        }
        else {
          chartDataSet.data.push(sortedCollisions.filter((collision) => {
            if (this.parseDateString(collision.collision_date) < currentDate && this.parseDateString(collision.collision_date) >= sixmonthsDate) {
              return true
            }
            else {
              return false
            }
          }).length)
          lry.push(sortedCollisions.filter((collision) => {
            if (this.parseDateString(collision.collision_date) < currentDate && new Date(collision.collision_date) >= sixmonthsDate) {
              return true
            }
            else {
              return false
            }
          }).length)
        }
        currentDate.setMonth(currentDate.getMonth() + 1);
        sixmonthsDate.setMonth(sixmonthsDate.getMonth() + 1)
      }
      if (!this.trafficChange()) {
        let intercept = this.linearRegression(lrx, lry)!.intercept
        let slope = this.linearRegression(lrx, lry)!.slope
        lrDataSet.label = label + " " + slope.toFixed(3)
        let j: number = 0
        while (j <= i) {
          j++
          lrDataSet.data.push(intercept + j * slope)
        }
        lrDataSet.data.push(intercept)
        lrDataSet.data.push(intercept + this.linearRegression(lrx, lry)!.slope * 60)
        this.chartData.datasets.push(lrDataSet)
        this.chartData.datasets.push(chartDataSet)
      }
      else { //This is if there is a traffic change selected
        let change: TrafficChange = this.trafficChange()
        let m1: number = this.monthsBetweenDates(new Date(this.startDate()), new Date(change.start_date)) - 6
        let m2: number
        m2 = m1 + this.monthsBetweenDates(new Date(change.start_date), new Date(change.end_date)) - 1
        let m3: number
        m3 = m2 + this.monthsBetweenDates(new Date(change.end_date), new Date(this.endDate()))
        let TCLRx = lrx.slice(0, m1+6)
        let TCLRy = lry.slice(0, m1+6)
        let total = TCLRy.reduce(((a,b) => a+b))
        let average = total/(m1+6)
        lrDataSet.label = label + " Before= " + average.toFixed(3)
        let j: number = 0
        while (j < m1+6) {
          j++
          lrDataSet.data.push(average)
        }
        if (m2-m1 > 0) {
          TCLRx = lrx.slice(m1+6, m2+7)
          TCLRy = lry.slice(m1+6, m2+7)
          total = TCLRy.reduce(((a,b) => a+b))
          average = total/(m2-m1+1)
          if (m2-m1 >0) {lrDataSet.label = lrDataSet.label + " During= " + average.toFixed(3)}
          j = m1+6
          while (j < m2+7) {
            j++
            lrDataSet.data.push(average)
          }
          this.chartData.datasets.push(lrDataSet)  
        }
        TCLRx = lrx.slice(m2+7, m3)
        TCLRy = lry.slice(m2+7, m3)
        if (TCLRy.length > 0) {total = TCLRy.reduce(((a,b) => a+b))} else {total = 0}
        average = total/((m3-(m2+7)))
        lrDataSet.label = lrDataSet.label + " After= " + average.toFixed(3)
        j = m2+6
        while (j <= m3) {
          j++
          lrDataSet.data.push(average)
        }
        this.chartData.datasets.push(lrDataSet)
        this.chartData.datasets.push(chartDataSet)
      }
    }
    this.chartConfig.data = this.chartData
  }

  linearRegression(xValues: number[], yValues: number[]): LinearRegressionResult | null {
    // Check if the input arrays have the same length
    if (xValues.length !== yValues.length) {
      console.error("Arrays must have the same length");
      return null;
    }

    // Calculate the mean of x and y values
    const xMean = xValues.reduce((acc, val) => acc + val, 0) / xValues.length;
    const yMean = yValues.reduce((acc, val) => acc + val, 0) / yValues.length;

    // Calculate the slope (m)
    const numerator = xValues.reduce((acc, x, i) => acc + (x - xMean) * (yValues[i] - yMean), 0);
    const denominator = xValues.reduce((acc, x) => acc + Math.pow(x - xMean, 2), 0);
    const slope = numerator / denominator;

    // Calculate the intercept (b)
    const intercept = yMean - slope * xMean;

    return { slope, intercept };
  }

  monthsBetweenDates(startDate: Date, endDate: Date): number {
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();
    return (endYear - startYear) * 12 + endMonth - startMonth;
  }

  setSeries() {
    this.chartData.labels = []
    if (this.series == 'jurisdiction') {
      if (this.filter().jurisdition?.length == 0) {
        this.listData().citiesList.forEach((jurisdication) => {
          let seriesData: CollisionModel[] = this.filteredCollisions().filter((item) => {
            return (item.city == jurisdication)
          })
          if (seriesData.length > 0) {
            this.setDuration(jurisdication, seriesData)
          }
        })
      }
      else {
        this.filter().jurisdition.forEach((jurisdication) => {
          let seriesData: CollisionModel[] = this.filteredCollisions().filter((item) => {
            return (item.city == jurisdication)
          })
          if (seriesData.length > 0) {
            this.setDuration(jurisdication, seriesData)
          }
        })
      }
    }
    else if (this.series == 'manner_of_collision') {
      if (this.filter().manner_of_collision?.length == 0) {
        this.listData().mannerOfCollisionList?.forEach((manner) => {
          let seriesData: CollisionModel[] = this.filteredCollisions().filter((item) => {
            return (item.manner_of_collision == manner)
          })
          if (seriesData.length > 0) {
            this.setDuration(manner, seriesData, false)
          }
        })
      }
      else {
        this.filter().manner_of_collision?.forEach((manner) => {
          let seriesData: CollisionModel[] = this.filteredCollisions().filter((item) => {
            return (item.manner_of_collision == manner)
          })
          // if(seriesData.length > 0) {
          this.setDuration(manner, seriesData, false)
          // }
        })
      }
    }
    else if (this.series == 'primary_factor') {
      if (this.filter().primary_factor?.length == 0) {
        this.listData().primaryFactorList?.forEach((factor) => {
          let seriesData: CollisionModel[] = this.filteredCollisions().filter((item) => {
            return (item.primary_factor == factor)
          })
          // if(seriesData.length > 0) {
          this.setDuration(factor, seriesData, false)
          // }
        })
      }
      else {
        this.filter().primary_factor?.forEach((factor) => {
          let seriesData: CollisionModel[] = this.filteredCollisions().filter((item) => {
            return (item.primary_factor == factor)
          })
          // if(seriesData.length > 0) {
          this.setDuration(factor, seriesData, false)
          // }
        })
      }

    }
    else if (this.series == 'severity') {
      let seriesData: CollisionModel[] = this.filteredCollisions().filter((item) => {
        return (item.vehicles_involved > 0 && item.number_dead == 0 && item.number_injured == 0)
      })
      if (seriesData.length > 0) {
        this.setDuration('Property Damage', seriesData)
      }
      seriesData = this.filteredCollisions().filter((item) => {
        return (item.number_dead == 0 && item.number_injured > 0)
      })
      if (seriesData.length > 0) {
        this.setDuration('Injury', seriesData, false)
      }
      seriesData = this.filteredCollisions().filter((item) => {
        return (item.number_dead > 0)
      })
      if (seriesData.length > 0) {
        this.setDuration('Fatal', seriesData, false)
      }
    }
    else if (this.series == 'kabc') {
      console.log('kabc series')
      console.log(this.filter().kabc)
      if (this.filter().kabc?.length == 0) {
        this.listData().kabc?.forEach((kabc) => {
          let seriesData: CollisionModel[] = this.filteredCollisions().filter((item) => {
            return (item.kabc == kabc)
          })
          console.log(kabc, seriesData)
          if (seriesData.length > 0) {
            this.setDuration(kabc, seriesData, false)
          }
        })
      }
      else {
        this.filter().kabc?.forEach((kabc) => {
          let seriesData: CollisionModel[] = this.filteredCollisions().filter((item) => {
            return (item.kabc == kabc)
          })
          // if(seriesData.length > 0) {
          this.setDuration(kabc, seriesData, false)
          // }
        })
      }
    }
    else if (this.series == 'driver') {
      console.log('splitting by driver')
      this.setDuration('By Driver', this.filteredCollisions())
    }
    else {
      this.setDuration()
    }
    this.renderChart()
  }

  updateChart() {
    console.log('UpdateChart',this.filteredCollisions().length)
    this.chartData.datasets = []
    // if (filteredCollisions) { 
    //   this.filteredCollisions.set(filteredCollisions) }
    this.setSeries()
  }

  renderChart() {
    this.chart.destroy()
    this.chartConfig.options = {}
    this.chartConfig.options.aspectRatio = 2.5
    if (this.duration == '6monthmovingsum') { this.type = 'line' } else { this.type = 'bar' }
    switch (this.type) {
      case 'line':
        this.chartConfig.type = 'line'
        break
      case 'bar':
        this.chartConfig.type = 'bar'
        break
    }
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

parseDateString(dateString:string):Date {
  const dateOnlyRegex = /^([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1])))$/
  if (dateOnlyRegex.test(dateString)) {
    const utcDate = new Date(dateString)
    const localDate = new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000)
    return localDate  
  }
  return new Date(dateString)
}
}
