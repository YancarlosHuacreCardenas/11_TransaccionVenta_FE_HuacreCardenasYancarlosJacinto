import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentasService } from '../../../../core/services/ventas.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-formulario-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="glass-panel form-card animate-slide-up">
      <div class="card-header">
        <div class="header-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="icon-title">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <div>
          <h3>{{ editando ? 'Editar Cliente' : 'Nuevo Cliente' }}</h3>
          <p>{{ editando ? 'Modifica los datos del cliente' : 'Registra un nuevo comprador en el sistema' }}</p>
        </div>
      </div>

      <form (submit)="$event.preventDefault(); guardar()" class="form-body">

        <!-- Nombre -->
        <div class="form-group">
          <label class="form-label">Nombre Completo *</label>
          <input
            type="text"
            class="form-control"
            [class.input-error]="enviado && !nombre.trim()"
            placeholder="Ej. Juan Pérez García"
            [(ngModel)]="nombre"
            name="nombre"
            [disabled]="submitting" />
          @if (enviado && !nombre.trim()) {
            <span class="error-msg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="err-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              El nombre es obligatorio.
            </span>
          }
          @if (enviado && nombre.trim() && nombre.trim().length < 3) {
            <span class="error-msg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="err-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Mínimo 3 caracteres.
            </span>
          }
        </div>

        <!-- Email -->
        <div class="form-group">
          <label class="form-label">Correo Electrónico *</label>
          <input
            type="email"
            class="form-control"
            [class.input-error]="enviado && (!email.trim() || !emailValido())"
            placeholder="correo@ejemplo.com"
            [(ngModel)]="email"
            name="email"
            [disabled]="submitting" />
          @if (enviado && !email.trim()) {
            <span class="error-msg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="err-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              El correo electrónico es obligatorio.
            </span>
          }
          @if (enviado && email.trim() && !emailValido()) {
            <span class="error-msg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="err-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Ingresa un correo válido (ej. usuario&#64;dominio.com).
            </span>
          }
        </div>

        <!-- Teléfono -->
        <div class="form-group">
          <label class="form-label">Teléfono *</label>
          <input
            type="text"
            class="form-control"
            [class.input-error]="enviado && (!telefono.trim() || !telefonoValido())"
            placeholder="Ej. 987654321"
            [(ngModel)]="telefono"
            name="telefono"
            maxlength="15"
            [disabled]="submitting" />
          @if (enviado && !telefono.trim()) {
            <span class="error-msg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="err-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              El teléfono es obligatorio.
            </span>
          }
          @if (enviado && telefono.trim() && !telefonoValido()) {
            <span class="error-msg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="err-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Solo números, mínimo 7 dígitos.
            </span>
          }
        </div>

        <!-- Dirección -->
        <div class="form-group">
          <label class="form-label">Dirección <span class="optional">(opcional)</span></label>
          <input
            type="text"
            class="form-control"
            placeholder="Ej. Av. Principal 123, Lima"
            [(ngModel)]="direccion"
            name="direccion"
            [disabled]="submitting" />
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
              {{ editando ? 'Actualizar Cliente' : 'Registrar Cliente' }}
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
      background: rgba(239,68,68,.12); color: #f87171;
      border-radius: var(--border-radius-md); padding: 0.75rem;
      display: flex; align-items: center; justify-content: center;
    }
    .icon-title { width: 1.5rem; height: 1.5rem; }
    .card-header h3 { font-size: 1.25rem; margin: 0; }
    .card-header p { font-size: 0.8rem; margin: 0; color: var(--text-secondary); }

    .form-body { display: flex; flex-direction: column; gap: 1rem; }

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
  `]
})
export class FormularioClienteComponent {
  private ventasService = inject(VentasService);
  private toastService = inject(ToastService);

  nombre = '';
  email = '';
  telefono = '';
  direccion = '';
  submitting = false;
  editando = false;
  enviado = false;

  emailValido(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
  }

  emailTieneTypo(): boolean {
    const dominiosComunes = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'];
    const partes = this.email.trim().split('@');
    if (partes.length !== 2) return false;
    const dominio = partes[1].toLowerCase();
    // Detectar typos comunes
    const typos: Record<string, string> = {
      'gamil.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmial.com': 'gmail.com',
      'hotmal.com': 'hotmail.com', 'hotmial.com': 'hotmail.com',
      'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com'
    };
    return dominio in typos;
  }

  sugerenciaEmail(): string {
    const typos: Record<string, string> = {
      'gamil.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmial.com': 'gmail.com',
      'hotmal.com': 'hotmail.com', 'hotmial.com': 'hotmail.com',
      'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com'
    };
    const partes = this.email.trim().split('@');
    if (partes.length !== 2) return '';
    const dominio = partes[1].toLowerCase();
    return typos[dominio] ? `¿Quisiste decir ${partes[0]}@${typos[dominio]}?` : '';
  }

  telefonoValido(): boolean {
    return /^[0-9]{7,15}$/.test(this.telefono.trim());
  }

  private esValido(): boolean {
    if (!this.nombre.trim() || this.nombre.trim().length < 3) return false;
    if (!this.email.trim() || !this.emailValido()) return false;
    if (!this.telefono.trim() || !this.telefonoValido()) return false;
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
      email: this.email.trim(),
      telefono: this.telefono.trim(),
      direccion: this.direccion.trim(),
      activo: true
    };
    this.ventasService.crearClienteApi(dto).subscribe({
      next: () => {
        this.toastService.success('Cliente registrado', `"${this.nombre}" fue agregado correctamente.`);
        this.limpiar();
        this.ventasService.refrescarDatos();
        this.submitting = false;
      },
      error: (err) => {
        this.toastService.error('Error al guardar', err.message || 'No se pudo registrar el cliente.');
        this.submitting = false;
      }
    });
  }

  limpiar() {
    this.nombre = '';
    this.email = '';
    this.telefono = '';
    this.direccion = '';
    this.editando = false;
    this.enviado = false;
  }
}
