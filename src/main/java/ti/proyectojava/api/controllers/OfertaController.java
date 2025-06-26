package ti.proyectojava.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectojava.api.responses.ResponseListadoCombos;
import ti.proyectojava.api.responses.ResponseListadoDescuentos;
import ti.proyectojava.api.responses.ResponseListadoPromociones;
import ti.proyectojava.dtos.ComboDto;
import ti.proyectojava.dtos.DescuentoDto;
import ti.proyectojava.dtos.PromocionDto;
import ti.proyectojava.services.OfertaService;

@RestController
@RequestMapping(value = "api/v1/oferta")
public class OfertaController {

    private final OfertaService ofertaService;

    public OfertaController(OfertaService ofertaService) {
        this.ofertaService = ofertaService;
    }

//  COMBO

    @PostMapping("/combo")
    @Secured({"ADMIN"})
    @Operation(description = "Crea un nuevo Combo")
    public ResponseEntity<String> crearCombo(@RequestBody ComboDto comboDto) {
        try {
            comboDto.setId(null);
            String response = ofertaService.crearCombo(comboDto);
            return response == null ? new ResponseEntity<>("Error al crear Combo. ID:" + comboDto.getId(), HttpStatus.BAD_REQUEST) : new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {

            return new ResponseEntity<>("Error interno al crear combo: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @GetMapping("/listarCombo")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta funcion lista los combos")
    public ResponseEntity<ResponseListadoCombos> getCombos() {
        ResponseListadoCombos response = ofertaService.listadoCombo();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/combos/producto/{productoId}")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta funcion lista los combos que contienen un producto específico")
    public ResponseEntity<ResponseListadoCombos> getCombosByProducto(@PathVariable Long productoId) {
        ResponseListadoCombos response = ofertaService.getCombosByProducto(productoId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

//  DESCUENTO

    @PostMapping("/descuento")
    @Secured({"ADMIN"})
    @Operation(description = "Crea un nuevo Descuento")
    public ResponseEntity<String> crearDescuento(@RequestBody DescuentoDto descuentoDto) {
        try {
            descuentoDto.setId(null);
            String response = ofertaService.crearDescuento(descuentoDto);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            e.printStackTrace();
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error interno al crear descuento: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @GetMapping("/listarDescuentos")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta funcion lista los descuentos")
    public ResponseEntity<ResponseListadoDescuentos> getDescuentos() {
        ResponseListadoDescuentos response = ofertaService.listadoDescuentos();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }


//  PROMOCION

    @PostMapping("/promocion")
    @Secured({"ADMIN"})
    @Operation(description = "Crea una nueva Promoción")
    public ResponseEntity<String> crearPromocion(@RequestBody PromocionDto promocionDto) {
        try {
            promocionDto.setId(null);
            String response = ofertaService.crearPromocion(promocionDto);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            e.printStackTrace();
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error interno al crear promoción: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @GetMapping("/listarPromociones")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta funcion lista las promociones")
    public ResponseEntity<ResponseListadoPromociones> getPromociones() {
        ResponseListadoPromociones response = ofertaService.listadoPromociones();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }


// ELIMINAR OFERTA

    @PutMapping("/eliminar")
    @Secured({"ADMIN"})
    @Operation(description = "Elimina (lógicamente) una Oferta")
    public ResponseEntity<String> eliminarOferta(@RequestBody Long id) {
        String response = ofertaService.eliminarOferta(id);

        return ResponseEntity.ok(response);
    }
}
