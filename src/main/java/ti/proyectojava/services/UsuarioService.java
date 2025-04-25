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

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public ResponseListadoUsuarios listadoUsuarios(){
        ResponseListadoUsuarios responseListadoUsuarios = new ResponseListadoUsuarios();

        List<UsuarioDto> usuariosActivos = usuarioRepository.findByActivoTrue()
                .stream()
                .map(this::mapToDtoUsuario)
                .toList();

        responseListadoUsuarios.setUsuarios(usuariosActivos);

        return responseListadoUsuarios;
    }

    public String crearUsuario(UsuarioDto usuario){
        String response = null;

        if(usuario.getNombre()==null){
            response = "Usuario creado exitosamente. NOMBRE:" + usuarioRepository.save(mapToEntity(usuario)).getNombre();

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
        aux.setNombre(usuario.getNombre());

        usuarioRepository.save(aux);
        response = "Usuario modificado correctamente. NOMBRE:" + aux.getNombre();
        return response;
    }

// capaz anda capaz no
    /*
    * public void chequearNotificaciones() {
    List<Producto> productos = productoRepository.findAll();

    for (Producto producto : productos) {
        int stockTotal = producto.getStockTotal();

        if (stockTotal == 0) continue;

        for (Lote lote : producto.getLotes()) {
            if (lote.getStock() == 0) continue;

            long diasFaltantes = ChronoUnit.DAYS.between(LocalDate.now(), lote.getFechaVencimiento());

            if (diasFaltantes <= 21) {

                Notificacion notificacion = new Notificacion();
                notificacion.setFechahora(LocalDateTime.now());
                notificacion.setMensaje("Producto " + producto.getNombre() +
                        " (lote " + lote.getId() + ") vence en " + diasFaltantes + " días.");

                notificacionRepository.save(notificacion);

                // mandarla a todos los usuarios
                List<Usuario> usuarios = usuarioRepository.findAll();
                List<NotificacionUsuario> notisUsuario = new ArrayList<>();

                for (Usuario usuario : usuarios) {
                    NotificacionUsuario nu = new NotificacionUsuario();
                    nu.setLeido(false);
                    nu.setUsuario(usuario);
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

    * */




    /////////////////////


    public RolUsuarioDto mapToDtoRoles(RolUsuario rol){
        RolUsuarioDto rolDto = new RolUsuarioDto();
        rolDto.setId(rol.getId());
        rolDto.setNombre(rol.getNombre());
        rolDto.setUsuarios(rol.getUsuarios().stream().map(e -> mapToDtoUsuario(e)).toList());
        return rolDto;
    }

    public UsuarioDto mapToDtoUsuario(Usuario usuario){
        UsuarioDto usuarioDto = new UsuarioDto();
        usuarioDto.setMail(usuario.getMail());
        usuarioDto.setContrasenia(usuario.getContrasenia());
        usuarioDto.setNombre(usuario.getNombre());
        usuarioDto.setActivo(usuario.getActivo());
        usuarioDto.setRoles(usuario.getRoles().stream().map(e -> mapToDtoRoles(e)).toList());
        return usuarioDto;
    }

    public RolUsuario mapToEntityRoles(RolUsuarioDto rolDto){
        RolUsuario rol = new RolUsuario();
        rol.setId(rolDto.getId());
        rol.setNombre(rolDto.getNombre());
        rol.setUsuarios(rolDto.getUsuarios().stream().map(e -> mapToEntity(e)).toList());
        return rol;
    }
    public Usuario mapToEntity(UsuarioDto usuarioDto){
        Usuario usuario = new Usuario();
        usuario.setMail(usuarioDto.getMail());
        usuario.setContrasenia(usuarioDto.getContrasenia());
        usuario.setNombre(usuarioDto.getNombre());
        usuario.setActivo(usuarioDto.getActivo());
        usuario.setRoles(usuarioDto.getRoles().stream().map(e -> mapToEntityRoles(e)).toList());
        return usuario;
    }
}

