import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ClienteDto } from '../models/cliente.dto';
import { clienteCreditoDto } from 'src/models/clienteCredito.dto';
import { UrlService } from 'src/services/url.service';
import { ProveedorDto } from 'src/models/proveedor.dto';

@Injectable({
  providedIn: 'root',
})
export class EntidadService {

  private endpoint: string = '/entidad';
  constructor(
    private http: HttpClient,
    private urlService: UrlService,
  ) {}

  getCliente(id: number): Observable<ClienteDto> {
      const params = new HttpParams().set('id', id.toString());
      return this.http.get<ClienteDto>(`${this.urlService.baseUrl}${this.endpoint}/seleccionarCliente`, 
        { params },);
  }


  crearClienteCredito(clienteCreditoDto: clienteCreditoDto): Observable<String> {
    return this.http.post(`${this.urlService.baseUrl}${this.endpoint}/clienteCredito`, 
      clienteCreditoDto,
      { responseType: 'text'},    );
  }
  
  getProveedor(id: number): Observable<ProveedorDto> {
    return this.http.get<ProveedorDto>(
      `${this.urlService.baseUrl}${this.endpoint}/${id}/seleccionarProveedor/`
    );
  }

  listadoProveedores(): Observable<{proveedores: ProveedorDto[]}> {
    return this.http.get<{proveedores: ProveedorDto[]}>(`${this.urlService.baseUrl}${this.endpoint}/proveedor/listar`);
  }
  editarCliente(cliente: ClienteDto): Observable<String> {
    return this.http.put(`${this.urlService.baseUrl}${this.endpoint}/editarcliente`, cliente, 
      { responseType: 'text' });
  }

  editarProveedor(proveedor: ProveedorDto): Observable<String> {
    return this.http.put(`${this.urlService.baseUrl}${this.endpoint}/editarproveedor`, proveedor, 
      { responseType: 'text' });
  }

  listarProveedores(): Observable<ProveedorDto[]> {
    return this.http.get<ProveedorDto[]>(
      `${this.urlService.baseUrl}${this.endpoint}/listarProveedores`
    );
  }

  crearProveedor(proveedor: ProveedorDto): Observable<String> {
    return this.http.post(`${this.urlService.baseUrl}${this.endpoint}/proveedor`, proveedor, 
      { responseType: 'text' });
  }
  
  eliminarPersona(id: number): Observable<String> {
    return this.http.put(`${this.urlService.baseUrl}${this.endpoint}/eliminar`, id, 
      { responseType: 'text' });
  }

}
