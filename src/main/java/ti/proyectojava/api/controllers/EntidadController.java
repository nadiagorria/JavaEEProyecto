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

        if (clienteCreditoDto.getNombre() == null || clienteCreditoDto.getNombre().trim().isEmpty()) {
            return new ResponseEntity<>("El nombre del cliente es obligatorio", HttpStatus.BAD_REQUEST);
        }
        
        if (clienteCreditoDto.getNombre().matches(".*\\d.*")) {
            return new ResponseEntity<>("El nombre del cliente no puede contener números", HttpStatus.BAD_REQUEST);
        }

        if (clienteCreditoDto.getTelefono() == null || clienteCreditoDto.getTelefono().trim().isEmpty()) {
            return new ResponseEntity<>("El teléfono del cliente es obligatorio", HttpStatus.BAD_REQUEST);
        }
        
        if (!clienteCreditoDto.getTelefono().matches("[0-9+\\s-]+")) {
            return new ResponseEntity<>("El teléfono del cliente solo puede contener números, espacios, guiones y el símbolo +", HttpStatus.BAD_REQUEST);
        }

        if (clienteCreditoDto.getMinimo() < 0) {
            return new ResponseEntity<>("El crédito mínimo no puede ser negativo", HttpStatus.BAD_REQUEST);
        }

        if (clienteCreditoDto.getMaximo() <= 0) {
            return new ResponseEntity<>("El crédito máximo debe ser mayor a 0", HttpStatus.BAD_REQUEST);
        }

        if (clienteCreditoDto.getMaximo() <= clienteCreditoDto.getMinimo()) {
            return new ResponseEntity<>("El crédito máximo debe ser mayor que el crédito mínimo", HttpStatus.BAD_REQUEST);
        }

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

        if (clienteDto.getNombre() == null || clienteDto.getNombre().trim().isEmpty()) {
            return new ResponseEntity<>("El nombre del cliente es obligatorio", HttpStatus.BAD_REQUEST);
        }
        
        if (clienteDto.getNombre().matches(".*\\d.*")) {
            return new ResponseEntity<>("El nombre del cliente no puede contener números", HttpStatus.BAD_REQUEST);
        }

        if (clienteDto.getTelefono() == null || clienteDto.getTelefono().trim().isEmpty()) {
            return new ResponseEntity<>("El teléfono del cliente es obligatorio", HttpStatus.BAD_REQUEST);
        }
        
        if (!clienteDto.getTelefono().matches("[0-9+\\s-]+")) {
            return new ResponseEntity<>("El teléfono del cliente solo puede contener números, espacios, guiones y el símbolo +", HttpStatus.BAD_REQUEST);
        }

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

        if (proveedorDto.getNombre() == null || proveedorDto.getNombre().trim().isEmpty()) {
            return new ResponseEntity<>("El nombre del proveedor es obligatorio", HttpStatus.BAD_REQUEST);
        }
        
        if (proveedorDto.getNombre().matches(".*\\d.*")) {
            return new ResponseEntity<>("El nombre del proveedor no puede contener números", HttpStatus.BAD_REQUEST);
        }

        if (proveedorDto.getTelefono() == null || proveedorDto.getTelefono().trim().isEmpty()) {
            return new ResponseEntity<>("El teléfono del proveedor es obligatorio", HttpStatus.BAD_REQUEST);
        }
        
        if (!proveedorDto.getTelefono().matches("[0-9+\\s-]+")) {
            return new ResponseEntity<>("El teléfono del proveedor solo puede contener números, espacios, guiones y el símbolo +", HttpStatus.BAD_REQUEST);
        }

        if (proveedorDto.getCorreo() == null || proveedorDto.getCorreo().trim().isEmpty()) {
            return new ResponseEntity<>("El correo del proveedor es obligatorio", HttpStatus.BAD_REQUEST);
        }


        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        if (!proveedorDto.getCorreo().matches(emailRegex)) {
            return new ResponseEntity<>("El formato del correo electrónico no es válido", HttpStatus.BAD_REQUEST);
        }
        
        proveedorDto.setId(null);
        String response = entidadService.crearProveedor(proveedorDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/editarproveedor")
    @Secured({"ADMIN"})
    public ResponseEntity<String> editarProveedor(@RequestBody ProveedorDto proveedorDto) {
        
        if (proveedorDto.getNombre() == null || proveedorDto.getNombre().trim().isEmpty()) {
            return new ResponseEntity<>("El nombre del proveedor es obligatorio", HttpStatus.BAD_REQUEST);
        }
        
        if (proveedorDto.getNombre().matches(".*\\d.*")) {
            return new ResponseEntity<>("El nombre del proveedor no puede contener números", HttpStatus.BAD_REQUEST);
        }

        if (proveedorDto.getTelefono() == null || proveedorDto.getTelefono().trim().isEmpty()) {
            return new ResponseEntity<>("El teléfono del proveedor es obligatorio", HttpStatus.BAD_REQUEST);
        }
        
        if (!proveedorDto.getTelefono().matches("[0-9+\\s-]+")) {
            return new ResponseEntity<>("El teléfono del proveedor solo puede contener números, espacios, guiones y el símbolo +", HttpStatus.BAD_REQUEST);
        }

        if (proveedorDto.getCorreo() == null || proveedorDto.getCorreo().trim().isEmpty()) {
            return new ResponseEntity<>("El correo del proveedor es obligatorio", HttpStatus.BAD_REQUEST);
        }

        // Validar formato de correo
        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        if (!proveedorDto.getCorreo().matches(emailRegex)) {
            return new ResponseEntity<>("El formato del correo electrónico no es válido", HttpStatus.BAD_REQUEST);
        }
        
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
