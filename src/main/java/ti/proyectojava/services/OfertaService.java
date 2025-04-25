package ti.proyectojava.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ti.proyectojava.business.entities.*;
import ti.proyectojava.business.repositories.*;
import ti.proyectojava.dtos.*;

import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class OfertaService {

    private final OfertaRepository ofertaRepository;
    private final ComboRepository comboRepository;
    private final DescuentoRepository descuentoRepository;
    private final PromocionRepository promocionRepository;
    private final ProductoService productoService;

    private OfertaService(OfertaRepository ofertaRepository, ComboRepository comboRepository, DescuentoRepository descuentoRepository, PromocionRepository promocionRepository, ProductoService productoService){
        this.ofertaRepository = ofertaRepository;
        this.comboRepository= comboRepository;
        this.descuentoRepository=descuentoRepository;
        this.promocionRepository=promocionRepository;
        this.productoService=productoService;
    }


    public String eliminarOferta(Long id) {

        Optional<Oferta> ofertaAct = ofertaRepository.findById(id);
        String response = null;

        if (ofertaAct.isPresent()) {
            Oferta oferta = ofertaAct.get();
            oferta.setActivo(false);
            ofertaRepository.save(oferta);
            response = "Oferta eliminado correctamente. ID:" +  oferta.getId();
        }
        return response;
    }

    /// //////////////////////////COMBO////////////////////////////////////

    public String crearCombo(ComboDto comboDto) {
        if(comboRepository.findById(comboDto.getId()).isEmpty()){
            return "Combo creado. ID:" + comboRepository.save(mapToEntityCombo(comboDto)).getId();
        }
        return null;
    }

    public String editarCombo(ComboDto comboDto) {
        Optional<Combo> optionalCombo = comboRepository.findById(comboDto.getId());
        if (optionalCombo.isPresent()) {
            Combo combo = optionalCombo.get();
            combo.setDescripcion(combo.getDescripcion());
            combo.setDescuento(combo.getDescuento());
            combo.setDescuento(combo.getDescuento());
            combo.setProductos(combo.getProductos());
            // No actualizamos ID ni relaciones por simplicidad
            comboRepository.save(combo);
            return "Combo actualizado. ID:" + combo.getId();
        } else {
            return "Combo no encontrado. ID:" + comboDto.getId();
        }
    }




    public ComboDto mapToDtoCombo(Combo combo) {
        ComboDto dto = new ComboDto();
        dto.setId(combo.getId());
        dto.setDescripcion(combo.getDescripcion());
        dto.setDescuento(combo.getDescuento());
        dto.setProductos(combo.getProductos().stream()
                .map(productoService::mapToDtoProducto)
                .collect(Collectors.toList()));
        dto.setActivo(combo.getActivo());
        return dto;
    }


    public Combo mapToEntityCombo(ComboDto comboDto) {
        Combo combo = new Combo();
        combo.setId(comboDto.getId());
        combo.setDescuento(comboDto.getDescuento());
        combo.setActivo(comboDto.getActivo());
        combo.setDescripcion(comboDto.getDescripcion());
        combo.setProductos(comboDto.getProductos().stream()
                .map(productoService::mapToEntityProducto)
                .collect(Collectors.toList()));
        return combo;
    }


    //////////////////////////////////DESCUENTO///////////////////////////////////

    public String crearDescuento(DescuentoDto descuentoDto) {
        if (descuentoRepository.findById(descuentoDto.getId()).isEmpty()) {
            return "Descuento creado. ID:" + descuentoRepository.save(mapToEntityDescuento(descuentoDto)).getId();
        }
        return null;
    }

    public String editarDescuento(DescuentoDto descuentoDto) {
        Optional<Descuento> optionalDescuento = descuentoRepository.findById(descuentoDto.getId());
        if (optionalDescuento.isPresent()) {
            Descuento descuento = optionalDescuento.get();
            descuento.setDescuento(descuento.getDescuento());
            descuento.setProducto(descuento.getProducto());
            // No actualizamos ID ni relaciones por simplicidad
            descuentoRepository.save(descuento);
            return "Descuento actualizado. ID:" + descuento.getId();
        } else {
            return "Descuento no encontrado. ID:" + descuentoDto.getId();
        }
    }

    public DescuentoDto mapToDtoDescuento(Descuento descuento) {
        DescuentoDto dto = new DescuentoDto();
        dto.setId(descuento.getId());
        dto.setDescuento(descuento.getDescuento());
        dto.setProducto(productoService.mapToDtoProducto(descuento.getProducto()));
        dto.setActivo(descuento.getActivo());
        return dto;
    }

    public Descuento mapToEntityDescuento(DescuentoDto descuentoDto) {
        Descuento descuento = new Descuento();
        descuento.setId(descuentoDto.getId());
        descuento.setDescuento(descuentoDto.getDescuento());
        descuento.setActivo(descuentoDto.getActivo());
        descuento.setProducto(productoService.mapToEntityProducto(descuentoDto.getProducto()));
        return descuento;
    }

//////////////////////////////////PROMOCIONES///////////////////////////////////

    public String crearPromocion(PromocionDto promocionDto) {
        if (promocionRepository.findById(promocionDto.getId()).isEmpty()) {
            return "Promoción creada. ID:" + promocionRepository.save(mapToEntityPromocion(promocionDto)).getId();
        }
        return null;
    }

    public String editarPromocion(PromocionDto promocionDto) {
        Optional<Promocion> optionalPromocion = promocionRepository.findById(promocionDto.getId());
        if (optionalPromocion.isPresent()) {
            Promocion promocion = optionalPromocion.get();
            promocion.setDescripcion(promocionDto.getDescripcion());
            promocion.setDescuento(promocionDto.getDescuento());
            promocion.setProducto(productoService.mapToEntityProducto(promocionDto.getProducto()));
            promocion.setActivo(promocionDto.getActivo());
            promocionRepository.save(promocion);
            return "Promoción actualizada. ID:" + promocion.getId();
        } else {
            return "Promoción no encontrada. ID:" + promocionDto.getId();
        }
    }

    public PromocionDto mapToDtoPromocion(Promocion promocion) {
        PromocionDto dto = new PromocionDto();
        dto.setId(promocion.getId());
        dto.setDescripcion(promocion.getDescripcion());
        dto.setDescuento(promocion.getDescuento());
        dto.setProducto(productoService.mapToDtoProducto(promocion.getProducto()));
        dto.setActivo(promocion.getActivo());
        return dto;
    }

    public Promocion mapToEntityPromocion(PromocionDto promocionDto) {
        Promocion promocion = new Promocion();
        promocion.setId(promocionDto.getId());
        promocion.setDescuento(promocionDto.getDescuento());
        promocion.setActivo(promocionDto.getActivo());
        promocion.setDescripcion(promocionDto.getDescripcion());
        promocion.setProducto(productoService.mapToEntityProducto(promocionDto.getProducto()));
        return promocion;
    }
}
