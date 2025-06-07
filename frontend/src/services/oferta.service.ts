import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ComboDto, DescuentoDto, PromocionDto } from '../models';
import { UrlService } from './url.service';

// Interfaces para las respuestas del backend
export interface ResponseListadoCombos {
  combos: ComboDto[];
}

export interface ResponseListadoDescuentos {
  descuentos: DescuentoDto[];
}

export interface ResponseListadoPromociones {
  promociones: PromocionDto[];
}

@Injectable({
  providedIn: 'root'
})
export class OfertaService {
  private endpoint: string = '/oferta';

  constructor(
    private http: HttpClient,
    private urlService: UrlService
  ) { }

  // ==================== COMBOS ====================
  /**
   * Crea un nuevo combo
   */
  crearCombo(combo: ComboDto): Observable<string> {
    return this.http.post(`${this.urlService.baseUrl}${this.endpoint}/combo`, combo, { responseType: 'text' });
  }
  /**
   * Edita un combo existente
   */
  editarCombo(combo: ComboDto): Observable<string> {
    return this.http.put(`${this.urlService.baseUrl}${this.endpoint}/editarcombo`, combo, { responseType: 'text' });
  }

  /**
   * Lista todos los combos activos
   */
  listarCombos(): Observable<ResponseListadoCombos> {
    return this.http.get<ResponseListadoCombos>(`${this.urlService.baseUrl}${this.endpoint}/listarCombo`);
  }

  /**
   * Lista los combos que contienen un producto específico
   */
  getCombosByProducto(productoId: number): Observable<ResponseListadoCombos> {
    return this.http.get<ResponseListadoCombos>(`${this.urlService.baseUrl}${this.endpoint}/combos/producto/${productoId}`);
  }

  // ==================== DESCUENTOS ====================
  /**
   * Crea un nuevo descuento
   */
  crearDescuento(descuento: DescuentoDto): Observable<string> {
    return this.http.post(`${this.urlService.baseUrl}${this.endpoint}/descuento`, descuento, { responseType: 'text' });
  }
  /**
   * Edita un descuento existente
   */
  editarDescuento(descuento: DescuentoDto): Observable<string> {
    return this.http.put(`${this.urlService.baseUrl}${this.endpoint}/editardescuento`, descuento, { responseType: 'text' });
  }

  /**
   * Lista todos los descuentos activos
   */
  listarDescuentos(): Observable<ResponseListadoDescuentos> {
    return this.http.get<ResponseListadoDescuentos>(`${this.urlService.baseUrl}${this.endpoint}/listarDescuentos`);
  }

  /**
   * Lista los descuentos de un producto específico
   */
  getDescuentosByProducto(productoId: number): Observable<ResponseListadoDescuentos> {
    return this.http.get<ResponseListadoDescuentos>(`${this.urlService.baseUrl}${this.endpoint}/descuentos/producto/${productoId}`);
  }

  // ==================== PROMOCIONES ====================
  /**
   * Crea una nueva promoción
   */
  crearPromocion(promocion: PromocionDto): Observable<string> {
    return this.http.post(`${this.urlService.baseUrl}${this.endpoint}/promocion`, promocion, { responseType: 'text' });
  }
  /**
   * Edita una promoción existente
   */
  editarPromocion(promocion: PromocionDto): Observable<string> {
    return this.http.put(`${this.urlService.baseUrl}${this.endpoint}/editarpromocion`, promocion, { responseType: 'text' });
  }

  /**
   * Lista todas las promociones activas
   */
  listarPromociones(): Observable<ResponseListadoPromociones> {
    return this.http.get<ResponseListadoPromociones>(`${this.urlService.baseUrl}${this.endpoint}/listarPromociones`);
  }

  /**
   * Lista las promociones de un producto específico
   */
  getPromocionesByProducto(productoId: number): Observable<ResponseListadoPromociones> {
    return this.http.get<ResponseListadoPromociones>(`${this.urlService.baseUrl}${this.endpoint}/promociones/producto/${productoId}`);
  }

  // ==================== GENERAL ====================
  /**
   * Elimina (lógicamente) una oferta por ID
   */
  eliminarOferta(id: number): Observable<string> {
    return this.http.put(`${this.urlService.baseUrl}${this.endpoint}/eliminar`, id, { responseType: 'text' });
  }
}
