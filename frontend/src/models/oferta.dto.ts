export interface OfertaDto {
    id: number;
    descripcion: string;
    descuento: number;
    activo: boolean;
    inicio: string; // ISO date format: YYYY-MM-DD
    fin: string; // ISO date format: YYYY-MM-DD
    fechaEliminado?: string; // ISO date-time format: YYYY-MM-DDTHH:mm:ss
}
