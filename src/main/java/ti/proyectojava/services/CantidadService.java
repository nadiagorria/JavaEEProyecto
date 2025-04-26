package ti.proyectojava.services;

import org.springframework.stereotype.Service;
import ti.proyectojava.api.responses.ResponseListadoCantidades;
import ti.proyectojava.business.repositories.CantidadRepository;
import ti.proyectojava.dtos.CantidadDto;


@Service
public class CantidadService {

    private final CantidadRepository cantidadRepository;
    private final MapsDtosEntityService mapsDtosEntityService;


    public CantidadService(CantidadRepository cantidadRepository, MapsDtosEntityService mapsDtosEntityService) {
        this.cantidadRepository = cantidadRepository;
        this.mapsDtosEntityService = mapsDtosEntityService;
    }

    public ResponseListadoCantidades listadoCantidades() {
        ResponseListadoCantidades responseListadoCantidades = new ResponseListadoCantidades();

        responseListadoCantidades.setCantidades(
                cantidadRepository.findAll()
                        .stream()
                        .map(mapsDtosEntityService::mapToDtoCantidad)
                        .toList()
        );

        return responseListadoCantidades;
    }

    public String crearCantidad(CantidadDto cantidad){
        String response = null;

        if(cantidad.getId()==null){
            response = "Cantidad creada. ID:" + cantidadRepository.save(mapsDtosEntityService.mapToEntityCantidad(cantidad)).getId();

        }
        return  response;
    }

    public String borrarCantidad(Long id) {
        if (!cantidadRepository.existsById(id)) {
            return "Cantidad no encontrada. ID:" + id;
        }

        cantidadRepository.deleteById(id);
        return "Cantidad eliminada correctamente. ID:" + id;
    }
}
