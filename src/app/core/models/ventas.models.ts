export interface Cliente {
  id: number;
  nombre: string;
  tipoDocumento?: 'DNI' | 'RUC' | 'CE';
  nroDocumento?: string;
  email: string;
  telefono: string;
}

export interface Producto {
  id: number;
  nombre: string;
  codigo: string;
  precio: number;
  stock: number;
  imagen?: string; // Ruta de imagen o placeholder estético
  categoria: string;
}

export interface DetalleVenta {
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Venta {
  id: number;
  codigoVenta?: string;
  cliente: Cliente;
  clienteId?: number;
  clienteNombre?: string;
  fecha: string;
  detalles: DetalleVenta[];
  total: number;
  cantidadProductos: number;
  eliminado?: boolean;
  fechaEliminacion?: string;
}
