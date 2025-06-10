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
  ) { }  crearProducto(producto: ProductoDto): Observable<string> {
    return this.http.post(`${this.urlService.baseUrl}${this.endpoint}/crear-json`, producto, {
      responseType: 'text'
    });
  }
  // Nuevo método que usa el endpoint optimizado con DTO completo
  crearProductoConDto(producto: ProductoDto): Observable<any> {
    return this.http.post(`${this.urlService.baseUrl}${this.endpoint}/crear-dto`, producto, {
      responseType: 'text'
    });
  }
  crearProductoConImagen(formData: FormData): Observable<any> {
    // No establecer Content-Type manualmente para FormData
    // Angular lo hará automáticamente y incluirá el boundary
    return this.http.post(`${this.urlService.baseUrl}${this.endpoint}/crear`, formData, {
      responseType: 'text' // Esto ayuda a manejar respuestas de texto plano
    });
  }

  obtenerImagenProducto(id: number): Observable<Blob> {
    return this.http.get(`${this.urlService.baseUrl}${this.endpoint}/${id}/imagen`, {
      responseType: 'blob'
    });
  }

  actualizarImagenProducto(id: number, imagen: File): Observable<string> {
    const formData = new FormData();
    formData.append('imagen', imagen);
    return this.http.put<string>(`${this.urlService.baseUrl}${this.endpoint}/${id}/imagen`, formData);
  }

  obtenerProducto(id: number): Observable<ProductoDto> {
    return this.http.get<ProductoDto>(`${this.urlService.baseUrl}${this.endpoint}/${id}`);
  }
  editarProducto(producto: ProductoDto): Observable<string> {
    return this.http.put(`${this.urlService.baseUrl}${this.endpoint}/${producto.id}/editar`, producto, {
      responseType: 'text'
    });
  }

  eliminarProducto(id: number): Observable<string> {
    return this.http.put(`${this.urlService.baseUrl}${this.endpoint}/${id}/eliminar`, {}, {
      responseType: 'text'
    });
  }

  listarProductos(): Observable<{productos: ProductoDto[]}> {
    return this.http.get<{productos: ProductoDto[]}>(`${this.urlService.baseUrl}${this.endpoint}/listar`);
  }
  buscarPorCodigoBarras(codigoBarras: string): Observable<ProductoDto | null> {
    return this.http.get<ProductoDto>(`${this.urlService.baseUrl}${this.endpoint}/buscar/codigo/${codigoBarras}`);
  }  
  
  buscarTodosPorCodigoBarras(codigoBarras: string): Observable<ProductoDto[]> {
    return this.http.get<ProductoDto[]>(`${this.urlService.baseUrl}${this.endpoint}/buscar/codigo/todos/${codigoBarras}`);
  }
  
  buscarTopNProductos(n: number): Observable<{productos: ProductoDto[]}> {
    return this.http.get<{productos: ProductoDto[]}>(`${this.urlService.baseUrl}${this.endpoint}/listarCategorias?n=${n}`);
  }
}