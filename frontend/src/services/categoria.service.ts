import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoriaDto } from '../models/categoria.dto';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private endpoint: string = '/categoria';

  constructor(
    private http: HttpClient,
    private urlService: UrlService
  ) {}

  crearCategoria(categoria: CategoriaDto): Observable<string> {
    return this.http.post<string>(`${this.urlService.baseUrl}${this.endpoint}/crear`, categoria);
  }

  editarCategoria(categoria: CategoriaDto): Observable<string> {
    return this.http.put<string>(`${this.urlService.baseUrl}${this.endpoint}/${categoria.id}/editar`, categoria);
  }

  eliminarCategoria(id: number): Observable<string> {
    return this.http.put<string>(`${this.urlService.baseUrl}${this.endpoint}/${id}/eliminar`, {});
  }

  listarCategorias(): Observable<{categorias: CategoriaDto[]}> {
    return this.http.get<{categorias: CategoriaDto[]}>(`${this.urlService.baseUrl}${this.endpoint}/listar`);
  }

  seleccionarCategoria(id: number): Observable<CategoriaDto> {
    return this.http.get<CategoriaDto>(`${this.urlService.baseUrl}${this.endpoint}/${id}`);
  }
}