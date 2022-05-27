import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[themeHover]'
})
export class ThemeHoverDirective {

  constructor(
    private elementRef: ElementRef
  ) {
  }

  @HostListener('mouseover')
  onMouseOver(): void {
    this.container()?.classList?.add('hover');
  }

  @HostListener('mouseout')
  onMouseOut(): void {
    this.container()?.classList?.remove('hover');
  }

  private container(): HTMLElement | null {
    return this.elementRef.nativeElement;
  }

}
