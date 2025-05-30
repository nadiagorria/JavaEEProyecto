package ti.proyectojava.services;

import org.springframework.stereotype.Service;
import ti.proyectojava.api.responses.ResponseListadoUsuarios;
import ti.proyectojava.business.entities.*;
import ti.proyectojava.business.repositories.UsuarioRepository;
import ti.proyectojava.business.repositories.RolUsuarioRepository;
import ti.proyectojava.dtos.RolUsuarioDto;
import ti.proyectojava.dtos.UsuarioDto;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolUsuarioRepository rolUsuarioRepository;
    private final MapsDtosEntityService mapsDtosEntityService;


    public UsuarioService(UsuarioRepository usuarioRepository, RolUsuarioRepository rolUsuarioRepository, MapsDtosEntityService mapsDtosEntityService) {
        this.usuarioRepository = usuarioRepository;
        this.rolUsuarioRepository = rolUsuarioRepository;
        this.mapsDtosEntityService = mapsDtosEntityService;
    }

    public ResponseListadoUsuarios listadoUsuarios(){
        ResponseListadoUsuarios responseListadoUsuarios = new ResponseListadoUsuarios();

        List<UsuarioDto> usuariosActivos = usuarioRepository.findByActivoTrue()
                .stream()
                .map(mapsDtosEntityService::mapToDtoUsuario)
                .toList();

        responseListadoUsuarios.setUsuarios(usuariosActivos);

        return responseListadoUsuarios;
    }    public String crearUsuario(UsuarioDto usuario, boolean isAdmin){
        String response = null;

        if(usuario.getNombre() != null && usuario.getMail() != null && usuario.getContrasenia() != null && usuarioRepository.findByNombreIgnoreCase(usuario.getNombre()).isEmpty()) {
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
        }
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
        String response = null;

        Usuario aux = usuarioRepository.findById(nombre).orElseThrow(() -> new RuntimeException("Usuario no existe"));

        aux.setMail(usuario.getMail());
        aux.setContrasenia(usuario.getContrasenia());
        usuarioRepository.save(aux);
        response = "Usuario modificado correctamente. NOMBRE:" + aux.getNombre();
        return response;
    }


    public UsuarioDto buscarUsuario(String nombre){
        Usuario usuario = usuarioRepository.findById(nombre).orElseThrow(() -> new RuntimeException("Usuario no existe"));
        return mapsDtosEntityService.mapToDtoUsuario(usuario);
    }


}

