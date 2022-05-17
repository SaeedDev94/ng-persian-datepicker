import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit
} from '@angular/core';

@Directive({
  selector: '[themeHover]'
})
export class ThemeHoverDirective implements OnInit, OnDestroy {

  constructor(
    private elementRef: ElementRef
  ) {
  }

  container?: HTMLElement;

  onMouseOver = () => {
    this.addHoverClass();
  };

  onMouseOut = () => {
    this.removeHoverClass();
  };

  ngOnInit(): void {
    this.container = this.elementRef.nativeElement;

    this.container?.addEventListener('mouseover', this.onMouseOver);
    this.container?.addEventListener('mouseout', this.onMouseOut);
  }

  ngOnDestroy(): void {
    this.container?.removeEventListener('mouseover', this.onMouseOver);
    this.container?.removeEventListener('mouseout', this.onMouseOut);
  }

  addHoverClass(): void {
    this.container?.classList?.add('hover');
  }

  removeHoverClass(): void {
    this.container?.classList?.remove('hover');
  }

}
