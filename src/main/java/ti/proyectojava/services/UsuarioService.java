package ti.proyectojava.services;

import org.springframework.beans.factory.annotation.Autowired;
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

    public ResponseListadoUsuarios listadoUsuarios(){
        ResponseListadoUsuarios responseListadoUsuarios = new ResponseListadoUsuarios();

        List<UsuarioDto> usuariosActivos = usuarioRepository.findByActivoTrue()
                .stream()
                .map(mapsDtosEntityService::mapToDtoUsuarioPlano)
                .toList();

        responseListadoUsuarios.setUsuarios(usuariosActivos);

        return responseListadoUsuarios;
    }

    public Integer listadoUsuariosTotales(){
        return  usuarioRepository.cantidadUsuarios();
    }    
    
    
    public String crearUsuario(UsuarioDto usuario, boolean isAdmin){
        String response = null;

        // Validar que los campos requeridos no sean null
        if(usuario.getNombre() == null || usuario.getMail() == null || usuario.getContrasenia() == null) {
            throw new RuntimeException("Todos los campos son requeridos");
        }

        // Validar que el nombre de usuario no esté duplicado
        if(usuarioRepository.findByNombreIgnoreCase(usuario.getNombre()).isPresent()) {
            throw new RuntimeException("USUARIO_EXISTENTE");
        }

        // Validar que el email no esté duplicado en usuarios activos
        Optional<Usuario> usuarioConEmailActivo = usuarioRepository.findByMailIgnoreCaseAndActivoTrue(usuario.getMail());
        if(usuarioConEmailActivo.isPresent()) {
            throw new RuntimeException("EMAIL_EXISTENTE");
        }

        // Validar que la contraseña tenga al menos 6 caracteres
        if(usuario.getContrasenia().length() < 6) {
            throw new RuntimeException("CONTRASENIA_CORTA");
        }

        // Validar que el nombre de usuario tenga al menos 3 caracteres
        if(usuario.getNombre().length() < 3) {
            throw new RuntimeException("NOMBRE_CORTO");
        }

        // Validar que el email tenga un formato válido
        if (!usuario.getMail().matches("^[\\w-\\.]+@[\\w-]+\\.[a-zA-Z]{2,}$")) {
            throw new RuntimeException("EMAIL_INVALIDO");
        }

        // Crear nuevo usuario
        // Encriptar la contraseña antes de crear el usuario
        String contraseniaEncriptada = passwordService.encryptPassword(usuario.getContrasenia());
        usuario.setContrasenia(contraseniaEncriptada);
        
        // Crear la entidad usuario
        Usuario nuevoUsuario = mapsDtosEntityService.mapToEntityUsuario(usuario);
        
        // Asignar rol según el parámetro isAdmin
        List<RolUsuario> roles = new ArrayList<>();
        if (isAdmin) {
            // Asignar rol de administrador (ID = 1)
            rolUsuarioRepository.findById(1L).ifPresent(roles::add);
        } else {
            // Asignar rol de cajero (ID = 2)
            rolUsuarioRepository.findById(2L).ifPresent(roles::add);
        }
        nuevoUsuario.setRoles(roles);

        // Guardar usuario con roles
        Usuario usuarioGuardado = usuarioRepository.save(nuevoUsuario);
        response = "Usuario creado exitosamente. NOMBRE:" + usuarioGuardado.getNombre();
        
        return response;
    }

    public String borrarUsuario(String nombreUsuario){
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
    
    public String modificarUsuario(String nombre, UsuarioDto usuario){
        String response = null;        Usuario aux = usuarioRepository.findById(nombre).orElseThrow(() -> new RuntimeException("Usuario no existe"));        
        // Verificar que la contraseña actual coincida con la almacenada (usando encriptación)
        if (!passwordService.matchPassword(usuario.getContrasenia(), aux.getContrasenia())) {
            throw new RuntimeException("Contraseña actual incorrecta");
        }

        // Actualizar email
        aux.setMail(usuario.getMail());
        
        // Si hay una nueva contraseña, encriptarla y actualizarla
        if (usuario.getNuevaContrasenia() != null && !usuario.getNuevaContrasenia().trim().isEmpty()) {
            String contraseniaEncriptada = passwordService.encryptPassword(usuario.getNuevaContrasenia());
            aux.setContrasenia(contraseniaEncriptada);
        }

        usuarioRepository.save(aux);
        response = "Usuario modificado correctamente. NOMBRE:" + aux.getNombre();
        return response;
    }


    public UsuarioDto buscarUsuario(String nombre){
        Usuario usuario = usuarioRepository.findById(nombre).orElseThrow(() -> new RuntimeException("Usuario no existe"));
        return mapsDtosEntityService.mapToDtoUsuario(usuario);
    }

    public String otorgarRolAdmin(String adminUsuario, String usuarioDestino) {
        // Verificar que solo el usuario "admin" puede otorgar roles de administrador
        if (!"admin".equals(adminUsuario)) {
            throw new RuntimeException("Solo el administrador por defecto puede otorgar permisos de administrador");
        }

        // Verificar que el usuario destino existe
        Usuario usuario = usuarioRepository.findByNombreIgnoreCase(usuarioDestino)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + usuarioDestino));

        // Verificar que el usuario tenga solo rol CAJERO
        boolean soloTieneCajero = usuario.getRoles().size() == 1 && 
                                 usuario.getRoles().get(0).getNombre().equals("CAJERO");
        
        if (!soloTieneCajero) {
            throw new RuntimeException("Solo se pueden otorgar permisos de administrador a usuarios con rol exclusivo de CAJERO");
        }

        // Agregar rol ADMIN (manteniendo CAJERO)
        List<RolUsuario> roles = new ArrayList<>(usuario.getRoles());
        rolUsuarioRepository.findById(1L).ifPresent(roles::add);
        usuario.setRoles(roles);
        
        usuarioRepository.save(usuario);
        return "Permisos de administrador otorgados exitosamente a: " + usuarioDestino;
    }

    public String revocarRolAdmin(String adminUsuario, String usuarioDestino) {
        // Verificar que solo el usuario "admin" puede revocar roles de administrador
        if (!"admin".equals(adminUsuario)) {
            throw new RuntimeException("Solo el administrador por defecto puede revocar permisos de administrador");
        }

        // Verificar que el usuario destino existe
        Usuario usuario = usuarioRepository.findByNombreIgnoreCase(usuarioDestino)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + usuarioDestino));

        // No permitir que se modifique al propio admin
        if ("admin".equals(usuarioDestino)) {
            throw new RuntimeException("No se puede modificar al usuario administrador por defecto");
        }

        // Remover solo el rol ADMIN, mantener CAJERO
        List<RolUsuario> rolesActualizados = usuario.getRoles().stream()
                .filter(rol -> !rol.getNombre().equals("ADMIN"))
                .collect(java.util.stream.Collectors.toList());
        
        usuario.setRoles(rolesActualizados);
        usuarioRepository.save(usuario);
        return "Permisos de administrador revocados exitosamente de: " + usuarioDestino;
    }

    /**
     * Solicita recuperación de contraseña generando un código de recuperación
     */
    public String solicitarRecuperacionPassword(String email) {
        // Verificar que el email existe
        Optional<Usuario> usuarioOpt = usuarioRepository.findByMailIgnoreCaseAndActivoTrue(email);
        if (usuarioOpt.isEmpty()) {
            throw new RuntimeException("No existe un usuario registrado con ese email");
        }

        Usuario usuario = usuarioOpt.get();

        // Invalidar códigos anteriores del mismo email
        List<PasswordRecovery> codigosAnteriores = passwordRecoveryRepository.findByEmailAndUsadoFalse(email);
        codigosAnteriores.forEach(codigo -> codigo.setUsado(true));
        passwordRecoveryRepository.saveAll(codigosAnteriores);

        // Generar código de 6 dígitos
        String codigoRecuperacion = generarCodigoRecuperacion();
        
        // Crear nuevo registro de recuperación (válido por 15 minutos)
        LocalDateTime fechaExpiracion = LocalDateTime.now().plusMinutes(15);
        PasswordRecovery recovery = new PasswordRecovery(email, codigoRecuperacion, fechaExpiracion);
        passwordRecoveryRepository.save(recovery);

        try {
            // Enviar código por email
            emailService.enviarCodigoRecuperacion(email, codigoRecuperacion, usuario.getNombre());
            return "Se ha enviado un código de recuperación a tu email (" + 
                   enmascararEmail(email) + "). El código es válido por 15 minutos.";
        } catch (Exception e) {
            // Si falla el envío del email, eliminar el código generado
            passwordRecoveryRepository.delete(recovery);
            throw new RuntimeException("Error al enviar el email de recuperación. Verifica tu conexión e inténtalo de nuevo.");
        }
    }

    /**
     * Restablece la contraseña usando el código de recuperación
     */
    public String restablecerPassword(String email, String codigo, String nuevaPassword) {
        // Validar que la nueva contraseña no esté vacía y tenga al menos 6 caracteres
        if (nuevaPassword == null || nuevaPassword.trim().length() < 6) {
            throw new RuntimeException("La nueva contraseña debe tener al menos 6 caracteres");
        }

        // Buscar código de recuperación válido
        Optional<PasswordRecovery> recoveryOpt = passwordRecoveryRepository
                .findByEmailAndCodigoRecuperacionAndUsadoFalse(email, codigo);
        
        if (recoveryOpt.isEmpty()) {
            throw new RuntimeException("Código de recuperación inválido o ya utilizado");
        }

        PasswordRecovery recovery = recoveryOpt.get();
        
        // Verificar que no haya expirado
        if (LocalDateTime.now().isAfter(recovery.getFechaExpiracion())) {
            throw new RuntimeException("El código de recuperación ha expirado");
        }

        // Buscar el usuario
        Optional<Usuario> usuarioOpt = usuarioRepository.findByMailIgnoreCaseAndActivoTrue(email);
        if (usuarioOpt.isEmpty()) {
            throw new RuntimeException("Usuario no encontrado");
        }

        Usuario usuario = usuarioOpt.get();
        
        // Actualizar contraseña
        String passwordEncriptada = passwordService.encryptPassword(nuevaPassword);
        usuario.setContrasenia(passwordEncriptada);
        usuarioRepository.save(usuario);        // Marcar código como usado
        recovery.setUsado(true);
        passwordRecoveryRepository.save(recovery);

        // Enviar notificación de cambio de contraseña
        try {
            emailService.enviarNotificacionCambioPassword(email, usuario.getNombre());
        } catch (Exception e) {
            // No fallar si no se puede enviar la notificación
            System.err.println("No se pudo enviar notificación de cambio de contraseña: " + e.getMessage());
        }

        return "Contraseña restablecida exitosamente";
    }

    /**
     * Genera un código de recuperación de 6 dígitos
     */
    private String generarCodigoRecuperacion() {
        Random random = new Random();
        int codigo = 100000 + random.nextInt(900000);
        return String.valueOf(codigo);
    }

    /**
     * Enmascara un email para mostrar solo las primeras letras y el dominio
     */
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

    /**
     * Limpia códigos de recuperación expirados (se puede ejecutar como tarea programada)
     */
    public void limpiarCodigosExpirados() {
        passwordRecoveryRepository.deleteByFechaExpiracionBefore(LocalDateTime.now());
    }

}

