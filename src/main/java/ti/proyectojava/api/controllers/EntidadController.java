package ti.proyectojava.api.controllers;


import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectojava.business.entities.Entidad;
import ti.proyectojava.dtos.ClienteDto;
import ti.proyectojava.dtos.ProveedorDto;
import ti.proyectojava.services.EntidadService;

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
    }

    //solo puede usarlo un admin
    @PutMapping("/eliminar")
    @Secured({"ADMIN"})
    @Operation(description = "Esta Funcion elimina una Persona")
    public ResponseEntity<String> eliminarPersona(@RequestBody Long id) {
        Entidad entidad = entidadService.eliminarPersona(this.entidadActual);
        return ResponseEntity.ok("Persona eliminado correctamente. ID:" + entidad.getId());
    }


    //////////////////////CLIENTE////////////////////////////

    //solo puede usarlo un admin
    @PostMapping("/cliente")
    @Secured({"ADMIN"})
    @Operation(description = "Esta Funcion crea un nuevo Cliente")
    public ResponseEntity<String> crearCliente(@RequestBody ClienteDto clienteDto) {
        String response = entidadService.crearCliente(clienteDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //solo puede usarlo un admin
    @PutMapping("/editarcliente")
    @Secured({"ADMIN"})
    public ResponseEntity<String> editarCliente(@RequestBody ClienteDto clienteDto) {
        String result = entidadService.editarCliente(clienteDto);
        return ResponseEntity.ok(result);
    }

    //solo admin puede usarlo
    @PutMapping("/{id}/eliminarCliente")
    @Secured({"ADMIN"})
    @Operation(description = "Esta Funcion elimina un cliente")
    public ResponseEntity<String> eliminarCliente(@PathVariable Long id) {
        String response = entidadService.eliminarCliente(id);
        return new ResponseEntity<> (response, HttpStatus.OK);
    }

    //cualquiera lo usa
    @GetMapping("/seleccionarCliente")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta Funcion selecciona un cliente")
    public ResponseEntity<?> seleccionarCliente(@RequestParam Long id) {
        return ResponseEntity.ok(entidadService.seleccionarCliente(id));
    }

    /////////////////////////////PROVEEDOR/////////////////////////////////

    //solo puede usarlo un admin
    @PostMapping("/proveedor")
    @Secured({"ADMIN"})
    @Operation(description = "Esta Funcion crea un nuevo Proveedor")
    public ResponseEntity<String> crearProveedor(@RequestBody ProveedorDto proveedorDto) {
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

    //solo admin puede usarlo
    @PutMapping("/{id}/eliminarProveedor")
    @Secured({"ADMIN"})
    @Operation(description = "Esta Funcion elimina un proveedor")
    public ResponseEntity<String> eliminarProveedor(@PathVariable Long id) {
        String response = entidadService.eliminarProveedor(id);
        return new ResponseEntity<> (response, HttpStatus.OK);
    }

    //cualquiera lo usa
    @GetMapping("/seleccionarProveedor")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta Funcion selecciona un proveedor")
    public ResponseEntity<?> seleccionarProveedor(@RequestParam Long id) {
        return ResponseEntity.ok(entidadService.seleccionarProveedor(id));
    }

    }
