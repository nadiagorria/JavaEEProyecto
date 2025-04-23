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

    public LoteService(LoteRepository loteRepository) {
        this.loteRepository = loteRepository;
    }

    public ResponseListadoLotes listadoLotes() {
        ResponseListadoLotes response = new ResponseListadoLotes();

        List<LoteDto> lotesActivos = loteRepository.findByActivoTrue()
                .stream()
                .map(this::mapToDtoLote)
                .toList();

        response.setLotes(lotesActivos);

        return response;
    }

    public String crearLote(LoteDto loteDto) {
        if(loteRepository.findById(loteDto.getId()).isEmpty()){
            return "Lote creada nro: " + loteRepository.save(mapToEntityLote(loteDto)).getId();
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
            response = "Lote eliminado exitosamente.";
        }
        return response;
    }

    public LoteDto mapToDtoLote(Lote lote) {
        LoteDto dto = new LoteDto();
        dto.setId(lote.getId());
        dto.setNumeLote(lote.getNumero());
        dto.setCantidad(lote.getCantidad());
        dto.setFechaVencimiento(lote.getFechaVencimiento());
        dto.setPrecioCompra(lote.getPrecioCompra());
        dto.setActivo(lote.getActivo());
        return dto;
    }

    public Lote mapToEntityLote(LoteDto dto) {
        Lote lote = new Lote();
        lote.setId(dto.getId());
        lote.setNumero(dto.getNumeLote());
        lote.setCantidad(dto.getCantidad());
        lote.setFechaVencimiento(dto.getFechaVencimiento());
        lote.setPrecioCompra(dto.getPrecioCompra());
        lote.setActivo(dto.getActivo());
        return lote;
    }



}
