package ti.proyectojava.dtos;

import lombok.Data;

import java.util.List;

@Data
public class CategoriaDto {
    private String nombre;
    private Boolean activo;
    private List<CategoriaDto> subcategorias;
    private CategoriaDto categoriaPadre;
    private List<ProductoDto> productos;

}
