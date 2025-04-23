package ti.proyectojava.services;

import org.springframework.stereotype.Service;
import ti.proyectojava.api.responses.ResponseListadoCategorias;
import ti.proyectojava.business.repositories.CantidadRepository;
import ti.proyectojava.dtos.CantidadDto;
import ti.proyectojava.dtos.CategoriaDto;

import java.util.List;

@Service
public class CantidadService {

    private final CantidadRepository cantidadRepository;


    public CantidadService(CantidadRepository cantidadRepository) {
        this.cantidadRepository = cantidadRepository;
    }

    public ResponseListadoCantidad listadoSocios(){
        ResponseListadoCantidad responseListadoCantidad = new ResponseListadoCantidad();

        responseListadoCantidad.setCantidad(cantidadRepository.findAll().stream().map(this::mapToDtoCantidad).toList());

        return responseListadoCantidad;
    }

    public String crearSocio(CantidadDto cantidad){
        String response = null;

        if(cantidad.getId()==null){
            response = "Socio creado nro: " + socioRepository.save(mapToEntity(socio)).getId();

        }
        return  response;
    }

}
