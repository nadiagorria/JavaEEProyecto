package ti.proyectojava.services;

import org.springframework.stereotype.Service;
import ti.proyectojava.api.responses.ResponseListadoUsuarios;
import ti.proyectojava.business.entities.*;
import ti.proyectojava.business.repositories.UsuarioRepository;
import ti.proyectojava.business.repositories.RolUsuarioRepository;
import ti.proyectojava.dtos.UsuarioDto;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolUsuarioRepository rolUsuarioRepository;
    private final MapsDtosEntityService mapsDtosEntityService;
    private final PasswordService passwordService;


    public UsuarioService(UsuarioRepository usuarioRepository, RolUsuarioRepository rolUsuarioRepository, MapsDtosEntityService mapsDtosEntityService, PasswordService passwordService) {
        this.usuarioRepository = usuarioRepository;
        this.rolUsuarioRepository = rolUsuarioRepository;
        this.mapsDtosEntityService = mapsDtosEntityService;
        this.passwordService = passwordService;
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

        if(usuario.getNombre() != null && usuario.getMail() != null && usuario.getContrasenia() != null && usuarioRepository.findByNombreIgnoreCase(usuario.getNombre()).isEmpty()) {
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
            response = "Usuario creado exitosamente. NOMBRE:" + usuarioGuardado.getNombre();        }
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

}

