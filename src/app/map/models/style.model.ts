
// Includes both style and filter classes
import { Feature } from 'ol';
import { FeatureLike } from 'ol/Feature';
import { Fill, Stroke, Circle as CircleStyle, Style, Text } from 'ol/style';

export class GeoFeatureStyle {
    color!: string;
    width!: number;
}

export class GeoFilterFields {
    column!: string;
    operator!: string;
    value!: string | boolean;
}

export class GeoFilterOperator {
    operator!: string;
}

export class GeoStyle {
    load!: GeoFeatureStyle;
    current!: GeoFeatureStyle;
    listLabel!: string;
    showLabel!: boolean;
    filter = new GeoFilterFields;
    filterOperator!: GeoFilterOperator; //not used yet
    opacity!: number;
}

//filter classes
export class filterOperators {
    isEqual = [
        { value: 'isEqual', viewValue: 'Equal' },
        { value: 'isNotEqual', viewValue: 'Not Equal' }
    ]
    contains = [
        { value: 'contains', viewValue: 'Contains' }
    ]
    beforeAfter = [
        { value: 'isGreaterThan', viewValue: 'After' },
        { value: 'isLessThan', viewValue: 'Before' }
    ]
    inequality = [
        { value: 'isGreaterThan', viewValue: 'Greater Than' },
        { value: 'isLessThan', viewValue: 'Less Than' }
    ]

    booleanOperators = this.isEqual
    textOperators = this.isEqual.concat(this.contains)
    dateOperators = this.isEqual.concat(this.beforeAfter)
    doublePrecisionOperators = this.isEqual.concat(this.inequality)
    integerOperators = this.isEqual.concat(this.inequality)
}

export class MapStyles {
    public selected = new Style({
        zIndex: 100,
        image: new CircleStyle({
            radius: 5,
            fill: undefined,
            stroke: new Stroke({ color: '#ff0000', width: 2 })
        }),
        fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new Stroke({
            color: '#ff0000',
            width: 2
        }),

    })

    public unselected = new Style({
        zIndex: 100,
        image: new CircleStyle({
            radius: 5,
            fill: undefined,
            stroke: new Stroke({ color: '#ff0000', width: 4 })
        }),
        fill: new Fill({
            color: 'rgba(255, 255, 200, 0.6)'
        }),
        stroke: new Stroke({
            color: '#00ff00',
            width: 4
        }),
    })

    public current = new Style({
      image: new CircleStyle({
          radius: 5,
          fill: undefined,
          stroke: new Stroke({color: '#319FD3', width: 4})
      }),
      fill: new Fill({
          color: 'rgba(255, 255, 255, 0.6)'
      }),
      stroke: new Stroke({
          color: '#319FD3',
          width: 4
      }),
      text: new Text({
          font: '12px Calibri,sans-serif',
          fill: new Fill({
              color: '#000'
          }),
          stroke: new Stroke({
              color: '#fff',
              width: 5
          })
      })
  })

    public cluster (feature:FeatureLike) {
        const styleCache: any = {}
        const size = feature.get('features').length;
        let style = styleCache[size];
        if (!style) {
          style = new Style({
            image: new CircleStyle({
              radius: 10,
              stroke: new Stroke({
                color: '#fff',
              }),
              fill: new Fill({
                color: '#3399CC',
              }),
            }),
            text: new Text({
              text: size.toString(),
              fill: new Fill({
                color: '#fff',
              }),
            }),
          });
          styleCache[size] = style;
        }
        return style;
      }

      public DefaultStyle(feature?: any, resolution?: any): Style {
        let defaultStyles: any
        const fill = new Fill({
          color: 'rgba(255,255,255,0.4)',
        });
        const stroke: any = new Stroke({
          color: '#3399CC',
          width: 1.25,
        })
        return defaultStyles;
      }
}