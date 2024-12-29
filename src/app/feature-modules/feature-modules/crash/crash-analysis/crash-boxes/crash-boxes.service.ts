import { Injectable } from '@angular/core';
import { DisplayGroup, DisplaySubgroup, DisplayColumn, ListData } from '../config-model';

@Injectable({
  providedIn: 'root'
})
export class CrashBoxesService {
  locationarray: string[][] =
    [['id', 'ID', 'Location', 'string', 'true'],
    ['StreetName', 'Street Name', 'Location', 'string', 'true']]
  classificationarray: string[][]=
    [['Classification', 'Classification', 'Location', 'string', 'false'],
    ['Subclassification', 'Subclassification', 'Location', 'string', 'false'],
    ['Owner', 'Owner', 'Classifications', 'string', 'false']]
  totalarray: string[][] =
    [['totalCollisions', '#', 'total', 'number', 'true'], //]
    ['totalCost', '#', 'total', 'number', 'true']]
  injuryarray: string[][] =
    [['injuryCrashDSS', '#', 'injury', 'number', 'true'],
    ['injuryCrashPDSS', '%', 'injury', 'percent', 'false'],
    ['injuryCrashDev', '+/-', 'injury', 'number', 'false']]

  constructor() { }

  generateDisplayColumns(listData: ListData): DisplayGroup[] {
    let display: DisplayGroup[] = []
    let generalGroup: DisplayGroup = new DisplayGroup
    generalGroup.group = 'General'
    let locationSubgroup: DisplaySubgroup = new DisplaySubgroup
    locationSubgroup.subgroup = 'Location'
    locationSubgroup.columns = 2
    this.locationarray.forEach((x) => {
      let DiS = new DisplayColumn
      DiS.name = x[0]
      DiS.title = x[1]
      DiS.type = x[3]
      DiS.visible = Boolean(x[3])
      locationSubgroup.displayColumn.push(DiS)
    })
    let classificationSubgroup: DisplaySubgroup = new DisplaySubgroup
    classificationSubgroup.subgroup = 'Classifications'
    classificationSubgroup.columns = this.classificationarray.length
    classificationSubgroup.visible = false
    this.classificationarray.forEach((x) => {
      let DiS = new DisplayColumn
      DiS.name = x[0]
      DiS.title = x[1]
      DiS.type = x[3]
      DiS.visible = false
      classificationSubgroup.displayColumn.push(DiS)
    })
    let totalSubgroup: DisplaySubgroup = new DisplaySubgroup
    totalSubgroup.subgroup = 'Total'
    totalSubgroup.columns = 2
    this.totalarray.forEach((x) => {
      let DiS = new DisplayColumn
      DiS.name = x[0]
      DiS.title = x[1]
      DiS.type = x[3]
      DiS.visible = Boolean(x[3])
      totalSubgroup.displayColumn.push(DiS)
    })
    let injurySubgroup: DisplaySubgroup = new DisplaySubgroup
    injurySubgroup.subgroup = 'Injury'
    injurySubgroup.columns = 3
    this.injuryarray.forEach((x) => {
      let DiS = new DisplayColumn
      DiS.name = x[0]
      DiS.title = x[1]
      DiS.type = x[3]
      DiS.visible = Boolean(x[3])
      injurySubgroup.displayColumn.push(DiS)
    })
    generalGroup.displaySubGroup.push(locationSubgroup)
    generalGroup.displaySubGroup.push(classificationSubgroup)
    generalGroup.displaySubGroup.push(totalSubgroup)
    generalGroup.displaySubGroup.push(injurySubgroup)

    let lightGroup = new DisplayGroup
    lightGroup.group = 'Light Condition'
    listData.lightConditionList.forEach((x) => {
      if (x != "") {
        let lightSubgroup = new DisplaySubgroup
        let y = ""
        y = x.replace('/','')
        y = y.replace('(','')
        y = y.replace(')','')
        y = y.replace(' ','')
        y = y.replace(/\s/g, "")
        lightSubgroup.subgroup = x
        lightSubgroup.columns = 3
        lightSubgroup.visible = false
        let displayColumn = new DisplayColumn
        displayColumn.name = y + 'DS'
        displayColumn.title = '#'
        displayColumn.type = 'number'
        displayColumn.visible = false
        lightSubgroup.displayColumn.push(displayColumn)
        displayColumn = new DisplayColumn
        displayColumn.name = y + 'PS'
        displayColumn.title = '%'
        displayColumn.type = 'percent'
        displayColumn.visible = false
        lightSubgroup.displayColumn.push(displayColumn)
        displayColumn = new DisplayColumn
        displayColumn.name = y + 'DV'
        displayColumn.title = '+/-'
        displayColumn.type = 'number'
        displayColumn.visible = false
        lightSubgroup.displayColumn.push(displayColumn)
        lightGroup.displaySubGroup.push(lightSubgroup)
      }
    })

    let mannerGroup = new DisplayGroup
    mannerGroup.group = 'Manner'
    listData.mannerOfCollisionList.forEach((x) => {
      if (x != "") {
        let mannerSubgroup = new DisplaySubgroup
        let y = ""
        y = x.replace('/','')
        y = y.replace('(','')
        y = y.replace(')','')
        y = y.replace(' ','')
        y = y.replace('-','')
        y = y.replace(/\s/g, "")
        mannerSubgroup.subgroup = x
        mannerSubgroup.columns = 3
        mannerSubgroup.visible = false
        let displayColumn = new DisplayColumn
        displayColumn.name = y + 'DS'
        displayColumn.title = '#'
        displayColumn.type = 'number'
        displayColumn.visible = false
        mannerSubgroup.displayColumn.push(displayColumn)
        displayColumn = new DisplayColumn
        displayColumn.name = y + 'PS'
        displayColumn.title = '%'
        displayColumn.type = 'percent'
        displayColumn.visible = false
        mannerSubgroup.displayColumn.push(displayColumn)
        displayColumn = new DisplayColumn
        displayColumn.name = y + 'DV'
        displayColumn.title = '+/-'
        displayColumn.type = 'number'
        displayColumn.visible = false
        mannerSubgroup.displayColumn.push(displayColumn)
        mannerGroup.displaySubGroup.push(mannerSubgroup)
      }
    })
    display.push(generalGroup)
    display.push(lightGroup)
    display.push(mannerGroup)
    return display
  }

}
