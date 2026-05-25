import { Component } from '@angular/core';
import { DashboardComponent } from './features/ventas/pages/dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardComponent],
  template: `<app-dashboard></app-dashboard>`,
  styles: []
})
export class AppComponent {}
