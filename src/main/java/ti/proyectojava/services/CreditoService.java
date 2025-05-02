package ti.proyectojava.services;

import org.springframework.stereotype.Service;
import ti.proyectojava.business.entities.Credito;
import ti.proyectojava.business.entities.Entidad;
import ti.proyectojava.business.entities.Usuario;
import ti.proyectojava.business.repositories.CreditoRepository;
import ti.proyectojava.dtos.CantidadDto;
import ti.proyectojava.dtos.CreditoDto;
import ti.proyectojava.dtos.ProductoDto;
import ti.proyectojava.dtos.UsuarioDto;

@Service
public class CreditoService {

    private final CreditoRepository creditoRepository;
    private final MapsDtosEntityService mapsDtosEntityService;

    public CreditoService(CreditoRepository creditoRepository, MapsDtosEntityService mapsDtosEntityService) {
        this.creditoRepository = creditoRepository;
        this.mapsDtosEntityService = mapsDtosEntityService;
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
