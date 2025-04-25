package ti.proyectojava.api.controllers;


import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    @GetMapping("/persona/")
    public ResponseEntity<?> seleccionarEntidad(@RequestBody Long id) {
        return ResponseEntity.ok(entidadService.seleccionarEntidad(id));
    }

    @PutMapping("/eliminar")
    @Operation(description = "Esta Funcion elimina una Persona")
    public ResponseEntity<String> eliminarPersona(@RequestBody Long id) {
        Entidad entidad = entidadService.eliminarPersona(this.entidadActual);
        return ResponseEntity.ok("Persona eliminado correctamente. ID:" + entidad.getId());
    }


    //////////////////////CLIENTE////////////////////////////

    @PostMapping("/cliente")
    @Operation(description = "Esta Funcion crea un nuevo Cliente")
    public ResponseEntity<String> crearCliente(@RequestBody ClienteDto clienteDto) {
        String response = entidadService.crearCliente(clienteDto);

        if (response == null) {
            return new ResponseEntity<>("Error al crear Cliente. ID:" + clienteDto.getId() , HttpStatus.BAD_REQUEST);
        } else {
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        }
    }

    @PutMapping("/editarcliente")
    public ResponseEntity<String> editarCliente(@RequestBody ClienteDto clienteDto) {
        String result = entidadService.editarCliente(clienteDto);
        return ResponseEntity.ok(result);
    }

    /////////////////////////////PROVEEDOR/////////////////////////////////

    @PostMapping("/proveedor")
    @Operation(description = "Esta Funcion crea un nuevo Proveedor")
    public ResponseEntity<String> crearProveedor(@RequestBody ProveedorDto proveedorDto) {
        String response = entidadService.crearProveedor(proveedorDto);

        if (response == null) {
            return new ResponseEntity<>("Error al crear Proveedor", HttpStatus.BAD_REQUEST);
        } else {
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        }
    }

    @PutMapping("/editarproveedor")
    public ResponseEntity<String> editarProveedor(@RequestBody ProveedorDto proveedorDto) {
        String result = entidadService.editarProveedor(proveedorDto);
        return ResponseEntity.ok(result);
    }

    }
