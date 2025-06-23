package ti.proyectojava.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import ti.proyectojava.api.responses.ResponseListadoUsuarios;
import ti.proyectojava.business.entities.*;
import ti.proyectojava.business.repositories.UsuarioRepository;
import ti.proyectojava.business.repositories.RolUsuarioRepository;
import ti.proyectojava.business.repositories.PasswordRecoveryRepository;
import ti.proyectojava.dtos.UsuarioDto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.Random;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolUsuarioRepository rolUsuarioRepository;
    private final MapsDtosEntityService mapsDtosEntityService;
    private final PasswordService passwordService;
    private final PasswordRecoveryRepository passwordRecoveryRepository;

    @Autowired
    private EmailService emailService;


    public UsuarioService(UsuarioRepository usuarioRepository, RolUsuarioRepository rolUsuarioRepository, MapsDtosEntityService mapsDtosEntityService, PasswordService passwordService, PasswordRecoveryRepository passwordRecoveryRepository) {
        this.usuarioRepository = usuarioRepository;
        this.rolUsuarioRepository = rolUsuarioRepository;
        this.mapsDtosEntityService = mapsDtosEntityService;
        this.passwordService = passwordService;
        this.passwordRecoveryRepository = passwordRecoveryRepository;
    }

    public ResponseListadoUsuarios listadoUsuarios() {
        ResponseListadoUsuarios responseListadoUsuarios = new ResponseListadoUsuarios();

        List<UsuarioDto> usuariosActivos = usuarioRepository.findByActivoTrue().stream().map(mapsDtosEntityService::mapToDtoUsuarioPlano).toList();

        responseListadoUsuarios.setUsuarios(usuariosActivos);

        return responseListadoUsuarios;
    }

    public Integer listadoUsuariosTotales() {
        return usuarioRepository.cantidadUsuarios();
    }


    public String crearUsuario(UsuarioDto usuario, boolean isAdmin) {
        String response = null;

        if (usuario.getNombre() == null || usuario.getMail() == null || usuario.getContrasenia() == null) {
            throw new RuntimeException("Todos los campos son requeridos");
        }

        if (usuarioRepository.findByNombreIgnoreCase(usuario.getNombre()).isPresent()) {
            throw new RuntimeException("USUARIO_EXISTENTE");
        }

        Optional<Usuario> usuarioConEmailActivo = usuarioRepository.findByMailIgnoreCaseAndActivoTrue(usuario.getMail());
        if (usuarioConEmailActivo.isPresent()) {
            throw new RuntimeException("EMAIL_EXISTENTE");
        }

        if (usuario.getContrasenia().length() < 6) {
            throw new RuntimeException("CONTRASENIA_CORTA");
        }

        if (usuario.getNombre().length() < 3) {
            throw new RuntimeException("NOMBRE_CORTO");
        }

        if (!usuario.getMail().matches("^[\\w-\\.]+@[\\w-]+\\.[a-zA-Z]{2,}$")) {
            throw new RuntimeException("EMAIL_INVALIDO");
        }

        String contraseniaEncriptada = passwordService.encryptPassword(usuario.getContrasenia());
        usuario.setContrasenia(contraseniaEncriptada);

        Usuario nuevoUsuario = mapsDtosEntityService.mapToEntityUsuario(usuario);

        List<RolUsuario> roles = new ArrayList<>();
        if (isAdmin) {
            rolUsuarioRepository.findById(1L).ifPresent(roles::add);
        } else {
            rolUsuarioRepository.findById(2L).ifPresent(roles::add);
        }
        nuevoUsuario.setRoles(roles);

        Usuario usuarioGuardado = usuarioRepository.save(nuevoUsuario);
        response = "Usuario creado exitosamente. NOMBRE:" + usuarioGuardado.getNombre();

        return response;
    }

    public String borrarUsuario(String nombreUsuario) {
        Optional<Usuario> usuarioAct = usuarioRepository.findById(nombreUsuario);
        String response = null;

        if (usuarioAct.isPresent()) {
            Usuario usuario = usuarioAct.get();
            usuario.setActivo(false);
            usuarioRepository.save(usuario);
            response = "Usuario eliminado correctamente. NOMBRE:" + usuario.getNombre();
        }
        return response;
    }


    public String modificarUsuario(String nombre, UsuarioDto usuario) {
        String response = null;
        Usuario aux = usuarioRepository.findById(nombre).orElseThrow(() -> new RuntimeException("Usuario no existe"));
        if (!passwordService.matchPassword(usuario.getContrasenia(), aux.getContrasenia())) {
            throw new RuntimeException("Contraseña actual incorrecta");
        }

        if (!aux.getMail().equalsIgnoreCase(usuario.getMail())) {
            Optional<Usuario> usuarioConEmail = usuarioRepository.findByMailIgnoreCaseAndActivoTrue(usuario.getMail());
            if (usuarioConEmail.isPresent()) {
                throw new RuntimeException("El email ya está siendo utilizado por otro usuario");
            }
        }

        aux.setMail(usuario.getMail());

        if (usuario.getNuevaContrasenia() != null && !usuario.getNuevaContrasenia().trim().isEmpty()) {
            String contraseniaEncriptada = passwordService.encryptPassword(usuario.getNuevaContrasenia());
            aux.setContrasenia(contraseniaEncriptada);
        }

        usuarioRepository.save(aux);
        response = "Usuario modificado correctamente. NOMBRE:" + aux.getNombre();
        return response;
    }


    public UsuarioDto buscarUsuario(String nombre) {
        Usuario usuario = usuarioRepository.findById(nombre).orElseThrow(() -> new RuntimeException("Usuario no existe"));
        return mapsDtosEntityService.mapToDtoUsuario(usuario);
    }

    public String otorgarRolAdmin(String adminUsuario, String usuarioDestino) {
        if (!"admin".equals(adminUsuario)) {
            throw new RuntimeException("Solo el administrador por defecto puede otorgar permisos de administrador");
        }

        Usuario usuario = usuarioRepository.findByNombreIgnoreCase(usuarioDestino).orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + usuarioDestino));

        boolean soloTieneCajero = usuario.getRoles().size() == 1 && usuario.getRoles().get(0).getNombre().equals("CAJERO");

        if (!soloTieneCajero) {
            throw new RuntimeException("Solo se pueden otorgar permisos de administrador a usuarios con rol exclusivo de CAJERO");
        }

        List<RolUsuario> roles = new ArrayList<>(usuario.getRoles());
        rolUsuarioRepository.findById(1L).ifPresent(roles::add);
        usuario.setRoles(roles);

        usuarioRepository.save(usuario);
        return "Permisos de administrador otorgados exitosamente a: " + usuarioDestino;
    }

    public String revocarRolAdmin(String adminUsuario, String usuarioDestino) {
        if (!"admin".equals(adminUsuario)) {
            throw new RuntimeException("Solo el administrador por defecto puede revocar permisos de administrador");
        }

        Usuario usuario = usuarioRepository.findByNombreIgnoreCase(usuarioDestino).orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + usuarioDestino));

        if ("admin".equals(usuarioDestino)) {
            throw new RuntimeException("No se puede modificar al usuario administrador por defecto");
        }

        List<RolUsuario> rolesActualizados = usuario.getRoles().stream().filter(rol -> !rol.getNombre().equals("ADMIN")).collect(java.util.stream.Collectors.toList());

        usuario.setRoles(rolesActualizados);
        usuarioRepository.save(usuario);
        return "Permisos de administrador revocados exitosamente de: " + usuarioDestino;
    }


    public String solicitarRecuperacionPassword(String email) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByMailIgnoreCaseAndActivoTrue(email);
        if (usuarioOpt.isEmpty()) {
            throw new RuntimeException("No existe un usuario registrado con ese email");
        }

        Usuario usuario = usuarioOpt.get();

        List<PasswordRecovery> codigosAnteriores = passwordRecoveryRepository.findByEmailAndUsadoFalse(email);
        codigosAnteriores.forEach(codigo -> codigo.setUsado(true));
        passwordRecoveryRepository.saveAll(codigosAnteriores);

        String codigoRecuperacion = generarCodigoRecuperacion();

        LocalDateTime fechaExpiracion = LocalDateTime.now().plusMinutes(15);
        PasswordRecovery recovery = new PasswordRecovery(email, codigoRecuperacion, fechaExpiracion);
        passwordRecoveryRepository.save(recovery);

        try {
            emailService.enviarCodigoRecuperacion(email, codigoRecuperacion, usuario.getNombre());
            return "Se ha enviado un código de recuperación a tu email (" + enmascararEmail(email) + "). El código es válido por 15 minutos.";
        } catch (Exception e) {
            passwordRecoveryRepository.delete(recovery);
            throw new RuntimeException("Error al enviar el email de recuperación. Verifica tu conexión e inténtalo de nuevo.");
        }
    }


    public String restablecerPassword(String email, String codigo, String nuevaPassword) {
        if (nuevaPassword == null || nuevaPassword.trim().length() < 6) {
            throw new RuntimeException("La nueva contraseña debe tener al menos 6 caracteres");
        }

        Optional<PasswordRecovery> recoveryOpt = passwordRecoveryRepository.findByEmailAndCodigoRecuperacionAndUsadoFalse(email, codigo);

        if (recoveryOpt.isEmpty()) {
            throw new RuntimeException("Código de recuperación inválido o ya utilizado");
        }

        PasswordRecovery recovery = recoveryOpt.get();

        if (LocalDateTime.now().isAfter(recovery.getFechaExpiracion())) {
            throw new RuntimeException("El código de recuperación ha expirado");
        }

        Optional<Usuario> usuarioOpt = usuarioRepository.findByMailIgnoreCaseAndActivoTrue(email);
        if (usuarioOpt.isEmpty()) {
            throw new RuntimeException("Usuario no encontrado");
        }

        Usuario usuario = usuarioOpt.get();

        if (passwordService.matchPassword(nuevaPassword, usuario.getContrasenia())) {
            throw new RuntimeException("La nueva contraseña no puede ser igual a la actual");
        }

        String passwordEncriptada = passwordService.encryptPassword(nuevaPassword);
        usuario.setContrasenia(passwordEncriptada);
        usuarioRepository.save(usuario);
        recovery.setUsado(true);
        passwordRecoveryRepository.save(recovery);

        try {
            emailService.enviarNotificacionCambioPassword(email, usuario.getNombre());
        } catch (Exception ignored) {
        }
        return "Contraseña restablecida exitosamente";
    }

    public boolean esPasswordIgualAActual(String email, String password) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByMailIgnoreCaseAndActivoTrue(email);
        if (usuarioOpt.isEmpty()) {
            return false;
        }

        Usuario usuario = usuarioOpt.get();
        return passwordService.matchPassword(password, usuario.getContrasenia());
    }


    private String generarCodigoRecuperacion() {
        Random random = new Random();
        int codigo = 100000 + random.nextInt(900000);
        return String.valueOf(codigo);
    }


    private String enmascararEmail(String email) {
        if (email == null || !email.contains("@")) {
            return email;
        }

        String[] partes = email.split("@");
        String usuario = partes[0];
        String dominio = partes[1];

        if (usuario.length() <= 2) {
            return usuario.charAt(0) + "*@" + dominio;
        } else {
            return usuario.substring(0, 2) + "***@" + dominio;
        }
    }


    @Scheduled(cron = "0 0 16 * * MON", zone = "America/Montevideo")
    @Async
    public void limpiarCodigosExpiradosProgramado() {
        try {
            LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));

            long codigosAntesLimpieza = passwordRecoveryRepository.count();

            limpiarCodigosExpirados();

            long codigosDespuesLimpieza = passwordRecoveryRepository.count();
            long codigosEliminados = codigosAntesLimpieza - codigosDespuesLimpieza;
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void limpiarCodigosExpirados() {
        passwordRecoveryRepository.deleteByFechaExpiracionBefore(LocalDateTime.now());
    }

}

