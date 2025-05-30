package ti.proyectojava.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import ti.proyectojava.api.responses.ResponseListadoNotificacionUsuario;
import ti.proyectojava.business.entities.*;
import ti.proyectojava.business.repositories.*;
import ti.proyectojava.dtos.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
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

    public String crearNotificacionUsuario(NotificacionUsuarioDto notificacionUsuarioDto) {
        return "NotificacionUsuario creado. ID: " + notificacionUsuarioRepository.save(mapsDtosEntityService.mapToEntityNotificacionUsuario(notificacionUsuarioDto)).getId();
    }    public ResponseListadoNotificacionUsuario listadoNotificacionUsuario() {
        ResponseListadoNotificacionUsuario responseListadoNotificacionUsuario = new ResponseListadoNotificacionUsuario();
        List<NotificacionUsuarioDto> notificacionUsuarioActivos = notificacionUsuarioRepository.findByActivoTrue()
                .stream()
                .map(mapsDtosEntityService::mapToDtoNotificacionUsuario)
                .collect(Collectors.toList());
        responseListadoNotificacionUsuario.setNotificacionUsuarios(notificacionUsuarioActivos);
        return responseListadoNotificacionUsuario;
    }public String borrarNotificacionUsuario(Long id) {
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

    @Scheduled(cron = "0 0 3 * * ?") // Se ejecuta diariamente a las 3:00 AM
    public void chequearNotificaciones() {
        log.info("Iniciando verificación de notificaciones automáticas");
        
        try {
            List<Producto> productos = productoRepository.findByActivoTrue();
            
            for (Producto producto : productos) {
                // Verificar stock mínimo
                verificarStockMinimo(producto);
                
                // Verificar lotes próximos a vencer
                verificarLotesProximosVencer(producto);
            }
            
            log.info("Verificación de notificaciones completada exitosamente");
        } catch (Exception e) {
            log.error("Error al verificar notificaciones: {}", e.getMessage(), e);
        }
    }

    private void verificarStockMinimo(Producto producto) {
        try {
            // Verificar si el stock actual está por debajo del mínimo
            if (producto.getStockTotal() <= producto.getStockMin() && producto.getStockMin() > 0) {
                
                // Verificar si ya existe una notificación reciente para este producto
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
                    String mensaje = String.format("El producto '%s' ha alcanzado el stock mínimo. Stock actual: %d, Stock mínimo: %d",
                            producto.getNombre(), producto.getStockTotal(), producto.getStockMin());
                    
                    crearYEnviarNotificacion(titulo, mensaje);
                    log.info("Notificación de stock mínimo creada para producto: {} (ID: {})",
                            producto.getNombre(), producto.getId());
                }
            }
        } catch (Exception e) {
            log.warn("Error al verificar notificaciones existentes de stock mínimo: {}", e.getMessage());
        }
    }

    private void verificarLotesProximosVencer(Producto producto) {
        try {
            for (Lote lote : producto.getLotes()) {
                if (lote.getActivo() != null && lote.getActivo() &&
                    lote.getFechaVencimiento() != null &&
                    lote.getStock() != null && lote.getStock() > 0) {

                    // Convertir Date a LocalDate
                    LocalDate fechaVencimiento = lote.getFechaVencimiento().toInstant()
                            .atZone(ZoneId.systemDefault()).toLocalDate();
                    
                    long diasFaltantes = ChronoUnit.DAYS.between(LocalDate.now(), fechaVencimiento);
                    
                    if (diasFaltantes <= 21 && diasFaltantes >= 0) {
                        // Verificar si ya existe una notificación para este lote
                        LocalDateTime hace24Horas = LocalDateTime.now().minusHours(24);
                        boolean yaExisteNotificacion = notificacionUsuarioRepository
                                .findByActivoTrueAndNotificaciones_FechaHoraAfter(hace24Horas)
                                .stream()
                                .anyMatch(nu -> nu.getNotificaciones().stream()
                                        .anyMatch(n -> n.getMensaje() != null && 
                                                 (n.getMensaje().contains(lote.getNumero()))));

                        if (!yaExisteNotificacion) {
                            String titulo = "Alerta: Producto Próximo a Vencer";
                            String mensaje;
                            
                            if (diasFaltantes == 0) {
                                mensaje = String.format("¡URGENTE! El lote %s del producto '%s' vence HOY. Stock: %d unidades",
                                        lote.getNumero(), producto.getNombre(), lote.getStock());
                            } else if (diasFaltantes <= 7) {
                                mensaje = String.format("¡URGENTE! El lote %s del producto '%s' vence en %d días. Stock: %d unidades",
                                        lote.getNumero(), producto.getNombre(), diasFaltantes, lote.getStock());
                            } else {
                                mensaje = String.format("El lote %s del producto '%s' vence en %d días. Stock: %d unidades",
                                        lote.getNumero(), producto.getNombre(), diasFaltantes, lote.getStock());
                            }
                            
                            crearYEnviarNotificacion(titulo, mensaje);
                            log.info("Notificación de vencimiento creada para lote: {} del producto: {} (días restantes: {})",
                                    lote.getNumero(), producto.getNombre(), diasFaltantes);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Error al verificar notificaciones existentes de vencimiento: {}", e.getMessage());
        }
    }

    private void crearYEnviarNotificacion(String titulo, String mensaje) {
        try {
            // Crear la notificación
            Notificacion notificacion = new Notificacion();
            notificacion.setTitulo(titulo);
            notificacion.setMensaje(mensaje);
            notificacion.setFechaHora(LocalDateTime.now());
            
            // Guardar la notificación
            notificacion = notificacionRepository.save(notificacion);
            
            // Obtener todos los usuarios activos
            List<Usuario> usuarios = usuarioRepository.findByActivoTrue();
            
            if (usuarios.isEmpty()) {
                log.warn("No hay usuarios para enviar notificaciones");
                return;
            }
            
            // Crear NotificacionUsuario para cada usuario
            for (Usuario usuario : usuarios) {
                NotificacionUsuario notificacionUsuario = new NotificacionUsuario();
                notificacionUsuario.setActivo(true);
                notificacionUsuario.setLeido(false);
                
                // Establecer las relaciones
                notificacionUsuario.getNotificaciones().add(notificacion);
                notificacionUsuario.getUsuarios().add(usuario);
                
                // Guardar la relación
                notificacionUsuarioRepository.save(notificacionUsuario);
            }
            
        } catch (Exception e) {
            log.error("Error al crear y enviar notificación: {}", e.getMessage(), e);
        }
    }    public ResponseListadoNotificacionUsuario obtenerNotificacionesPorUsuario(String userName) {
        try {
            ResponseListadoNotificacionUsuario response = new ResponseListadoNotificacionUsuario();
            
            List<NotificacionUsuarioDto> notificacionesUsuario = notificacionUsuarioRepository
                .findByActivoTrueAndUsuarios_Nombre(userName)
                .stream()
                .map(mapsDtosEntityService::mapToDtoNotificacionUsuario)
                .sorted((a, b) -> {
                    // Ordenar por fecha más reciente primero
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
            log.error("Error al obtener notificaciones del usuario {}: {}", userName, e.getMessage(), e);
            return new ResponseListadoNotificacionUsuario();
        }
    }    public String marcarComoLeida(Long notificacionUsuarioId, String userName) {
        try {
            Optional<NotificacionUsuario> notificacionOpt = notificacionUsuarioRepository.findById(notificacionUsuarioId);
            
            if (notificacionOpt.isPresent()) {
                NotificacionUsuario notificacion = notificacionOpt.get();
                
                // Verificar que la notificación pertenece al usuario
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
            log.error("Error al marcar notificación como leída: {}", e.getMessage(), e);
            return "Error al marcar la notificación como leída";
        }
    }    public int contarNotificacionesNoLeidas(String userName) {
        try {
            return notificacionUsuarioRepository
                .findByActivoTrueAndLeidoFalseAndUsuarios_Nombre(userName)
                .size();
        } catch (Exception e) {
            log.error("Error al contar notificaciones no leídas para {}: {}", userName, e.getMessage(), e);
            return 0;
        }
    }    public String marcarTodasComoLeidas(String userName) {
        try {
            List<NotificacionUsuario> notificacionesNoLeidas = notificacionUsuarioRepository
                .findByActivoTrueAndLeidoFalseAndUsuarios_Nombre(userName);
            
            for (NotificacionUsuario notificacion : notificacionesNoLeidas) {
                notificacion.setLeido(true);
                notificacionUsuarioRepository.save(notificacion);
            }
            
            return String.format("Se marcaron %d notificaciones como leídas", notificacionesNoLeidas.size());
            
        } catch (Exception e) {
            log.error("Error al marcar todas las notificaciones como leídas para {}: {}", userName, e.getMessage(), e);
            return "Error al marcar las notificaciones como leídas";
        }
    }    public String debugNotificaciones(String userName) {
        StringBuilder debug = new StringBuilder();
        
        try {
            debug.append("=== DEBUG NOTIFICACIONES ===\n");
            debug.append("Usuario actual: ").append(userName).append("\n\n");
            
            // Verificar si existe el usuario
            Usuario usuario = usuarioRepository.findByNombre(userName).orElse(null);
            if (usuario == null) {
                debug.append("ERROR: Usuario no encontrado en la base de datos\n");
                return debug.toString();
            }
            debug.append("Usuario encontrado: Nombre=").append(usuario.getNombre()).append(", Activo=").append(usuario.getActivo()).append("\n\n");
            
            // Contar todas las NotificacionUsuario
            List<NotificacionUsuario> todasLasNotificaciones = notificacionUsuarioRepository.findAll();
            debug.append("Total NotificacionUsuario en BD: ").append(todasLasNotificaciones.size()).append("\n");
            
            // Contar NotificacionUsuario activas
            List<NotificacionUsuario> notificacionesActivas = notificacionUsuarioRepository.findByActivoTrue();
            debug.append("NotificacionUsuario activas: ").append(notificacionesActivas.size()).append("\n");
            
            // Mostrar detalles de las NotificacionUsuario activas
            debug.append("\n=== DETALLES DE NOTIFICACIONES ACTIVAS ===\n");
            for (NotificacionUsuario nu : notificacionesActivas) {
                debug.append("ID: ").append(nu.getId())
                     .append(", Activo: ").append(nu.getActivo())
                     .append(", Leído: ").append(nu.getLeido())
                     .append(", Usuarios asociados: ").append(nu.getUsuarios().size())
                     .append("\n");
                
                // Mostrar usuarios asociados
                for (Usuario u : nu.getUsuarios()) {
                    debug.append("  - Usuario: ").append(u.getMail()).append(" (Nombre: ").append(u.getNombre()).append(")\n");
                }
                
                // Mostrar notificaciones asociadas
                for (Notificacion n : nu.getNotificaciones()) {
                    debug.append("  - Notificación: ").append(n.getTitulo())
                           .append(" - ").append(n.getFechaHora()).append("\n");
                }
                debug.append("\n");
            }
              // Verificar consulta específica del usuario
            List<NotificacionUsuario> notificacionesDelUsuario = notificacionUsuarioRepository
                .findByActivoTrueAndUsuarios_Nombre(userName);
            debug.append("NotificacionUsuario para el usuario ").append(userName).append(": ")
                 .append(notificacionesDelUsuario.size()).append("\n");
            
            List<NotificacionUsuario> notificacionesNoLeidasDelUsuario = notificacionUsuarioRepository
                .findByActivoTrueAndLeidoFalseAndUsuarios_Nombre(userName);
            debug.append("NotificacionUsuario no leídas para el usuario ").append(userName).append(": ")
                 .append(notificacionesNoLeidasDelUsuario.size()).append("\n");
            
        } catch (Exception e) {
            debug.append("ERROR durante debug: ").append(e.getMessage()).append("\n");
            log.error("Error en debug de notificaciones", e);
        }
        
        return debug.toString();
    }    public String debugUsuarioYNotificaciones(String userName) {
        StringBuilder debug = new StringBuilder();
        
        try {
            debug.append("=== DEBUG USUARIO Y NOTIFICACIONES ===\n");
            debug.append("Nombre del contexto de seguridad: ").append(userName).append("\n\n");
            
            // Verificar si existe el usuario
            Usuario usuario = usuarioRepository.findByNombre(userName).orElse(null);
            if (usuario == null) {
                debug.append("❌ ERROR: Usuario no encontrado con nombre: ").append(userName).append("\n");
                
                // Mostrar todos los usuarios para debug
                List<Usuario> todosUsuarios = usuarioRepository.findAll();
                debug.append("\n📋 Todos los usuarios en la BD:\n");
                for (Usuario u : todosUsuarios) {
                    debug.append("  - Nombre: ").append(u.getNombre())
                         .append(", Email: ").append(u.getMail())
                         .append(", Activo: ").append(u.getActivo()).append("\n");
                }
                return debug.toString();
            }
            
            debug.append("✅ Usuario encontrado:\n");
            debug.append("  - Nombre: ").append(usuario.getNombre()).append("\n");
            debug.append("  - Email: ").append(usuario.getMail()).append("\n");
            debug.append("  - Activo: ").append(usuario.getActivo()).append("\n\n");
            
            // Probar las consultas del repositorio
            List<NotificacionUsuario> todasNotificaciones = notificacionUsuarioRepository.findAll();
            debug.append("📊 Total NotificacionUsuario en BD: ").append(todasNotificaciones.size()).append("\n");
            
            List<NotificacionUsuario> notificacionesActivas = notificacionUsuarioRepository.findByActivoTrue();
            debug.append("📊 NotificacionUsuario activas: ").append(notificacionesActivas.size()).append("\n");            List<NotificacionUsuario> notificacionesDelUsuario = notificacionUsuarioRepository
                .findByActivoTrueAndUsuarios_Nombre(userName);
            debug.append("📊 NotificacionUsuario del usuario: ").append(notificacionesDelUsuario.size()).append("\n");
            
            List<NotificacionUsuario> notificacionesNoLeidas = notificacionUsuarioRepository
                .findByActivoTrueAndLeidoFalseAndUsuarios_Nombre(userName);
            debug.append("📊 NotificacionUsuario no leídas del usuario: ").append(notificacionesNoLeidas.size()).append("\n\n");
            
            // Detalles de las notificaciones del usuario
            debug.append("=== DETALLES NOTIFICACIONES DEL USUARIO ===\n");
            for (NotificacionUsuario nu : notificacionesDelUsuario) {
                debug.append("NotificacionUsuario ID: ").append(nu.getId()).append("\n");
                debug.append("  - Activo: ").append(nu.getActivo()).append("\n");
                debug.append("  - Leído: ").append(nu.getLeido()).append("\n");
                debug.append("  - Usuarios asociados: ").append(nu.getUsuarios().size()).append("\n");
                
                for (Usuario u : nu.getUsuarios()) {
                    debug.append("    * Usuario: ").append(u.getMail()).append("\n");
                }
                
                debug.append("  - Notificaciones asociadas: ").append(nu.getNotificaciones().size()).append("\n");
                for (Notificacion n : nu.getNotificaciones()) {
                    debug.append("    * ").append(n.getTitulo()).append(" - ").append(n.getFechaHora()).append("\n");
                }
                debug.append("\n");
            }
            
        } catch (Exception e) {
            debug.append("❌ ERROR durante debug: ").append(e.getMessage()).append("\n");
            log.error("Error en debug de usuario y notificaciones", e);
        }
        
        return debug.toString();
    }
}