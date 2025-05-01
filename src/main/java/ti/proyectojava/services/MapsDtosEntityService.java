package ti.proyectojava.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ti.proyectojava.business.entities.*;
import ti.proyectojava.dtos.*;

import java.util.Collections;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.HashSet;
import java.util.Set;

@Service
@Slf4j
public class MapsDtosEntityService {

    public CategoriaDto mapToDtoCategoria(Categoria categoria) {
        return mapToDtoCategoria(categoria, new HashSet<>());
    }

    private CategoriaDto mapToDtoCategoria(Categoria categoria, Set<Categoria> processed) {
        if (categoria == null || processed.contains(categoria)) {
            return null;
        }
        processed.add(categoria);

        CategoriaDto catDto = new CategoriaDto();
        catDto.setNombre(categoria.getNombre());

        if (categoria.getProductos() != null) {
            catDto.setProductos(
                    categoria.getProductos().stream()
                            .map(this::mapToDtoProducto)
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
                            .toList()
            );
        }
        return catDto;
    }

    public Categoria mapToEntityCategoria(CategoriaDto catDto) {
        return mapToEntityCategoria(catDto, new HashSet<>());
    }

    private Categoria mapToEntityCategoria(CategoriaDto catDto, Set<CategoriaDto> processed) {
        if (catDto == null || processed.contains(catDto)) {
            return null;
        }
        processed.add(catDto);

        Categoria categoria = new Categoria();
        categoria.setNombre(catDto.getNombre());

        if (catDto.getProductos() != null) {
            categoria.setProductos(
                    catDto.getProductos().stream()
                            .map(this::mapToEntityProducto)
                            .toList()
            );
        }

        if (catDto.getCategoriaPadre() != null) {
            categoria.setCategoriaPadre(mapToEntityCategoria(catDto.getCategoriaPadre(), processed));
        }

        if (catDto.getSubcategorias() != null) {
            categoria.setSubcategorias(
                    catDto.getSubcategorias().stream()
                            .map(sub -> mapToEntityCategoria(sub, processed))
                            .toList()
            );
        }

        return categoria;
    }

    public CreditoDto mapToDtoCredito(Credito credito) {
        CreditoDto dto = new CreditoDto();

        dto.setId(credito.getId());
        dto.setPrecioTotal(credito.getPrecioTotal());
        dto.setMinimo(credito.getMinimo());
        dto.setMaximo(credito.getMaximo());
        dto.setPagoHastaAhora(credito.getPagoHastaAhora());

        if (credito.getCliente() != null) {
            dto.setCliente(mapToDtoCliente(credito.getCliente()));
        }

        return dto;
    }

    public Credito mapToEntityCredito(CreditoDto dto) {
        Credito credito = new Credito();

        credito.setId(dto.getId());
        credito.setPrecioTotal(dto.getPrecioTotal());
        credito.setMinimo(dto.getMinimo());
        credito.setMaximo(dto.getMaximo());
        credito.setPagoHastaAhora(dto.getPagoHastaAhora());

        if (dto.getCliente() != null) {
            credito.setCliente(mapToEntityCliente(dto.getCliente()));
        }

        return credito;
    }

    public ClienteDto mapToDtoCliente(Cliente cliente) {
        ClienteDto dto = new ClienteDto();
        dto.setId(cliente.getId());
        dto.setNombre(cliente.getNombre());
        dto.setTelefono(cliente.getTelefono());
        dto.setActivo(cliente.isActivo());
        return dto;
    }


    public Cliente mapToEntityCliente(ClienteDto clienteDto) {
        Cliente cliente = new Cliente();
        cliente.setId(clienteDto.getId());
        cliente.setNombre(clienteDto.getNombre());
        cliente.setTelefono(clienteDto.getTelefono());
        return cliente;
    }

    public ProveedorDto mapToDtoProveedor(Proveedor proveedor) {
        ProveedorDto dto = new ProveedorDto();
        dto.setId(proveedor.getId());
        dto.setNombre(proveedor.getNombre());
        dto.setTelefono(proveedor.getTelefono());
        dto.setActivo(proveedor.isActivo());
        dto.setCorreo(proveedor.getCorreo());
        return dto;
    }


    public Proveedor mapToEntityProveedor(ProveedorDto proveedorDto) {
        Proveedor proveedor = new Proveedor();
        proveedor.setId(proveedorDto.getId());
        proveedor.setNombre(proveedorDto.getNombre());
        proveedor.setTelefono(proveedorDto.getTelefono());
        return proveedor;
    }

    public LoteDto mapToDtoLote(Lote lote) {
        LoteDto dto = new LoteDto();
        dto.setId(lote.getId());
        dto.setNumeLote(lote.getNumero());
        dto.setStock(lote.getStock());
        dto.setFechaVencimiento(lote.getFechaVencimiento());
        dto.setPrecioCompra(lote.getPrecioCompra());
        dto.setActivo(lote.getActivo());
        return dto;
    }

    public Lote mapToEntityLote(LoteDto dto) {
        Lote lote = new Lote();
        lote.setId(dto.getId());
        lote.setNumero(dto.getNumeLote());
        lote.setStock(dto.getStock());
        lote.setFechaVencimiento(dto.getFechaVencimiento());
        lote.setPrecioCompra(dto.getPrecioCompra());
        lote.setActivo(dto.getActivo());
        return lote;
    }

    public Notificacion mapToEntityNotificacion(NotificacionDto notificacionDto){
        Notificacion notificacion = new Notificacion();
        notificacion.setId(notificacionDto.getId());
        notificacion.setMensajes(notificacionDto.getMensajes());

        return notificacion;
    }

    public NotificacionDto mapToDtoNotificacion(Notificacion notificacion) {

        NotificacionDto notiDto = new NotificacionDto();
        notiDto.setId(notificacion.getId());
        notiDto.setMensajes(notificacion.getMensajes());

        return notiDto;
    }

    public UsuarioDto mapToDtoUsuario(Usuario usuario) {
        return mapToDtoUsuario(usuario, new HashSet<>());
    }

    private UsuarioDto mapToDtoUsuario(Usuario usuario, Set<RolUsuario> processed) {
        if (usuario == null) {
            return null;
        }

        UsuarioDto usuarioDto = new UsuarioDto();
        usuarioDto.setMail(usuario.getMail());
        usuarioDto.setContrasenia(usuario.getContrasenia());
        usuarioDto.setNombre(usuario.getNombre());
        usuarioDto.setActivo(usuario.getActivo());
        usuarioDto.setRoles(usuario.getRoles().stream()
                .map(rol -> mapToDtoRoles(rol, processed))
                .toList());

        if (usuario.getVentas() != null){
            usuarioDto.setVentas(usuario.getVentas().stream()
                    .map(venta -> mapToDtoVentas(venta, processed))
                    .toList());
        }
        return usuarioDto;
    }

    public Usuario mapToEntityUsuario(UsuarioDto usuarioDto) {
        return mapToEntityUsuario(usuarioDto, new HashSet<>());
    }

    private Usuario mapToEntityUsuario(UsuarioDto usuarioDto, Set<RolUsuarioDto> processed) {
        if (usuarioDto == null) {
            return null;
        }

        Usuario usuario = new Usuario();
        usuario.setMail(usuarioDto.getMail());
        usuario.setContrasenia(usuarioDto.getContrasenia());
        usuario.setNombre(usuarioDto.getNombre());
        usuario.setActivo(usuarioDto.getActivo());
        usuario.setRoles(usuarioDto.getRoles().stream()
                .map(rolDto -> mapToEntityRoles(rolDto, processed))
                .toList());
        return usuario;
    }

    public RolUsuario mapToEntityRoles(RolUsuarioDto rolDto) {
        return mapToEntityRoles(rolDto, new HashSet<>());
    }

    private RolUsuario mapToEntityRoles(RolUsuarioDto rolDto, Set<RolUsuarioDto> processed) {
        if (rolDto == null || processed.contains(rolDto)) {
            return null;
        }
        processed.add(rolDto);

        RolUsuario rol = new RolUsuario();
        rol.setId(rolDto.getId());
        rol.setNombre(rolDto.getNombre());


        rol.setUsuarios(
                Optional.ofNullable(rolDto.getUsuarios())
                        .orElse(Collections.emptyList())
                        .stream()
                        .map(userDto -> mapToEntityUsuario(userDto, processed))
                        .toList()
        );

        return rol;
    }

    public RolUsuarioDto mapToDtoRoles(RolUsuario rol) {
        return mapToDtoRoles(rol, new HashSet<>());
    }

    private RolUsuarioDto mapToDtoRoles(RolUsuario rol, Set<RolUsuario> processed) {
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

    public NotificacionUsuarioDto mapToDtoNotificacionUsuario(NotificacionUsuario notificacionUsuario) {
        NotificacionUsuarioDto notificacionUsuarioDto = new NotificacionUsuarioDto();

        notificacionUsuarioDto.setId(notificacionUsuario.getId());
        notificacionUsuarioDto.setActivo(notificacionUsuario.getActivo());
        notificacionUsuarioDto.setLeido(notificacionUsuario.getLeido());

        if (notificacionUsuario.getUsuarios() != null) {
            notificacionUsuarioDto.setUsuarios(
                    notificacionUsuario.getUsuarios().stream()
                            .map(e -> mapToDtoUsuario(e))
                            .toList()
            );
        }

        if (notificacionUsuario.getNotificaciones() != null) {
            notificacionUsuarioDto.setNotificaciones(
                    notificacionUsuario.getNotificaciones().stream()
                            .map(e -> mapToDtoNotificacion(e))
                            .toList()
            );
        }

        return notificacionUsuarioDto;
    }

    public NotificacionUsuario mapToEntityNotificacionUsuario(NotificacionUsuarioDto notificacionUsuarioDto) {
        NotificacionUsuario notificacionUsuario = new NotificacionUsuario();

        notificacionUsuario.setId(notificacionUsuarioDto.getId());
        notificacionUsuario.setActivo(notificacionUsuarioDto.getActivo());
        notificacionUsuario.setLeido(notificacionUsuarioDto.getLeido());

        if (notificacionUsuarioDto.getUsuarios() != null) {
            notificacionUsuario.setUsuarios(
                    notificacionUsuarioDto.getUsuarios().stream()
                            .map(e -> mapToEntityUsuario(e))
                            .toList()
            );
        }

        if (notificacionUsuarioDto.getNotificaciones() != null) {
            notificacionUsuario.setNotificaciones(
                    notificacionUsuarioDto.getNotificaciones().stream()
                            .map(e -> mapToEntityNotificacion(e))
                            .toList()
            );
        }

        return notificacionUsuario;
    }

    public ComboDto mapToDtoCombo(Combo combo) {
        ComboDto dto = new ComboDto();
        dto.setId(combo.getId());
        dto.setDescripcion(combo.getDescripcion());
        dto.setDescuento(combo.getDescuento());
        dto.setProductos(combo.getProductos().stream()
                .map(this::mapToDtoProducto)
                .collect(Collectors.toList()));
        dto.setActivo(combo.getActivo());
        return dto;
    }

    public Combo mapToEntityCombo(ComboDto comboDto) {
        Combo combo = new Combo();
        combo.setId(comboDto.getId());
        combo.setDescuento(comboDto.getDescuento());
        combo.setActivo(comboDto.getActivo());
        combo.setDescripcion(comboDto.getDescripcion());
        combo.setProductos(comboDto.getProductos().stream()
                .map(this::mapToEntityProducto)
                .collect(Collectors.toList()));
        return combo;
    }

    public DescuentoDto mapToDtoDescuento(Descuento descuento) {
        DescuentoDto dto = new DescuentoDto();
        dto.setId(descuento.getId());
        dto.setDescuento(descuento.getDescuento());
        dto.setProducto(mapToDtoProducto(descuento.getProducto()));
        dto.setActivo(descuento.getActivo());
        return dto;
    }

    public Descuento mapToEntityDescuento(DescuentoDto descuentoDto) {
        Descuento descuento = new Descuento();
        descuento.setId(descuentoDto.getId());
        descuento.setDescuento(descuentoDto.getDescuento());
        descuento.setActivo(descuentoDto.getActivo());
        descuento.setProducto(mapToEntityProducto(descuentoDto.getProducto()));
        return descuento;
    }

    public PromocionDto mapToDtoPromocion(Promocion promocion) {
        PromocionDto dto = new PromocionDto();
        dto.setId(promocion.getId());
        dto.setDescripcion(promocion.getDescripcion());
        dto.setDescuento(promocion.getDescuento());
        dto.setProducto(mapToDtoProducto(promocion.getProducto()));
        dto.setActivo(promocion.getActivo());
        return dto;
    }

    public Promocion mapToEntityPromocion(PromocionDto promocionDto) {
        Promocion promocion = new Promocion();
        promocion.setId(promocionDto.getId());
        promocion.setDescuento(promocionDto.getDescuento());
        promocion.setActivo(promocionDto.getActivo());
        promocion.setDescripcion(promocionDto.getDescripcion());
        promocion.setProducto(mapToEntityProducto(promocionDto.getProducto()));
        return promocion;
    }

    public Producto mapToEntityProducto (ProductoDto productoDto) {
        Producto producto = new Producto();
        producto.setId(productoDto.getId());
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
                            .map(e -> mapToEntityCombo(e))
                            .toList()
            );
        }

        if (productoDto.getProveedor() != null) {
            producto.setProveedor(mapToEntityProveedor(productoDto.getProveedor()));
        }

        if (productoDto.getCategoria() != null) {
            producto.setCategoria(mapToEntityCategoria(productoDto.getCategoria()));
        }

        if (productoDto.getLotes() != null) {
            producto.setLotes(
                    productoDto.getLotes().stream()
                            .map(e -> mapToEntityLote(e))
                            .toList()
            );
        }

        if (productoDto.getPromociones() != null) {
            producto.setPromociones(
                    productoDto.getPromociones().stream()
                            .map(e -> mapToEntityPromocion(e))
                            .toList()
            );
        }

        if (productoDto.getDescuentos() != null) {
            producto.setDescuentos(
                    productoDto.getDescuentos().stream()
                            .map(e -> mapToEntityDescuento(e))
                            .toList()
            );
        }


        if (productoDto.getCantidades() != null) {
            producto.setCantidades(
                    productoDto.getCantidades().stream()
                            .map(e -> mapToEntityCantidad(e))
                            .toList()
            );
        }

        return producto;
    }

    public ProductoDto mapToDtoProducto (Producto producto){
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
                            .map(e -> mapToDtoCombo(e))
                            .toList()
            );
        }

        if (producto.getProveedor() != null) {
            productoDto.setProveedor(mapToDtoProveedor(producto.getProveedor()));
        }

        if (producto.getLotes() != null) {
            productoDto.setLotes(
                    producto.getLotes().stream()
                            .map(e -> mapToDtoLote(e))
                            .toList()
            );
        }

        if (producto.getPromociones() != null) {
            productoDto.setPromociones(
                    producto.getPromociones().stream()
                            .map(e -> mapToDtoPromocion(e))
                            .toList()
            );
        }

        if (producto.getDescuentos() != null) {
            productoDto.setDescuentos(
                    producto.getDescuentos().stream()
                            .map(e -> mapToDtoDescuento(e))
                            .toList()
            );
        }

        if (producto.getProveedor() != null) {
            productoDto.setCategoria(mapToDtoCategoria(producto.getCategoria()));
        }

        if (producto.getCantidades() != null) {
            productoDto.setCantidades(
                    producto.getCantidades().stream()
                            .map(e -> mapToDtoCantidad(e))
                            .toList()
            );
        }

        if (producto.getCategoria() != null) {
            productoDto.setCategoria(mapToDtoCategoria(producto.getCategoria()));
        }

        return productoDto;

    }

    public CantidadDto mapToDtoCantidad(Cantidad cantidad) {
        CantidadDto dto = new CantidadDto();

        dto.setId(cantidad.getId());
        dto.setCantidad(cantidad.getCantidad());
        dto.setProducto(mapToDtoProducto(cantidad.getProducto()));
        dto.setVenta(mapToDtoVenta(cantidad.getVenta()));

        return dto;
    }

    public Cantidad mapToEntityCantidad(CantidadDto dto) {
        Cantidad cantidad = new Cantidad();

        cantidad.setId(dto.getId());
        cantidad.setCantidad(dto.getCantidad());
        cantidad.setProducto(mapToEntityProducto(dto.getProducto()));
        cantidad.setVenta(mapToEntityVenta(dto.getVenta()));

        return cantidad;
    }

    public VentaDto mapToDtoVenta(Venta venta) {
        VentaDto dto = new VentaDto();

        dto.setFinalizada(venta.getFinalizada());
        dto.setFormaPago(venta.getFormaPago());
        dto.setId(venta.getId());
        dto.setFechaVenta(venta.getFechaVenta());
        dto.setTotal(venta.getTotal());
        dto.setActivo(venta.getActivo());
        dto.setUsuario(venta.getUsuario());

        if (venta.getCredito() != null) {
            dto.setCredito(mapToDtoCredito(venta.getCredito()));
        }

        if (venta.getCantidades() != null) {
            dto.setCantidades(venta.getCantidades().stream()
                    .map(e -> mapToDtoCantidad(e))
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    public Venta mapToEntityVenta(VentaDto dto) {
        Venta venta = new Venta();

        venta.setFinalizada(dto.getFinalizada());
        venta.setFormaPago(dto.getFormaPago());
        venta.setId(dto.getId());
        venta.setFechaVenta(dto.getFechaVenta());
        venta.setTotal(dto.getTotal());
        venta.setActivo(dto.getActivo());
        venta.setUsuario(dto.getUsuario());

        if (dto.getCredito() != null) {
            venta.setCredito(mapToEntityCredito(dto.getCredito()));
        }
        if (dto.getCantidades() != null) {
            venta.setCantidades(dto.getCantidades().stream()
                    .map(c -> mapToEntityCantidad(c))
                    .collect(Collectors.toList()));
        }
        return venta;
    }
}
