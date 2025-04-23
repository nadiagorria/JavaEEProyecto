package ti.proyectojava.services;

import org.springframework.stereotype.Service;
import ti.proyectojava.api.responses.ResponseListadoCantidades;
import ti.proyectojava.business.repositories.CantidadRepository;
import ti.proyectojava.dtos.CantidadDto;


@Service
public class CantidadService {

    private final CantidadRepository cantidadRepository;
    private final VentaService ventaService;


    public CantidadService(CantidadRepository cantidadRepository, VentaService ventaService) {
        this.cantidadRepository = cantidadRepository;
        this.ventaService = ventaService;
    }

    public ResponseListadoCantidades listadoCantidades() {
        ResponseListadoCantidades responseListadoCantidades = new ResponseListadoCantidades();

        responseListadoCantidades.setCantidades(
                cantidadRepository.findAll()
                        .stream()
                        .map(ventaService::mapToDtoCantidad)
                        .toList()
        );

        return responseListadoCantidades;
    }

    public String crearCantidad(CantidadDto cantidad){
        String response = null;

        if(cantidad.getId()==null){
            response = "Cantidad creada nro: " + cantidadRepository.save(ventaService.mapToEntityCantidad(cantidad)).getId();

        }
        return  response;
    }

    public String borrarCantidad(Long id) {
        if (!cantidadRepository.existsById(id)) {
            return "Cantidad no encontrada";
        }

        cantidadRepository.deleteById(id);
        return "Cantidad eliminada correctamente";
    }
}
