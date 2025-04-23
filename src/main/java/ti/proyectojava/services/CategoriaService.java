package ti.proyectojava.services;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import ti.proyectojava.api.responses.ResponseListadoCategorias;
import ti.proyectojava.business.entities.*;
import ti.proyectojava.business.repositories.CategoriaRepository;
import ti.proyectojava.dtos.*;

import java.util.List;
import java.util.Optional;

@Service
public class CategoriaService {
    private final CategoriaRepository categoriaRepository;
    private final ProductoService productoService;

    public CategoriaService(CategoriaRepository categoriaRepository, @Lazy ProductoService productoService)
    {
        this.categoriaRepository = categoriaRepository;
        this.productoService = productoService;
    }

    public ResponseListadoCategorias listadoCategorias() {
        ResponseListadoCategorias response = new ResponseListadoCategorias();

        List<CategoriaDto> categoriasActivas = categoriaRepository.findByActivoTrue()
                .stream()
                .map(this::mapToDtoCategoria)
                .toList();

        response.setCategorias(categoriasActivas);

        return response;
    }


    public String crearCategoria(CategoriaDto categoria) {
        String response = null;

        if (categoria.getNombre() == null) {
            response = "Categoria: " + categoriaRepository.save(mapToEntityCategoria(categoria)).getNombre() + " creada exitosamente.";

        }
        return response;
    }

    public String borrarCategoria(String nombreCategoria) {
        Optional<Categoria> categoriaOpt = categoriaRepository.findById(nombreCategoria);
        String response = null;

        if (categoriaOpt.isPresent()) {
            Categoria categoria = categoriaOpt.get();
            categoria.setActivo(false);
            categoriaRepository.save(categoria);
            response = "Categoría eliminada correctamente.";
        }

        return response;
    }


    //////////////


    public CategoriaDto mapToDtoCategoria(Categoria categoria) {
        CategoriaDto catDto = new CategoriaDto();
        catDto.setNombre(categoria.getNombre());

        if (categoria.getProductos() != null) {
            catDto.setProductos(
                    categoria.getProductos().stream()
                            .map(e -> productoService.mapToDtoProducto(e))
                            .toList()
            );
        }
        if (categoria.getCategoriaPadre() != null) {
            catDto.setCategoriaPadre(mapToDtoCategoria(categoria.getCategoriaPadre()));
        }

        if (categoria.getSubcategorias() != null) {
            catDto.setSubcategorias(
                    categoria.getSubcategorias().stream()
                            .map(e -> mapToDtoCategoria(e))
                            .toList()
            );
        }
        return catDto;
    }

    public Categoria mapToEntityCategoria(CategoriaDto catDto) {
        Categoria categoria = new Categoria();
        categoria.setNombre(catDto.getNombre());


        if (catDto.getProductos() != null) {
            categoria.setProductos(
                    catDto.getProductos().stream()
                            .map(e ->productoService.mapToEntityProducto(e))
                            .toList()
            );
        }

        if (catDto.getCategoriaPadre() != null) {
            categoria.setCategoriaPadre(mapToEntityCategoria(catDto.getCategoriaPadre()));
        }

        if (catDto.getSubcategorias() != null) {
            categoria.setSubcategorias(
                    catDto.getSubcategorias().stream()
                            .map(e -> mapToEntityCategoria(e))
                            .toList()
            );
        }

        return categoria;
    }

}
