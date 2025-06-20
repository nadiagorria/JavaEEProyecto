package ti.proyectojava.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectojava.api.responses.ResponseListadoCategorias;
import ti.proyectojava.dtos.CategoriaDto;
import ti.proyectojava.services.CategoriaService;

@RestController
@RequestMapping(value = "api/v1/categorias")

public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    // esta funcion la puede usar cualquiera
    @GetMapping
    @Secured({"ADMIN", "CAJERO"})
    public ResponseEntity<ResponseListadoCategorias> getCategorias(){
        ResponseListadoCategorias response = categoriaService.listadoCategorias();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    // obtener las 3 categorías con más productos vendidos
    @GetMapping("/top")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Obtiene las top N categorías con más productos vendidos")
    public ResponseEntity<ResponseListadoCategorias> getTopCategorias(@RequestParam int n){
        ResponseListadoCategorias response = categoriaService.listadoCategoriasTop(n);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }


    // esta funcion solo la puede usar un admin
    @PostMapping
    @Secured({"ADMIN"})
    @Operation(description = "Esta funcion crea una nueva categoria")
    public ResponseEntity<String> createCategoria(@RequestBody CategoriaDto categoriaDto){
        String response = categoriaService.crearCategoria(categoriaDto);
        if (response == null){
            return new ResponseEntity<>("Error al crear categoria. NOMBRE:" + categoriaDto.getNombre(), HttpStatus.BAD_REQUEST);
        }else {
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        }
    }    
    
    // esta funcion solo la puede usar un admin
    @PutMapping("/borrar/{id}")
    @Secured({"ADMIN"})
    public ResponseEntity<Void> borrarCategoria(@PathVariable (name = "id") Long id){
        categoriaService.borrarCategoria(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }    
    
    //esta funcion solo la puede usar un admin
    @PutMapping("/desvincular-productos/{id}")
    @Secured({"ADMIN"})
    @Operation(description = "Esta función desvincula todos los productos de una categoría por ID")
    public ResponseEntity<Void> desvincularProductosDeCategoria(@PathVariable(name = "id") Long id) {
        categoriaService.desvincularProductosDeCategoria(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }    
    

}

