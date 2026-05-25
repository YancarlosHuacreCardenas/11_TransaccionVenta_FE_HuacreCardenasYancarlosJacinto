import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentasService } from '../../../../core/services/ventas.service';
import { Venta } from '../../../../core/models/ventas.models';

@Component({
  selector: 'app-listado-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="glass-panel list-card animate-slide-up">
      <div class="card-header">
        <div class="header-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="icon-title">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <div>
          <h3>Historial de Ventas Registradas</h3>
          <p>Consulta, busca, filtra y revisa detalles de transacciones</p>
        </div>
      </div>

      <!-- BUSCADOR Y FILTROS -->
      <div class="filters-bar">
        <!-- Búsqueda -->
        <div class="search-box">
          <input 
            type="text" 
            class="form-control" 
            placeholder="Buscar por cliente, DNI o código..."
            [ngModel]="searchTerm()"
            (ngModelChange)="searchTerm.set($event)" />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="search-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- Filtro Cliente -->
        <div class="select-box">
          <select 
            class="form-select"
            [ngModel]="selectedClienteFilter()"
            (ngModelChange)="selectedClienteFilter.set($event)">
            <option [value]="null">Todos los clientes</option>
            @for (c of ventasService.clientes(); track c.id) {
              <option [value]="c.id">{{ c.nombre }}</option>
            }
          </select>
        </div>

        <!-- Ordenación -->
        <div class="select-box">
          <select 
            class="form-select"
            [ngModel]="activeSort()"
            (ngModelChange)="activeSort.set($event)">
            <option value="date_desc">Fecha: Más recientes</option>
            <option value="date_asc">Fecha: Más antiguos</option>
            <option value="total_desc">Total: Mayor a Menor</option>
            <option value="total_asc">Total: Menor a Mayor</option>
          </select>
        </div>
      </div>

      <!-- TABLA DE RESULTADOS -->
      @if (filteredVentas().length === 0) {
        <div class="empty-list-state animate-fade-in">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="empty-list-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h4>No se encontraron ventas</h4>
          <p>Prueba ajustando los términos de búsqueda o filtros seleccionados.</p>
        </div>
      } @else {
        <div class="table-responsive list-table-container">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Código</th>
                <th>Cliente</th>
                <th class="text-center">Fecha</th>
                <th class="text-center">Artículos</th>
                <th class="text-right">Total General</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (venta of filteredVentas(); track venta.id) {
                <tr class="animate-fade-in">
                  <td>
                    <span class="badge badge-primary font-mono font-bold">{{ venta.codigoVenta || 'N/A' }}</span>
                  </td>
                  <td>
                    <div class="client-info">
                      <span class="client-name">{{ venta.cliente.nombre || venta.clienteNombre || 'Sin cliente' }}</span>
                      <span class="client-doc">{{ venta.cliente.tipoDocumento || 'DNI' }}: {{ venta.cliente.nroDocumento || 'N/A' }}</span>
                    </div>
                  </td>
                  <td class="text-center font-mono text-small">
                    {{ venta.fecha | date:'dd/MM/yyyy HH:mm' }}
                  </td>
                  <td class="text-center font-bold">
                    {{ venta.cantidadProductos || 0 }}
                  </td>
                  <td class="text-right font-mono font-bold text-emerald">
                    S/ {{ venta.total | number:'1.2-2' }}
                  </td>
                  <td class="text-center">
                    <button 
                      type="button" 
                      class="btn btn-secondary btn-detail-action" 
                      (click)="verDetalle(venta)"
                      title="Ver desglose completo">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="btn-detail-icon">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        
        <div class="list-summary-info">
          <span>Mostrando {{ filteredVentas().length }} de {{ ventasService.ventas().length }} registros guardados.</span>
        </div>
      }
    </div>

    <!-- MODAL ELEGANTE DETALLE DE LA TRANSACCIÓN (GLASSMORPHIC BACKDROP) -->
    @if (ventaSeleccionada) {
      <div class="modal-backdrop animate-fade-in" (click)="cerrarDetalle()">
        <div class="modal-content glass-panel animate-slide-up" (click)="$event.stopPropagation()">
          
          <div class="modal-header">
            <div class="modal-title-area">
              <span class="badge badge-primary font-mono font-bold large-badge">{{ ventaSeleccionada.codigoVenta }}</span>
              <h3>Detalles de la Transacción</h3>
              <p>Generado el {{ ventaSeleccionada.fecha | date:'dd MMMM yyyy, hh:mm a' }}</p>
            </div>
            <button class="modal-close-btn" (click)="cerrarDetalle()">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="close-icon-svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <!-- Bloque de datos del Cliente -->
            <div class="detail-section client-detail-card">
              <h4 class="section-title">Información del Comprador</h4>
              <div class="info-grid">
                <div>
                  <span class="info-lbl">Razón Social / Nombre:</span>
                  <strong class="info-val">{{ ventaSeleccionada.cliente.nombre || ventaSeleccionada.clienteNombre || 'N/A' }}</strong>
                </div>
                <div>
                  <span class="info-lbl">Identificación:</span>
                  <span class="info-val font-mono">{{ ventaSeleccionada.cliente.tipoDocumento || 'DNI' }}: {{ ventaSeleccionada.cliente.nroDocumento || 'N/A' }}</span>
                </div>
                <div>
                  <span class="info-lbl">Correo Electrónico:</span>
                  <span class="info-val">{{ ventaSeleccionada.cliente.email || 'N/A' }}</span>
                </div>
                <div>
                  <span class="info-lbl">Contacto Telefónico:</span>
                  <span class="info-val">{{ ventaSeleccionada.cliente.telefono || 'N/A' }}</span>
                </div>
              </div>
            </div>

            <!-- Tabla de items comprados -->
            <div class="detail-section items-detail-section">
              <h4 class="section-title">Ítems Adquiridos</h4>
              @if (ventaSeleccionada.detalles && ventaSeleccionada.detalles.length > 0) {
                <div class="table-responsive modal-table-container">
                  <table class="table-custom">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th class="text-right">Precio Unitario</th>
                        <th class="text-center">Cant.</th>
                        <th class="text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (det of ventaSeleccionada.detalles; track det.productoId) {
                        <tr>
                          <td>
                            <span class="modal-prod-name">{{ det.productoNombre }}</span>
                          </td>
                          <td class="text-right font-mono">S/ {{ det.precioUnitario | number:'1.2-2' }}</td>
                          <td class="text-center font-bold font-mono">{{ det.cantidad }}</td>
                          <td class="text-right font-mono font-bold">S/ {{ det.subtotal | number:'1.2-2' }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else {
                <div class="empty-items-message">
                  <p>No hay ítems en esta transacción</p>
                </div>
              }
            </div>

            <!-- Resumen Totalizador -->
            <div class="modal-summary-card">
              <div class="summary-line">
                <span>Items Totales:</span>
                <span class="summary-val font-mono">{{ ventaSeleccionada.cantidadProductos || 0 }} unids.</span>
              </div>
              <div class="summary-line main-total">
                <span>MONTO TOTAL PAGADO:</span>
                <span class="summary-val text-emerald font-mono">S/ {{ ventaSeleccionada.total | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="cerrarDetalle()">Cerrar Vista</button>
            <button type="button" class="btn btn-primary" (click)="imprimirSimulado()">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="print-icon-svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir Comprobante
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .list-card {
      padding: 1.75rem;
      height: 100%;
    }

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

    .icon-title {
      width: 1.5rem;
      height: 1.5rem;
    }

    .card-header h3 {
      font-size: 1.25rem;
      margin: 0;
    }

    .card-header p {
      font-size: 0.8rem;
      margin: 0;
    }

    /* Barra de Filtros */
    .filters-bar {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }

    @media (max-width: 768px) {
      .filters-bar {
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }
    }

    .search-box {
      position: relative;
      width: 100%;
    }

    .search-box .form-control {
      padding-left: 2.5rem;
    }

    .search-icon {
      position: absolute;
      left: 0.85rem;
      top: 50%;
      transform: translateY(-50%);
      width: 1.1rem;
      height: 1.1rem;
      color: var(--text-muted);
    }

    .empty-list-state {
      padding: 4rem 1rem;
      text-align: center;
      background: rgba(15, 23, 42, 0.2);
      border: 1.5px dashed var(--border-color);
      border-radius: var(--border-radius-md);
      color: var(--text-secondary);
    }

    .empty-list-icon {
      width: 3rem;
      height: 3rem;
      margin: 0 auto 1rem auto;
      opacity: 0.4;
      color: var(--text-muted);
    }

    .empty-list-state h4 {
      font-size: 1.1rem;
      margin-bottom: 0.25rem;
      color: var(--text-primary);
    }

    .empty-list-state p {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .list-table-container {
      max-height: 480px;
      overflow-y: auto;
    }

    .client-info {
      display: flex;
      flex-direction: column;
    }

    .client-name {
      font-weight: 600;
      font-size: 0.9rem;
    }

    .client-doc {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .font-mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    .font-bold {
      font-weight: 700;
    }

    .text-center {
      text-align: center;
    }

    .text-right {
      text-align: right;
    }

    .text-emerald {
      color: var(--color-success);
    }

    .text-small {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .btn-detail-action {
      font-size: 0.8rem;
      padding: 0.4rem 0.85rem;
      border-radius: var(--border-radius-sm);
    }

    .btn-detail-icon {
      width: 0.95rem;
      height: 0.95rem;
    }

    .list-summary-info {
      margin-top: 1rem;
      font-size: 0.8rem;
      color: var(--text-muted);
      text-align: right;
    }

    /* --- ESTILOS MODAL --- */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(4, 6, 12, 0.75);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 9000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .modal-content {
      width: 100%;
      max-width: 650px;
      background: var(--bg-secondary);
      border-radius: var(--border-radius-lg);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
      display: flex;
      flex-direction: column;
      max-height: 90vh;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      background: rgba(22, 30, 49, 0.4);
    }

    .modal-title-area h3 {
      font-size: 1.15rem;
      margin: 0.25rem 0 0.15rem 0;
    }

    .modal-title-area p {
      font-size: 0.75rem;
      margin: 0;
      color: var(--text-muted);
    }

    .large-badge {
      font-size: 0.75rem;
      padding: 0.35rem 0.85rem;
    }

    .modal-close-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      transition: color var(--transition-fast), background-color var(--transition-fast);
    }

    .modal-close-btn:hover {
      color: var(--text-primary);
      background-color: rgba(255, 255, 255, 0.05);
    }

    .close-icon-svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .detail-section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .section-title {
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 0.25rem;
    }

    .client-detail-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-md);
      padding: 1rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem 1.5rem;
      font-size: 0.85rem;
    }

    @media (max-width: 576px) {
      .info-grid {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }
    }

    .info-lbl {
      color: var(--text-secondary);
      display: block;
      font-size: 0.75rem;
      margin-bottom: 0.1rem;
    }

    .info-val {
      color: var(--text-primary);
      word-break: break-all;
    }

    .modal-table-container {
      max-height: 220px;
      overflow-y: auto;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-md);
    }

    .modal-prod-name {
      font-weight: 600;
      font-size: 0.85rem;
    }

    .empty-items-message {
      padding: 2rem 1rem;
      text-align: center;
      background: rgba(15, 23, 42, 0.2);
      border: 1px dashed var(--border-color);
      border-radius: var(--border-radius-md);
      color: var(--text-muted);
      font-size: 0.85rem;
    }

    .modal-summary-card {
      background: rgba(22, 30, 49, 0.6);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-md);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .summary-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .main-total {
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 1.1rem;
      color: var(--text-primary);
      border-top: 1px dashed var(--border-color);
      padding-top: 0.5rem;
      margin-top: 0.25rem;
    }

    .summary-val {
      font-weight: 600;
    }

    .modal-footer {
      padding: 1.25rem 1.5rem;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      background: rgba(22, 30, 49, 0.4);
    }

    .print-icon-svg {
      width: 1.15rem;
      height: 1.15rem;
    }
  `]
})
export class ListadoVentasComponent {
  ventasService = inject(VentasService);

  // Estados locales para Filtros y Ordenamiento (Signals)
  searchTerm = signal<string>('');
  selectedClienteFilter = signal<number | null>(null);
  activeSort = signal<string>('date_desc');

  // Estado del Modal
  ventaSeleccionada: Venta | null = null;

  // Lista Filtrada Computada reactivamente con Signals
  filteredVentas = computed(() => {
    let list = this.ventasService.ventas();
    
    // 1. Filtrar por término de búsqueda (Fuzzy search)
    const query = this.searchTerm().trim().toLowerCase();
    if (query) {
      list = list.filter(v => 
        (v.codigoVenta?.toLowerCase().includes(query) || false) || 
        v.cliente.nombre.toLowerCase().includes(query) ||
        (v.cliente.nroDocumento?.includes(query) || false)
      );
    }

    // 2. Filtrar por cliente específico
    const cliId = this.selectedClienteFilter();
    if (cliId !== null && String(cliId) !== 'null') {
      list = list.filter(v => v.cliente.id === Number(cliId));
    }

    // 3. Aplicar ordenamiento
    const sorting = this.activeSort();
    list = [...list].sort((a, b) => {
      switch (sorting) {
        case 'date_desc':
          return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
        case 'date_asc':
          return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
        case 'total_desc':
          return b.total - a.total;
        case 'total_asc':
          return a.total - b.total;
        default:
          return 0;
      }
    });

    return list;
  });

  /**
   * Abre el modal de detalles para una venta específica
   */
  verDetalle(venta: Venta) {
    this.ventaSeleccionada = venta;
  }

  /**
   * Cierra el modal de detalles
   */
  cerrarDetalle() {
    this.ventaSeleccionada = null;
  }

  /**
   * Simula la impresión del comprobante físico de la transacción
   */
  imprimirSimulado() {
    if (!this.ventaSeleccionada) return;
    
    // Simula una ventana de impresión nativa y atractiva para fines demostrativos
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor habilite las ventanas emergentes en su navegador para simular el ticket.');
      return;
    }

    const v = this.ventaSeleccionada;
    let detailsHtml = '';
    v.detalles.forEach(d => {
      detailsHtml += `
        <tr>
          <td>${d.productoNombre}</td>
          <td style="text-align: center;">${d.cantidad}</td>
          <td style="text-align: right;">S/ ${d.precioUnitario.toFixed(2)}</td>
          <td style="text-align: right;">S/ ${d.subtotal.toFixed(2)}</td>
        </tr>
      `;
    });

    printWindow.document.write(`
      <html>
      <head>
        <title>Ticket de Transacción - ${v.codigoVenta}</title>
        <style>
          body { font-family: 'Courier New', Courier, monospace; padding: 20px; color: #333; max-width: 400px; margin: 0 auto; }
          h2 { text-align: center; margin: 5px 0; }
          .center { text-align: center; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th { border-bottom: 1px solid #000; }
          .right { text-align: right; }
          .total { font-size: 1.15em; font-weight: bold; }
        </style>
      </head>
      <body>
        <h2>TICKET DE VENTA</h2>
        <p class="center">RETO SALES TRANSACCIÓN INC.<br>Lima, Perú</p>
        <div class="divider"></div>
        <p><strong>CÓDIGO:</strong> ${v.codigoVenta}<br>
        <strong>FECHA:</strong> ${new Date(v.fecha).toLocaleString()}<br>
        <strong>CLIENTE:</strong> ${v.cliente.nombre}<br>
        <strong>${v.cliente.tipoDocumento}:</strong> ${v.cliente.nroDocumento}</p>
        <div class="divider"></div>
        <table>
          <thead>
            <tr>
              <th>Ítem</th>
              <th>Cant</th>
              <th>P.U.</th>
              <th>Subt</th>
            </tr>
          </thead>
          <tbody>
            ${detailsHtml}
          </tbody>
        </table>
        <div class="divider"></div>
        <p class="right total">CANT. ITEMS: ${v.cantidadProductos}<br>
        TOTAL PAGADO: S/ ${v.total.toFixed(2)}</p>
        <div class="divider"></div>
        <p class="center">¡Muchas gracias por su compra!<br>Vuelva pronto</p>
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }
}
