import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1100;" aria-live="polite">
      @for (t of toastService.toasts(); track t.id) {
        <div [class]="'toast show border-0 text-bg-' + t.type" role="alert">
          <div class="d-flex">
            <div class="toast-body">{{ t.message }}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto"
              aria-label="Tancar" (click)="toastService.dismiss(t.id)"></button>
          </div>
        </div>
      }
    </div>
  `
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
