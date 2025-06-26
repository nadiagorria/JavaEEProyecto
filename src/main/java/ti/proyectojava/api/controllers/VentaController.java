package ti.proyectojava.api.controllers;


import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpSession;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import ti.proyectojava.api.responses.ResponseListadoVentas;
import ti.proyectojava.business.entities.Venta;
import ti.proyectojava.business.entities.FormaDePago;
import ti.proyectojava.dtos.UsuarioDto;
import ti.proyectojava.dtos.VentaDto;
import ti.proyectojava.services.UsuarioService;
import ti.proyectojava.services.VentaService;
import ti.proyectojava.services.CreditoService;

import java.time.LocalDate;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping(value = "api/v1/venta")
public class VentaController {
    private final VentaService ventaService;
    private final UsuarioService usuarioService;
    private final CreditoService creditoService;

    public VentaController(VentaService ventaService, UsuarioService usuarioService, CreditoService creditoService) {
        this.ventaService = ventaService;
        this.usuarioService = usuarioService;
        this.creditoService = creditoService;
    }

    @GetMapping()
    @Secured({"ADMIN", "CAJERO"})
    public ResponseEntity<ResponseListadoVentas> listarVentas(Authentication authentication) {
        String username = authentication.getName();
        UsuarioDto usuario = usuarioService.buscarUsuario(username);

        boolean esAdmin = usuario.getRoles().stream().anyMatch(rol -> rol.getNombre().equals("ADMIN"));

        ResponseListadoVentas response;

        if (esAdmin) {
            response = ventaService.listadoVentas();
        } else {
            response = ventaService.listadoVentasPorUsuario(username);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/paginado")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Lista ventas paginadas con filtros opcionales por fecha")
    public ResponseEntity<Page<VentaDto>> ventasPaginadas(
            Authentication authentication,
            @RequestParam("pagina") Integer pagina,
            @RequestParam("cantidad") Integer cantidad,
            @RequestParam(value = "fechaDesde", required = false) String fechaDesdeStr,
            @RequestParam(value = "fechaHasta", required = false) String fechaHastaStr) {
        
        String username = authentication.getName();
        UsuarioDto usuario = usuarioService.buscarUsuario(username);
        boolean esAdmin = usuario.getRoles().stream().anyMatch(rol -> rol.getNombre().equals("ADMIN"));
        
        LocalDate fechaDesde = null;
        LocalDate fechaHasta = null;
        
        try {
            if (fechaDesdeStr != null && !fechaDesdeStr.trim().isEmpty()) {
                fechaDesde = LocalDate.parse(fechaDesdeStr);
            }
            if (fechaHastaStr != null && !fechaHastaStr.trim().isEmpty()) {
                fechaHasta = LocalDate.parse(fechaHastaStr);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
        
        Page<VentaDto> response;
        
        if (esAdmin) {
            response = ventaService.listadoVentasPageConFiltros(pagina, cantidad, fechaDesde, fechaHasta);
        } else {
            response = ventaService.listadoVentasPagePorUsuarioConFiltros(username, pagina, cantidad, fechaDesde, fechaHasta);
        }
        
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

    @PostMapping("/crear")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta Funcion crea una nueva Venta")
    public ResponseEntity<Map<String, Long>> crearVenta(@RequestBody VentaDto ventaDto, HttpSession session, Authentication authentication) {

        String username = authentication.getName();
        UsuarioDto usuario = usuarioService.buscarUsuario(username);
        ventaDto.setUsuario(usuario.getNombre());
        if (ventaDto.getFormaPago() == FormaDePago.FIADO) {
            String error = "error";
            if (ventaDto.getCredito() == null || ventaDto.getCredito().getId() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Collections.singletonMap(error, -1L));
            }

            Long creditoId = ventaDto.getCredito().getId();
            float totalVenta = ventaDto.getTotal();

            if (!creditoService.superaCreditoMinimo(creditoId, totalVenta)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Collections.singletonMap(error, -3L));
            }

            if (!creditoService.puedeRealizarCompra(creditoId, totalVenta)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Collections.singletonMap(error, -2L));
            }
        }

        Long ventaId = ventaService.crearVenta(ventaDto);

        return ResponseEntity.status(HttpStatus.CREATED).body(Collections.singletonMap("id", ventaId));
    }

    @PutMapping("/{id}/eliminar")
    @Secured({"ADMIN"})
    @Operation(description = "Esta Funcion elimina una venta")
    public ResponseEntity<Map<String, Object>> eliminarVenta(@PathVariable Long id) {
        try {
            Venta venta = ventaService.eliminarVenta(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Venta eliminada correctamente");
            response.put("ventaId", venta.getId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }


    @Operation(description = "Obtiene el número total de ventas registradas")
    @GetMapping("/cantidadVentas")
    @Secured({"ADMIN", "CAJERO"})
    public ResponseEntity<Integer> getVentasTotales() {
        Integer response = ventaService.listadoVentasTotales();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
