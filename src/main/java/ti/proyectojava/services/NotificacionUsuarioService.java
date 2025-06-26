package ti.proyectojava.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import ti.proyectojava.api.responses.ResponseListadoNotificacionUsuario;
import ti.proyectojava.business.entities.*;
import ti.proyectojava.business.repositories.*;
import ti.proyectojava.dtos.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NotificacionUsuarioService {

    @Autowired
    private NotificacionUsuarioRepository notificacionUsuarioRepository;

    @Autowired
    private NotificacionRepository notificacionRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private MapsDtosEntityService mapsDtosEntityService;

    public String borrarNotificacionUsuario(Long id) {
        String response = "";
        NotificacionUsuario notificacionUsuario = notificacionUsuarioRepository.findById(id).orElse(null);
        if (notificacionUsuario != null) {
            notificacionUsuario.setActivo(false);
            notificacionUsuarioRepository.save(notificacionUsuario);
            response = "NotificacionUsuario eliminado correctamente. ID:" + notificacionUsuario.getId();
        } else {
            response = "No se encontró NotificacionUsuario con ID " + id;
        }
        return response;
    }

    @Scheduled(cron = "0 30 9 * * ?", zone = "America/Montevideo")
    public void chequearNotificaciones() {
        try {
            List<Producto> productos = productoRepository.findByActivoTrue();
            for (Producto producto : productos) {
                verificarLotesVencenEn21Dias(producto);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void verificarStockMinimoPostVenta(Producto producto) {
        verificarStockMinimo(producto);
    }

    private void verificarStockMinimo(Producto producto) {
        try {
            if (producto.getStockTotal() <= producto.getStockMin() && producto.getStockMin() > 0) {

                LocalDateTime hace24Horas = LocalDateTime.now().minusHours(24);
                boolean yaExisteNotificacion = notificacionUsuarioRepository
                        .findByActivoTrueAndNotificaciones_FechaHoraAfter(hace24Horas)
                        .stream()
                        .anyMatch(nu -> nu.getNotificaciones().stream()
                                .anyMatch(n -> n.getMensaje() != null &&
                                        n.getMensaje().contains("Stock mínimo") &&
                                        n.getMensaje().contains(producto.getNombre())));

                if (!yaExisteNotificacion) {
                    String titulo = "Alerta: Stock Mínimo";
                    String mensaje = String.format("El producto '%s' tiene stock mínimo. Quedan %d unidades en total (mínimo requerido: %d)",
                            producto.getNombre(), producto.getStockTotal(), producto.getStockMin());

                    crearYEnviarNotificacion(titulo, mensaje);
                }
            }
        } catch (Exception e) {
        }
    }

    private void verificarLotesVencenEn21Dias(Producto producto) {
        try {
            for (Lote lote : producto.getLotes()) {
                if (lote.getActivo() != null && lote.getActivo() &&
                        lote.getFechaVencimiento() != null &&
                        lote.getStock() != null && lote.getStock() > 0) {

                    LocalDate fechaVencimiento = lote.getFechaVencimiento();

                    long diasFaltantes = ChronoUnit.DAYS.between(LocalDate.now(), fechaVencimiento);

                    boolean esPrimeraAlerta = diasFaltantes >= 19 && diasFaltantes <= 21;
                    boolean esSegundaAlerta = diasFaltantes >= 13 && diasFaltantes <= 15;

                    if (esPrimeraAlerta || esSegundaAlerta) {
                        LocalDateTime hace72Horas = LocalDateTime.now().minusHours(72);
                        boolean yaExisteNotificacion = notificacionUsuarioRepository
                                .findByActivoTrueAndNotificaciones_FechaHoraAfter(hace72Horas)
                                .stream()
                                .anyMatch(nu -> nu.getNotificaciones().stream()
                                        .anyMatch(n -> n.getMensaje() != null &&
                                                n.getMensaje().contains(lote.getNumero()) &&
                                                ((esPrimeraAlerta && (n.getMensaje().contains("21 días") ||
                                                        n.getMensaje().contains("20 días") ||
                                                        n.getMensaje().contains("19 días"))) ||
                                                        (esSegundaAlerta && (n.getMensaje().contains("15 días") ||
                                                                n.getMensaje().contains("14 días") ||
                                                                n.getMensaje().contains("13 días"))))));

                        if (!yaExisteNotificacion) {
                            String titulo = esPrimeraAlerta ? "⚠️ Alerta: Producto Próximo a Vencer" : "🚨 Alerta Urgente: Producto Próximo a Vencer";
                            String prioridad = esPrimeraAlerta ? "Primera alerta" : "Segunda alerta";
                            String mensaje = String.format("%s - El lote %s del producto '%s' vence en %d días (%d unidades disponibles).",
                                    prioridad, lote.getNumero(), producto.getNombre(), diasFaltantes, lote.getStock());

                            crearYEnviarNotificacion(titulo, mensaje);
                        }
                    }
                }
            }
        } catch (Exception e) {
        }
    }

    private void crearYEnviarNotificacion(String titulo, String mensaje) {
        try {
            Notificacion notificacion = new Notificacion();
            notificacion.setTitulo(titulo);
            notificacion.setMensaje(mensaje);
            notificacion.setFechaHora(LocalDateTime.now());

            notificacion = notificacionRepository.save(notificacion);

            List<Usuario> usuarios = usuarioRepository.findByActivoTrue();

            if (usuarios.isEmpty()) {
                return;
            }

            int notificacionesCreadas = 0;
            for (Usuario usuario : usuarios) {
                try {

                    NotificacionUsuario notificacionUsuario = new NotificacionUsuario();
                    notificacionUsuario.setActivo(true);
                    notificacionUsuario.setLeido(false);


                    if (notificacion.getNotificacionUsuarios() == null) {
                        notificacion.setNotificacionUsuarios(new java.util.ArrayList<>());
                    }
                    notificacion.getNotificacionUsuarios().add(notificacionUsuario);

                    if (notificacionUsuario.getNotificaciones() == null) {
                        notificacionUsuario.setNotificaciones(new java.util.ArrayList<>());
                    }
                    notificacionUsuario.getNotificaciones().add(notificacion);

                    if (usuario.getNotificaciones() == null) {
                        usuario.setNotificaciones(new java.util.ArrayList<>());
                    }
                    usuario.getNotificaciones().add(notificacionUsuario);

                    if (notificacionUsuario.getUsuarios() == null) {
                        notificacionUsuario.setUsuarios(new java.util.ArrayList<>());
                    }
                    notificacionUsuario.getUsuarios().add(usuario);
                    NotificacionUsuario guardada = notificacionUsuarioRepository.save(notificacionUsuario);

                    usuarioRepository.save(usuario);

                    notificacionesCreadas++;


                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public ResponseListadoNotificacionUsuario obtenerNotificacionesPorUsuario(String userName) {
        try {
            ResponseListadoNotificacionUsuario response = new ResponseListadoNotificacionUsuario();

            List<NotificacionUsuarioDto> notificacionesUsuario = notificacionUsuarioRepository
                    .findByActivoTrueAndUsuarios_Nombre(userName)
                    .stream()
                    .map(mapsDtosEntityService::mapToDtoNotificacionUsuario)
                    .sorted((a, b) -> {
                        if (a.getNotificaciones() != null && !a.getNotificaciones().isEmpty() &&
                                b.getNotificaciones() != null && !b.getNotificaciones().isEmpty()) {
                            return b.getNotificaciones().get(0).getFechaHora()
                                    .compareTo(a.getNotificaciones().get(0).getFechaHora());
                        }
                        return 0;
                    })
                    .collect(Collectors.toList());

            response.setNotificacionUsuarios(notificacionesUsuario);
            return response;

        } catch (Exception e) {
            return new ResponseListadoNotificacionUsuario();
        }
    }

    public String marcarComoLeida(Long notificacionUsuarioId, String userName) {
        try {
            Optional<NotificacionUsuario> notificacionOpt = notificacionUsuarioRepository.findById(notificacionUsuarioId);

            if (notificacionOpt.isPresent()) {
                NotificacionUsuario notificacion = notificacionOpt.get();

                boolean perteneceAlUsuario = notificacion.getUsuarios().stream()
                        .anyMatch(u -> u.getNombre().equals(userName));

                if (perteneceAlUsuario) {
                    notificacion.setLeido(true);
                    notificacionUsuarioRepository.save(notificacion);
                    return "Notificación marcada como leída exitosamente";
                } else {
                    return "No se encontró la notificación para este usuario";
                }
            } else {
                return "No se encontró la notificación con ID: " + notificacionUsuarioId;
            }

        } catch (Exception e) {
            return "Error al marcar la notificación como leída";
        }
    }

    public int contarNotificacionesNoLeidas(String userName) {
        try {
            return notificacionUsuarioRepository
                    .findByActivoTrueAndLeidoFalseAndUsuarios_Nombre(userName)
                    .size();
        } catch (Exception e) {
            return 0;
        }
    }

    public String marcarTodasComoLeidas(String userName) {
        try {
            List<NotificacionUsuario> notificacionesNoLeidas = notificacionUsuarioRepository
                    .findByActivoTrueAndLeidoFalseAndUsuarios_Nombre(userName);

            for (NotificacionUsuario notificacion : notificacionesNoLeidas) {
                notificacion.setLeido(true);
                notificacionUsuarioRepository.save(notificacion);
            }

            return String.format("Se marcaron %d notificaciones como leídas", notificacionesNoLeidas.size());

        } catch (Exception e) {
            return "Error al marcar las notificaciones como leídas";
        }
    }

}