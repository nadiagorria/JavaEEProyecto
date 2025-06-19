package ti.proyectojava.services;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import ti.proyectojava.api.responses.ResponseListadoCategorias;
import ti.proyectojava.api.responses.ResponseListadoUsuarios;
import ti.proyectojava.business.entities.*;
import ti.proyectojava.business.repositories.CantidadRepository;
import ti.proyectojava.business.repositories.CategoriaRepository;
import ti.proyectojava.dtos.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CategoriaService {
    private final CategoriaRepository categoriaRepository;
    private final MapsDtosEntityService mapsDtosEntityService;
    private final CantidadRepository cantidadRepository;

    public CategoriaService(CategoriaRepository categoriaRepository, MapsDtosEntityService mapsDtosEntityService, CantidadRepository cantidadRepository)
    {
        this.categoriaRepository = categoriaRepository;
        this.mapsDtosEntityService = mapsDtosEntityService;
        this.cantidadRepository = cantidadRepository;
    }

    public ResponseListadoCategorias listadoCategorias() {
        ResponseListadoCategorias response = new ResponseListadoCategorias();

        List<CategoriaDto> categoriasActivas = categoriaRepository.findByActivoTrue()
                .stream()
                .map(mapsDtosEntityService::mapToDtoCategoria)
                .toList();

        response.setCategorias(categoriasActivas);

        return response;
    }

    public String crearCategoria(CategoriaDto categoria) {
        String response = null;

        if (categoria.getNombre() != null) {
            response = "Categoria creada exitosamente. NOMBRE:" + categoriaRepository.save(mapsDtosEntityService.mapToEntityCategoria(categoria)).getId();

        }
        return response;
    }

    public String borrarCategoria(String nombreCategoria) {
        Optional<Categoria> categoriaOpt = categoriaRepository.findByNombre(nombreCategoria);
        String response = null;

        if (categoriaOpt.isPresent()) {
            Categoria categoria = categoriaOpt.get();
            categoria.setActivo(false);
            categoriaRepository.save(categoria);
            response = "Categoría eliminada correctamente. NOMBRE:" + categoria.getNombre();
        }

        return response;
    }    public String desvincularProductosDeCategoria(String nombreCategoria) {
        Optional<Categoria> categoriaOpt = categoriaRepository.findByNombre(nombreCategoria);
        String response = null;

        if (categoriaOpt.isPresent()) {
            Categoria categoria = categoriaOpt.get();
            
            // Obtener la lista de productos y desvincularlos
            List<Producto> productos = categoria.getProductos();
            for (Producto producto : productos) {
                producto.setCategoria(null);
            }
            
            // La categoría ya no tiene productos asociados
            categoria.setProductos(new ArrayList<>());
            
            // Guardar los cambios
            categoriaRepository.save(categoria);
            response = "Productos desvinculados correctamente de la categoría: " + categoria.getNombre();
        }

        return response;
    }

    public ResponseListadoCategorias listadoCategoriasTop(int n) {
        ResponseListadoCategorias response = new ResponseListadoCategorias();

        List<Object[]> topResults = cantidadRepository.findTopBestSellingCategories();
        List<CategoriaDto> topCategoriasVendidas = topResults.stream()
                .limit(n)
                .map(result -> {
                    Categoria categoria = (Categoria) result[0];
                    return mapsDtosEntityService.mapToDtoCategoria(categoria);
                })
                .collect(java.util.stream.Collectors.toList());

        response.setCategorias(topCategoriasVendidas);

        return response;
    }
}
