package ti.proyectojava.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ti.proyectojava.business.entities.Combo;
import ti.proyectojava.business.entities.Descuento;
import ti.proyectojava.business.entities.Promocion;
import ti.proyectojava.business.repositories.ComboRepository;
import ti.proyectojava.business.repositories.DescuentoRepository;
import ti.proyectojava.business.repositories.PromocionRepository;
import ti.proyectojava.dtos.ComboDto;
import ti.proyectojava.dtos.DescuentoDto;
import ti.proyectojava.dtos.PromocionDto;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ValidacionOfertasService {

    private final PromocionRepository promocionRepository;
    private final DescuentoRepository descuentoRepository;
    private final ComboRepository comboRepository;

    public ValidacionOfertasService(PromocionRepository promocionRepository, DescuentoRepository descuentoRepository, ComboRepository comboRepository) {
        this.promocionRepository = promocionRepository;
        this.descuentoRepository = descuentoRepository;
        this.comboRepository = comboRepository;
    }


    public void validarConflictosPromocion(PromocionDto promocionDto) {
        if (promocionDto.getProducto() == null || promocionDto.getProducto().getId() == null) {
            return;
        }

        if (promocionDto.getDescuento() < 2) {
            throw new RuntimeException("No se puede crear la promoción: la cantidad mínima de unidades debe ser 2 (para promociones tipo 2x1, 3x2, etc.). Valor recibido: " + promocionDto.getDescuento());
        }

        Long productoId = promocionDto.getProducto().getId();
        Long promocionId = promocionDto.getId() != null ? promocionDto.getId() : -1L;
        LocalDate fechaInicio = promocionDto.getInicio();
        LocalDate fechaFin = promocionDto.getFin();

        if (!promocionDto.getActivo()) {
            return;
        }

        StringBuilder conflictos = new StringBuilder();
        List<Promocion> promocionesConflicto = promocionRepository.buscarPromocionesActivasSolapadas(productoId, promocionId, fechaInicio, fechaFin);

        if (!promocionesConflicto.isEmpty()) {
            conflictos.append("Promociones en conflicto: ");
            conflictos.append(promocionesConflicto.stream().map(p -> p.getDescripcion() + " (" + p.getInicio() + " - " + p.getFin() + ")").collect(Collectors.joining(", ")));
            conflictos.append("; ");
        }

        List<Descuento> descuentosConflicto = descuentoRepository.buscarDescuentosActivosSolapados(productoId, -1L, fechaInicio, fechaFin);

        if (!descuentosConflicto.isEmpty()) {
            conflictos.append("Descuentos en conflicto: ");
            conflictos.append(descuentosConflicto.stream().map(d -> d.getDescripcion() + " (" + d.getInicio() + " - " + d.getFin() + ")").collect(Collectors.joining(", ")));
            conflictos.append("; ");
        }

        List<Combo> combosConflicto = comboRepository.buscarCombosActivosSolapados(List.of(productoId), -1L, fechaInicio, fechaFin);
        if (!combosConflicto.isEmpty()) {
            conflictos.append("Combos en conflicto: ");
            conflictos.append(combosConflicto.stream().map(c -> c.getDescripcion() + " (" + c.getInicio() + " - " + c.getFin() + ")").collect(Collectors.joining(", ")));
        }

        if (conflictos.length() > 0) {
            throw new RuntimeException("No se puede crear la promoción porque ya existe una oferta activa en el período seleccionado (" + fechaInicio + " - " + fechaFin + ") que contiene este producto. " + conflictos.toString());
        }
    }


    public void validarConflictosDescuento(DescuentoDto descuentoDto) {
        if (descuentoDto.getProducto() == null || descuentoDto.getProducto().getId() == null) {
            return;
        }

        Long productoId = descuentoDto.getProducto().getId();
        Long descuentoId = descuentoDto.getId() != null ? descuentoDto.getId() : -1L;
        LocalDate fechaInicio = descuentoDto.getInicio();
        LocalDate fechaFin = descuentoDto.getFin();

        if (!descuentoDto.getActivo()) {
            return;
        }

        StringBuilder conflictos = new StringBuilder();
        List<Promocion> promocionesConflicto = promocionRepository.buscarPromocionesActivasSolapadas(productoId, -1L, fechaInicio, fechaFin);

        if (!promocionesConflicto.isEmpty()) {
            conflictos.append("Promociones en conflicto: ");
            conflictos.append(promocionesConflicto.stream().map(p -> p.getDescripcion() + " (" + p.getInicio() + " - " + p.getFin() + ")").collect(Collectors.joining(", ")));
            conflictos.append("; ");
        }

        List<Descuento> descuentosConflicto = descuentoRepository.buscarDescuentosActivosSolapados(productoId, descuentoId, fechaInicio, fechaFin);

        if (!descuentosConflicto.isEmpty()) {
            conflictos.append("Descuentos en conflicto: ");
            conflictos.append(descuentosConflicto.stream().map(d -> d.getDescripcion() + " (" + d.getInicio() + " - " + d.getFin() + ")").collect(Collectors.joining(", ")));
            conflictos.append("; ");
        }

        List<Combo> combosConflicto = comboRepository.buscarCombosActivosSolapados(List.of(productoId), -1L, fechaInicio, fechaFin);

        if (!combosConflicto.isEmpty()) {
            conflictos.append("Combos en conflicto: ");
            conflictos.append(combosConflicto.stream().map(c -> c.getDescripcion() + " (" + c.getInicio() + " - " + c.getFin() + ")").collect(Collectors.joining(", ")));
        }
        if (conflictos.length() > 0) {
            throw new RuntimeException("No se puede crear el descuento porque ya existe una oferta activa en el período seleccionado (" + fechaInicio + " - " + fechaFin + ") que contiene este producto. " + conflictos.toString());
        }
    }


    public void validarConflictosCombo(ComboDto comboDto) {
        if (comboDto.getProductos() == null || comboDto.getProductos().isEmpty()) {
            return;
        }

        List<Long> productosIds = comboDto.getProductos().stream().map(p -> p.getId()).filter(id -> id != null).collect(Collectors.toList());

        if (productosIds.isEmpty()) {
            return;
        }

        Long comboId = comboDto.getId() != null ? comboDto.getId() : -1L;
        LocalDate fechaInicio = comboDto.getInicio();
        LocalDate fechaFin = comboDto.getFin();

        if (!comboDto.getActivo()) {
            return;
        }

        StringBuilder conflictos = new StringBuilder();
        for (Long productoId : productosIds) {
            List<Promocion> promocionesConflicto = promocionRepository.buscarPromocionesActivasSolapadas(productoId, -1L, fechaInicio, fechaFin);

            if (!promocionesConflicto.isEmpty()) {
                conflictos.append("Producto ID ").append(productoId).append(" tiene promociones en conflicto: ");
                conflictos.append(promocionesConflicto.stream().map(p -> p.getDescripcion() + " (" + p.getInicio() + " - " + p.getFin() + ")").collect(Collectors.joining(", ")));
                conflictos.append("; ");
            }

            List<Descuento> descuentosConflicto = descuentoRepository.buscarDescuentosActivosSolapados(productoId, -1L, fechaInicio, fechaFin);

            if (!descuentosConflicto.isEmpty()) {
                conflictos.append("Producto ID ").append(productoId).append(" tiene descuentos en conflicto: ");
                conflictos.append(descuentosConflicto.stream().map(d -> d.getDescripcion() + " (" + d.getInicio() + " - " + d.getFin() + ")").collect(Collectors.joining(", ")));
                conflictos.append("; ");
            }
        }

        List<Combo> combosConflicto = comboRepository.buscarCombosActivosSolapados(productosIds, comboId, fechaInicio, fechaFin);

        if (!combosConflicto.isEmpty()) {
            conflictos.append("Combos en conflicto: ");
            conflictos.append(combosConflicto.stream().map(c -> c.getDescripcion() + " (" + c.getInicio() + " - " + c.getFin() + ")").collect(Collectors.joining(", ")));
        }
        if (conflictos.length() > 0) {
            throw new RuntimeException("No se puede crear el combo porque ya existe una oferta activa en el período seleccionado (" + fechaInicio + " - " + fechaFin + ") que contiene uno o varios de los productos seleccionados. " + conflictos.toString());
        }
    }
}
