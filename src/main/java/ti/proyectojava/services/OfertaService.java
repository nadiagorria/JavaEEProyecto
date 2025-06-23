package ti.proyectojava.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ti.proyectojava.api.responses.ResponseListadoCombos;
import ti.proyectojava.api.responses.ResponseListadoDescuentos;
import ti.proyectojava.api.responses.ResponseListadoPromociones;
import ti.proyectojava.business.entities.*;
import ti.proyectojava.business.repositories.*;
import ti.proyectojava.dtos.*;

import java.time.LocalDateTime;
import java.util.List;
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
    private final ValidacionOfertasService validacionOfertasService;

    private OfertaService(OfertaRepository ofertaRepository, ComboRepository comboRepository, DescuentoRepository descuentoRepository, PromocionRepository promocionRepository, MapsDtosEntityService mapsDtosEntityService, ValidacionOfertasService validacionOfertasService) {
        this.ofertaRepository = ofertaRepository;
        this.comboRepository = comboRepository;
        this.descuentoRepository = descuentoRepository;
        this.promocionRepository = promocionRepository;
        this.mapsDtosEntityService = mapsDtosEntityService;
        this.validacionOfertasService = validacionOfertasService;
    }


    public String eliminarOferta(Long id) {

        Optional<Oferta> ofertaAct = ofertaRepository.findById(id);
        String response = null;

        if (ofertaAct.isPresent()) {
            Oferta oferta = ofertaAct.get();
            oferta.setActivo(false);
            oferta.setFechaEliminado(LocalDateTime.now());
            ofertaRepository.save(oferta);
            response = "Oferta eliminado correctamente. ID:" + oferta.getId();
        }
        return response;
    }

//  COMBO

    public String crearCombo(ComboDto comboDto) {
        validacionOfertasService.validarConflictosCombo(comboDto);

        if (comboDto.getId() == null || comboRepository.findById(comboDto.getId()).isEmpty()) {
            return "Combo creado. ID:" + comboRepository.save(mapsDtosEntityService.mapToEntityCombo(comboDto)).getId();
        }
        return null;
    }

    public ResponseListadoCombos listadoCombo() {
        ResponseListadoCombos response = new ResponseListadoCombos();

        List<ComboDto> combosActivos = comboRepository.findByActivoTrue().stream().map(mapsDtosEntityService::mapToDtoComboSimple).toList();

        response.setCombos(combosActivos);

        return response;
    }

    public ResponseListadoCombos getCombosByProducto(Long productoId) {
        ResponseListadoCombos response = new ResponseListadoCombos();

        List<ComboDto> combos = comboRepository.findByProductos_Id(productoId).stream().map(mapsDtosEntityService::mapToDtoComboSimple).collect(Collectors.toList());

        response.setCombos(combos);
        return response;
    }


//  DESCUENTO

    public String crearDescuento(DescuentoDto descuentoDto) {
        validacionOfertasService.validarConflictosDescuento(descuentoDto);

        return "Descuento creado. ID:" + descuentoRepository.save(mapsDtosEntityService.mapToEntityDescuento(descuentoDto)).getId();
    }

    public ResponseListadoDescuentos listadoDescuentos() {
        ResponseListadoDescuentos response = new ResponseListadoDescuentos();

        List<DescuentoDto> descuentosActivos = descuentoRepository.findByActivoTrue().stream().map(mapsDtosEntityService::mapToDtoDescuentoSimple).toList();

        response.setDescuentos(descuentosActivos);

        return response;
    }


//  PROMOCION

    public String crearPromocion(PromocionDto promocionDto) {
        validacionOfertasService.validarConflictosPromocion(promocionDto);

        return "Promoción creada. ID:" + promocionRepository.save(mapsDtosEntityService.mapToEntityPromocion(promocionDto)).getId();
    }


    public ResponseListadoPromociones listadoPromociones() {
        ResponseListadoPromociones response = new ResponseListadoPromociones();

        List<PromocionDto> promocionesActivos = promocionRepository.findByActivoTrue().stream().map(mapsDtosEntityService::mapToDtoPromocionSimple).toList();

        response.setPromociones(promocionesActivos);

        return response;
    }

}

