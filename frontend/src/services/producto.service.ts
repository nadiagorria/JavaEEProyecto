import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductoDto } from '../models';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private endpoint: string = '/producto';

  constructor(
    private http: HttpClient,
    private urlService: UrlService
  ) { }

  crearProducto(producto: ProductoDto): Observable<string> {
    return this.http.post<string>(`${this.urlService.baseUrl}${this.endpoint}/crear`, producto);
  }

  seleccionarProducto(id: number): Observable<string> {
    return this.http.post<string>(`${this.urlService.baseUrl}${this.endpoint}/seleccionar`, id);
  }

  editarProducto(producto: ProductoDto): Observable<string> {
    return this.http.put<string>(`${this.urlService.baseUrl}${this.endpoint}/${producto.id}/editar`, producto);
  }

  eliminarProducto(id: number): Observable<string> {
    return this.http.put<string>(`${this.urlService.baseUrl}${this.endpoint}/${id}/eliminar`, {});
  }

  listarProductos(): Observable<{productos: ProductoDto[]}> {
    return this.http.get<{productos: ProductoDto[]}>(`${this.urlService.baseUrl}${this.endpoint}/listar`);
  }

  buscarPorCodigoBarras(codigoBarras: string): Observable<ProductoDto | null> {
    return this.http.get<ProductoDto>(`${this.urlService.baseUrl}${this.endpoint}/buscar/codigo/${codigoBarras}`);
  }  
  
  buscarTopNProductos(n: number): Observable<{productos: ProductoDto[]}> {
    return this.http.get<{productos: ProductoDto[]}>(`${this.urlService.baseUrl}${this.endpoint}/listarCategorias?n=${n}`);
  }
}