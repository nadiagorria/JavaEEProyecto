package ti.proyectojava.services;

import org.springframework.stereotype.Service;
import ti.proyectojava.api.responses.ResponseListadoUsuarios;
import ti.proyectojava.business.entities.*;
import ti.proyectojava.business.repositories.UsuarioRepository;
import ti.proyectojava.dtos.RolUsuarioDto;
import ti.proyectojava.dtos.UsuarioDto;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final MapsDtosEntityService mapsDtosEntityService;


    public UsuarioService(UsuarioRepository usuarioRepository, MapsDtosEntityService mapsDtosEntityService) {
        this.usuarioRepository = usuarioRepository;
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
    }

    public String crearUsuario(UsuarioDto usuario){
        String response = null;

        if(usuario.getNombre() != null && usuario.getMail() != null && usuario.getContrasenia() != null && usuarioRepository.findById(usuario.getNombre()).isEmpty()) {
            response = "Usuario creado exitosamente. NOMBRE:" + usuarioRepository.save(mapsDtosEntityService.mapToEntityUsuario(usuario)).getNombre();

        }
        return  response;
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

