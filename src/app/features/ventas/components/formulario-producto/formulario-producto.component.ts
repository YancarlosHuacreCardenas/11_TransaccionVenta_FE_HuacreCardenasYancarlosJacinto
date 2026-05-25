import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentasService } from '../../../../core/services/ventas.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-formulario-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="glass-panel form-card animate-slide-up">
      <div class="card-header">
        <div class="header-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="icon-title">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div>
          <h3>{{ editando ? 'Editar Producto' : 'Nuevo Producto' }}</h3>
          <p>{{ editando ? 'Modifica los datos del producto' : 'Registra un nuevo artículo al catálogo' }}</p>
        </div>
      </div>

      <form (submit)="$event.preventDefault(); guardar()" class="form-body" #formProducto="ngForm">

        <!-- Nombre -->
        <div class="form-group">
          <label class="form-label">Nombre del Producto *</label>
          <input
            type="text"
            class="form-control"
            [class.input-error]="enviado && !nombre.trim()"
            placeholder="Ej. Laptop HP 15"
            [(ngModel)]="nombre"
            name="nombre"
            [disabled]="submitting" />
          @if (enviado && !nombre.trim()) {
            <span class="error-msg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="err-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              El nombre del producto es obligatorio.
            </span>
          }
          @if (enviado && nombre.trim() && nombre.trim().length < 3) {
            <span class="error-msg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="err-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Mínimo 3 caracteres.
            </span>
          }
        </div>

        <!-- Descripción -->
        <div class="form-group">
          <label class="form-label">Descripción <span class="optional">(opcional)</span></label>
          <textarea
            class="form-control"
            placeholder="Descripción breve del producto..."
            [(ngModel)]="descripcion"
            name="descripcion"
            rows="2"
            [disabled]="submitting"></textarea>
        </div>

        <!-- Precio y Stock -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Precio (S/) *</label>
            <input
              type="number"
              class="form-control"
              [class.input-error]="enviado && (precio === null || precio <= 0)"
              placeholder="0.00"
              [(ngModel)]="precio"
              name="precio"
              min="0.01"
              step="0.01"
              [disabled]="submitting" />
            @if (enviado && (precio === null || precio === undefined)) {
              <span class="error-msg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="err-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                El precio es obligatorio.
              </span>
            }
            @if (enviado && precio !== null && precio <= 0) {
              <span class="error-msg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="err-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                El precio debe ser mayor a 0.
              </span>
            }
          </div>
          <div class="form-group">
            <label class="form-label">Stock *</label>
            <input
              type="number"
              class="form-control"
              [class.input-error]="enviado && (stock === null || stock < 0)"
              placeholder="0"
              [(ngModel)]="stock"
              name="stock"
              min="0"
              [disabled]="submitting" />
            @if (enviado && (stock === null || stock === undefined)) {
              <span class="error-msg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="err-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                El stock es obligatorio.
              </span>
            }
            @if (enviado && stock !== null && stock < 0) {
              <span class="error-msg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="err-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                El stock no puede ser negativo.
              </span>
            }
          </div>
        </div>

        <!-- Categoría -->
        <div class="form-group">
          <label class="form-label">Categoría *</label>
          <input
            type="text"
            class="form-control"
            [class.input-error]="enviado && !categoria.trim()"
            placeholder="Ej. Electrónica, Accesorios, Periféricos..."
            [(ngModel)]="categoria"
            name="categoria"
            [disabled]="submitting" />
          @if (enviado && !categoria.trim()) {
            <span class="error-msg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="err-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              La categoría es obligatoria.
            </span>
          }
        </div>

        <!-- Acciones -->
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="limpiar()" [disabled]="submitting">
            Cancelar
          </button>
          <button type="submit" class="btn btn-success flex-grow" [disabled]="submitting">
            @if (submitting) {
              <div class="spinner"></div> Guardando...
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="btn-icon-svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ editando ? 'Actualizar Producto' : 'Registrar Producto' }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-card { padding: 1.75rem; }

    .card-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
    .header-icon {
      background: rgba(99,102,241,.15); color: #818cf8;
      border-radius: var(--border-radius-md); padding: 0.75rem;
      display: flex; align-items: center; justify-content: center;
    }
    .icon-title { width: 1.5rem; height: 1.5rem; }
    .card-header h3 { font-size: 1.25rem; margin: 0; }
    .card-header p { font-size: 0.8rem; margin: 0; color: var(--text-secondary); }

    .form-body { display: flex; flex-direction: column; gap: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

    .optional { font-size: 0.72rem; color: var(--text-muted); font-weight: 400; }

    .input-error {
      border-color: var(--color-danger) !important;
      box-shadow: 0 0 0 2px rgba(239,68,68,0.15) !important;
    }

    .error-msg {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.75rem;
      color: var(--color-danger);
      margin-top: 0.3rem;
    }
    .err-icon { width: 0.85rem; height: 0.85rem; flex-shrink: 0; }

    .form-actions { display: flex; gap: 1rem; margin-top: 0.5rem; }
    .flex-grow { flex-grow: 1; }
    .btn-icon-svg { width: 1.15rem; height: 1.15rem; }

    .spinner {
      width: 1rem; height: 1rem;
      border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
      border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    textarea.form-control { resize: vertical; min-height: 60px; }
  `]
})
export class FormularioProductoComponent {
  private ventasService = inject(VentasService);
  private toastService = inject(ToastService);

  nombre = '';
  descripcion = '';
  precio: number | null = null;
  stock: number | null = null;
  categoria = '';
  submitting = false;
  editando = false;
  enviado = false;

  private esValido(): boolean {
    if (!this.nombre.trim() || this.nombre.trim().length < 3) return false;
    if (this.precio === null || this.precio <= 0) return false;
    if (this.stock === null || this.stock < 0) return false;
    if (!this.categoria.trim()) return false;
    return true;
  }

  guardar() {
    this.enviado = true;
    if (!this.esValido()) {
      this.toastService.warning('Formulario incompleto', 'Corrige los errores antes de continuar.');
      return;
    }
    this.submitting = true;
    const dto = {
      nombre: this.nombre.trim(),
      descripcion: this.descripcion.trim(),
      precio: this.precio,
      stock: this.stock,
      categoria: this.categoria.trim(),
      activo: true
    };
    this.ventasService.crearProductoApi(dto).subscribe({
      next: () => {
        this.toastService.success('Producto registrado', `"${this.nombre}" fue agregado al catálogo.`);
        this.limpiar();
        this.ventasService.refrescarDatos();
        this.submitting = false;
      },
      error: (err) => {
        this.toastService.error('Error al guardar', err.message || 'No se pudo registrar el producto.');
        this.submitting = false;
      }
    });
  }

  limpiar() {
    this.nombre = '';
    this.descripcion = '';
    this.precio = null;
    this.stock = null;
    this.categoria = '';
    this.editando = false;
    this.enviado = false;
  }
}
