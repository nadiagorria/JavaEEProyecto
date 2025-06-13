package ti.proyectojava.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectojava.api.responses.ResponseListadoCombos;
import ti.proyectojava.api.responses.ResponseListadoDescuentos;
import ti.proyectojava.api.responses.ResponseListadoProductos;
import ti.proyectojava.api.responses.ResponseListadoPromociones;
import ti.proyectojava.dtos.ComboDto;
import ti.proyectojava.dtos.DescuentoDto;
import ti.proyectojava.dtos.PromocionDto;
import ti.proyectojava.business.entities.Oferta;
import ti.proyectojava.services.OfertaService;

@RestController
@RequestMapping(value = "api/v1/oferta")
public class OfertaController {

    private final OfertaService ofertaService;

    public OfertaController(OfertaService ofertaService) {
        this.ofertaService = ofertaService;
    }

    ////////////////////// COMBO //////////////////////

    //solo admin puede hacerlo
    @PostMapping("/combo")
    @Secured({"ADMIN"})
    @Operation(description = "Crea un nuevo Combo")
    public ResponseEntity<String> crearCombo(@RequestBody ComboDto comboDto) {
        try {
            System.out.println("DEBUG: Datos recibidos en controller - ComboDto: " + comboDto);
            System.out.println("DEBUG: Descripción recibida: " + comboDto.getDescripcion());
            System.out.println("DEBUG: Descuento recibido: " + comboDto.getDescuento());
            System.out.println("DEBUG: Inicio recibido: " + comboDto.getInicio());
            System.out.println("DEBUG: Fin recibido: " + comboDto.getFin());
            System.out.println("DEBUG: Productos recibidos: " + comboDto.getProductos());
            
            comboDto.setId(null);
            String response = ofertaService.crearCombo(comboDto);
            return response == null ?
                    new ResponseEntity<>("Error al crear Combo. ID:" + comboDto.getId(), HttpStatus.BAD_REQUEST) :
                    new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            System.err.println("ERROR en crearCombo: " + e.getMessage());
            e.printStackTrace();
            // Devolver el mensaje específico del error de validación
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("ERROR GENERAL en crearCombo: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>("Error interno al crear combo: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    //todos pueden usarla
    @GetMapping("/listarCombo")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta funcion lista los combos")
    public ResponseEntity<ResponseListadoCombos> getCombos() {
        ResponseListadoCombos response = ofertaService.listadoCombo();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    //todos pueden usarla
    @GetMapping("/combos/producto/{productoId}")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta funcion lista los combos que contienen un producto específico")
    public ResponseEntity<ResponseListadoCombos> getCombosByProducto(@PathVariable Long productoId) {
        ResponseListadoCombos response = ofertaService.getCombosByProducto(productoId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    ////////////////////// DESCUENTO //////////////////////

    //solo puede hacerlo el admin
    @PostMapping("/descuento")
    @Secured({"ADMIN"})
    @Operation(description = "Crea un nuevo Descuento")
    public ResponseEntity<String> crearDescuento(@RequestBody DescuentoDto descuentoDto) {
        try {
            System.out.println("DEBUG: Datos recibidos en controller - DescuentoDto: " + descuentoDto);
            System.out.println("DEBUG: Descripción recibida: " + descuentoDto.getDescripcion());
            System.out.println("DEBUG: Descuento recibido: " + descuentoDto.getDescuento());
            System.out.println("DEBUG: Inicio recibido: " + descuentoDto.getInicio());
            System.out.println("DEBUG: Fin recibido: " + descuentoDto.getFin());
            System.out.println("DEBUG: Producto recibido: " + descuentoDto.getProducto());
            
            descuentoDto.setId(null); // Aseguramos que el ID sea nulo para crear un nuevo descuento
            String response = ofertaService.crearDescuento(descuentoDto);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            System.err.println("ERROR en crearDescuento: " + e.getMessage());
            e.printStackTrace();
            // Devolver el mensaje específico del error de validación
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("ERROR GENERAL en crearDescuento: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>("Error interno al crear descuento: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    //todos pueden usarla
    @GetMapping("/listarDescuentos")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta funcion lista los descuentos")
    public ResponseEntity<ResponseListadoDescuentos> getDescuentos() {
        ResponseListadoDescuentos response = ofertaService.listadoDescuentos();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    //todos pueden usarla
    @GetMapping("/descuentos/producto/{productoId}")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta funcion lista los descuentos de un producto específico")
    public ResponseEntity<ResponseListadoDescuentos> getDescuentosByProducto(@PathVariable Long productoId) {
        ResponseListadoDescuentos response = ofertaService.getDescuentosByProducto(productoId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    ////////////////////// PROMOCIÓN //////////////////////    //solo admin puede hacerlo
    @PostMapping("/promocion")
    @Secured({"ADMIN"})
    @Operation(description = "Crea una nueva Promoción")
    public ResponseEntity<String> crearPromocion(@RequestBody PromocionDto promocionDto) {
        try {
            System.out.println("DEBUG: Datos recibidos en controller - PromocionDto: " + promocionDto);
            System.out.println("DEBUG: Descripción recibida: " + promocionDto.getDescripcion());
            System.out.println("DEBUG: Descuento recibido: " + promocionDto.getDescuento());
            System.out.println("DEBUG: Inicio recibido: " + promocionDto.getInicio());
            System.out.println("DEBUG: Fin recibido: " + promocionDto.getFin());
            System.out.println("DEBUG: Producto recibido: " + promocionDto.getProducto());
            
            promocionDto.setId(null); // Aseguramos que el ID sea nulo para crear una nueva promoción
            String response = ofertaService.crearPromocion(promocionDto);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            System.err.println("ERROR en crearPromocion: " + e.getMessage());
            e.printStackTrace();
            // Devolver el mensaje específico del error de validación
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("ERROR GENERAL en crearPromocion: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>("Error interno al crear promoción: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    //todos pueden usarla
    @GetMapping("/listarPromociones")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta funcion lista las promociones")
    public ResponseEntity<ResponseListadoPromociones> getPromociones() {
        ResponseListadoPromociones response = ofertaService.listadoPromociones();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    //todos pueden usarla
    @GetMapping("/promociones/producto/{productoId}")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta funcion lista las promociones de un producto específico")
    public ResponseEntity<ResponseListadoPromociones> getPromocionesByProducto(@PathVariable Long productoId) {
        ResponseListadoPromociones response = ofertaService.getPromocionesByProducto(productoId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    ////////////////////// ELIMINAR OFERTA //////////////////////

    //solo admin puede hacerlo
    @PutMapping("/eliminar")
    @Secured({"ADMIN"})
    @Operation(description = "Elimina (lógicamente) una Oferta")
    public ResponseEntity<String> eliminarOferta(@RequestBody Long id) {
        String response = ofertaService.eliminarOferta(id);

        return ResponseEntity.ok(response);
    }
}
