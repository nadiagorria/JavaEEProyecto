package ti.proyectojava.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ti.proyectojava.dtos.ComboDto;
import ti.proyectojava.dtos.DescuentoDto;
import ti.proyectojava.dtos.PromocionDto;
import ti.proyectojava.business.entities.Oferta;
import ti.proyectojava.services.OfertaService;

@RestController
@RequestMapping("/oferta")
public class OfertaController {

    private final OfertaService ofertaService;

    public OfertaController(OfertaService ofertaService) {
        this.ofertaService = ofertaService;
    }

    ////////////////////// COMBO //////////////////////

    @PostMapping("/combo")
    @Operation(description = "Crea un nuevo Combo")
    public ResponseEntity<String> crearCombo(@RequestBody ComboDto comboDto) {
        String response = ofertaService.crearCombo(comboDto);
        return response == null ?
                new ResponseEntity<>("Error al crear Combo. ID:" + comboDto.getId(), HttpStatus.BAD_REQUEST) :
                new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/editarcombo")
    @Operation(description = "Edita un Combo existente")
    public ResponseEntity<String> editarCombo(@RequestBody ComboDto comboDto) {
        return ResponseEntity.ok(ofertaService.editarCombo(comboDto));
    }

    ////////////////////// DESCUENTO //////////////////////

    @PostMapping("/descuento")
    @Operation(description = "Crea un nuevo Descuento")
    public ResponseEntity<String> crearDescuento(@RequestBody DescuentoDto descuentoDto) {
        String response = ofertaService.crearDescuento(descuentoDto);
        return response == null ?
                new ResponseEntity<>("Error al crear Descuento. ID:" + descuentoDto.getId(), HttpStatus.BAD_REQUEST) :
                new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/editardescuento")
    @Operation(description = "Edita un Descuento existente")
    public ResponseEntity<String> editarDescuento(@RequestBody DescuentoDto descuentoDto) {
        return ResponseEntity.ok(ofertaService.editarDescuento(descuentoDto));
    }

    ////////////////////// PROMOCIÓN //////////////////////

    @PostMapping("/promocion")
    @Operation(description = "Crea una nueva Promoción")
    public ResponseEntity<String> crearPromocion(@RequestBody PromocionDto promocionDto) {
        String response = ofertaService.crearPromocion(promocionDto);
        return response == null ?
                new ResponseEntity<>("Error al crear Promoción. ID:" + promocionDto.getId(), HttpStatus.BAD_REQUEST) :
                new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/editarpromocion")
    @Operation(description = "Edita una Promoción existente")
    public ResponseEntity<String> editarPromocion(@RequestBody PromocionDto promocionDto) {
        return ResponseEntity.ok(ofertaService.editarPromocion(promocionDto));
    }

    ////////////////////// ELIMINAR OFERTA //////////////////////

    @PutMapping("/eliminar")
    @Operation(description = "Elimina (lógicamente) una Oferta")
    public ResponseEntity<String> eliminarOferta(@RequestBody Long id) {
        String response = ofertaService.eliminarOferta(id);

        return ResponseEntity.ok(response);
    }
}
