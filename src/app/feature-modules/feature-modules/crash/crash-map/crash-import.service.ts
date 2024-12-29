import { Injectable } from '@angular/core';
import { CrashHTTPService } from '../crash-analysis/crash_http.service';
import * as XLSX from 'xlsx'

@Injectable({
  providedIn: 'root'
})
export class CrashImportService {

  constructor(public crashHTTPService: CrashHTTPService) { }

  collisionImport(binaryData: any) {
    let data: any[] = []
    const workbook: XLSX.WorkBook = XLSX.read(binaryData, { type: 'binary' })
    const firstSheetName: string = workbook.SheetNames[0]
    const worksheet: XLSX.WorkSheet = workbook.Sheets[firstSheetName]
    const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    data = excelData
    this.crashHTTPService.uploadCollisions(data)
  }

  individualImport(binaryData: any) {
    let data: any[] = []
    const workbook: XLSX.WorkBook = XLSX.read(binaryData, { type: 'binary' })
    const firstSheetName: string = workbook.SheetNames[0]
    const worksheet: XLSX.WorkSheet = workbook.Sheets[firstSheetName]
    const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    data = excelData
    this.crashHTTPService.uploadIndividuals(data)
  }

  unitImport(binaryData: any) {
    let data: any[] = []
    const workbook: XLSX.WorkBook = XLSX.read(binaryData, { type: 'binary' })
    const firstSheetName: string = workbook.SheetNames[0]
    const worksheet: XLSX.WorkSheet = workbook.Sheets[firstSheetName]
    const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    data = excelData
    this.crashHTTPService.uploadUnits(data)
  }
  // crashImportXLS(collisionFile: File, individualFile: File, unitFile: File) {
  //   const workbook: XLSX.WorkBook = XLSX.read(collisionFile, { type: 'binary' })
  //   const firstSheetName: string = workbook.SheetNames[0]

  // }

  // crashImport(collisionFile: File, individualFile: File, unitFile: File) {
  //   console.log('crashImport')
  //   const reader = new FileReader
  //   let fileText: string
  //   reader.onload = () => {
  //     fileText = (reader.result as string)
  //     console.log(this.parseCSV(fileText))
  //     this.crashHTTPService.uploadCollisions(this.parseCSV(fileText, ','))
  //   }
  //   reader.readAsText(collisionFile)
  // }


  private parseCSV(csv: string, delimiter: string = ','): JSON[] {
    const titles = csv.slice(0, csv.indexOf('\r')).split(',');
    const rows: string[][] = []; // Always initialize as an empty array.
    const pattern = new RegExp(
      // Delimiters.
      `\\s*(${delimiter}|\\r?\\n|\\r|^)` +
      // Quoted fields.
      '(?:"([^"]*(?:""[^"]*)*)"|' +
      // Standard fields.
      '([^"\\' + delimiter + '\\r\\n]*))',
      'gi'
    );

    let matches: RegExpExecArray | null = null;
    let row: string[] = [];
    let fieldValue: string | undefined;

    while ((matches = pattern.exec(csv))) {
      const matchedDelimiter = matches[1];
      // console.log(row.length)
      // If a new line or end of input is encountered, push the row.
      if (matchedDelimiter.length && matchedDelimiter !== delimiter) {
        if (row.length > 0) {
          if (row.length == 61) { row.splice(56, 1); }
          // if (row.length == 62) {row.splice(57, 1);}
          // if (row.length == 63) {row.splice(57, 1);}

          rows.push(row);
          row = []; // Reset row for the next line.
        }
      }

      if (matches[2]) {
        // Handle quoted field.
        fieldValue = matches[2].replace(/""/g, '"');
      } else {
        // Handle standard field.
        fieldValue = matches[3];
      }

      row.push(fieldValue || '');

      // Handle the last line if it doesn't end with a new line.
      if (pattern.lastIndex === csv.length && row.length > 0) {
        if (row.length == 61) { row.splice(56, 1); }
        // if (row.length == 62) {row.splice(57, 1);}
        // if (row.length == 63) {row.splice(57, 1);}


        rows.push(row);
      }
    }

    return rows.map((row: any) => {
      return titles.reduce((object: any, curr: any, i: number) => (object[curr] = row[i], object), {})
    });
    // return rows; // Always returns a valid string[][]
  }

  private parseCSVWithQuotedCommaFields(csv: string, delimiter: string = ',', fieldsWithCommas: number[] = []): JSON[] {
    const titles = csv.slice(0, csv.indexOf('\r')).split(',');
    const rows: string[][] = [];
    const pattern = new RegExp(
      // Delimiters.
      `\\s*(${delimiter}|\\r?\\n|\\r|^)` +
      // Quoted fields.
      '(?:"([^"]*(?:""[^"]*)*)"|' +
      // Standard fields.
      '([^"\\' + delimiter + '\\r\\n]*))',
      'gi'
    );

    let matches: RegExpExecArray | null = null;
    let row: string[] = [];
    let fieldValue: string | undefined;
    let rowIndex = 0;

    while ((matches = pattern.exec(csv))) {
      const matchedDelimiter = matches[1];

      if (matchedDelimiter.length && matchedDelimiter !== delimiter) {
        if (row.length > 0) {
          // Check and quote fields that contain commas
          row = row.map((field, index) => {
            if (fieldsWithCommas.includes(index) && field.includes(delimiter)) {
              // If the field has a comma and is in the "fieldsWithCommas" array, add quotes
              return `"${field.replace(/"/g, '""')}"`; // Escape quotes inside fields
            }
            return field;
          });
          rows.push(row);
          row = [];
          rowIndex++;
        }
      }

      if (matches[2]) {
        // Handle quoted field.
        fieldValue = matches[2].replace(/""/g, '"');
      } else {
        // Handle standard field.
        fieldValue = matches[3];
      }

      row.push(fieldValue || '');

      // Handle the last line if it doesn't end with a new line.
      if (pattern.lastIndex === csv.length && row.length > 0) {
        row = row.map((field, index) => {
          if (fieldsWithCommas.includes(index) && field.includes(delimiter)) {
            return `"${field.replace(/"/g, '""')}"`;
          }
          return field;
        });
        rows.push(row);
      }
    }
    return rows.map((row: any) => {
      return titles.reduce((object: any, curr: any, i: number) => (object[curr] = row[i], object), {})
    });
    // return rows;
  }


  private parseCSVold(data: string): JSON[] {
    // Split the data into rows
    const rows = data.split('\n');

    // Initialize the array to hold the parsed data
    const parsedData: string[][] = [];
    const titles = data.slice(0, data.indexOf('\r')).split(',');
    console.log(titles)
    // Iterate over each row
    for (const row of rows) {
      // Trim any leading/trailing whitespace
      const trimmedRow = row.trim();

      // If the row is empty, skip it
      if (!trimmedRow) continue;

      // Split the row by commas
      const columns = trimmedRow.split(',');
      if (columns[0] == 'Master Record Number') continue
      // Handle the special case for the last column
      if (columns.length > 59) {
        // Merge all parts after the first (N-1) columns to form the last column
        const lastColumn = columns.slice(59).join(',');

        // Update the columns array to contain only the first N-1 columns and the merged last column
        columns.length = 59;
        columns.push(lastColumn);
      }

      // Add the parsed row to the parsedData array
      parsedData.push(columns);
    }

    return parsedData.map((row: any) => {
      return titles.reduce((object: any, curr: any, i: number) => (object[curr] = row[i], object), {})
    });
    // return parsedData;
  }


}
