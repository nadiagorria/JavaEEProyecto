import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductoDto } from '../models';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private endpoint: string = '/producto';

  constructor(private http: HttpClient, private urlService: UrlService) {}

  crearProductoConDto(producto: ProductoDto): Observable<any> {
    return this.http.post(
      `${this.urlService.baseUrl}${this.endpoint}/crear-dto`,
      producto,
      {
        responseType: 'text',
      }
    );
  }

  obtenerImagenProducto(id: number): Observable<Blob> {
    return this.http.get(
      `${this.urlService.baseUrl}${this.endpoint}/${id}/imagen`,
      {
        responseType: 'blob',
      }
    );
  }

  actualizarImagenProducto(id: number, imagen: File): Observable<string> {
    const formData = new FormData();
    formData.append('imagen', imagen);
    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/${id}/imagen`,
      formData,
      {
        responseType: 'text',
      }
    );
  }

  obtenerProducto(id: number): Observable<ProductoDto> {
    return this.http.get<ProductoDto>(
      `${this.urlService.baseUrl}${this.endpoint}/${id}`
    );
  }

  editarProducto(producto: ProductoDto): Observable<string> {
    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/${producto.id}/editar`,
      producto,
      {
        responseType: 'text',
      }
    );
  }

  eliminarProducto(id: number): Observable<string> {
    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/${id}/eliminar`,
      {},
      {
        responseType: 'text',
      }
    );
  }

  listarProductos(): Observable<{ productos: ProductoDto[] }> {
    return this.http.get<{ productos: ProductoDto[] }>(
      `${this.urlService.baseUrl}${this.endpoint}/listar`
    );
  }

  buscarTodosPorCodigoBarras(codigoBarras: string): Observable<ProductoDto[]> {
    return this.http.get<ProductoDto[]>(
      `${this.urlService.baseUrl}${this.endpoint}/buscar/codigo/todos/${codigoBarras}`
    );
  }

  buscarTopNProductos(n: number): Observable<{ productos: ProductoDto[] }> {
    return this.http.get<{ productos: ProductoDto[] }>(
      `${this.urlService.baseUrl}${this.endpoint}/top?n=${n}`
    );
  }

  modificarStockTotal(id: number, stockTotal: number): Observable<string> {
    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/${id}/stock`,
      stockTotal,
      {
        responseType: 'text',
      }
    );
  }

  listarProductosPaginado(pagina: number, cantidad: number): Observable<any> {
    return this.http.get<any>(
      `${this.urlService.baseUrl}${this.endpoint}/paginado?pagina=${pagina}&cantidad=${cantidad}`
    );
  }

  listarProductosPaginadoConFiltros(pagina: number, cantidad: number, busqueda?: string, categoriaId?: number): Observable<any> {
    let url = `${this.urlService.baseUrl}${this.endpoint}/paginado?pagina=${pagina}&cantidad=${cantidad}`;
    
    if (busqueda && busqueda.trim()) {
      url += `&busqueda=${encodeURIComponent(busqueda.trim())}`;
    }
    
    if (categoriaId !== undefined && categoriaId !== null) {
      url += `&categoria=${categoriaId}`;
    }
    
    return this.http.get<any>(url);
  }
}
