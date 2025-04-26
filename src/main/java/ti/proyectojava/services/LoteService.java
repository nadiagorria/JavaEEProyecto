package ti.proyectojava.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ti.proyectojava.api.responses.ResponseListadoLotes;
import ti.proyectojava.business.entities.Lote;
import ti.proyectojava.business.repositories.LoteRepository;
import ti.proyectojava.dtos.LoteDto;

import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class LoteService {

    private final LoteRepository loteRepository;
    private  final MapsDtosEntityService mapsDtosEntityService;

    public LoteService(LoteRepository loteRepository, MapsDtosEntityService mapsDtosEntityService) {
        this.loteRepository = loteRepository;
        this.mapsDtosEntityService = mapsDtosEntityService;
    }

    public ResponseListadoLotes listadoLotes() {
        ResponseListadoLotes response = new ResponseListadoLotes();

        List<LoteDto> lotesActivos = loteRepository.findByActivoTrue()
                .stream()
                .map(mapsDtosEntityService::mapToDtoLote)
                .toList();

        response.setLotes(lotesActivos);

        return response;
    }

    public String crearLote(LoteDto loteDto) {
        if(loteRepository.findById(loteDto.getId()).isEmpty()){
            return "Lote creado. ID: " + loteRepository.save(mapsDtosEntityService.mapToEntityLote(loteDto)).getId();
        }

        return null;
    }

    public String borrarLote(Long id) {
        String response = null;
        Optional<Lote> aux = loteRepository.findById(id);
        if(aux.isPresent()){
            Lote lote = aux.get();
            lote.setActivo(false);
            loteRepository.save(lote);
            response = "Lote eliminado exitosamente. ID:" + lote.getId();
        }
        return response;
    }





}
