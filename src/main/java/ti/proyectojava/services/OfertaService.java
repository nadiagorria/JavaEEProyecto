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
    private final MapsDtosEntityService mapsDtosEntityService;

    private OfertaService(OfertaRepository ofertaRepository, ComboRepository comboRepository, DescuentoRepository descuentoRepository, PromocionRepository promocionRepository, MapsDtosEntityService mapsDtosEntityService){
        this.ofertaRepository = ofertaRepository;
        this.comboRepository = comboRepository;
        this.descuentoRepository = descuentoRepository;
        this.promocionRepository = promocionRepository;
        this.mapsDtosEntityService = mapsDtosEntityService;
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
            return "Combo creado. ID:" + comboRepository.save(mapsDtosEntityService.mapToEntityCombo(comboDto)).getId();
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



    //////////////////////////////////DESCUENTO///////////////////////////////////

    public String crearDescuento(DescuentoDto descuentoDto) {
        if (descuentoRepository.findById(descuentoDto.getId()).isEmpty()) {
            return "Descuento creado. ID:" + descuentoRepository.save(mapsDtosEntityService.mapToEntityDescuento(descuentoDto)).getId();
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



//////////////////////////////////PROMOCIONES///////////////////////////////////

    public String crearPromocion(PromocionDto promocionDto) {
        if (promocionRepository.findById(promocionDto.getId()).isEmpty()) {
            return "Promoción creada. ID:" + promocionRepository.save(mapsDtosEntityService.mapToEntityPromocion(promocionDto)).getId();
        }
        return null;
    }

    public String editarPromocion(PromocionDto promocionDto) {
        Optional<Promocion> optionalPromocion = promocionRepository.findById(promocionDto.getId());
        if (optionalPromocion.isPresent()) {
            Promocion promocion = optionalPromocion.get();
            promocion.setDescripcion(promocionDto.getDescripcion());
            promocion.setDescuento(promocionDto.getDescuento());
            promocion.setProducto(mapsDtosEntityService.mapToEntityProducto(promocionDto.getProducto()));
            promocion.setActivo(promocionDto.getActivo());
            promocionRepository.save(promocion);
            return "Promoción actualizada. ID:" + promocion.getId();
        } else {
            return "Promoción no encontrada. ID:" + promocionDto.getId();
        }
    }


}
