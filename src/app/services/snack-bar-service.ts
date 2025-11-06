import { Injectable, Injector } from '@angular/core';
import { Overlay, OverlayRef, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { StackedSnackBar } from '../components/stacked-snack-bar/stacked-snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackBarService {
  private activeSnackbars: OverlayRef[] = [];
  private snackbarHeight = 76; // height + spacing
  private bottomMargin = 24;

  constructor(private overlay: Overlay, private injector: Injector) {}

  /**
   * Shows a stacked snackbar message.
   * @param message The message text.
   * @param duration Duration in ms; -1 means persistent until closed manually.
   */
  show(message: string, duration: number = 10000): void {
    // const offset = this.activeSnackbars.length * this.snackbarHeight + this.bottomMargin;
    // Old:
    // const offset = this.activeSnackbars.length * this.snackbarHeight + this.bottomMargin;

    // New: calculate sum of actual snackbar heights
    const offset = this.activeSnackbars
      .map(ref => (ref.overlayElement as HTMLElement).offsetHeight + 8)
      .reduce((sum, h) => sum + h, 0) + this.bottomMargin;

    const positionStrategy = this.overlay
      .position()
      .global()
      .centerHorizontally()
      .bottom(`${offset}px`);

    const overlayConfig = new OverlayConfig({
      positionStrategy,
      hasBackdrop: false,
      scrollStrategy: this.overlay.scrollStrategies.noop(),
      panelClass: ['custom-snack-bar']
    });

    const overlayRef = this.overlay.create(overlayConfig);

    const injector = Injector.create({
      providers: [
        { provide: 'SNACKBAR_MESSAGE', useValue: message },
        { provide: 'SNACKBAR_DURATION', useValue: duration },
        { provide: 'SNACKBAR_REF', useValue: overlayRef },
        { provide: SnackBarService, useValue: this } // allow component to dismiss itself
      ],
      parent: this.injector
    });

    const portal = new ComponentPortal(StackedSnackBar, null, injector);
    overlayRef.attach(portal);

    this.activeSnackbars.push(overlayRef);

    // Auto-dismiss if duration > 0
    if (duration > 0) {
      setTimeout(() => this.dismiss(overlayRef), duration);
    }
  }

  /** Dismiss one snackbar and reposition others */
  dismiss(ref: OverlayRef): void {
    if (!ref || !this.activeSnackbars.includes(ref)) return;

    ref.dispose();
    this.activeSnackbars = this.activeSnackbars.filter(r => r !== ref);
    this.repositionWithAnimation();
  }

  /** Smoothly reposition remaining snackbars */
  /*
  private repositionWithAnimation(): void {
    this.activeSnackbars.forEach((ref, i) => {
      const el = ref.overlayElement as HTMLElement;
      const targetBottom = i * this.snackbarHeight + this.bottomMargin;

      // Remove existing transition to force reflow
      el.style.transition = 'none';
      el.style.bottom = `${parseInt(el.style.bottom || '0')}px`;

      // Force reflow
      void el.offsetHeight;

      // Apply transition for smooth animation
      el.style.transition = 'bottom 0.25s ease-in-out';
      el.style.bottom = `${targetBottom}px`;
    });
  }
  */
  private repositionWithAnimation(): void {
    let accumulatedOffset = this.bottomMargin;

    this.activeSnackbars.forEach(ref => {
      const el = ref.overlayElement as HTMLElement;

      // Remove existing transition to force reflow
      el.style.transition = 'none';
      el.style.bottom = `${parseInt(el.style.bottom || '0')}px`;
      void el.offsetHeight; // force reflow

      // Apply transition for smooth animation
      el.style.transition = 'bottom 0.25s ease-in-out';
      el.style.bottom = `${accumulatedOffset}px`;

      // Add current element height to offset for next snackbar
      accumulatedOffset += el.offsetHeight;
    });
  }

}
