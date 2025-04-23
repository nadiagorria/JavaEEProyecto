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
    private final EntidadService entidadService;
    public CreditoService(CreditoRepository creditoRepository, EntidadService entidadService) {
        this.creditoRepository = creditoRepository;
        this.entidadService = entidadService;
    }

    public String crearCredito(CreditoDto credito){
        String response = null;

        if(credito.getId()==null){
            response = "Credito: " + creditoRepository.save(mapToEntityCredito(credito)).getId() + " creado exitosamente.";

        }
        return  response;
    }

    public String pagarCredito(Long Id, Float pago){
        String response = null;

        Credito aux = creditoRepository.findById(Id).orElseThrow(() -> new RuntimeException("Credito no existe"));

        float total = pago + aux.getPagoHastaAhora();
        aux.setPagoHastaAhora(total);

        total = aux.getPrecioTotal() - pago;
        aux.setPrecioTotal(total);

        creditoRepository.save(aux);
        response = "Credito modificado correctamente";
        return response;
    }


    public CreditoDto mapToDtoCredito(Credito credito) {
        CreditoDto dto = new CreditoDto();

        dto.setId(credito.getId());
        dto.setPrecioTotal(credito.getPrecioTotal());
        dto.setMinimo(credito.getMinimo());
        dto.setMaximo(credito.getMaximo());
        dto.setPagoHastaAhora(credito.getPagoHastaAhora());

        if (credito.getCliente() != null) {
            dto.setCliente(entidadService.mapToDtoCliente(credito.getCliente()));
        }

        return dto;
    }

    public Credito mapToEntityCredito(CreditoDto dto) {
        Credito credito = new Credito();

        credito.setId(dto.getId());
        credito.setPrecioTotal(dto.getPrecioTotal());
        credito.setMinimo(dto.getMinimo());
        credito.setMaximo(dto.getMaximo());
        credito.setPagoHastaAhora(dto.getPagoHastaAhora());

        if (dto.getCliente() != null) {
            credito.setCliente(entidadService.mapToEntityCliente(dto.getCliente()));
        }

        return credito;
    }

}
