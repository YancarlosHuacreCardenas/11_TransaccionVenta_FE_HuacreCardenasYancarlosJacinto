import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { Cliente, Producto, Venta, DetalleVenta } from '../models/ventas.models';
import { environment } from '../../../environments/environment';

interface CrearVentaRequest {
  clienteId: number;
  items: Array<{
    productoId: number;
    cantidad: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private readonly apiUrl = environment.apiUrl;

  // Signals reactivos expuestos al Frontend
  clientes = signal<Cliente[]>([]);
  productos = signal<Producto[]>([]);
  ventas = signal<Venta[]>([]);

  // Signals computadas para estadísticas / dashboard
  totalVentasRealizadas = computed(() => this.ventas().length);
  montoRecaudado = computed(() => this.ventas().reduce((sum, v) => sum + v.total, 0));
  totalArticulosVendidos = computed(() => this.ventas().reduce((sum, v) => sum + v.cantidadProductos, 0));

  constructor(private http: HttpClient) {
    this.cargarDatosDelBackend();
  }

  /**
   * Carga todos los datos del backend garantizando el orden correcto
   */
  private cargarDatosDelBackend() {
    // Cargar clientes, productos y ventas en paralelo
    forkJoin({
      clientes: this.http.get<any[]>(`${this.apiUrl}/clientes`),
      productos: this.http.get<any[]>(`${this.apiUrl}/productos`),
      ventas: this.http.get<any[]>(`${this.apiUrl}/ventas`)
    }).subscribe({
      next: ({ clientes, productos, ventas }) => {
        this.clientes.set(clientes);
        this.productos.set(productos);
        // Mapear ventas con clientes ya disponibles
        const ventasMapeadas = ventas.map(v => this.mapearVentaDelBackend(v, clientes));
        this.ventas.set(ventasMapeadas);
      },
      error: (err) => console.error('Error al cargar datos:', err)
    });
  }

  /**
   * Obtiene todos los clientes del backend (GET /api/clientes)
   */
  getClientesApi(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/clientes`).pipe(
      catchError(error => {
        console.error('Error al obtener clientes:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene todos los productos del backend (GET /api/productos)
   */
  getProductosApi(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos`).pipe(
      catchError(error => {
        console.error('Error al obtener productos:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene todas las ventas del backend (GET /api/ventas)
   */
  getVentasApi(): Observable<Venta[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ventas`).pipe(
      map(ventasRaw => ventasRaw.map(v => this.mapearVentaDelBackend(v, this.clientes()))),
      tap(ventas => this.ventas.set(ventas)),
      catchError(error => {
        console.error('Error al obtener ventas:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Registra una nueva venta en el backend (POST /api/ventas)
   */
  registrarVentaApi(clienteId: number, detalles: DetalleVenta[]): Observable<Venta> {
    if (!clienteId || !detalles || detalles.length === 0) {
      return throwError(() => new Error('Cliente y detalles son requeridos'));
    }

    // Convertir detalles al formato que espera el backend (items)
    const items = detalles.map(d => ({
      productoId: d.productoId,
      cantidad: d.cantidad
    }));

    const request: CrearVentaRequest = {
      clienteId: clienteId,
      items: items
    };

    return this.http.post<any>(`${this.apiUrl}/ventas`, request).pipe(
      tap(ventaRaw => {
        const ventaMapeada = this.mapearVentaDelBackend(ventaRaw, this.clientes());
        const listaVentasActualizada = [ventaMapeada, ...this.ventas()];
        this.ventas.set(listaVentasActualizada);
        // Recargar productos para actualizar stock
        this.getProductosApi().subscribe(
          productos => this.productos.set(productos),
          error => console.error('Error al actualizar productos:', error)
        );
      }),
      catchError(error => {
        console.error('Error al registrar venta:', error);
        const mensajeError = this.extraerMensajeError(error);
        return throwError(() => new Error(mensajeError));
      })
    );
  }

  /**
   * Obtiene una venta específica (GET /api/ventas/{id})
   */
  obtenerVentaPorId(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.apiUrl}/ventas/${id}`).pipe(
      catchError(error => {
        console.error('Error al obtener venta:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene las ventas de un cliente específico (GET /api/ventas/cliente/{clienteId})
   */
  obtenerVentasPorCliente(clienteId: number): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${this.apiUrl}/ventas/cliente/${clienteId}`).pipe(
      catchError(error => {
        console.error('Error al obtener ventas del cliente:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualiza una venta existente (PUT /api/ventas/{id})
   */
  actualizarVentaApi(id: number, clienteId: number, detalles: DetalleVenta[]): Observable<Venta> {
    if (!id || !clienteId || !detalles || detalles.length === 0) {
      return throwError(() => new Error('ID, cliente y detalles son requeridos'));
    }

    // Convertir detalles al formato que espera el backend (items)
    const items = detalles.map(d => ({
      productoId: d.productoId,
      cantidad: d.cantidad
    }));

    const request: CrearVentaRequest = {
      clienteId: clienteId,
      items: items
    };

    return this.http.put<Venta>(`${this.apiUrl}/ventas/${id}`, request).pipe(
      tap(ventaActualizada => {
        // Actualizar la venta en el signal
        const listaVentasActualizada = this.ventas().map(v => v.id === id ? ventaActualizada : v);
        this.ventas.set(listaVentasActualizada);
        
        // Recargar productos para actualizar stock
        this.getProductosApi().subscribe(
          productos => this.productos.set(productos),
          error => console.error('Error al actualizar productos:', error)
        );
      }),
      catchError(error => {
        console.error('Error al actualizar venta:', error);
        const mensajeError = this.extraerMensajeError(error);
        return throwError(() => new Error(mensajeError));
      })
    );
  }

  /**
   * Elimina lógicamente una venta (DELETE /api/ventas/{id})
   */
  eliminarVentaApi(id: number): Observable<Venta> {
    if (!id) {
      return throwError(() => new Error('ID de venta es requerido'));
    }

    return this.http.delete<Venta>(`${this.apiUrl}/ventas/${id}`).pipe(
      tap(ventaEliminada => {
        // Actualizar la venta en el signal marcándola como eliminada
        const listaVentasActualizada = this.ventas().map(v => 
          v.id === id ? { ...v, eliminado: true, fechaEliminacion: new Date().toISOString() } : v
        );
        this.ventas.set(listaVentasActualizada);
      }),
      catchError(error => {
        console.error('Error al eliminar venta:', error);
        const mensajeError = this.extraerMensajeError(error);
        return throwError(() => new Error(mensajeError));
      })
    );
  }

  /**
   * Restaura una venta eliminada (POST /api/ventas/{id}/restore)
   */
  restaurarVentaApi(id: number): Observable<Venta> {
    if (!id) {
      return throwError(() => new Error('ID de venta es requerido'));
    }

    return this.http.post<Venta>(`${this.apiUrl}/ventas/${id}/restore`, {}).pipe(
      tap(ventaRestaurada => {
        // Actualizar la venta en el signal marcándola como no eliminada
        const listaVentasActualizada = this.ventas().map(v => 
          v.id === id ? { ...v, eliminado: false, fechaEliminacion: undefined } : v
        );
        this.ventas.set(listaVentasActualizada);
      }),
      catchError(error => {
        console.error('Error al restaurar venta:', error);
        const mensajeError = this.extraerMensajeError(error);
        return throwError(() => new Error(mensajeError));
      })
    );
  }

  /**
   * Extrae el mensaje de error del response HTTP
   */
  private extraerMensajeError(error: any): string {
    console.error('Error completo:', error);
    console.error('Error status:', error.status);
    console.error('Error body:', error.error);

    if (error.error) {
      if (typeof error.error === 'object') {
        if (error.error.message) return error.error.message;
        if (error.error.error) return error.error.error;
        if (error.error.detail) return error.error.detail;
        // Si el body tiene estado (como VentaDTO con estado=mensaje)
        if (error.error.estado) return error.error.estado;
      }
      if (typeof error.error === 'string' && error.error.trim()) return error.error;
    }
    if (error.message) return error.message;
    return `Error ${error.status || ''}: No se pudo completar la operación`;
  }

  /**
   * Crea un nuevo producto (POST /api/productos)
   */
  crearProductoApi(dto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/productos`, dto).pipe(
      catchError(error => {
        const msg = this.extraerMensajeError(error);
        return throwError(() => new Error(msg));
      })
    );
  }

  /**
   * Crea un nuevo cliente (POST /api/clientes)
   */
  crearClienteApi(dto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/clientes`, dto).pipe(
      catchError(error => {
        const msg = this.extraerMensajeError(error);
        return throwError(() => new Error(msg));
      })
    );
  }

  /**
   * Refresca los datos desde el backend
   */
  refrescarDatos() {
    this.cargarDatosDelBackend();
  }

  /**
   * Mapea la respuesta del backend al formato esperado por el frontend
   */
  private mapearVentaDelBackend(ventaRaw: any, clientes?: Cliente[]): Venta {
    const listaClientes = clientes || this.clientes();

    // Buscar cliente en la lista o construir uno con los datos del backend
    const cliente = listaClientes.find(c => c.id === ventaRaw.clienteId) || {
      id: ventaRaw.clienteId || 0,
      nombre: ventaRaw.clienteNombre || 'Sin nombre',
      email: '',
      telefono: ''
    };

    // Mapear detalles: el backend devuelve precio/subtotal como BigDecimal
    const detalles: DetalleVenta[] = (ventaRaw.detalles || []).map((d: any) => ({
      productoId: d.productoId,
      productoNombre: d.productoNombre,
      cantidad: d.cantidad,
      precioUnitario: Number(d.precio),
      subtotal: Number(d.subtotal)
    }));

    return {
      id: ventaRaw.id,
      codigoVenta: ventaRaw.codigoVenta || `V-${String(ventaRaw.id).padStart(6, '0')}`,
      cliente: cliente,
      clienteId: ventaRaw.clienteId,
      clienteNombre: ventaRaw.clienteNombre,
      fecha: ventaRaw.fecha,
      detalles: detalles,
      total: Number(ventaRaw.total) || 0,
      cantidadProductos: ventaRaw.cantidadProductos || detalles.length,
      eliminado: ventaRaw.eliminado || false,
      fechaEliminacion: ventaRaw.fechaEliminacion
    };
  }
}
