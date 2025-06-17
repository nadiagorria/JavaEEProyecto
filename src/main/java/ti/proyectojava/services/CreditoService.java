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

    /**
     * Valida si un cliente puede realizar una compra sin exceder su límite de crédito
     * @param creditoId ID del crédito del cliente
     * @param montoVenta Monto total de la venta
     * @return true si puede realizar la compra, false si excede el límite
     */
    public boolean puedeRealizarCompra(Long creditoId, float montoVenta) {
        Credito credito = creditoRepository.findById(creditoId)
                .orElseThrow(() -> new RuntimeException("Crédito no encontrado. ID: " + creditoId));
        
        float deudaActual = credito.getPrecioTotal();
        float dineroDisponible = Math.max(0, credito.getMaximo() - deudaActual);
        
        return montoVenta <= dineroDisponible;
    }    /**
     * Calcula el dinero disponible que puede gastar un cliente
     * @param creditoId ID del crédito del cliente
     * @return monto disponible para gastar
     */
    public float calcularDineroDisponible(Long creditoId) {
        Credito credito = creditoRepository.findById(creditoId)
                .orElseThrow(() -> new RuntimeException("Crédito no encontrado. ID: " + creditoId));
        
        float deudaActual = credito.getPrecioTotal();
        return Math.max(0, credito.getMaximo() - deudaActual);
    }

    /**
     * Verifica si el monto de la venta supera el crédito mínimo requerido
     * @param creditoId ID del crédito del cliente
     * @param montoVenta Monto total de la venta
     * @return true si el monto supera el mínimo requerido, false en caso contrario
     */
    public boolean superaCreditoMinimo(Long creditoId, float montoVenta) {
        Credito credito = creditoRepository.findById(creditoId)
                .orElseThrow(() -> new RuntimeException("Crédito no encontrado. ID: " + creditoId));
        
        return montoVenta >= credito.getMinimo();
    }

    /**
     * Valida si un cliente puede realizar una compra fiada (supera mínimo y no excede máximo)
     * @param creditoId ID del crédito del cliente
     * @param montoVenta Monto total de la venta
     * @return true si puede realizar la compra fiada, false en caso contrario
     */
    public boolean puedeComprarConCredito(Long creditoId, float montoVenta) {
        return superaCreditoMinimo(creditoId, montoVenta) && puedeRealizarCompra(creditoId, montoVenta);
    }

}
