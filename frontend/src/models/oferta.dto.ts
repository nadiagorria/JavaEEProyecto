export interface OfertaDto {
  id: number;
  descripcion: string;
  descuento: number;
  activo: boolean;
  inicio: string;
  fin: string;
  fechaEliminado?: string;
}
