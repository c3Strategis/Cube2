import { Directive, ElementRef, HostListener, input, OnInit, effect, computed, Input } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[appHighlight]',
})
export class HighlightDirective {
  
  constructor(private el: ElementRef) {
    effect(() => {
      if (this.highlightValue() > 1) {
        this.el.nativeElement.style.color = 'red'
      }
      else {
        this.el.nativeElement.style.color = 'green'
      }
      
    })
  }
  highlightValue = input<number>(0)
  color!: string

}