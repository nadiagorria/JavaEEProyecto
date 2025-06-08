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
import java.time.ZoneId;
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

    public String crearNotificacionUsuario(NotificacionUsuarioDto notificacionUsuarioDto) {
        return "NotificacionUsuario creado. ID: " + notificacionUsuarioRepository.save(mapsDtosEntityService.mapToEntityNotificacionUsuario(notificacionUsuarioDto)).getId();
    }

    public ResponseListadoNotificacionUsuario listadoNotificacionUsuario() {
        ResponseListadoNotificacionUsuario responseListadoNotificacionUsuario = new ResponseListadoNotificacionUsuario();
        List<NotificacionUsuarioDto> notificacionUsuarioActivos = notificacionUsuarioRepository.findByActivoTrue()
                .stream()
                .map(mapsDtosEntityService::mapToDtoNotificacionUsuario)
                .collect(Collectors.toList());
        responseListadoNotificacionUsuario.setNotificacionUsuarios(notificacionUsuarioActivos);
        return responseListadoNotificacionUsuario;
    }

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
        System.out.println("Iniciando verificación de notificaciones automáticas a las 9:30 AM hora Uruguay");
        
        try {
            List<Producto> productos = productoRepository.findByActivoTrue();
            for (Producto producto : productos) {
                verificarLotesVencenEn21Dias(producto);
            }
            
            System.out.println("Verificación de notificaciones completada exitosamente");
        } catch (Exception e) {
            System.err.println("Error al verificar notificaciones: " + e.getMessage());
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
                    System.out.println("Notificación de stock mínimo creada para producto: " + producto.getNombre());
                }
            }
        } catch (Exception e) {
            System.err.println("Error al verificar stock mínimo: " + e.getMessage());
        }
    }

    private void verificarLotesVencenEn21Dias(Producto producto) {
        try {
            for (Lote lote : producto.getLotes()) {
                if (lote.getActivo() != null && lote.getActivo() &&
                    lote.getFechaVencimiento() != null &&
                    lote.getStock() != null && lote.getStock() > 0) {

                    LocalDate fechaVencimiento = lote.getFechaVencimiento().toInstant()
                            .atZone(ZoneId.systemDefault()).toLocalDate();
                    
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
                            System.out.println(prioridad + " - Notificación creada para lote: " + lote.getNumero());
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error al verificar lotes próximos a vencer: " + e.getMessage());
        }
    }

    private void crearYEnviarNotificacion(String titulo, String mensaje) {
        try {
            System.out.println("=== CREANDO NOTIFICACIÓN ===");
            System.out.println("Título: " + titulo);
            System.out.println("Mensaje: " + mensaje);
            
            // Crear la notificación
            Notificacion notificacion = new Notificacion();
            notificacion.setTitulo(titulo);
            notificacion.setMensaje(mensaje);
            notificacion.setFechaHora(LocalDateTime.now());
            
            // Guardar la notificación
            notificacion = notificacionRepository.save(notificacion);
            System.out.println("Notificación guardada con ID: " + notificacion.getId());
            
            // Obtener todos los usuarios activos
            List<Usuario> usuarios = usuarioRepository.findByActivoTrue();
            System.out.println("Usuarios activos encontrados: " + usuarios.size());
            
            if (usuarios.isEmpty()) {
                System.out.println("No hay usuarios activos para enviar notificaciones");
                return;
            }
            
            // Crear NotificacionUsuario para cada usuario
            int notificacionesCreadas = 0;
            for (Usuario usuario : usuarios) {
                try {
                    System.out.println("Creando NotificacionUsuario para usuario: " + usuario.getNombre());
                    
                    NotificacionUsuario notificacionUsuario = new NotificacionUsuario();
                    notificacionUsuario.setActivo(true);
                    notificacionUsuario.setLeido(false);
                    
                    // Establecer las relaciones bidireccionales correctamente
                    // La notificación conoce a los NotificacionUsuario
                    if (notificacion.getNotificacionUsuarios() == null) {
                        notificacion.setNotificacionUsuarios(new java.util.ArrayList<>());
                    }
                    notificacion.getNotificacionUsuarios().add(notificacionUsuario);
                    
                    // El NotificacionUsuario conoce las notificaciones
                    if (notificacionUsuario.getNotificaciones() == null) {
                        notificacionUsuario.setNotificaciones(new java.util.ArrayList<>());
                    }
                    notificacionUsuario.getNotificaciones().add(notificacion);
                    
                    // El usuario conoce sus notificaciones
                    if (usuario.getNotificaciones() == null) {
                        usuario.setNotificaciones(new java.util.ArrayList<>());
                    }
                    usuario.getNotificaciones().add(notificacionUsuario);
                    
                    // El NotificacionUsuario conoce sus usuarios
                    if (notificacionUsuario.getUsuarios() == null) {
                        notificacionUsuario.setUsuarios(new java.util.ArrayList<>());
                    }
                    notificacionUsuario.getUsuarios().add(usuario);
                      // Guardar la relación
                    NotificacionUsuario guardada = notificacionUsuarioRepository.save(notificacionUsuario);
                    
                    // También guardar el usuario para asegurar que la relación bidireccional se persista
                    usuarioRepository.save(usuario);
                    
                    notificacionesCreadas++;
                    
                    System.out.println("NotificacionUsuario creada con ID: " + guardada.getId() + 
                        " para usuario: " + usuario.getNombre() + " (email: " + usuario.getMail() + ")");
                    System.out.println("Usuarios asociados a la notificación: " + guardada.getUsuarios().size());
                    System.out.println("Notificaciones del usuario: " + usuario.getNotificaciones().size());
                    
                } catch (Exception e) {
                    System.err.println("Error al crear NotificacionUsuario para usuario " + usuario.getNombre() + 
                        ": " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
            System.out.println("=== RESUMEN ===");
            System.out.println("Notificación '" + titulo + "' enviada exitosamente");
            System.out.println("NotificacionUsuario creadas: " + notificacionesCreadas + " de " + usuarios.size() + " usuarios");
            
        } catch (Exception e) {
            System.err.println("Error al crear y enviar notificación: " + e.getMessage());
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
            System.err.println("Error al obtener notificaciones del usuario " + userName + ": " + e.getMessage());
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
            System.err.println("Error al marcar notificación como leída: " + e.getMessage());
            return "Error al marcar la notificación como leída";
        }
    }

    public int contarNotificacionesNoLeidas(String userName) {
        try {
            return notificacionUsuarioRepository
                .findByActivoTrueAndLeidoFalseAndUsuarios_Nombre(userName)
                .size();
        } catch (Exception e) {
            System.err.println("Error al contar notificaciones no leídas para " + userName + ": " + e.getMessage());
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
            System.err.println("Error al marcar todas las notificaciones como leídas para " + userName + ": " + e.getMessage());
            return "Error al marcar las notificaciones como leídas";
        }
    }

    public String debugNotificaciones(String userName) {
        StringBuilder debug = new StringBuilder();
        
        try {
            debug.append("=== DEBUG NOTIFICACIONES ===\n");
            debug.append("Usuario actual: ").append(userName).append("\n\n");
            
            Usuario usuario = usuarioRepository.findByNombre(userName).orElse(null);
            if (usuario == null) {
                debug.append("ERROR: Usuario no encontrado en la base de datos\n");
                return debug.toString();
            }
            debug.append("Usuario encontrado: Nombre=").append(usuario.getNombre()).append(", Activo=").append(usuario.getActivo()).append("\n\n");
            
            List<NotificacionUsuario> todasLasNotificaciones = notificacionUsuarioRepository.findAll();
            debug.append("Total NotificacionUsuario en BD: ").append(todasLasNotificaciones.size()).append("\n");
            
            List<NotificacionUsuario> notificacionesActivas = notificacionUsuarioRepository.findByActivoTrue();
            debug.append("NotificacionUsuario activas: ").append(notificacionesActivas.size()).append("\n");
            
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
            System.err.println("Error en debug de notificaciones: " + e.getMessage());
        }
          return debug.toString();
    }

    public String debugUsuarioYNotificaciones(String userName) {
        StringBuilder debug = new StringBuilder();
        
        try {
            debug.append("=== DEBUG USUARIO Y NOTIFICACIONES ===\n");
            debug.append("Usuario: ").append(userName).append("\n\n");
            
            // Buscar usuario
            Usuario usuario = usuarioRepository.findByNombre(userName).orElse(null);
            if (usuario == null) {
                debug.append("ERROR: Usuario no encontrado\n");
                return debug.toString();
            }
            
            debug.append("Usuario encontrado:\n");
            debug.append("- Nombre: ").append(usuario.getNombre()).append("\n");
            debug.append("- Email: ").append(usuario.getMail()).append("\n");
            debug.append("- Activo: ").append(usuario.getActivo()).append("\n");
            debug.append("- Notificaciones asignadas: ").append(usuario.getNotificaciones() != null ? usuario.getNotificaciones().size() : 0).append("\n\n");
            
            // Buscar notificaciones del usuario
            List<NotificacionUsuario> notificacionesUsuario = notificacionUsuarioRepository
                .findByActivoTrueAndUsuarios_Nombre(userName);
            debug.append("NotificacionUsuario encontradas: ").append(notificacionesUsuario.size()).append("\n");
            
            for (NotificacionUsuario nu : notificacionesUsuario) {
                debug.append("- ID: ").append(nu.getId())
                     .append(", Leído: ").append(nu.getLeido())
                     .append(", Activo: ").append(nu.getActivo())
                     .append(", Usuarios: ").append(nu.getUsuarios() != null ? nu.getUsuarios().size() : 0)
                     .append(", Notificaciones: ").append(nu.getNotificaciones() != null ? nu.getNotificaciones().size() : 0)
                     .append("\n");
            }
            
            // Buscar notificaciones no leídas
            List<NotificacionUsuario> noLeidas = notificacionUsuarioRepository
                .findByActivoTrueAndLeidoFalseAndUsuarios_Nombre(userName);
            debug.append("\nNotificaciones no leídas: ").append(noLeidas.size()).append("\n");
            
        } catch (Exception e) {
            debug.append("ERROR: ").append(e.getMessage()).append("\n");
            e.printStackTrace();
        }
        
        return debug.toString();
    }
}