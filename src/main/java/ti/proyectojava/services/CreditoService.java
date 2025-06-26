package ti.proyectojava.services;

import org.springframework.stereotype.Service;
import ti.proyectojava.business.entities.Credito;
import ti.proyectojava.business.repositories.CreditoRepository;
import ti.proyectojava.dtos.CreditoDto;
import ti.proyectojava.api.responses.ResponseListadoCreditos;

import java.util.List;

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

        List<CreditoDto> creditosActivos = creditoRepository.findByActivoTrue().stream().map(mapsDtosEntityService::mapToDtoCredito).toList();

        response.setCreditos(creditosActivos);

        return response;
    }


    public String pagarCredito(Long id, Float pago) {
        String response = null;

        Credito aux = creditoRepository.findById(id).orElseThrow(() -> new RuntimeException("Credito no existe. ID:" + id));

        if (pago < 0 || pago > aux.getPrecioTotal()) {
            throw new RuntimeException("El pago debe ser positivo y no puede exceder el total adeudado.");
        }

        float total = pago + aux.getPagoHastaAhora();
        aux.setPagoHastaAhora(total);

        total = aux.getPrecioTotal() - pago;
        aux.setPrecioTotal(total);

        creditoRepository.save(aux);
        response = "Credito modificado correctamente. ID:" + aux.getId();
        return response;
    }


    public boolean puedeRealizarCompra(Long creditoId, float montoVenta) {
        Credito credito = creditoRepository.findById(creditoId).orElseThrow(() -> new RuntimeException("Crédito no encontrado. ID: " + creditoId));

        float deudaActual = credito.getPrecioTotal();
        float dineroDisponible = Math.max(0, credito.getMaximo() - deudaActual);

        return montoVenta <= dineroDisponible;
    }


    public boolean superaCreditoMinimo(Long creditoId, float montoVenta) {
        Credito credito = creditoRepository.findById(creditoId).orElseThrow(() -> new RuntimeException("Crédito no encontrado. ID: " + creditoId));

        return montoVenta >= credito.getMinimo();
    }


}
