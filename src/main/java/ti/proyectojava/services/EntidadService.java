package ti.proyectojava.services;


import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ti.proyectojava.api.responses.ResponseListadoProveedores;
import ti.proyectojava.business.entities.Cliente;
import ti.proyectojava.business.entities.Credito;
import ti.proyectojava.business.entities.Entidad;
import ti.proyectojava.business.entities.Proveedor;
import ti.proyectojava.business.repositories.*;
import ti.proyectojava.dtos.*;


import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class EntidadService {

    private final EntidadRepository entidadRepository;
    private final ClienteRepository clienteRepository;
    private final CreditoRepository creditoRepository;
    private final ProveedorRepository proveedorRepository;
    private final MapsDtosEntityService mapsDtosEntityService;

    private EntidadService(ClienteRepository clienteRepository, ProveedorRepository proveedorRepository, EntidadRepository entidadRepository, CreditoRepository creditoRepository, MapsDtosEntityService mapsDtosEntityService) {
        this.entidadRepository = entidadRepository;
        this.clienteRepository = clienteRepository;
        this.proveedorRepository = proveedorRepository;
        this.creditoRepository = creditoRepository;
        this.mapsDtosEntityService = mapsDtosEntityService;
    }

    public Entidad seleccionarEntidad(Long id) {
        Optional<Cliente> cliente = clienteRepository.findById(id);
        if (cliente.isPresent()) {
            return cliente.get();
        }

        Optional<Proveedor> proveedor = proveedorRepository.findById(id);
        if (proveedor.isPresent()) {
            return proveedor.get();
        }
        throw new NoSuchElementException("No se encontró ninguna entidad. ID:" + id);
    }

    public Entidad eliminarPersona(Entidad entidad) {
        entidad.setActivo(false);


        if (entidad instanceof Cliente) {
            Cliente cliente = (Cliente) entidad;
            if (cliente.getCredito() != null) {
                Credito credito = cliente.getCredito();
                credito.setActivo(false);
                creditoRepository.save(credito);
            }
        }
        entidadRepository.save(entidad);
        return entidad;
    }


//  CLIENTE


    public String crearClienteCredito(ClienteCreditoDto clienteCreditoDto) {
        
        // Validaciones adicionales de negocio
        if (clienteCreditoDto.getNombre() == null || clienteCreditoDto.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del cliente es obligatorio");
        }
        
        if (clienteCreditoDto.getTelefono() == null || clienteCreditoDto.getTelefono().trim().isEmpty()) {
            throw new IllegalArgumentException("El teléfono del cliente es obligatorio");
        }
        
        if (clienteCreditoDto.getMinimo() < 0) {
            throw new IllegalArgumentException("El crédito mínimo no puede ser negativo");
        }
        
        if (clienteCreditoDto.getMaximo() <= 0) {
            throw new IllegalArgumentException("El crédito máximo debe ser mayor a 0");
        }
        
        if (clienteCreditoDto.getMaximo() <= clienteCreditoDto.getMinimo()) {
            throw new IllegalArgumentException("El crédito máximo debe ser mayor que el crédito mínimo");
        }

        ClienteDto clienteDto = new ClienteDto();
        clienteDto.setNombre(clienteCreditoDto.getNombre().trim());
        clienteDto.setTelefono(clienteCreditoDto.getTelefono().trim());
        clienteDto.setActivo(true);

        Cliente cliente = mapsDtosEntityService.mapToEntityCliente(clienteDto);

        CreditoDto creditoDto = new CreditoDto();
        creditoDto.setActivo(true);
        creditoDto.setMinimo(clienteCreditoDto.getMinimo());
        creditoDto.setMaximo(clienteCreditoDto.getMaximo());
        creditoDto.setPagoHastaAhora(clienteCreditoDto.getPagoHastaAhora());
        creditoDto.setPrecioTotal(clienteCreditoDto.getPrecioTotal());
        creditoDto.setVentas(new ArrayList<>());

        Credito credito = mapsDtosEntityService.mapToEntityCredito(creditoDto);

        credito.setCliente(cliente);

        cliente.setCredito(credito);

        creditoRepository.save(credito);

        return "Cliente creado. ID: " + cliente.getId() + ", Credito creado. ID: " + credito.getId();
    }


    public String editarCliente(ClienteDto clienteDto) {

        if (clienteDto.getNombre() == null || clienteDto.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del cliente es obligatorio");
        }
        
        if (clienteDto.getTelefono() == null || clienteDto.getTelefono().trim().isEmpty()) {
            throw new IllegalArgumentException("El teléfono del cliente es obligatorio");
        }
        
        Optional<Cliente> optionalCliente = clienteRepository.findById(clienteDto.getId());
        if (optionalCliente.isPresent()) {
            Cliente cliente = optionalCliente.get();
            cliente.setNombre(clienteDto.getNombre().trim());
            cliente.setTelefono(clienteDto.getTelefono().trim());
            clienteRepository.save(cliente);
            return "Cliente actualizado con ID:" + cliente.getId();
        } else {
            return "Cliente no encontrado con ID:" + clienteDto.getId();
        }
    }

    public ClienteDto seleccionarCliente(Long id) {
        Optional<Cliente> cliente = clienteRepository.findById(id);
        if (cliente.isPresent()) {
            return mapsDtosEntityService.mapToDtoCliente(cliente.get());
        }
        throw new NoSuchElementException("No se encontró ninguna entidad. ID:" + id);
    }

//  PROVEEDOR

    public ResponseListadoProveedores listadoProveedores() {
        ResponseListadoProveedores response = new ResponseListadoProveedores();

        List<ProveedorDto> proveedoresActivos = proveedorRepository.findByActivoTrue().stream().map(mapsDtosEntityService::mapToDtoProveedorSimple).toList();

        response.setProveedores(proveedoresActivos);

        return response;
    }

    public String crearProveedor(ProveedorDto proveedorDto) {
        return "Proveedor creado. ID:" + proveedorRepository.save(mapsDtosEntityService.mapToEntityProveedor(proveedorDto)).getId();
    }

    public String editarProveedor(ProveedorDto proveedorDto) {
        Optional<Proveedor> optionalProveedor = proveedorRepository.findById(proveedorDto.getId());
        if (optionalProveedor.isPresent()) {
            Proveedor proveedor = optionalProveedor.get();
            proveedor.setNombre(proveedorDto.getNombre());
            proveedor.setTelefono(proveedorDto.getTelefono());
            proveedor.setCorreo(proveedorDto.getCorreo());

            proveedorRepository.save(proveedor);
            return "Cliente actualizado. ID:" + proveedor.getId();
        } else {
            return "Cliente no encontrado. ID:" + proveedorDto.getId();
        }
    }

    public ProveedorDto seleccionarProveedor(Long id) {
        Optional<Proveedor> proveedor = proveedorRepository.findById(id);
        if (proveedor.isPresent()) {
            return mapsDtosEntityService.mapToDtoProveedor(proveedor.get());
        }
        throw new NoSuchElementException("No se encontró ningun proveedor. ID:" + id);
    }


}
