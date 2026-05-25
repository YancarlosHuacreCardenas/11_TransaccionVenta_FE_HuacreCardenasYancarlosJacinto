import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentasService } from '../../../../core/services/ventas.service';
import { Producto } from '../../../../core/models/ventas.models';

@Component({
  selector: 'app-listado-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="glass-panel list-card animate-slide-up">
      <div class="card-header">
        <div class="header-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="icon-title">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div>
          <h3>Catálogo de Productos</h3>
          <p>Consulta el inventario y stock disponible</p>
        </div>
      </div>

      <!-- BUSCADOR -->
      <div class="filters-bar">
        <div class="search-box">
          <input
            type="text"
            class="form-control"
            placeholder="Buscar por nombre o categoría..."
            [ngModel]="searchTerm()"
            (ngModelChange)="searchTerm.set($event)" />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="search-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div class="select-box">
          <select class="form-select" [ngModel]="categoriaFilter()" (ngModelChange)="categoriaFilter.set($event)">
            <option value="">Todas las categorías</option>
            @for (cat of categorias(); track cat) {
              <option [value]="cat">{{ cat }}</option>
            }
          </select>
        </div>
      </div>

      <!-- TABLA -->
      @if (filteredProductos().length === 0) {
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="empty-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p>No se encontraron productos</p>
        </div>
      } @else {
        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th class="text-right">Precio</th>
                <th class="text-center">Stock</th>
                <th class="text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              @for (p of filteredProductos(); track p.id) {
                <tr class="animate-fade-in">
                  <td>
                    <span class="prod-name">{{ p.nombre }}</span>
                  </td>
                  <td>
                    <span class="category-badge">{{ p.categoria || 'General' }}</span>
                  </td>
                  <td class="text-right font-mono font-bold">
                    S/ {{ p.precio | number:'1.2-2' }}
                  </td>
                  <td class="text-center">
                    <span class="stock-val font-mono" [class.stock-low]="p.stock <= 5" [class.stock-ok]="p.stock > 5">
                      {{ p.stock }}
                    </span>
                  </td>
                  <td class="text-center">
                    @if (p.stock === 0) {
                      <span class="badge badge-danger">Sin Stock</span>
                    } @else if (p.stock <= 5) {
                      <span class="badge badge-warning">Stock Bajo</span>
                    } @else {
                      <span class="badge badge-success">Disponible</span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="summary-info">
          <span>{{ filteredProductos().length }} de {{ ventasService.productos().length }} productos</span>
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
      background: var(--color-primary-light);
      color: var(--color-primary);
      border-radius: var(--border-radius-md);
      padding: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-title { width: 1.5rem; height: 1.5rem; }

    .card-header h3 { font-size: 1.25rem; margin: 0; }
    .card-header p { font-size: 0.8rem; margin: 0; color: var(--text-secondary); }

    .filters-bar {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }

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

    .prod-name { font-weight: 600; font-size: 0.9rem; }

    .category-badge {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--color-primary);
      background: var(--color-primary-light);
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
    }

    .stock-val {
      font-weight: 700;
      font-size: 0.95rem;
    }

    .stock-low { color: #fbbf24; }
    .stock-ok  { color: #34d399; }

    .badge-success { background: rgba(16,185,129,.15); color: #34d399; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.72rem; font-weight: 700; }
    .badge-warning { background: rgba(245,158,11,.15); color: #fbbf24; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.72rem; font-weight: 700; }
    .badge-danger  { background: rgba(239,68,68,.15);  color: #f87171; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.72rem; font-weight: 700; }

    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .font-bold { font-weight: 700; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }

    .summary-info {
      margin-top: 1rem;
      font-size: 0.8rem;
      color: var(--text-muted);
      text-align: right;
    }
  `]
})
export class ListadoProductosComponent {
  ventasService = inject(VentasService);

  searchTerm = signal('');
  categoriaFilter = signal('');

  categorias = computed(() => {
    const cats = this.ventasService.productos()
      .map(p => p.categoria)
      .filter((c): c is string => !!c);
    return [...new Set(cats)].sort();
  });

  filteredProductos = computed(() => {
    let list = this.ventasService.productos();
    const q = this.searchTerm().trim().toLowerCase();
    if (q) {
      list = list.filter(p =>
        p.nombre.toLowerCase().includes(q) ||
        (p.categoria?.toLowerCase().includes(q) || false)
      );
    }
    const cat = this.categoriaFilter();
    if (cat) {
      list = list.filter(p => p.categoria === cat);
    }
    return list;
  });
}
