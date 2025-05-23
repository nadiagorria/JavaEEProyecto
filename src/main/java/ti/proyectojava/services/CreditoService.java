package ti.proyectojava.services;

import org.springframework.stereotype.Service;
import ti.proyectojava.api.responses.ResponseListadoCategorias;
import ti.proyectojava.business.entities.Credito;
import ti.proyectojava.business.repositories.CreditoRepository;
import ti.proyectojava.dtos.CategoriaDto;
import ti.proyectojava.dtos.CreditoDto;
import ti.proyectojava.api.responses.ResponseListadoCreditos;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CreditoService {

    private final CreditoRepository creditoRepository;
    private final MapsDtosEntityService mapsDtosEntityService;

    public CreditoService(CreditoRepository creditoRepository, MapsDtosEntityService mapsDtosEntityService) {
        this.creditoRepository = creditoRepository;
        this.mapsDtosEntityService = mapsDtosEntityService;
    }

    public ResponseListadoCreditos listarCreditos() {
        ResponseListadoCreditos response = new ResponseListadoCreditos();

        List<CreditoDto> creditosActivos = creditoRepository.findByActivoTrue()
                .stream()
                .map(mapsDtosEntityService::mapToDtoCredito)
                .toList();

        response.setCreditos(creditosActivos);

        return response;
    }
    public String crearCredito(CreditoDto credito){
        String response = null;

        if(credito.getId() == null){
            response = "Credito creado exitosamente. ID:" + creditoRepository.save(mapsDtosEntityService.mapToEntityCredito(credito)).getId();

        }
        return  response;
    }

    public String pagarCredito(Long id, Float pago){
        String response = null;

        Credito aux = creditoRepository.findById(id).orElseThrow(() -> new RuntimeException("Credito no existe. ID:" + id));

        float total = pago + aux.getPagoHastaAhora();
        aux.setPagoHastaAhora(total);

        total = aux.getPrecioTotal() - pago;
        aux.setPrecioTotal(total);

        creditoRepository.save(aux);
        response = "Credito modificado correctamente. ID:" + aux.getId();
        return response;
    }



}
