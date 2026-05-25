import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentasService } from '../../../../core/services/ventas.service';

@Component({
  selector: 'app-listado-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="glass-panel list-card animate-slide-up">
      <div class="card-header">
        <div class="header-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="icon-title">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h3>Clientes Registrados</h3>
          <p>Directorio de compradores activos en el sistema</p>
        </div>
      </div>

      <!-- BUSCADOR -->
      <div class="filters-bar">
        <div class="search-box">
          <input
            type="text"
            class="form-control"
            placeholder="Buscar por nombre, email o teléfono..."
            [ngModel]="searchTerm()"
            (ngModelChange)="searchTerm.set($event)" />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="search-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- TABLA -->
      @if (filteredClientes().length === 0) {
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="empty-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p>No se encontraron clientes</p>
        </div>
      } @else {
        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th class="text-center">Ventas</th>
              </tr>
            </thead>
            <tbody>
              @for (c of filteredClientes(); track c.id; let i = $index) {
                <tr class="animate-fade-in">
                  <td>
                    <div class="avatar">{{ c.nombre.charAt(0).toUpperCase() }}</div>
                  </td>
                  <td>
                    <span class="client-name">{{ c.nombre }}</span>
                  </td>
                  <td>
                    <span class="client-email">{{ c.email || 'N/A' }}</span>
                  </td>
                  <td>
                    <span class="client-phone font-mono">{{ c.telefono || 'N/A' }}</span>
                  </td>
                  <td class="text-center">
                    <span class="ventas-count font-mono font-bold">
                      {{ ventasPorCliente(c.id) }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="summary-info">
          <span>{{ filteredClientes().length }} de {{ ventasService.clientes().length }} clientes registrados</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .list-card { padding: 1.75rem; }

    .card-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .header-icon {
      background: rgba(239,68,68,.12);
      color: #f87171;
      border-radius: var(--border-radius-md);
      padding: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-title { width: 1.5rem; height: 1.5rem; }
    .card-header h3 { font-size: 1.25rem; margin: 0; }
    .card-header p { font-size: 0.8rem; margin: 0; color: var(--text-secondary); }

    .filters-bar { margin-bottom: 1.25rem; }

    .search-box { position: relative; }
    .search-box .form-control { padding-left: 2.5rem; }
    .search-icon {
      position: absolute;
      left: 0.85rem;
      top: 50%;
      transform: translateY(-50%);
      width: 1.1rem;
      height: 1.1rem;
      color: var(--text-muted);
    }

    .empty-state {
      padding: 3rem 1rem;
      text-align: center;
      background: rgba(15, 23, 42, 0.2);
      border: 1.5px dashed var(--border-color);
      border-radius: var(--border-radius-md);
      color: var(--text-muted);
    }

    .empty-icon {
      width: 2.5rem;
      height: 2.5rem;
      margin: 0 auto 0.75rem;
      opacity: 0.4;
    }

    .empty-state p { font-size: 0.85rem; margin: 0; }

    .table-responsive { max-height: 380px; overflow-y: auto; }

    .avatar {
      width: 2rem;
      height: 2rem;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      color: white;
    }

    .client-name { font-weight: 600; font-size: 0.9rem; }
    .client-email { font-size: 0.82rem; color: var(--text-secondary); }
    .client-phone { font-size: 0.82rem; color: var(--text-secondary); }

    .ventas-count {
      display: inline-block;
      background: var(--color-primary-light);
      color: var(--color-primary);
      padding: 0.15rem 0.6rem;
      border-radius: 999px;
      font-size: 0.82rem;
    }

    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .font-bold { font-weight: 700; }
    .text-center { text-align: center; }

    .summary-info {
      margin-top: 1rem;
      font-size: 0.8rem;
      color: var(--text-muted);
      text-align: right;
    }
  `]
})
export class ListadoClientesComponent {
  ventasService = inject(VentasService);
  searchTerm = signal('');

  filteredClientes = computed(() => {
    let list = this.ventasService.clientes();
    const q = this.searchTerm().trim().toLowerCase();
    if (q) {
      list = list.filter(c =>
        c.nombre.toLowerCase().includes(q) ||
        (c.email?.toLowerCase().includes(q) || false) ||
        (c.telefono?.includes(q) || false)
      );
    }
    return list;
  });

  ventasPorCliente(clienteId: number): number {
    return this.ventasService.ventas().filter(v => v.clienteId === clienteId).length;
  }
}
