export interface Cliente {
  id: number;
  nombre: string;
  telefono: string;
  activo: boolean;
  credito: Credito;
}
