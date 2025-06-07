package ti.proyectojava.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ti.proyectojava.api.responses.ResponseListadoCombos;
import ti.proyectojava.api.responses.ResponseListadoDescuentos;
import ti.proyectojava.api.responses.ResponseListadoPromociones;
import ti.proyectojava.business.entities.*;
import ti.proyectojava.business.repositories.*;
import ti.proyectojava.dtos.*;

import java.util.List;
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

    /// COMBOS ///////////////

    public String crearCombo(ComboDto comboDto) {
        // Si el ID es null, es un nuevo combo
        if(comboDto.getId() == null || comboRepository.findById(comboDto.getId()).isEmpty()){
            return "Combo creado. ID:" + comboRepository.save(mapsDtosEntityService.mapToEntityCombo(comboDto)).getId();
        }
        return null;
    }

    public String editarCombo(ComboDto comboDto) {
        Optional<Combo> optionalCombo = comboRepository.findById(comboDto.getId());
        if (optionalCombo.isPresent()) {
            Combo combo = optionalCombo.get();
            combo.setDescripcion(comboDto.getDescripcion());
            combo.setDescuento(comboDto.getDescuento());
            combo.setActivo(comboDto.getActivo());
            combo.setInicio(comboDto.getInicio());
            combo.setFin(comboDto.getFin());
            // Mapear productos del DTO
            combo.setProductos(comboDto.getProductos().stream()
                .map(mapsDtosEntityService::mapToEntityProducto)
                .collect(Collectors.toList()));
            comboRepository.save(combo);
            return "Combo actualizado. ID:" + combo.getId();
        } else {
            return "Combo no encontrado. ID:" + comboDto.getId();
        }
    }

    public ResponseListadoCombos listadoCombo() {
        ResponseListadoCombos response = new ResponseListadoCombos();

        List<ComboDto> combosActivos = comboRepository.findByActivoTrue()
                .stream()
                .map(mapsDtosEntityService::mapToDtoComboSimple)
                .toList();

        response.setCombos(combosActivos);

        return response;
    }

    public ResponseListadoCombos getCombosByProducto(Long productoId) {
        ResponseListadoCombos response = new ResponseListadoCombos();

        List<ComboDto> combos = comboRepository.findByProductos_Id(productoId)
                .stream()
                .map(mapsDtosEntityService::mapToDtoComboSimple)
                .collect(Collectors.toList());

        response.setCombos(combos);
        return response;
    }


    //////////////////////////////////DESCUENTO///////////////////////////////////

    public String crearDescuento(DescuentoDto descuentoDto) {
        return "Descuento creado. ID:" + descuentoRepository.save(mapsDtosEntityService.mapToEntityDescuento(descuentoDto)).getId();
    }

    public String editarDescuento(DescuentoDto descuentoDto) {
        Optional<Descuento> optionalDescuento = descuentoRepository.findById(descuentoDto.getId());
        if (optionalDescuento.isPresent()) {
            Descuento descuento = optionalDescuento.get();
            descuento.setDescripcion(descuentoDto.getDescripcion());
            descuento.setDescuento(descuentoDto.getDescuento());
            descuento.setProducto(mapsDtosEntityService.mapToEntityProducto(descuentoDto.getProducto()));
            descuento.setActivo(descuentoDto.getActivo());
            descuentoRepository.save(descuento);
            return "Descuento actualizado. ID:" + descuento.getId();
        } else {
            return "Descuento no encontrado. ID:" + descuentoDto.getId();
        }
    }

    public ResponseListadoDescuentos listadoDescuentos() {
        ResponseListadoDescuentos response = new ResponseListadoDescuentos();

        List<DescuentoDto> descuentosActivos = descuentoRepository.findByActivoTrue()
                .stream()
                .map(mapsDtosEntityService::mapToDtoDescuentoSimple)
                .toList();

        response.setDescuentos(descuentosActivos);

        return response;
    }

    public ResponseListadoDescuentos getDescuentosByProducto(Long productoId) {
        ResponseListadoDescuentos response = new ResponseListadoDescuentos();

        List<DescuentoDto> descuentos = descuentoRepository.findByProducto_Id(productoId)
                .stream()
                .map(mapsDtosEntityService::mapToDtoDescuentoSimple)
                .collect(Collectors.toList());

        response.setDescuentos(descuentos);
        return response;
    }


//////////////////////////////////PROMOCIONES///////////////////////////////////

    public String crearPromocion(PromocionDto promocionDto) {
        System.out.println("Creando promoción: " + promocionDto.getDescripcion());
        return "Promoción creada. ID:" + promocionRepository.save(mapsDtosEntityService.mapToEntityPromocion(promocionDto)).getId();
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

    public ResponseListadoPromociones listadoPromociones() {
        ResponseListadoPromociones response = new ResponseListadoPromociones();

        List<PromocionDto> promocionesActivos = promocionRepository.findByActivoTrue()
                .stream()
                .map(mapsDtosEntityService::mapToDtoPromocionSimple)
                .toList();

        response.setPromociones(promocionesActivos);

        return response;
    }

    public ResponseListadoPromociones getPromocionesByProducto(Long productoId) {
        ResponseListadoPromociones response = new ResponseListadoPromociones();

        List<PromocionDto> promociones = promocionRepository.findByProducto_Id(productoId)
                .stream()
                .map(mapsDtosEntityService::mapToDtoPromocionSimple)
                .collect(Collectors.toList());

        response.setPromociones(promociones);
        return response;
    }

}

