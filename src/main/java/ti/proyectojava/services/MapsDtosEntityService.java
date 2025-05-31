package ti.proyectojava.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ti.proyectojava.business.entities.*;
import ti.proyectojava.business.repositories.CategoriaRepository;
import ti.proyectojava.dtos.*;
import ti.proyectojava.business.repositories.*;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class MapsDtosEntityService {

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final RolUsuarioRepository rolUsuarioRepository;
    private final VentaRepository ventaRepository;
    private final ProveedorRepository proveedorRepository;
    private final ClienteRepository clienteRepository;
    private final ComboRepository comboRepository;
    private final LoteRepository loteRepository;
    private final CreditoRepository creditoRepository;
    private final DescuentoRepository descuentoRepository;
    private final  NotificacionRepository notificacionRepository;
    private final NotificacionUsuarioRepository notificacionUsuarioRepository;
    private final CantidadRepository cantidadRepository;
    private final PromocionRepository promocionRepository;

    @Autowired
    public MapsDtosEntityService(
            CategoriaRepository categoriaRepository,
            ProductoRepository productoRepository,
            UsuarioRepository usuarioRepository,
            RolUsuarioRepository rolUsuarioRepository,
            VentaRepository ventaRepository,
            ProveedorRepository proveedorRepository,
            ClienteRepository clienteRepository,
            ComboRepository comboRepository,
            LoteRepository loteRepository, CreditoRepository creditoRepository, DescuentoRepository descuentoRepository, NotificacionRepository notificacionRepository, NotificacionUsuarioRepository notificacionUsuarioRepository, CantidadRepository cantidadRepository, PromocionRepository promocionRepository) {
        this.categoriaRepository = categoriaRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
        this.rolUsuarioRepository = rolUsuarioRepository;
        this.ventaRepository = ventaRepository;
        this.proveedorRepository = proveedorRepository;
        this.clienteRepository = clienteRepository;
        this.comboRepository = comboRepository;
        this.loteRepository = loteRepository;
        this.creditoRepository = creditoRepository;
        this.descuentoRepository = descuentoRepository;
        this.notificacionRepository = notificacionRepository;
        this.notificacionUsuarioRepository = notificacionUsuarioRepository;
        this.cantidadRepository = cantidadRepository;
        this.promocionRepository = promocionRepository;
    }

    public CategoriaDto mapToDtoCategoria(Categoria categoria) {
        return mapToDtoCategoria(categoria, new HashSet<>());
    }

    private CategoriaDto mapToDtoCategoria(Categoria categoria, Set<Object> processed) {
        if (categoria == null || processed.contains(categoria)) {
            return null;
        }
        processed.add(categoria);

        CategoriaDto catDto = new CategoriaDto();
        catDto.setNombre(categoria.getNombre());
        catDto.setActivo(categoria.getActivo());

        if (categoria.getProductos() != null) {
            catDto.setProductos(
                    categoria.getProductos().stream()
                            .map(producto -> mapToDtoProducto(producto, processed))
                            .filter(Objects::nonNull)
                            .toList()
            );

        }

        if (categoria.getCategoriaPadre() != null) {
            catDto.setCategoriaPadre(mapToDtoCategoria(categoria.getCategoriaPadre(), processed));
        }

        if (categoria.getSubcategorias() != null) {
            catDto.setSubcategorias(
                    categoria.getSubcategorias().stream()
                            .map(sub -> mapToDtoCategoria(sub, processed))
                            .filter(Objects::nonNull)
                            .toList()
            );
        }
        return catDto;
    }

    public Categoria mapToEntityCategoria(CategoriaDto catDto) {
        return mapToEntityCategoria(catDto, new HashSet<>());
    }

    private Categoria mapToEntityCategoria(CategoriaDto catDto, Set<Object> processed) {
        if (catDto == null || processed.contains(catDto)) {
            return null;
        }
        processed.add(catDto);

        // Si tiene id
        if (catDto.getId() != null) {
            Optional<Categoria> categoriaExistente = categoriaRepository.findById(catDto.getId());
            if (categoriaExistente.isPresent()) {
                return categoriaExistente.get();
            }
        }

        // Si no tiene id (no existe)
        Categoria categoria = new Categoria();
        categoria.setNombre(catDto.getNombre());
        categoria.setActivo(catDto.getActivo());

        if (catDto.getProductos() != null) {
            categoria.setProductos(
                    catDto.getProductos().stream()
                            .map(prodDto -> mapToEntityProducto(prodDto, processed)) // Pasa el mismo Set
                            .filter(Objects::nonNull)
                            .toList()
            );

            // Mantener bidireccionalidad
            categoria.getProductos().forEach(producto -> producto.setCategoria(categoria));
        }

        if (catDto.getCategoriaPadre() != null) {
            categoria.setCategoriaPadre(mapToEntityCategoria(catDto.getCategoriaPadre(), processed));
        }

        if (catDto.getSubcategorias() != null) {
            categoria.setSubcategorias(
                    catDto.getSubcategorias().stream()
                            .map(subDto -> mapToEntityCategoria(subDto, processed))
                            .filter(Objects::nonNull)
                            .toList()
            );

            // Mantener bidireccionalidad
            categoria.getSubcategorias().forEach(sub -> sub.setCategoriaPadre(categoria));
        }

        return categoria;
    }

    public VentaDto mapToDtoVentaPlano(Venta venta) {
        if (venta == null) return null;
        VentaDto dto = new VentaDto();
        dto.setId(venta.getId());
        dto.setTotal(venta.getTotal());
        dto.setFechaVenta(venta.getFechaVenta());
        dto.setActivo(venta.getActivo());
        dto.setFinalizada(venta.getFinalizada());
        dto.setFormaPago(venta.getFormaPago());

        if (venta.getUsuario() != null) {
            dto.setUsuario(venta.getUsuario().getNombre());
        }

        if (venta.getCantidades() != null) {
            dto.setCantidades(venta.getCantidades().stream()
                    .map(cantidad -> mapToDtoCantidadSimple(cantidad))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList())
            );
        }
        return dto;
    }


    public CreditoDto mapToDtoCredito(Credito credito) {
        return mapToDtoCredito(credito, new HashSet<>());
    }

    private CreditoDto mapToDtoCredito(Credito credito, Set<Object> processed) {
        if (credito == null || processed.contains(credito)) {
            return null;
        }
        processed.add(credito);

        CreditoDto dto = new CreditoDto();
        dto.setActivo(credito.getActivo());
        dto.setId(credito.getId());
        dto.setPrecioTotal(credito.getPrecioTotal());
        dto.setMinimo(credito.getMinimo());
        dto.setMaximo(credito.getMaximo());
        dto.setPagoHastaAhora(credito.getPagoHastaAhora());

        if (credito.getVentas() != null) {
            dto.setVentas(credito.getVentas().stream()
                        .map(venta -> mapToDtoVentaPlano(venta))
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList())
            );
        }

        if (credito.getCliente() != null) {
            dto.setCliente(mapToDtoCliente(credito.getCliente(), processed));
        }

        return dto;
    }

    public Credito mapToEntityCredito(CreditoDto dto) {
        return mapToEntityCredito(dto, new HashSet<>());
    }

    private Credito mapToEntityCredito(CreditoDto dto, Set<Object> processed) {
        if (dto == null || processed.contains(dto)) {
            return null;
        }
        processed.add(dto);

        // Si tiene id
        if (dto.getId() != null) {
            Optional<Credito> creditoExistente = creditoRepository.findById(dto.getId());
            if (creditoExistente.isPresent()) {
                return creditoExistente.get();
            }
        }

        Credito credito = new Credito();
        credito.setId(dto.getId());
        credito.setActivo(dto.getActivo());
        credito.setPrecioTotal(dto.getPrecioTotal());
        credito.setMinimo(dto.getMinimo());
        credito.setMaximo(dto.getMaximo());
        credito.setPagoHastaAhora(dto.getPagoHastaAhora());

        if (dto.getVentas() != null) {
            credito.setVentas(
                    dto.getVentas().stream()
                            .map(ventaDto -> mapToEntityVenta(ventaDto, processed))
                            .filter(Objects::nonNull)
                            .toList()
            );

            // Mantener bidireccionalidad
            credito.getVentas().forEach(venta -> venta.setCredito(credito));
        }

        if (dto.getCliente() != null) {
            credito.setCliente(mapToEntityCliente(dto.getCliente(), processed));
            credito.getCliente().setCredito(credito);
        }

        return credito;
    }

    public ClienteDto mapToDtoCliente(Cliente cliente) {
        return mapToDtoCliente(cliente, new HashSet<>());
    }

    private ClienteDto mapToDtoCliente(Cliente cliente, Set<Object> processed) {
        if (cliente == null || processed.contains(cliente)) {
            return null;
        }
        processed.add(cliente);

        ClienteDto dto = new ClienteDto();
        dto.setId(cliente.getId());
        dto.setNombre(cliente.getNombre());
        dto.setTelefono(cliente.getTelefono());
        dto.setActivo(cliente.isActivo());

        if (cliente.getCredito() != null) {
            dto.setCredito(mapToDtoCredito(cliente.getCredito(), processed));
        }

        return dto;
    }

    public Cliente mapToEntityCliente(ClienteDto clienteDto) {
        return mapToEntityCliente(clienteDto, new HashSet<>());
    }

    private Cliente mapToEntityCliente(ClienteDto clienteDto, Set<Object> processed) {
        if (clienteDto == null || processed.contains(clienteDto)) {
            return null;
        }
        processed.add(clienteDto);

        // Si tiene id
        if (clienteDto.getId() != null) {
            Optional<Cliente> clienteExistente = clienteRepository.findById(clienteDto.getId());
            if (clienteExistente.isPresent()) {

                return clienteExistente.get();
            }
        }

        Cliente cliente = new Cliente();
        cliente.setNombre(clienteDto.getNombre());
        cliente.setTelefono(clienteDto.getTelefono());
        cliente.setActivo(clienteDto.isActivo());

        if (clienteDto.getCredito() != null) {
            cliente.setCredito(mapToEntityCredito(clienteDto.getCredito(), processed));
        }

        return cliente;
    }

    public ProveedorDto mapToDtoProveedor(Proveedor proveedor) {
        return mapToDtoProveedor(proveedor, new HashSet<>());
    }

    private ProveedorDto mapToDtoProveedor(Proveedor proveedor, Set<Object> processed) {
        if (proveedor == null || processed.contains(proveedor)) {
            return null;
        }
        processed.add(proveedor);

        ProveedorDto dto = new ProveedorDto();
        dto.setId(proveedor.getId());
        dto.setNombre(proveedor.getNombre());
        dto.setTelefono(proveedor.getTelefono());
        dto.setActivo(proveedor.isActivo());
        dto.setCorreo(proveedor.getCorreo());

        if (proveedor.getProductos() != null) {
            dto.setProductosDto(
                    proveedor.getProductos().stream()
                            .map(prod -> mapToDtoProducto(prod, processed))
                            .filter(Objects::nonNull)
                            .toList()
            );
        }

        return dto;
    }


    public Proveedor mapToEntityProveedor(ProveedorDto proveedorDto) {
        return mapToEntityProveedor(proveedorDto, new HashSet<>());
    }

    private Proveedor mapToEntityProveedor(ProveedorDto proveedorDto, Set<Object> processed) {
        if (proveedorDto == null || processed.contains(proveedorDto)) {
            return null;
        }
        processed.add(proveedorDto);

        // Si tiene id
        if (proveedorDto.getId() != null) {
            Optional<Proveedor> provExistente = proveedorRepository.findById(proveedorDto.getId());
            if (provExistente.isPresent()) {
                return provExistente.get();
            }
        }
        
        Proveedor proveedor = new Proveedor();
        proveedor.setNombre(proveedorDto.getNombre());
        proveedor.setTelefono(proveedorDto.getTelefono());
        proveedor.setActivo(proveedorDto.isActivo());
        proveedor.setCorreo(proveedorDto.getCorreo());

        if (proveedorDto.getProductosDto() != null) {
            proveedor.setProductos(
                    proveedorDto.getProductosDto().stream()
                            .map(prod -> mapToEntityProducto(prod, processed))
                            .filter(Objects::nonNull)
                            .toList()
            );
            proveedor.getProductos().forEach(producto -> producto.setProveedor(proveedor));
        }

        return proveedor;
    }

    public LoteDto mapToDtoLote(Lote lote) {
        return mapToDtoLote(lote, new HashSet<>());
    }

    private LoteDto mapToDtoLote(Lote lote, Set<Object> processed) {
        if (lote == null || processed.contains(lote)) {
            return null;
        }
        processed.add(lote);

        LoteDto dto = new LoteDto();
        dto.setId(lote.getId());
        dto.setNumeLote(lote.getNumero());
        dto.setStock(lote.getStock());
        dto.setFechaVencimiento(lote.getFechaVencimiento());
        dto.setPrecioCompra(lote.getPrecioCompra());
        dto.setActivo(lote.getActivo());

        if (lote.getProducto() != null) {
            dto.setProducto(mapToDtoProducto(lote.getProducto(), processed));
        }

        return dto;
    }

    public Lote mapToEntityLote(LoteDto dto) {
        return mapToEntityLote(dto, new HashSet<>());
    }

    private Lote mapToEntityLote(LoteDto dto, Set<Object> processed) {
        if (dto == null || processed.contains(dto)) {
            return null;
        }
        processed.add(dto);
        Lote lote = null;
        if (dto.getId() != null){
            lote = loteRepository.findById(dto.getId()).orElse(null);
        }
        // Buscar lote existente por id
        if (lote != null) {
            return lote;
        }
        lote = new Lote();
        lote.setNumero(dto.getNumeLote());
        lote.setStock(dto.getStock());
        lote.setFechaVencimiento(dto.getFechaVencimiento());
        lote.setPrecioCompra(dto.getPrecioCompra());
        lote.setActivo(dto.getActivo());

        if (dto.getProducto() != null) {
            lote.setProducto(mapToEntityProducto(dto.getProducto(), processed));
        }

        return lote;
    }



    // Esto no se va a usar, las notificaciones siempre son entidades.

    public Notificacion mapToEntityNotificacion(NotificacionDto notificacionDto){

        // Si tiene id
        if (notificacionDto.getId() != null) {
            Optional<Notificacion> notiExistente = notificacionRepository.findById(notificacionDto.getId());
            if (notiExistente.isPresent()) {
                return notiExistente.get();
            }
        }

        Notificacion notificacion = new Notificacion();
        notificacion.setId(notificacionDto.getId());
        notificacion.setTitulo(notificacionDto.getTitulo());
        notificacion.setMensaje(notificacionDto.getMensaje());

        return notificacion;
    }

    public NotificacionDto mapToDtoNotificacion(Notificacion notificacion) {

        NotificacionDto notiDto = new NotificacionDto();
        notiDto.setId(notificacion.getId());
        notiDto.setMensaje(notificacion.getMensaje());
        notiDto.setTitulo(notificacion.getTitulo());
        notiDto.setFechaHora(notificacion.getFechaHora());

        return notiDto;
    }

    public UsuarioDto mapToDtoUsuario(Usuario usuario) {
        return mapToDtoUsuario(usuario, new HashSet<>());
    }

    private UsuarioDto mapToDtoUsuario(Usuario usuario, Set<Object> processed) {
        if (usuario == null || processed.contains(usuario)) {
            return null;
        }
        processed.add(usuario);

        UsuarioDto usuarioDto = new UsuarioDto();
        usuarioDto.setMail(usuario.getMail());
        usuarioDto.setContrasenia(usuario.getContrasenia());
        usuarioDto.setNombre(usuario.getNombre());
        usuarioDto.setActivo(usuario.getActivo());

        usuarioDto.setRoles(
                usuario.getRoles().stream()
                        .map(rol -> mapToDtoRoles(rol, processed))
                        .filter(Objects::nonNull)
                        .toList()
        );

        if (usuario.getVentas() != null) {
            usuarioDto.setVentas(
                    usuario.getVentas().stream()
                            .map(venta -> mapToDtoVenta(venta, processed))
                            .filter(Objects::nonNull)
                            .toList()
            );
        }

        return usuarioDto;
    }

    public Usuario mapToEntityUsuario(UsuarioDto usuarioDto) {
        return mapToEntityUsuario(usuarioDto, new HashSet<>());
    }

    private Usuario mapToEntityUsuario(UsuarioDto usuarioDto, Set<Object> processed) {
        if (usuarioDto == null || processed.contains(usuarioDto)) {
            return null;
        }
        processed.add(usuarioDto);        // Si tiene username
        if (usuarioDto.getNombre() != null) {
            Optional<Usuario> usuarioExistente = usuarioRepository.findByNombreIgnoreCase(usuarioDto.getNombre());
            if (usuarioExistente.isPresent()) {
                return usuarioExistente.get();
            }
        }

        Usuario usuario = new Usuario();
        usuario.setMail(usuarioDto.getMail());
        usuario.setContrasenia(usuarioDto.getContrasenia());
        usuario.setNombre(usuarioDto.getNombre());
        usuario.setActivo(usuarioDto.getActivo());

        if (usuarioDto.getRoles() != null) {
            usuario.setRoles(usuarioDto.getRoles().stream()
                    .map(rolDto -> mapToEntityRoles(rolDto, processed))
                    .filter(Objects::nonNull)
                    .toList());
        }

        if (usuarioDto.getVentas() != null) {
            usuario.setVentas(
                    usuarioDto.getVentas().stream()
                            .map(venta -> mapToEntityVenta(venta, processed))
                            .filter(Objects::nonNull)
                            .toList()
            );
            usuario.getVentas().forEach(venta -> venta.setUsuario(usuario));
        }

        if (usuarioDto.getNotificaciones() != null) {
            usuario.setNotificaciones(
                    usuarioDto.getNotificaciones().stream()
                            .map(noti -> mapToEntityNotificacionUsuario(noti, processed))
                            .filter(Objects::nonNull)
                            .toList()
            );

        }
        return usuario;
    }

    public RolUsuario mapToEntityRoles(RolUsuarioDto rolDto) {
        return mapToEntityRoles(rolDto, new HashSet<>());
    }

    private RolUsuario mapToEntityRoles(RolUsuarioDto rolDto, Set<Object> processed) {
        if (rolDto == null || processed.contains(rolDto)) {
            return null;
        }
        processed.add(rolDto);

        // Si tiene username
        if (rolDto.getId() != null) {
            Optional<RolUsuario> rolExistente = rolUsuarioRepository.findById(rolDto.getId());
            if (rolExistente.isPresent()) {
                return rolExistente.get();
            }
        }

        RolUsuario rol = new RolUsuario();
        rol.setNombre(rolDto.getNombre());


        rol.setUsuarios(
                Optional.ofNullable(rolDto.getUsuarios())
                        .orElse(Collections.emptyList())
                        .stream()
                        .map(userDto -> mapToEntityUsuario(userDto, processed))
                        .toList()
        );
        rol.getUsuarios().forEach(usuario -> {
            if (!usuario.getRoles().contains(rol)) {
                usuario.getRoles().add(rol);
            }
        });


        return rol;
    }

    public RolUsuarioDto mapToDtoRoles(RolUsuario rol) {
        return mapToDtoRoles(rol, new HashSet<>());
    }

    private RolUsuarioDto mapToDtoRoles(RolUsuario rol, Set<Object> processed) {
        if (rol == null || processed.contains(rol)) {
            return null;
        }
        processed.add(rol);

        RolUsuarioDto rolDto = new RolUsuarioDto();
        rolDto.setId(rol.getId());
        rolDto.setNombre(rol.getNombre());
        rolDto.setUsuarios(rol.getUsuarios().stream()
                .map(user -> mapToDtoUsuario(user, processed))
                .toList());
        return rolDto;
    }



    public NotificacionUsuarioDto mapToDtoNotificacionUsuario (NotificacionUsuario notificacionUsuario) {
        return mapToDtoNotificacionUsuario(notificacionUsuario, new HashSet<>());
    }

    private NotificacionUsuarioDto mapToDtoNotificacionUsuario(NotificacionUsuario notificacionUsuario, Set<Object> processed) {
        if (notificacionUsuario == null || processed.contains(notificacionUsuario)) {
            return null;
        }
        processed.add(notificacionUsuario);

        NotificacionUsuarioDto notificacionUsuarioDto = new NotificacionUsuarioDto();
        notificacionUsuarioDto.setId(notificacionUsuario.getId());
        notificacionUsuarioDto.setActivo(notificacionUsuario.getActivo());
        notificacionUsuarioDto.setLeido(notificacionUsuario.getLeido());

        /*if (notificacionUsuario.getUsuarios() != null) {
            notificacionUsuarioDto.setUsuarios(
                    notificacionUsuario.getUsuarios().stream()
                            .map(e -> mapToDtoUsuario(e, processed))
                            .filter(Objects::nonNull)
                            .toList()
            );
        }*/

        if (notificacionUsuario.getNotificaciones() != null) {
            notificacionUsuarioDto.setNotificaciones(
                    notificacionUsuario.getNotificaciones().stream()
                            .map(e -> mapToDtoNotificacion(e))
                            .filter(Objects::nonNull)
                            .toList()
            );
        }

        return notificacionUsuarioDto;
    }


    public NotificacionUsuario mapToEntityNotificacionUsuario (NotificacionUsuarioDto notificacionUsuariodto) {
        return mapToEntityNotificacionUsuario(notificacionUsuariodto, new HashSet<>());
    }
    private NotificacionUsuario mapToEntityNotificacionUsuario(NotificacionUsuarioDto notificacionUsuarioDto, Set<Object> processed) {
        // Verificar si el DTO es nulo o ya fue procesado
        if (notificacionUsuarioDto == null || processed.contains(notificacionUsuarioDto)) {
            return null;
        }

        processed.add(notificacionUsuarioDto);

        // Si tiene id, buscar entidad existente
        if (notificacionUsuarioDto.getId() != null) {
            Optional<NotificacionUsuario> notiExistente = notificacionUsuarioRepository.findById(notificacionUsuarioDto.getId());
            if (notiExistente.isPresent()) {
                return notiExistente.get();
            }
        }

        NotificacionUsuario notificacionUsuario = new NotificacionUsuario();
        notificacionUsuario.setId(notificacionUsuarioDto.getId());
        notificacionUsuario.setActivo(notificacionUsuarioDto.getActivo());
        notificacionUsuario.setLeido(notificacionUsuarioDto.getLeido());


        if (notificacionUsuarioDto.getUsuarios() != null) {
            notificacionUsuario.setUsuarios(
                    notificacionUsuarioDto.getUsuarios().stream()
                            .map(e -> mapToEntityUsuario(e, processed))
                            .filter(Objects::nonNull)
                            .collect(Collectors.toList())
            );


            notificacionUsuario.getUsuarios().forEach(usuario -> {
                if (usuario != null) {
                    if (usuario.getNotificaciones() == null) {
                        usuario.setNotificaciones(new ArrayList<>());
                    }
                    if (!usuario.getNotificaciones().contains(notificacionUsuario)) {
                        usuario.getNotificaciones().add(notificacionUsuario);
                    }
                }
            });
        }


        /*
        if (notificacionUsuarioDto.getNotificaciones() != null) {
            notificacionUsuario.setNotificaciones(
                    notificacionUsuarioDto.getNotificaciones().stream()
                            .map(e -> mapToEntityNotificacion(e, processed))
                            .filter(Objects::nonNull)
                            .collect(Collectors.toList())
            );
        }*/

        return notificacionUsuario;
    }

    public ComboDto mapToDtoCombo(Combo combo) {
        return mapToDtoCombo(combo, new HashSet<>());
    }

    public ComboDto mapToDtoCombo(Combo combo, Set<Object> processed) {
        if (combo == null || processed.contains(combo)) {
            return null;
        }
        processed.add(combo);

        ComboDto dto = new ComboDto();
        dto.setInicio(combo.getInicio());
        dto.setFin(combo.getFin());
        dto.setId(combo.getId());
        dto.setDescripcion(combo.getDescripcion());
        dto.setDescuento(combo.getDescuento());
        dto.setProductos(combo.getProductos().stream()
                .map(producto -> mapToDtoProducto(producto, processed))
                .collect(Collectors.toList()));
        dto.setActivo(combo.getActivo());
        return dto;
    }

    public Combo mapToEntityCombo(ComboDto comboDto) {
        return mapToEntityCombo(comboDto, new HashSet<>());
    }

    private Combo mapToEntityCombo(ComboDto comboDto, Set<Object> processed) {
        if (comboDto == null || processed.contains(comboDto)) {
            return null;
        }
        processed.add(comboDto);

        // Si tiene id
        if (comboDto.getId() != null) {
            Optional<Combo> comboExistente = comboRepository.findById(comboDto.getId());
            if (comboExistente.isPresent()) {
                return comboExistente.get();
            }
        }


        Combo combo = new Combo();
        combo.setInicio(comboDto.getInicio());
        combo.setFin(comboDto.getFin());
        combo.setDescuento(comboDto.getDescuento());
        combo.setActivo(comboDto.getActivo());
        combo.setDescripcion(comboDto.getDescripcion());

        if (comboDto.getProductos() != null) {
            combo.setProductos(
                    comboDto.getProductos().stream()
                            .map(productoDto -> mapToEntityProducto(productoDto, processed))
                            .filter(Objects::nonNull)
                            .collect(Collectors.toList())
            );
            combo.getProductos().forEach(producto -> {
                if (!producto.getCombos().contains(combo)) {
                    producto.getCombos().add(combo);
                }
            });
        }

        return combo;
    }

    public DescuentoDto mapToDtoDescuento(Descuento descuento) {
        return mapToDtoDescuento(descuento, new HashSet<>());
    }

    public DescuentoDto mapToDtoDescuento(Descuento descuento, Set<Object> processed) {
        if (descuento == null || processed.contains(descuento)) {
            return null;
        }
        processed.add(descuento);

        DescuentoDto dto = new DescuentoDto();
        dto.setInicio(descuento.getInicio());
        dto.setFin(descuento.getFin());
        dto.setId(descuento.getId());
        dto.setDescuento(descuento.getDescuento());
        if (descuento.getProducto() != null) {
            dto.setProducto(mapToDtoProducto(descuento.getProducto(), processed));
        }
        dto.setActivo(descuento.getActivo());
        return dto;
    }

    public Descuento mapToEntityDescuento(DescuentoDto descuentoDto) {
        return mapToEntityDescuento(descuentoDto, new HashSet<>());
    }

    private Descuento mapToEntityDescuento(DescuentoDto descuentoDto, Set<Object> processed) {
        if (descuentoDto == null || processed.contains(descuentoDto)) {
            return null;
        }
        processed.add(descuentoDto);

        // Si tiene id
        if (descuentoDto.getId() != null) {
            Optional<Descuento> descExistente = descuentoRepository.findById(descuentoDto.getId());
            if (descExistente.isPresent()) {
                return descExistente.get();
            }
        }

        Descuento descuento = new Descuento();
        descuento.setInicio(descuentoDto.getInicio());
        descuento.setFin(descuentoDto.getFin());
        descuento.setDescuento(descuentoDto.getDescuento());
        descuento.setActivo(descuentoDto.getActivo());

        if (descuentoDto.getProducto() != null) {
            descuento.setProducto(mapToEntityProducto(descuentoDto.getProducto(), processed));
        }

        return descuento;
    }

    public PromocionDto mapToDtoPromocion(Promocion promocion) {
        return mapToDtoPromocion(promocion, new HashSet<>());
    }

    public PromocionDto mapToDtoPromocion(Promocion promocion, Set<Object> processed) {
        if (promocion == null || processed.contains(promocion)) {
            return null;
        }
        processed.add(promocion);

        PromocionDto dto = new PromocionDto();
        dto.setId(promocion.getId());
        dto.setInicio(promocion.getInicio());
        dto.setFin(promocion.getFin());
        dto.setDescripcion(promocion.getDescripcion());
        dto.setDescuento(promocion.getDescuento());
        if (promocion.getProducto() != null) {
            dto.setProducto(mapToDtoProducto(promocion.getProducto(), processed));
        }
        dto.setActivo(promocion.getActivo());
        return dto;
    }

    public Promocion mapToEntityPromocion(PromocionDto promocionDto) {
        return mapToEntityPromocion(promocionDto, new HashSet<>());
    }

    private Promocion mapToEntityPromocion(PromocionDto promocionDto, Set<Object> processed) {
        if (promocionDto == null || processed.contains(promocionDto)) {
            return null;
        }
        processed.add(promocionDto);

        // Si tiene id
        if (promocionDto.getId() != null) {
            Optional<Promocion> promoExistente = promocionRepository.findById(promocionDto.getId());
            if (promoExistente.isPresent()) {
                return promoExistente.get();
            }
        }


        Promocion promocion = new Promocion();
        promocion.setInicio(promocionDto.getInicio());
        promocion.setFin(promocionDto.getFin());
        promocion.setDescuento(promocionDto.getDescuento());
        promocion.setActivo(promocionDto.getActivo());
        promocion.setDescripcion(promocionDto.getDescripcion());

        if (promocionDto.getProducto() != null) {
            promocion.setProducto(mapToEntityProducto(promocionDto.getProducto(), processed));
        }

        return promocion;
    }

    public Producto mapToEntityProducto(ProductoDto productoDto) {
        return mapToEntityProducto(productoDto, new HashSet<>());
    }

    private Producto mapToEntityProducto(ProductoDto productoDto, Set<Object> processed) {
        if (productoDto == null || processed.contains(productoDto)) {
            return null;
        }
        processed.add(productoDto);


        // Si tiene id
        if (productoDto.getId() != null) {
            Optional<Producto> prodExistente = productoRepository.findById(productoDto.getId());
            if (prodExistente.isPresent()) {
                return prodExistente.get();
            }
        }

        Producto producto = new Producto();
        producto.setPrecioCompra(productoDto.getPrecioCompra());
        producto.setPrecioVenta(productoDto.getPrecioVenta());
        producto.setCodigoDeBarra(productoDto.getCodigoDeBarra());
        producto.setStockMin(productoDto.getStockMin());
        producto.setStockTotal(productoDto.getStockTotal());
        producto.setActivo(productoDto.getActivo());
        producto.setNombre(productoDto.getNombre());
        producto.setImagen(productoDto.getImagen());

        if (productoDto.getCombos() != null) {
            producto.setCombos(
                    productoDto.getCombos().stream()
                            .map(e -> mapToEntityCombo(e, processed))
                            .filter(Objects::nonNull)
                            .toList()
            );
        }

        if (productoDto.getProveedor() != null) {
            producto.setProveedor(mapToEntityProveedor(productoDto.getProveedor(), processed));
        }

        if (productoDto.getCategoria() != null) {
            producto.setCategoria(mapToEntityCategoria(productoDto.getCategoria(), processed));

            if (producto.getCategoria().getProductos() == null) {
                producto.getCategoria().setProductos(new ArrayList<>());
            }

            producto.getCategoria().getProductos().add(producto);

        }

        if (productoDto.getLotes() != null) {
            producto.setLotes(
                    productoDto.getLotes().stream()
                            .map(e -> mapToEntityLote(e, processed))
                            .filter(Objects::nonNull)
                            .toList()
            );

            // Mantener bidireccionalidad
            producto.getLotes().forEach(lote -> lote.setProducto(producto));
        }

        if (productoDto.getPromociones() != null) {
            producto.setPromociones(
                    productoDto.getPromociones().stream()
                            .map(e -> mapToEntityPromocion(e, processed))
                            .filter(Objects::nonNull)
                            .toList()
            );

            // Mantener bidireccionalidad
            producto.getPromociones().forEach(promocion -> promocion.setProducto(producto));
        }

        if (productoDto.getDescuentos() != null) {
            producto.setDescuentos(
                    productoDto.getDescuentos().stream()
                            .map(e -> mapToEntityDescuento(e, processed))
                            .filter(Objects::nonNull)
                            .toList()
            );

            // Mantener bidireccionalidad
            producto.getDescuentos().forEach(descuento -> descuento.setProducto(producto));
        }

        if (productoDto.getCantidades() != null) {
            producto.setCantidades(
                    productoDto.getCantidades().stream()
                            .map(e -> mapToEntityCantidad(e, processed))
                            .filter(Objects::nonNull)
                            .toList()
            );

            // Mantener bidireccionalidad
            producto.getCantidades().forEach(cantidad -> cantidad.setProducto(producto));
        }

        return producto;
    }


    public ProductoDto mapToDtoProducto(Producto producto) {
        return mapToDtoProducto(producto, new HashSet<>());
    }

    public ProductoDto mapToDtoProducto (Producto producto, Set<Object> processed){
        if (producto == null || processed.contains(producto)) {
            return null;
        }
        processed.add(producto);

        ProductoDto productoDto = new ProductoDto();
        productoDto.setId(producto.getId());
        productoDto.setPrecioCompra(producto.getPrecioCompra());
        productoDto.setPrecioVenta(producto.getPrecioVenta());
        productoDto.setCodigoDeBarra(producto.getCodigoDeBarra());
        productoDto.setStockMin(producto.getStockMin());
        productoDto.setStockTotal(producto.getStockTotal());
        productoDto.setActivo(producto.getActivo());
        productoDto.setNombre(producto.getNombre());
        productoDto.setImagen(producto.getImagen());

        if (producto.getCombos() != null) {
            productoDto.setCombos(
                    producto.getCombos().stream()
                            .map(e -> mapToDtoCombo(e, processed))
                            .toList()
            );
        }

        if (producto.getProveedor() != null) {
            productoDto.setProveedor(mapToDtoProveedor(producto.getProveedor(), processed));
        }

        if (producto.getLotes() != null) {
            productoDto.setLotes(
                    producto.getLotes().stream()
                            .filter(lote -> lote.getActivo())
                            .map(e -> mapToDtoLote(e, processed))
                            .toList()
            );
        }

        if (producto.getPromociones() != null) {
            productoDto.setPromociones(
                    producto.getPromociones().stream()
                            .map(e -> mapToDtoPromocion(e, processed))
                            .toList()
            );
        }

        if (producto.getDescuentos() != null) {
            productoDto.setDescuentos(
                    producto.getDescuentos().stream()
                            .map(e -> mapToDtoDescuento(e, processed))
                            .toList()
            );
        }


        if (producto.getCantidades() != null) {
            productoDto.setCantidades(
                    producto.getCantidades().stream()
                            .map(e -> mapToDtoCantidad(e, processed))
                            .toList()
            );
        }

        if (producto.getCategoria() != null) {
            productoDto.setCategoria(mapToDtoCategoria(producto.getCategoria(), processed));
        }

        return productoDto;

    }

    public ComboDto mapToDtoComboSimple(Combo combo) {
        if (combo == null) {
            return null;
        }

        ComboDto dto = new ComboDto();
        dto.setId(combo.getId());
        dto.setDescripcion(combo.getDescripcion());
        dto.setDescuento(combo.getDescuento());
        dto.setActivo(combo.getActivo());
        dto.setInicio(combo.getInicio());
        dto.setFin(combo.getFin());

        if (combo.getProductos() != null) {
            dto.setProductos(combo.getProductos().stream()
                    .map(this::mapToDtoProductoSimple)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    // combo sin productos
    public ComboDto mapToDtoComboSinProductos(Combo combo) {
        if (combo == null) {
            return null;
        }

        ComboDto dto = new ComboDto();
        dto.setId(combo.getId());
        dto.setDescripcion(combo.getDescripcion());
        dto.setDescuento(combo.getDescuento());
        dto.setActivo(combo.getActivo());
        dto.setInicio(combo.getInicio());
        dto.setFin(combo.getFin());
        return dto;
    }

    public PromocionDto mapToDtoPromocionSimple(Promocion promocion){
        if (promocion == null) {
            return null;
        }

        PromocionDto dto = new PromocionDto();
        dto.setId(promocion.getId());
        dto.setDescripcion(promocion.getDescripcion());
        dto.setDescuento(promocion.getDescuento());
        dto.setActivo(promocion.getActivo());
        dto.setInicio(promocion.getInicio());
        dto.setFin(promocion.getFin());

        if (promocion.getProducto() != null) {
            dto.setProducto(mapToDtoProductoSimple(promocion.getProducto()));
        }
        return dto;
    }

    // promoción sin producto
    public PromocionDto mapToDtoPromocionSinProducto(Promocion promocion){
        if (promocion == null) {
            return null;
        }

        PromocionDto dto = new PromocionDto();
        dto.setId(promocion.getId());
        dto.setDescripcion(promocion.getDescripcion());
        dto.setDescuento(promocion.getDescuento());
        dto.setActivo(promocion.getActivo());
        dto.setInicio(promocion.getInicio());
        dto.setFin(promocion.getFin());
        return dto;
    }

    public DescuentoDto mapToDtoDescuentoSimple(Descuento descuento){
        if (descuento == null) {
            return null;
        }

        DescuentoDto dto = new DescuentoDto();
        dto.setId(descuento.getId());
        dto.setDescuento(descuento.getDescuento());
        dto.setActivo(descuento.getActivo());
        dto.setInicio(descuento.getInicio());
        dto.setFin(descuento.getFin());

        if (descuento.getProducto() != null) {
            dto.setProducto(mapToDtoProductoSimple(descuento.getProducto()));
        }

        return dto;
    }

    // descuento sin producto
    public DescuentoDto mapToDtoDescuentoSinProducto(Descuento descuento){
        if (descuento == null) {
            return null;
        }

        DescuentoDto dto = new DescuentoDto();
        dto.setId(descuento.getId());
        dto.setDescuento(descuento.getDescuento());
        dto.setActivo(descuento.getActivo());
        dto.setInicio(descuento.getInicio());
        dto.setFin(descuento.getFin());
        // NO incluir producto para evitar referencias circulares
        return dto;
    }

    public ProductoDto mapToDtoProductoSimple(Producto producto) {
        if (producto == null) {
            return null;
        }

        ProductoDto dto = new ProductoDto();

        dto.setId(producto.getId());
        dto.setCodigoDeBarra(producto.getCodigoDeBarra());
        dto.setNombre(producto.getNombre());
        dto.setPrecioCompra(producto.getPrecioCompra());
        dto.setPrecioVenta(producto.getPrecioVenta());

        // ofertas sin productos
        if (producto.getCombos() != null) {
            dto.setCombos(producto.getCombos().stream()
                    .map(this::mapToDtoComboSinProductos)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList()));
        }

        if (producto.getPromociones() != null) {
            dto.setPromociones(producto.getPromociones().stream()
                    .map(this::mapToDtoPromocionSinProducto)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList()));
        }

        if (producto.getDescuentos() != null) {
            dto.setDescuentos(producto.getDescuentos().stream()
                    .map(this::mapToDtoDescuentoSinProducto)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    
    public CantidadDto mapToDtoCantidadSimple(Cantidad cantidad) {
        if (cantidad == null) {
            return null;
        }

        CantidadDto dto = new CantidadDto();
        dto.setId(cantidad.getId());
        dto.setPrecioActual(cantidad.getPrecioActual());
        dto.setCantidad(cantidad.getCantidad());
        if (cantidad.getProducto() != null) {
            dto.setProducto(mapToDtoProductoSimple(cantidad.getProducto()));
        }
    return dto;
    }


    public CantidadDto mapToDtoCantidad(Cantidad cantidad) {
        return mapToDtoCantidad(cantidad, new HashSet<>());
    }
    public CantidadDto mapToDtoCantidad(Cantidad cantidad, Set<Object> processed) {
        if (cantidad == null || processed.contains(cantidad)) {
            return null;
        }
        processed.add(cantidad);

        CantidadDto dto = new CantidadDto();

        dto.setId(cantidad.getId());
        dto.setPrecioActual(cantidad.getPrecioActual());
        dto.setCantidad(cantidad.getCantidad());
        if (cantidad.getProducto() != null) {
            dto.setProducto(mapToDtoProducto(cantidad.getProducto(), processed));
        }

        if (cantidad.getVenta() != null) {
            dto.setVenta(mapToDtoVenta(cantidad.getVenta(), processed));
        }
        return dto;
    }

    public Cantidad mapToEntityCantidad(CantidadDto dto) {
        return mapToEntityCantidad(dto, new HashSet<>());
    }



    private Cantidad mapToEntityCantidad(CantidadDto dto, Set<Object> processed) {
        if (dto == null || processed.contains(dto)) {
            return null;
        }
        processed.add(dto);

        //no creo que sea realmente necesario ya que solo se usa para crear las cantidades en la venta
        // Si tiene id
        if (dto.getId() != null) {
            Optional<Cantidad> cantExistente = cantidadRepository.findById(dto.getId());
            if (cantExistente.isPresent()) {
                return cantExistente.get();
            }
        }

        Cantidad cantidad = new Cantidad();
        cantidad.setPrecioActual(dto.getPrecioActual());
        cantidad.setId(dto.getId());
        cantidad.setCantidad(dto.getCantidad());

        if (dto.getProducto() != null) {
            cantidad.setProducto(mapToEntityProducto(dto.getProducto(), processed));
        }

        if (dto.getVenta() != null) {
            cantidad.setVenta(mapToEntityVenta(dto.getVenta(), processed));
        }

        return cantidad;
    }

    public VentaDto mapToDtoVenta(Venta venta) {
        return mapToDtoVenta(venta, new HashSet<>());
    }

    public VentaDto mapToDtoVenta(Venta venta, Set<Object> processed) {
        if (venta == null || processed.contains(venta)) {
            return null;
        }
        processed.add(venta);

        VentaDto dto = new VentaDto();

        dto.setFinalizada(venta.getFinalizada());
        dto.setFormaPago(venta.getFormaPago());
        dto.setId(venta.getId());
        dto.setFechaVenta(venta.getFechaVenta());
        dto.setTotal(venta.getTotal());
        dto.setActivo(venta.getActivo());
        dto.setUsuario(venta.getUsuario() != null ? venta.getUsuario().getNombre() : null);

        if (venta.getCredito() != null) {
            dto.setCredito(mapToDtoCredito(venta.getCredito(), processed));
        }

        if (venta.getCantidades() != null) {
            dto.setCantidades(venta.getCantidades().stream()
                    .map(e -> mapToDtoCantidad(e, processed))
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    public Venta mapToEntityVenta(VentaDto dto) {
        return mapToEntityVenta(dto, new HashSet<>());
    }

    private Venta mapToEntityVenta(VentaDto dto, Set<Object> processed) {
        if (dto == null || processed.contains(dto)) {
            return null;
        }
        processed.add(dto);

        // Si tiene id
        if (dto.getId() != null) {
            Optional<Venta> ventaExistente = ventaRepository.findById(dto.getId());
            if (ventaExistente.isPresent()) {
                return ventaExistente.get();
            }
        }

        Venta venta = new Venta();
        venta.setFinalizada(dto.getFinalizada());
        venta.setFormaPago(dto.getFormaPago());
        venta.setFechaVenta(dto.getFechaVenta());
        venta.setTotal(dto.getTotal());
        venta.setActivo(dto.getActivo());

        if (dto.getUsuario() != null) {

            venta.setUsuario(usuarioRepository.findByNombre(dto.getUsuario()).orElse(null));
            // Mantener bidireccionalidad
            if (venta.getUsuario() != null) {
                venta.getUsuario().getVentas().add(venta);
            }
        }

        if (dto.getCredito() != null) {
            venta.setCredito(mapToEntityCredito(dto.getCredito(), processed));
        }

        if (dto.getCantidades() != null) {
            venta.setCantidades(dto.getCantidades().stream()
                    .map(c -> mapToEntityCantidad(c, processed))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList()));

            // Mantener bidireccionalidad
            venta.getCantidades().forEach(c -> c.setVenta(venta));
        }

        return venta;
    }


}
