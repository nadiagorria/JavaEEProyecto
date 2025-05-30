package ti.proyectojava.api.controllers;


import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import ti.proyectojava.api.responses.ResponseListadoVentas;
import ti.proyectojava.business.entities.Venta;
import ti.proyectojava.business.entities.FormaDePago;
import ti.proyectojava.dtos.UsuarioDto;
import ti.proyectojava.dtos.VentaDto;
import ti.proyectojava.services.UsuarioService;
import ti.proyectojava.services.VentaService;
import ti.proyectojava.services.CreditoService;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping(value = "api/v1/venta")
public class VentaController {    private final VentaService ventaService;
    private final UsuarioService usuarioService;
    private final CreditoService creditoService;

    public VentaController(VentaService ventaService, UsuarioService usuarioService, CreditoService creditoService) {
        this.ventaService = ventaService;
        this.usuarioService = usuarioService;
        this.creditoService = creditoService;
    }

    @GetMapping()
    @Secured({"ADMIN"})
    public ResponseEntity<ResponseListadoVentas> listarVentas() {
        ResponseListadoVentas response = ventaService.listadoVentas();
        return ResponseEntity.ok(response);
    }


    @GetMapping("/{id}")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Obtiene una venta específica por su ID")
    public ResponseEntity<VentaDto> obtenerVentaEspecifica(@PathVariable Long id) {
        try {
            VentaDto venta = ventaService.obtenerVentaPorId(id);
            return ResponseEntity.ok(venta);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @PutMapping("/cancelar")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Cancela la venta activa")
    public ResponseEntity<String> cancelarVenta(HttpSession session) {
        Long ventaId = (Long) session.getAttribute("ventaId");
        if (ventaId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No hay venta activa");
        }

        ventaService.eliminarVenta(ventaId);

        // Eliminar el ID de la venta de la sesión
        session.removeAttribute("ventaId");

        return ResponseEntity.ok("Venta cancelada correctamente");
    }

    //cualquiera puede usarla
    @PostMapping("/crear")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta Funcion crea una nueva Venta")
    public ResponseEntity<Map<String, Long>> crearVenta(@RequestBody VentaDto ventaDto, HttpSession session, Authentication authentication) {

        String username = authentication.getName();
        UsuarioDto usuario = usuarioService.buscarUsuario(username);
        ventaDto.setUsuario(usuario.getNombre());

        // Validación para pagos FIADO: verificar límites de crédito
        if (ventaDto.getFormaPago() == FormaDePago.FIADO) {
            if (ventaDto.getCredito() == null || ventaDto.getCredito().getId() == null) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(Collections.singletonMap("error", -1L));
            }

            // Verificar que el cliente no exceda su límite de crédito
            Long creditoId = ventaDto.getCredito().getId();
            float totalVenta = ventaDto.getTotal();
            
            if (!creditoService.puedeRealizarCompra(creditoId, totalVenta)) {
                float dineroDisponible = creditoService.calcularDineroDisponible(creditoId);
                // Retornar error con información específica
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(Collections.singletonMap("error", -2L)); // Código especial para límite excedido
            }
        }

        Long ventaId = ventaService.crearVenta(ventaDto);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(Collections.singletonMap("id", ventaId));
    }

    //solo el admin puede usarla
    @PutMapping("/{id}/eliminar")
    @Secured({"ADMIN"})
    @Operation(description = "Esta Funcion elimina una venta")
    public ResponseEntity<String> eliminarVenta(@PathVariable Long id) {
        Venta venta = ventaService.eliminarVenta(id);
        return new ResponseEntity<>("Venta eliminada. ID: " + venta.getId(), HttpStatus.OK);
    }

    /*//cualquiera puede hacerlo
    @PutMapping("/agregar-producto")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Agrega un producto a una venta existente")
    public ResponseEntity<String> agregarProductoAVenta(@RequestParam Long productoId, @RequestParam int cantidad, HttpSession session) {
        try {
            Long ventaId = (Long) session.getAttribute("ventaId");

            if (ventaId == null) {
                return new ResponseEntity<>("No hay una venta activa en la sesión.", HttpStatus.BAD_REQUEST);
            }
            ventaService.agregarProductoAVenta(ventaId, productoId, cantidad);
            return new ResponseEntity<>("Producto agregado a la venta. ID:" + ventaId, HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }*/

    //cualquiera puede usarla
    @PutMapping("/{ventaId}/finalizar")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Finaliza una venta existente")
    public ResponseEntity<String> finalizarVenta(@PathVariable Long ventaId) {
        try {
            String response = ventaService.finalizarVenta(ventaId);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
