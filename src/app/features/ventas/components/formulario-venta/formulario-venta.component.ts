import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentasService } from '../../../../core/services/ventas.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { Producto, DetalleVenta } from '../../../../core/models/ventas.models';

@Component({
  selector: 'app-formulario-venta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="glass-panel form-card animate-slide-up">
      <div class="card-header">
        <div class="header-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="icon-title">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3>Nueva Transacción de Venta</h3>
          <p>Registrar y procesar una nueva orden de salida</p>
        </div>
      </div>

      <form (submit)="$event.preventDefault(); registrarTransaccion()" class="form-body">
        
        <!-- 1. SELECCIÓN DE CLIENTE -->
        <div class="form-group">
          <label class="form-label" for="cliente">Cliente de la Venta *</label>
          <select 
            id="cliente" 
            name="cliente" 
            [(ngModel)]="selectedClienteId" 
            class="form-select" 
            [disabled]="submitting || detalles.length > 0">
            <option [value]="null" disabled selected>-- Seleccione un Cliente --</option>
            @for (c of ventasService.clientes(); track c.id) {
              <option [value]="c.id">{{ c.nombre }} ({{ c.tipoDocumento }}: {{ c.nroDocumento }})</option>
            }
          </select>
          @if (detalles.length > 0) {
            <span class="info-note">El cliente no se puede cambiar mientras haya productos agregados.</span>
          }
        </div>

        <div class="divider"></div>

        <!-- 2. AGREGAR PRODUCTO -->
        <div class="product-selector-grid">
          
          <!-- Selector Producto -->
          <div class="form-group">
            <label class="form-label" for="producto">Producto *</label>
            <select 
              id="producto" 
              name="producto" 
              [(ngModel)]="selectedProductoId" 
              (change)="onProductoChange()" 
              class="form-select" 
              [disabled]="submitting">
              <option [value]="null" disabled selected>-- Seleccione un Producto --</option>
              @for (p of ventasService.productos(); track p.id) {
                <option [value]="p.id" [disabled]="p.stock === 0">
                  {{ p.nombre }} - S/ {{ p.precio | number:'1.2-2' }}
                  @if (p.stock === 0) { (SIN STOCK) }
                </option>
              }
            </select>
          </div>

          <!-- Cantidad -->
          <div class="form-group">
            <label class="form-label" for="cantidad">Cantidad *</label>
            <input 
              id="cantidad" 
              name="cantidad" 
              type="number" 
              [(ngModel)]="inputCantidad" 
              class="form-control" 
              placeholder="Ej. 1" 
              min="1" 
              [disabled]="!selectedProductoId || submitting" />
          </div>

          <!-- Botón Agregar Fila -->
          <div class="btn-align">
            <button 
              type="button" 
              class="btn btn-primary btn-full" 
              (click)="agregarProducto()" 
              [disabled]="!selectedProductoId || submitting">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="btn-icon-svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
              </svg>
              Añadir
            </button>
          </div>
        </div>

        <!-- Info Card del Producto Seleccionado -->
        @if (productoSeleccionado) {
          <div class="selected-product-card animate-fade-in">
            <div class="product-details-summary">
              <span class="category-badge">{{ productoSeleccionado.categoria }}</span>
              <h4 class="prod-title">{{ productoSeleccionado.nombre }}</h4>
              <div class="prod-stats">
                <div>
                  <span class="stat-lbl">Precio Unitario:</span>
                  <strong class="stat-val text-primary">S/ {{ productoSeleccionado.precio | number:'1.2-2' }}</strong>
                </div>
                <div>
                  <span class="stat-lbl">Stock Disponible:</span>
                  <span 
                    class="badge" 
                    [class.badge-success]="productoSeleccionado.stock > 5" 
                    [class.badge-warning]="productoSeleccionado.stock <= 5 && productoSeleccionado.stock > 0"
                    [class.badge-danger]="productoSeleccionado.stock === 0">
                    {{ productoSeleccionado.stock }} unid.
                  </span>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- 3. TABLA DINÁMICA DE DETALLES -->
        <div class="table-container">
          <h4 class="table-title">Detalle de la Transacción</h4>
          
          @if (detalles.length === 0) {
            <div class="empty-table-state">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="empty-icon">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p>No se han añadido productos a esta venta todavía.</p>
            </div>
          } @else {
            <div class="table-responsive">
              <table class="table-custom">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th class="text-right">Precio Unit.</th>
                    <th class="text-center">Cant.</th>
                    <th class="text-right">Subtotal</th>
                    <th class="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (d of detalles; track d.productoId; let idx = $index) {
                    <tr class="animate-fade-in">
                      <td>
                        <div class="prod-table-cell">
                          <span class="prod-name">{{ d.productoNombre }}</span>
                        </div>
                      </td>
                      <td class="text-right font-mono">S/ {{ d.precioUnitario | number:'1.2-2' }}</td>
                      <td class="text-center">
                        <div class="qty-control">
                          <button type="button" class="qty-btn" (click)="cambiarCantidad(idx, -1)" [disabled]="submitting">-</button>
                          <span class="qty-val font-mono">{{ d.cantidad }}</span>
                          <button type="button" class="qty-btn" (click)="cambiarCantidad(idx, 1)" [disabled]="submitting">+</button>
                        </div>
                      </td>
                      <td class="text-right font-mono font-bold">S/ {{ d.subtotal | number:'1.2-2' }}</td>
                      <td class="text-center">
                        <button type="button" class="btn-delete" (click)="eliminarDetalle(idx)" [disabled]="submitting" title="Eliminar fila">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="trash-icon">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Resumen de Totales -->
            <div class="sales-totals-summary animate-fade-in">
              <div class="total-row">
                <span>Cantidad total de artículos:</span>
                <span class="total-val">{{ totalCantidad }} unidades</span>
              </div>
              <div class="total-row grand-total">
                <span>TOTAL GENERAL:</span>
                <span class="total-val text-emerald">S/ {{ totalVenta | number:'1.2-2' }}</span>
              </div>
            </div>
          }
        </div>

        <!-- 4. BOTONES DE ACCIÓN DE ENVÍO -->
        <div class="form-actions">
          <button 
            type="button" 
            class="btn btn-secondary" 
            (click)="limpiarFormulario()" 
            [disabled]="submitting || (detalles.length === 0 && !selectedClienteId)">
            Cancelar
          </button>
          
          <button 
            type="submit" 
            class="btn btn-success flex-grow" 
            [disabled]="submitting || detalles.length === 0 || !selectedClienteId">
            @if (submitting) {
              <div class="spinner"></div> Procesando API...
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="btn-icon-svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Confirmar y Registrar Venta
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-card {
      padding: 1.75rem;
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

    .divider {
      height: 1px;
      background: var(--border-color);
      margin: 1.25rem 0;
    }

    .form-body {
      display: flex;
      flex-direction: column;
    }

    .info-note {
      font-size: 0.75rem;
      color: var(--color-primary);
      margin-top: 0.25rem;
    }

    .product-selector-grid {
      display: grid;
      grid-template-columns: 2fr 1fr auto;
      gap: 1rem;
      align-items: flex-end;
    }

    @media (max-width: 768px) {
      .product-selector-grid {
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }
      .btn-align {
        width: 100%;
      }
    }

    .btn-full {
      width: 100%;
      height: 2.75rem;
    }

    .btn-align {
      margin-bottom: 1.25rem;
    }

    .btn-icon-svg {
      width: 1.15rem;
      height: 1.15rem;
    }

    .selected-product-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px dashed var(--border-color);
      border-radius: var(--border-radius-md);
      padding: 0.85rem;
      margin-bottom: 1.25rem;
    }

    .category-badge {
      display: inline-block;
      font-size: 0.65rem;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--color-primary);
      background: var(--color-primary-light);
      padding: 0.15rem 0.5rem;
      border-radius: var(--border-radius-full);
      margin-bottom: 0.25rem;
    }

    .prod-title {
      font-size: 0.9rem;
      margin: 0 0 0.5rem 0;
    }

    .prod-stats {
      display: flex;
      gap: 1.5rem;
      font-size: 0.8rem;
    }

    .stat-lbl {
      color: var(--text-secondary);
      margin-right: 0.25rem;
    }

    .stat-val {
      font-weight: 600;
    }

    .text-primary {
      color: #818cf8;
    }

    .table-container {
      margin-top: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .table-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
    }

    .empty-table-state {
      padding: 2.5rem 1rem;
      text-align: center;
      background: rgba(15, 23, 42, 0.2);
      border: 1.5px dashed var(--border-color);
      border-radius: var(--border-radius-md);
      color: var(--text-muted);
    }

    .empty-icon {
      width: 2.5rem;
      height: 2.5rem;
      margin: 0 auto 0.75rem auto;
      opacity: 0.5;
    }

    .empty-table-state p {
      font-size: 0.85rem;
    }

    .qty-control {
      display: inline-flex;
      align-items: center;
      background: rgba(15, 23, 42, 0.4);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      overflow: hidden;
    }

    .qty-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 600;
      width: 1.75rem;
      height: 1.75rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color var(--transition-fast), color var(--transition-fast);
    }

    .qty-btn:hover:not(:disabled) {
      background-color: rgba(255, 255, 255, 0.05);
      color: var(--text-primary);
    }

    .qty-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .qty-val {
      font-size: 0.85rem;
      font-weight: 600;
      width: 1.75rem;
      text-align: center;
      display: inline-block;
    }

    .font-mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    .font-bold {
      font-weight: 700;
    }

    .text-right {
      text-align: right;
    }

    .text-center {
      text-align: center;
    }

    .btn-delete {
      background: none;
      border: none;
      color: var(--color-danger);
      cursor: pointer;
      padding: 0.35rem;
      border-radius: 4px;
      transition: background-color var(--transition-fast), color var(--transition-fast);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .btn-delete:hover:not(:disabled) {
      color: #f87171;
      background: rgba(239, 68, 68, 0.1);
    }

    .trash-icon {
      width: 1.1rem;
      height: 1.1rem;
    }

    .sales-totals-summary {
      margin-top: 1rem;
      padding: 1rem;
      background: rgba(22, 30, 49, 0.5);
      border-radius: var(--border-radius-md);
      border: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .grand-total {
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 1.05rem;
      color: var(--text-primary);
      border-top: 1px dashed var(--border-color);
      padding-top: 0.5rem;
      margin-top: 0.25rem;
    }

    .text-emerald {
      color: var(--color-success);
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .flex-grow {
      flex-grow: 1;
    }

    /* Spinner loader */
    .spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class FormularioVentaComponent {
  ventasService = inject(VentasService);
  toastService = inject(ToastService);

  // Estados del Formulario
  selectedClienteId: number | null = null;
  selectedProductoId: number | null = null;
  inputCantidad: number | null = null;
  
  // Lista de detalles en memoria temporal del formulario
  detalles: DetalleVenta[] = [];
  submitting = false;

  // Producto seleccionado para visualización de ficha técnica
  productoSeleccionado: Producto | null = null;

  onProductoChange() {
    if (this.selectedProductoId) {
      const prod = this.ventasService.productos().find(p => p.id === Number(this.selectedProductoId));
      this.productoSeleccionado = prod || null;
      if (this.productoSeleccionado && (!this.inputCantidad || this.inputCantidad < 1)) {
        this.inputCantidad = 1;
      }
    } else {
      this.productoSeleccionado = null;
    }
  }

  // Getters computados locales para cálculos rápidos de la tabla activa
  get totalCantidad(): number {
    return this.detalles.reduce((sum, d) => sum + d.cantidad, 0);
  }

  get totalVenta(): number {
    return this.detalles.reduce((sum, d) => sum + d.subtotal, 0);
  }

  /**
   * Agrega un producto seleccionado a la tabla dinámica del formulario
   */
  agregarProducto() {
    if (!this.selectedProductoId) {
      this.toastService.warning('Campos incompletos', 'Por favor seleccione un producto.');
      return;
    }

    const cantidad = Number(this.inputCantidad);
    if (isNaN(cantidad) || cantidad <= 0) {
      this.toastService.warning('Validación fallida', 'La cantidad debe ser un número entero mayor a cero.');
      return;
    }

    const prod = this.ventasService.productos().find(p => p.id === Number(this.selectedProductoId));
    if (!prod) return;

    // Verificar si el producto ya existe en la lista de detalles actual
    const indexExistente = this.detalles.findIndex(d => d.productoId === prod.id);
    const cantidadActualEnFila = indexExistente !== -1 ? this.detalles[indexExistente].cantidad : 0;
    const cantidadAcumulada = cantidadActualEnFila + cantidad;

    // Validación de stock
    if (prod.stock < cantidadAcumulada) {
      this.toastService.error(
        'Stock insuficiente', 
        `No puedes agregar ${cantidad} unidad(es) de "${prod.nombre}". Stock disponible: ${prod.stock}.` +
        (cantidadActualEnFila > 0 ? ` (Ya has agregado ${cantidadActualEnFila} en la tabla).` : '')
      );
      return;
    }

    if (indexExistente !== -1) {
      // Actualizar fila existente
      this.detalles[indexExistente].cantidad = cantidadAcumulada;
      this.detalles[indexExistente].subtotal = Number((cantidadAcumulada * prod.precio).toFixed(2));
      this.toastService.success('Detalle actualizado', `Se incrementó la cantidad de "${prod.nombre}" en la tabla.`);
    } else {
      // Agregar nueva fila
      const nuevoDetalle: DetalleVenta = {
        productoId: prod.id,
        productoNombre: prod.nombre,
        cantidad: cantidad,
        precioUnitario: prod.precio,
        subtotal: Number((cantidad * prod.precio).toFixed(2))
      };
      this.detalles.push(nuevoDetalle);
      this.toastService.success('Producto añadido', `"${prod.nombre}" se agregó correctamente.`);
    }

    // Resetear solo select de producto y cantidad
    this.selectedProductoId = null;
    this.inputCantidad = null;
    this.productoSeleccionado = null;
  }

  /**
   * Modifica la cantidad directamente desde los controles +/- de la tabla dinámica
   */
  cambiarCantidad(index: number, delta: number) {
    const det = this.detalles[index];
    const prod = this.ventasService.productos().find(p => p.id === det.productoId);
    if (!prod) return;

    const nuevaCant = det.cantidad + delta;
    if (nuevaCant <= 0) {
      this.eliminarDetalle(index);
      return;
    }

    // Validar stock
    if (prod.stock < nuevaCant) {
      this.toastService.error('Stock insuficiente', `No hay más stock de "${prod.nombre}" disponible.`);
      return;
    }

    det.cantidad = nuevaCant;
    det.subtotal = Number((nuevaCant * det.precioUnitario).toFixed(2));
  }

  /**
   * Elimina un producto de la tabla dinámica del formulario
   */
  eliminarDetalle(index: number) {
    const nombre = this.detalles[index].productoNombre;
    this.detalles.splice(index, 1);
    this.toastService.info('Producto quitado', `Se retiró "${nombre}" de la transacción.`);
  }

  /**
   * Limpia todo el formulario y sus tablas dinámicas asociadas
   */
  limpiarFormulario() {
    this.selectedClienteId = null;
    this.selectedProductoId = null;
    this.inputCantidad = null;
    this.detalles = [];
    this.productoSeleccionado = null;
    this.toastService.info('Formulario limpiado', 'Se canceló la transacción y se restableció el formulario.');
  }

  /**
   * Envía los datos capturados en el formulario al servicio para su almacenamiento definitivo
   */
  registrarTransaccion() {
    if (!this.selectedClienteId) {
      this.toastService.warning('Validación de registro', 'Debe seleccionar un cliente antes de guardar la venta.');
      return;
    }

    if (this.detalles.length === 0) {
      this.toastService.warning('Validación de registro', 'Debe agregar al menos un producto a la transacción.');
      return;
    }

    this.submitting = true;

    this.ventasService.registrarVentaApi(Number(this.selectedClienteId), this.detalles).subscribe({
      next: (ventaCreada) => {
        const codigo = ventaCreada.codigoVenta || `V-${String(ventaCreada.id).padStart(6,'0')}`;
        const total = Number(ventaCreada.total) || 0;
        this.toastService.success(
          'Venta Registrada',
          `Venta ${codigo} guardada con éxito por S/ ${total.toFixed(2)}.`
        );
        this.selectedClienteId = null;
        this.selectedProductoId = null;
        this.inputCantidad = null;
        this.detalles = [];
        this.productoSeleccionado = null;
        this.submitting = false;
      },
      error: (err) => {
        this.toastService.error('Error del Servidor API', err.message || 'No se pudo registrar la venta.');
        this.submitting = false;
      }
    });
  }
}
