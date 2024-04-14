
export class DataSets {
    label!: string
    data: string[] = []
    segment!: string
}
export class Data {
    labels: string[] = []
    datasets: DataSets[] = []
}
export class Options {
    aspectRatio?: number
}

export class LineChartModel {
    type: string = 'line'
    data = new Data();
    options!: Options;
}