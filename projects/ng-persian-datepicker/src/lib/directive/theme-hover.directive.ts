import {
  Directive,
  ElementRef,
  HostListener
} from '@angular/core';

@Directive({
  selector: '[themeHover]'
})
export class ThemeHoverDirective {

  constructor(
    private elementRef: ElementRef<HTMLElement | null>
  ) {
  }

  @HostListener('mouseover')
  onMouseOver(): void {
    this.elementRef.nativeElement?.classList?.add('hover');
  }

  @HostListener('mouseout')
  onMouseOut(): void {
    this.elementRef.nativeElement?.classList?.remove('hover');
  }

}
