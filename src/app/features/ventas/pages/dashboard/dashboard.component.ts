import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VentasService } from '../../../../core/services/ventas.service';
import { FormularioVentaComponent } from '../../components/formulario-venta/formulario-venta.component';
import { FormularioProductoComponent } from '../../components/formulario-producto/formulario-producto.component';
import { FormularioClienteComponent } from '../../components/formulario-cliente/formulario-cliente.component';
import { ListadoVentasComponent } from '../../components/listado-ventas/listado-ventas.component';
import { ListadoProductosComponent } from '../../components/listado-productos/listado-productos.component';
import { ListadoClientesComponent } from '../../components/listado-clientes/listado-clientes.component';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormularioVentaComponent, FormularioProductoComponent, FormularioClienteComponent, ListadoVentasComponent, ListadoProductosComponent, ListadoClientesComponent, ToastComponent],
  template: `
    <!-- Sistema de Notificaciones Toast Global -->
    <app-toast></app-toast>

    <div class="dashboard-wrapper">

      <!-- ===== HEADER / NAVBAR ===== -->
      <header class="main-header">
        <div class="header-inner">
          <div class="brand">
            <div class="brand-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1>VentasPro</h1>
              <span class="brand-sub">Sistema de Transacción de Ventas</span>
            </div>
          </div>
          <div class="header-right">
            <span class="live-badge">
              <span class="live-dot"></span> Sistema Activo
            </span>
            <div class="user-chip">
              <div class="user-avatar">HC</div>
              <span>Huacre Yancarlos</span>
            </div>
          </div>
        </div>
      </header>

      <main class="dashboard-main">

        <!-- ===== KPI STATS CARDS ===== -->
        <section class="stats-grid animate-slide-up">
          <div class="stat-card">
            <div class="stat-icon-wrap indigo">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-label">Total de Ventas</span>
              <span class="stat-value">{{ ventasService.totalVentasRealizadas() }}</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap emerald">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-label">Monto Recaudado</span>
              <span class="stat-value emerald">S/ {{ ventasService.montoRecaudado() | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap amber">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-label">Artículos Vendidos</span>
              <span class="stat-value amber">{{ ventasService.totalArticulosVendidos() }}</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap rose">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-label">Clientes Registrados</span>
              <span class="stat-value rose">{{ ventasService.clientes().length }}</span>
            </div>
          </div>
        </section>

        <!-- ===== SECCIÓN PRINCIPAL: 2 COLUMNAS ===== -->
        <section class="main-content-grid">

          <!-- COLUMNA IZQUIERDA: Formulario según tab activo -->
          <div class="col-form">
            @if (activeTab() === 'ventas') {
              <app-formulario-venta></app-formulario-venta>
            }
            @if (activeTab() === 'productos') {
              <app-formulario-producto></app-formulario-producto>
            }
            @if (activeTab() === 'clientes') {
              <app-formulario-cliente></app-formulario-cliente>
            }
          </div>

          <!-- COLUMNA DERECHA: Tabs con listados -->
          <div class="col-list">

            <!-- TABS -->
            <div class="tabs-bar glass-panel">
              <button class="tab-btn" [class.active]="activeTab() === 'ventas'" (click)="activeTab.set('ventas')">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="tab-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Ventas
                <span class="tab-badge">{{ ventasService.ventas().length }}</span>
              </button>
              <button class="tab-btn" [class.active]="activeTab() === 'productos'" (click)="activeTab.set('productos')">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="tab-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Productos
                <span class="tab-badge">{{ ventasService.productos().length }}</span>
              </button>
              <button class="tab-btn" [class.active]="activeTab() === 'clientes'" (click)="activeTab.set('clientes')">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="tab-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Clientes
                <span class="tab-badge">{{ ventasService.clientes().length }}</span>
              </button>
            </div>

            <!-- CONTENIDO DE TABS -->
            @if (activeTab() === 'ventas') {
              <app-listado-ventas></app-listado-ventas>
            }
            @if (activeTab() === 'productos') {
              <app-listado-productos></app-listado-productos>
            }
            @if (activeTab() === 'clientes') {
              <app-listado-clientes></app-listado-clientes>
            }

          </div>

        </section>

        <!-- ===== FOOTER ===== -->
        <footer class="dashboard-footer">
          <p>Sistema de Transacción de Ventas &mdash; Desarrollado por <strong>Huacre Yancarlos</strong> · Angular 19 · {{ currentYear }}</p>
        </footer>

      </main>
    </div>
  `,
  styles: [`
    .dashboard-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* ---- HEADER ---- */
    .main-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(11, 15, 25, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .header-inner {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .brand-icon {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      border-radius: 10px;
      padding: 0.6rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 12px rgba(99, 102, 241, 0.4);
    }

    .brand-icon svg {
      width: 1.25rem;
      height: 1.25rem;
      color: white;
    }

    .brand h1 {
      font-size: 1.3rem;
      margin: 0;
      background: linear-gradient(90deg, #818cf8, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .brand-sub {
      font-size: 0.7rem;
      color: var(--text-muted);
      display: block;
      margin-top: -2px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .live-badge {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-success);
      background: var(--color-success-light);
      padding: 0.35rem 0.8rem;
      border-radius: 999px;
    }

    .live-dot {
      width: 6px;
      height: 6px;
      background: var(--color-success);
      border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }

    .user-chip {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.82rem;
      color: var(--text-secondary);
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-color);
      padding: 0.4rem 0.85rem 0.4rem 0.4rem;
      border-radius: 999px;
    }

    .user-avatar {
      width: 1.8rem;
      height: 1.8rem;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
      font-weight: 700;
      color: white;
    }

    /* ---- MAIN ---- */
    .dashboard-main {
      flex: 1;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    /* ---- STATS GRID ---- */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }

    @media (max-width: 1024px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 576px) {
      .stats-grid { grid-template-columns: 1fr; }
    }

    .stat-card {
      background: rgba(22, 30, 49, 0.65);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: transform var(--transition-normal), border-color var(--transition-normal), box-shadow var(--transition-normal);
    }

    .stat-card:hover {
      transform: translateY(-3px);
      border-color: rgba(255, 255, 255, 0.12);
      box-shadow: var(--shadow-md);
    }

    .stat-icon-wrap {
      width: 3rem;
      height: 3rem;
      border-radius: var(--border-radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-icon-wrap svg {
      width: 1.35rem;
      height: 1.35rem;
    }

    .stat-icon-wrap.indigo { background: rgba(99,102,241,.15); color: #818cf8; }
    .stat-icon-wrap.emerald { background: rgba(16,185,129,.12); color: #34d399; }
    .stat-icon-wrap.amber { background: rgba(245,158,11,.12); color: #fbbf24; }
    .stat-icon-wrap.rose { background: rgba(239,68,68,.12); color: #f87171; }

    .stat-info {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .stat-label {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
      color: var(--text-muted);
    }

    .stat-value {
      font-family: var(--font-heading);
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1;
    }

    .stat-value.emerald { color: #34d399; }
    .stat-value.amber { color: #fbbf24; }
    .stat-value.rose { color: #f87171; }

    /* ---- 2-COL GRID ---- */
    .main-content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      align-items: start;
    }

    @media (max-width: 1100px) {
      .main-content-grid {
        grid-template-columns: 1fr;
      }
    }

    /* ---- FOOTER ---- */
    .dashboard-footer {
      border-top: 1px solid var(--border-color);
      padding: 1.25rem 0 0.5rem 0;
      text-align: center;
      font-size: 0.78rem;
      color: var(--text-muted);
    }

    .dashboard-footer strong {
      color: var(--text-secondary);
    }

    /* ---- TABS ---- */
    .tabs-bar {
      display: flex;
      gap: 0.25rem;
      padding: 0.5rem;
      margin-bottom: 1rem;
      border-radius: var(--border-radius-lg);
    }

    .tab-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.6rem 1rem;
      background: none;
      border: none;
      border-radius: var(--border-radius-md);
      color: var(--text-muted);
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .tab-btn:hover {
      background: rgba(255,255,255,0.05);
      color: var(--text-secondary);
    }

    .tab-btn.active {
      background: var(--color-primary-light);
      color: var(--color-primary);
    }

    .tab-icon {
      width: 1rem;
      height: 1rem;
    }

    .tab-badge {
      background: rgba(255,255,255,0.1);
      color: inherit;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.1rem 0.45rem;
      border-radius: 999px;
    }

    .tab-btn.active .tab-badge {
      background: var(--color-primary);
      color: white;
    }
  `]
})
export class DashboardComponent {
  ventasService = inject(VentasService);
  currentYear = new Date().getFullYear();
  activeTab = signal<'ventas' | 'productos' | 'clientes'>('ventas');
}
