package ti.proyectojava.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import ti.proyectojava.api.responses.ResponseListadoNotificacionUsuario;
import ti.proyectojava.api.responses.ResponseListadoUsuarios;
import ti.proyectojava.business.entities.*;
import ti.proyectojava.business.repositories.NotificacionRepository;
import ti.proyectojava.business.repositories.NotificacionUsuarioRepository;
import ti.proyectojava.business.repositories.ProductoRepository;
import ti.proyectojava.business.repositories.UsuarioRepository;
import ti.proyectojava.dtos.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.Temporal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class NotificacionUsuarioService {

    private final NotificacionUsuarioRepository notificacionUsuarioRepository;
    private final ProductoRepository productoRepository;
    private final MapsDtosEntityService mapsDtosEntityService;
    private final UsuarioRepository usuarioRepository;
    private final NotificacionRepository notificacionRepository;

    public NotificacionUsuarioService(NotificacionUsuarioRepository notificacionUsuarioRepository, ProductoRepository productoRepository, MapsDtosEntityService mapsDtosEntityService, UsuarioRepository usuarioRepository, NotificacionRepository notificacionRepository) {
        this.notificacionUsuarioRepository = notificacionUsuarioRepository;
        this.productoRepository = productoRepository;
        this.mapsDtosEntityService = mapsDtosEntityService;
        this.usuarioRepository = usuarioRepository;
        this.notificacionRepository = notificacionRepository;
    }

    public ResponseListadoNotificacionUsuario listadoNotificacionUsuario(){
        ResponseListadoNotificacionUsuario responseListadoNotificacionUsuario = new ResponseListadoNotificacionUsuario();

        List<NotificacionUsuarioDto> notificacionUsuarioActivos = notificacionUsuarioRepository.findByActivoTrue()
                .stream()
                .map(mapsDtosEntityService::mapToDtoNotificacionUsuario)
                .toList();

        responseListadoNotificacionUsuario.setNotificacionUsuarios(notificacionUsuarioActivos);

        return responseListadoNotificacionUsuario;
    }

    public String crearNotificacionUsuario(NotificacionUsuarioDto notificacionUsuarioDto){
        return "Producto creado. ID: " + notificacionUsuarioRepository.save(mapsDtosEntityService.mapToEntityNotificacionUsuario(notificacionUsuarioDto)).getId();
    }

    public String borrarNotificacionUsuario(Long id){
        Optional<NotificacionUsuario> notificacionUsuarioAct = notificacionUsuarioRepository.findById(id);
        String response = null;

        if (notificacionUsuarioAct.isPresent()) {
            NotificacionUsuario notificacionUsuario = notificacionUsuarioAct.get();
            notificacionUsuario.setActivo(false);
            notificacionUsuarioRepository.save(notificacionUsuario);
            response = "notificacionUsuario eliminado correctamente. ID:" + notificacionUsuario.getId();
        }

        return response;
    }


    @Async
    @Scheduled(cron = "0 0 3 * * *") // Todos los días a las 3:00 AM
    public void chequearNotificaciones() {
        List<Producto> productos = productoRepository.findAll();

        for (Producto producto : productos) {
            int stockTotal = producto.getStockTotal();

            if (stockTotal == 0) continue;

            for (Lote lote : producto.getLotes()) {
                if (lote.getStock() == 0) continue;

                long diasFaltantes = ChronoUnit.DAYS.between((Temporal) LocalDate.now(), (Temporal) lote.getFechaVencimiento());

                if (diasFaltantes <= 21) {

                    Notificacion notificacion = new Notificacion();
                    notificacion.setFechaHora(LocalDateTime.now());
                    notificacion.getMensajes().add("El producto " + producto.getNombre() +
                            " del lote " + lote.getId() + " vence en " + diasFaltantes + " días.");

                    notificacionRepository.save(notificacion);

                    // mandarla a todos los usuarios
                    List<Usuario> usuarios = usuarioRepository.findAll();
                    List<NotificacionUsuario> notisUsuario = new ArrayList<>();

                    for (Usuario usuario : usuarios) {
                        NotificacionUsuario nu = new NotificacionUsuario();
                        nu.setLeido(false);
                        nu.getUsuarios().add(usuario);
                        nu.setNotificaciones(List.of(notificacion)); // o solo `setNotificacion(notificacion)` si es ManyToOne
                        notisUsuario.add(nu);
                    }

                    notificacionUsuarioRepository.saveAll(notisUsuario);
                } else {
                    break;
                }
            }
        }
    }
}
