import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ComboDto, DescuentoDto, PromocionDto } from '../models';
import { UrlService } from './url.service';

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
  providedIn: 'root',
})
export class OfertaService {
  private endpoint: string = '/oferta';

  constructor(private http: HttpClient, private urlService: UrlService) {}

  crearCombo(combo: ComboDto): Observable<string> {
    return this.http.post(
      `${this.urlService.baseUrl}${this.endpoint}/combo`,
      combo,
      { responseType: 'text' }
    );
  }
  editarCombo(combo: ComboDto): Observable<string> {
    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/editarcombo`,
      combo,
      { responseType: 'text' }
    );
  }

  listarCombos(): Observable<ResponseListadoCombos> {
    return this.http.get<ResponseListadoCombos>(
      `${this.urlService.baseUrl}${this.endpoint}/listarCombo`
    );
  }

  getCombosByProducto(productoId: number): Observable<ResponseListadoCombos> {
    return this.http.get<ResponseListadoCombos>(
      `${this.urlService.baseUrl}${this.endpoint}/combos/producto/${productoId}`
    );
  }

  crearDescuento(descuento: DescuentoDto): Observable<string> {
    return this.http.post(
      `${this.urlService.baseUrl}${this.endpoint}/descuento`,
      descuento,
      { responseType: 'text' }
    );
  }
  editarDescuento(descuento: DescuentoDto): Observable<string> {
    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/editardescuento`,
      descuento,
      { responseType: 'text' }
    );
  }

  listarDescuentos(): Observable<ResponseListadoDescuentos> {
    return this.http.get<ResponseListadoDescuentos>(
      `${this.urlService.baseUrl}${this.endpoint}/listarDescuentos`
    );
  }

  crearPromocion(promocion: PromocionDto): Observable<string> {
    return this.http.post(
      `${this.urlService.baseUrl}${this.endpoint}/promocion`,
      promocion,
      { responseType: 'text' }
    );
  }
  editarPromocion(promocion: PromocionDto): Observable<string> {
    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/editarpromocion`,
      promocion,
      { responseType: 'text' }
    );
  }

  listarPromociones(): Observable<ResponseListadoPromociones> {
    return this.http.get<ResponseListadoPromociones>(
      `${this.urlService.baseUrl}${this.endpoint}/listarPromociones`
    );
  }

  eliminarOferta(id: number): Observable<string> {
    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/eliminar`,
      id,
      { responseType: 'text' }
    );
  }
}
