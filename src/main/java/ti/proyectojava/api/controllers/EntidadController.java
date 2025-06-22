package ti.proyectojava.api.controllers;


import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectojava.api.responses.ResponseListadoProveedores;
import ti.proyectojava.business.entities.Entidad;
import ti.proyectojava.dtos.*;
import ti.proyectojava.services.EntidadService;

import java.util.List;

@RestController
@RequestMapping(value = "api/v1/entidad")
public class EntidadController {

    private final EntidadService entidadService;

    public EntidadController(EntidadService entidadService) {
        this.entidadService = entidadService;

    }


    @PutMapping("/eliminar")
    @Secured({"ADMIN"})
    @Operation(description = "Esta Funcion elimina una Persona")
    public ResponseEntity<String> eliminarPersona(@RequestBody Long id) {
        Entidad entidad = entidadService.seleccionarEntidad(id);
        entidad = entidadService.eliminarPersona(entidad);
        return ResponseEntity.ok("Persona eliminado correctamente. ID:" + entidad.getId());
    }

//  CLIENTE


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

    @PutMapping("/editarcliente")
    @Secured({"ADMIN"})
    public ResponseEntity<String> editarCliente(@RequestBody ClienteDto clienteDto) {
        String result = entidadService.editarCliente(clienteDto);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/seleccionarCliente")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta Funcion selecciona un cliente")
    public ResponseEntity<ClienteDto> seleccionarCliente(@RequestParam Long id) {
        return ResponseEntity.ok(entidadService.seleccionarCliente(id));
    }

//  PROVEEDOR

    @GetMapping("/proveedor/listar")
    @Secured({"ADMIN", "CAJERO"})
    public ResponseEntity<ResponseListadoProveedores> getProveedores() {
        ResponseListadoProveedores response = entidadService.listadoProveedores();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/proveedor")
    @Secured({"ADMIN"})
    @Operation(description = "Esta Funcion crea un nuevo Proveedor")
    public ResponseEntity<String> crearProveedor(@RequestBody ProveedorDto proveedorDto) {
        proveedorDto.setId(null);
        String response = entidadService.crearProveedor(proveedorDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/editarproveedor")
    @Secured({"ADMIN"})
    public ResponseEntity<String> editarProveedor(@RequestBody ProveedorDto proveedorDto) {
        String result = entidadService.editarProveedor(proveedorDto);
        return ResponseEntity.ok(result);
    }

    @GetMapping("{id}/seleccionarProveedor/")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta Funcion selecciona un proveedor")
    public ResponseEntity<ProveedorDto> seleccionarProveedor(@PathVariable Long id) {
        try {
            ProveedorDto provee = entidadService.seleccionarProveedor(id);
            return ResponseEntity.ok(provee);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

}
