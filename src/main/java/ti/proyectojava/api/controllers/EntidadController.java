package ti.proyectojava.api.controllers;


import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectojava.api.responses.ResponseListadoClientes;
import ti.proyectojava.api.responses.ResponseListadoProveedores;
import ti.proyectojava.business.entities.Entidad;
import ti.proyectojava.dtos.*;
import ti.proyectojava.services.EntidadService;

import java.util.List;

@RestController
@RequestMapping(value = "api/v1/entidad")
public class EntidadController {

    private final EntidadService entidadService;
    private Entidad entidadActual;

    public EntidadController(EntidadService entidadService) {
        this.entidadService = entidadService;
        this.entidadActual = null;
    }

    //cualquiera lo usa
    @GetMapping("/persona/")
    @Secured({"ADMIN", "CAJERO"})
    public ResponseEntity<?> seleccionarEntidad(@RequestBody Long id) {
        return ResponseEntity.ok(entidadService.seleccionarEntidad(id));
    }    //solo puede usarlo un admin


    @PutMapping("/eliminar")
    @Secured({"ADMIN"})
    @Operation(description = "Esta Funcion elimina una Persona")
    public ResponseEntity<String> eliminarPersona(@RequestBody Long id) {
        Entidad entidad = entidadService.seleccionarEntidad(id);
        entidad = entidadService.eliminarPersona(entidad);
        return ResponseEntity.ok("Persona eliminado correctamente. ID:" + entidad.getId());
    }


    //////////////////////CLIENTE////////////////////////////

    /*// esta funcion la puede usar cualquiera
    @GetMapping("/clientes/listar")
    @Secured({"ADMIN", "CAJERO"})
    public ResponseEntity<ResponseListadoClientes> getClientes(){
        ResponseListadoClientes response = entidadService.listadoClientes();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }*/

    //solo puede usarlo un admin
    @PostMapping("/cliente")
    @Secured({"ADMIN"})
    @Operation(description = "Esta Funcion crea un nuevo Cliente")
    public ResponseEntity<String> crearCliente(@RequestBody ClienteDto clienteDto) {
        String response = entidadService.crearCliente(clienteDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/clienteCredito")
    @Secured({"ADMIN"})
    @Operation(description = "Esta Funcion crea un nuevo Cliente y su Credito")
    public ResponseEntity<String> crearClienteCredito(@RequestBody ClienteCreditoDto clienteCreditoDto) {
        String response = entidadService.crearClienteCredito(clienteCreditoDto);
        if (response == null) {
            return new ResponseEntity<>("Error al crear cliente o credito", HttpStatus.BAD_REQUEST);
        } else {
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        }
    }

    //solo puede usarlo un admin
    @PutMapping("/editarcliente")
    @Secured({"ADMIN"})
    public ResponseEntity<String> editarCliente(@RequestBody ClienteDto clienteDto) {
        String result = entidadService.editarCliente(clienteDto);
        return ResponseEntity.ok(result);
    }    
    
    //cualquiera lo usa
    @GetMapping("/seleccionarCliente")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta Funcion selecciona un cliente")
    public ResponseEntity<?> seleccionarCliente(@RequestParam Long id) {
        return ResponseEntity.ok(entidadService.seleccionarCliente(id));
    }

    /////////////////////////////PROVEEDOR/////////////////////////////////

    // esta funcion la puede usar cualquiera
    @GetMapping("/proveedor/listar")
    @Secured({"ADMIN", "CAJERO"})
    public ResponseEntity<ResponseListadoProveedores> getProveedores(){
        ResponseListadoProveedores response = entidadService.listadoProveedores();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    //solo puede usarlo un admin
    @PostMapping("/proveedor")
    @Secured({"ADMIN"})
    @Operation(description = "Esta Funcion crea un nuevo Proveedor")
    public ResponseEntity<String> crearProveedor(@RequestBody ProveedorDto proveedorDto) {
        proveedorDto.setId(null);
        String response = entidadService.crearProveedor(proveedorDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //solo puede usarlo un admin
    @PutMapping("/editarproveedor")
    @Secured({"ADMIN"})
    public ResponseEntity<String> editarProveedor(@RequestBody ProveedorDto proveedorDto) {
        String result = entidadService.editarProveedor(proveedorDto);
        return ResponseEntity.ok(result);
    }    
    
    //cualquiera lo usa
    @GetMapping("{id}/seleccionarProveedor/")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta Funcion selecciona un proveedor")
    public ResponseEntity<ProveedorDto> seleccionarProveedor(@PathVariable Long id) {
        try {
            ProveedorDto provee = entidadService.seleccionarProveedor(id);
            return ResponseEntity.ok(provee);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }}
        
    //cualquiera lo usa
    @GetMapping("/listarProveedores")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta Funcion lista todos los proveedores activos")
    public ResponseEntity<List<ProveedorDto>> listarProveedores() {
        try {
            List<ProveedorDto> proveedores = entidadService.listarProveedores();
            return ResponseEntity.ok(proveedores);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

}
