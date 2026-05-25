import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-item" [class]="toast.type">
          <!-- Icon -->
          <div class="toast-icon">
            @if (toast.type === 'success') {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="icon success">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            } @else if (toast.type === 'error') {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="icon error">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            } @else if (toast.type === 'warning') {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="icon warning">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="icon info">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          </div>
          
          <!-- Content -->
          <div class="toast-content">
            <h4 class="toast-title">{{ toast.title }}</h4>
            <p class="toast-message">{{ toast.message }}</p>
          </div>
          
          <!-- Close button -->
          <button class="toast-close" (click)="toastService.remove(toast.id)">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="close-icon">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      background: rgba(19, 27, 46, 0.9);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 1px 1px rgba(255, 255, 255, 0.05) inset;
      color: #ffffff;
      min-width: 300px;
      position: relative;
      animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      overflow: hidden;
    }

    .toast-item.success { border-left: 4px solid var(--color-success); }
    .toast-item.error { border-left: 4px solid var(--color-danger); }
    .toast-item.warning { border-left: 4px solid var(--color-warning); }
    .toast-item.info { border-left: 4px solid var(--color-primary); }

    .toast-icon {
      flex-shrink: 0;
      width: 1.5rem;
      height: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon {
      width: 1.25rem;
      height: 1.25rem;
    }

    .icon.success { color: var(--color-success); }
    .icon.error { color: var(--color-danger); }
    .icon.warning { color: var(--color-warning); }
    .icon.info { color: var(--color-primary); }

    .toast-content {
      flex-grow: 1;
      padding-right: 1.25rem;
    }

    .toast-title {
      font-size: 0.875rem;
      font-weight: 600;
      margin: 0 0 0.125rem 0;
      font-family: var(--font-heading);
    }

    .toast-message {
      font-size: 0.775rem;
      color: var(--text-secondary);
      margin: 0;
    }

    .toast-close {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0.125rem;
      border-radius: 4px;
      transition: color var(--transition-fast), background-color var(--transition-fast);
    }

    .toast-close:hover {
      color: var(--text-primary);
      background-color: rgba(255, 255, 255, 0.05);
    }

    .close-icon {
      width: 0.875rem;
      height: 0.875rem;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100%) translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateX(0) translateY(0);
      }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
