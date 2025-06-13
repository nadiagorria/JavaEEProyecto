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
    
    public ValidacionOfertasService(PromocionRepository promocionRepository,
                                DescuentoRepository descuentoRepository,
                                ComboRepository comboRepository) {
        this.promocionRepository = promocionRepository;
        this.descuentoRepository = descuentoRepository;
        this.comboRepository = comboRepository;
    }
    
    /**
     * Valida que una promoción no tenga conflictos con otras ofertas activas
     */
    public void validarConflictosPromocion(PromocionDto promocionDto) {
        if (promocionDto.getProducto() == null || promocionDto.getProducto().getId() == null) {
            return;
        }
        
        Long productoId = promocionDto.getProducto().getId();
        Long promocionId = promocionDto.getId() != null ? promocionDto.getId() : -1L;
        LocalDate fechaInicio = promocionDto.getInicio();
        LocalDate fechaFin = promocionDto.getFin();
        
        // Solo validar si la promoción está activa
        if (!promocionDto.getActivo()) {
            return;
        }
        
        StringBuilder conflictos = new StringBuilder();        // Verificar conflictos con otras promociones
        List<Promocion> promocionesConflicto = promocionRepository.buscarPromocionesActivasSolapadas(
            productoId, promocionId, fechaInicio, fechaFin);
        
        if (!promocionesConflicto.isEmpty()) {
            conflictos.append("Promociones en conflicto: ");
            conflictos.append(promocionesConflicto.stream()
                .map(p -> p.getDescripcion() + " (" + p.getInicio() + " - " + p.getFin() + ")")
                .collect(Collectors.joining(", ")));
            conflictos.append("; ");
        }
        
        // Verificar conflictos con descuentos
        List<Descuento> descuentosConflicto = descuentoRepository.buscarDescuentosActivosSolapados(
            productoId, -1L, fechaInicio, fechaFin);
        
        if (!descuentosConflicto.isEmpty()) {
            conflictos.append("Descuentos en conflicto: ");
            conflictos.append(descuentosConflicto.stream()
                .map(d -> d.getDescripcion() + " (" + d.getInicio() + " - " + d.getFin() + ")")
                .collect(Collectors.joining(", ")));
            conflictos.append("; ");
        }
        
        // Verificar conflictos con combos
        List<Combo> combosConflicto = comboRepository.buscarCombosActivosSolapados(
            List.of(productoId), -1L, fechaInicio, fechaFin);
        
        if (!combosConflicto.isEmpty()) {
            conflictos.append("Combos en conflicto: ");
            conflictos.append(combosConflicto.stream()
                .map(c -> c.getDescripcion() + " (" + c.getInicio() + " - " + c.getFin() + ")")
                .collect(Collectors.joining(", ")));
        }
        
        if (conflictos.length() > 0) {
            throw new RuntimeException("El producto ya tiene ofertas activas en el mismo período. " + conflictos.toString());
        }
    }
      /**
     * Valida que un descuento no tenga conflictos con otras ofertas activas
     */
    public void validarConflictosDescuento(DescuentoDto descuentoDto) {
        if (descuentoDto.getProducto() == null || descuentoDto.getProducto().getId() == null) {
            return;
        }
        
        Long productoId = descuentoDto.getProducto().getId();
        Long descuentoId = descuentoDto.getId() != null ? descuentoDto.getId() : -1L;
        LocalDate fechaInicio = descuentoDto.getInicio();
        LocalDate fechaFin = descuentoDto.getFin();
        
        // Solo validar si el descuento está activo
        if (!descuentoDto.getActivo()) {
            return;
        }
        
        StringBuilder conflictos = new StringBuilder();
          // Verificar conflictos con promociones
        List<Promocion> promocionesConflicto = promocionRepository.buscarPromocionesActivasSolapadas(
            productoId, -1L, fechaInicio, fechaFin);
        
        if (!promocionesConflicto.isEmpty()) {
            conflictos.append("Promociones en conflicto: ");
            conflictos.append(promocionesConflicto.stream()
                .map(p -> p.getDescripcion() + " (" + p.getInicio() + " - " + p.getFin() + ")")
                .collect(Collectors.joining(", ")));
            conflictos.append("; ");
        }
        
        // Verificar conflictos con otros descuentos
        List<Descuento> descuentosConflicto = descuentoRepository.buscarDescuentosActivosSolapados(
            productoId, descuentoId, fechaInicio, fechaFin);
        
        if (!descuentosConflicto.isEmpty()) {
            conflictos.append("Descuentos en conflicto: ");
            conflictos.append(descuentosConflicto.stream()
                .map(d -> d.getDescripcion() + " (" + d.getInicio() + " - " + d.getFin() + ")")
                .collect(Collectors.joining(", ")));
            conflictos.append("; ");
        }
        
        // Verificar conflictos con combos
        List<Combo> combosConflicto = comboRepository.buscarCombosActivosSolapados(
            List.of(productoId), -1L, fechaInicio, fechaFin);
        
        if (!combosConflicto.isEmpty()) {
            conflictos.append("Combos en conflicto: ");
            conflictos.append(combosConflicto.stream()
                .map(c -> c.getDescripcion() + " (" + c.getInicio() + " - " + c.getFin() + ")")
                .collect(Collectors.joining(", ")));
        }
          if (conflictos.length() > 0) {
            throw new RuntimeException("El producto ya tiene ofertas activas en el mismo período. " + conflictos.toString());
        }
    }
    
    /**
     * Valida que un combo no tenga conflictos con otras ofertas activas
     */
    public void validarConflictosCombo(ComboDto comboDto) {
        if (comboDto.getProductos() == null || comboDto.getProductos().isEmpty()) {
            return;
        }
        
        List<Long> productosIds = comboDto.getProductos().stream()
            .map(p -> p.getId())
            .filter(id -> id != null)
            .collect(Collectors.toList());
        
        if (productosIds.isEmpty()) {
            return;
        }
        
        Long comboId = comboDto.getId() != null ? comboDto.getId() : -1L;
        LocalDate fechaInicio = comboDto.getInicio();
        LocalDate fechaFin = comboDto.getFin();
        
        // Solo validar si el combo está activo
        if (!comboDto.getActivo()) {
            return;
        }
        
        StringBuilder conflictos = new StringBuilder();
          // Verificar conflictos con promociones para cada producto
        for (Long productoId : productosIds) {
            List<Promocion> promocionesConflicto = promocionRepository.buscarPromocionesActivasSolapadas(
                productoId, -1L, fechaInicio, fechaFin);
            
            if (!promocionesConflicto.isEmpty()) {
                conflictos.append("Producto ID ").append(productoId).append(" tiene promociones en conflicto: ");
                conflictos.append(promocionesConflicto.stream()
                    .map(p -> p.getDescripcion() + " (" + p.getInicio() + " - " + p.getFin() + ")")
                    .collect(Collectors.joining(", ")));
                conflictos.append("; ");
            }
            
            // Verificar conflictos con descuentos
            List<Descuento> descuentosConflicto = descuentoRepository.buscarDescuentosActivosSolapados(
                productoId, -1L, fechaInicio, fechaFin);
            
            if (!descuentosConflicto.isEmpty()) {
                conflictos.append("Producto ID ").append(productoId).append(" tiene descuentos en conflicto: ");
                conflictos.append(descuentosConflicto.stream()
                    .map(d -> d.getDescripcion() + " (" + d.getInicio() + " - " + d.getFin() + ")")
                    .collect(Collectors.joining(", ")));
                conflictos.append("; ");
            }
        }
        
        // Verificar conflictos con otros combos
        List<Combo> combosConflicto = comboRepository.buscarCombosActivosSolapados(
            productosIds, comboId, fechaInicio, fechaFin);
        
        if (!combosConflicto.isEmpty()) {
            conflictos.append("Combos en conflicto: ");
            conflictos.append(combosConflicto.stream()
                .map(c -> c.getDescripcion() + " (" + c.getInicio() + " - " + c.getFin() + ")")
                .collect(Collectors.joining(", ")));
        }
          if (conflictos.length() > 0) {
            throw new RuntimeException("Uno o más productos ya tienen ofertas activas en el mismo período. " + conflictos.toString());
        }
    }
}
