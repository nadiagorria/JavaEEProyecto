package ti.proyectojava.services;


import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ti.proyectojava.business.entities.Cliente;
import ti.proyectojava.business.entities.Credito;
import ti.proyectojava.business.entities.Entidad;
import ti.proyectojava.business.entities.Proveedor;
import ti.proyectojava.business.repositories.*;
import ti.proyectojava.dtos.ClienteCreditoDto;
import ti.proyectojava.dtos.ClienteDto;
import ti.proyectojava.dtos.CreditoDto;
import ti.proyectojava.dtos.ProveedorDto;

import java.util.ArrayList;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@Slf4j
public class EntidadService {

    private final EntidadRepository entidadRepository;
    private final ClienteRepository clienteRepository;
    private final CreditoRepository creditoRepository;
    private final ProveedorRepository proveedorRepository;
    private final MapsDtosEntityService mapsDtosEntityService;

    private EntidadService(ClienteRepository clienteRepository, ProveedorRepository proveedorRepository, EntidadRepository entidadRepository, CreditoRepository creditoRepository, MapsDtosEntityService mapsDtosEntityService){
        this.entidadRepository = entidadRepository;
        this.clienteRepository=clienteRepository;
        this.proveedorRepository=proveedorRepository;
        this.creditoRepository = creditoRepository;
        this.mapsDtosEntityService = mapsDtosEntityService;
    }

    public Entidad seleccionarEntidad(Long id) {
        // Compruebo si es Cliente
        Optional<Cliente> cliente = clienteRepository.findById(id);
        if (cliente.isPresent()) {
            return cliente.get();
        }

        // Si no es cliente, probamos con proveedor
        Optional<Proveedor> proveedor = proveedorRepository.findById(id);
        if (proveedor.isPresent()) {
            return proveedor.get();
        }
        // Si no existe la persona se lanza exepcion
        throw new NoSuchElementException("No se encontró ninguna entidad. ID:" + id);
    }

    public Entidad eliminarPersona(Entidad entidad) {
        entidad.setActivo(false);
        entidadRepository.save(entidad);
        return entidad;
    }


    //////////////////////////////////CLIENTE////////////////////////////////////////

    public String crearCliente(ClienteDto clienteDto) {
            return "Cliente creado. ID: " + clienteRepository.save(mapsDtosEntityService.mapToEntityCliente(clienteDto)).getId();
    }

    public String crearClienteCredito(ClienteCreditoDto clienteCreditoDto) {

        ClienteDto clienteDto = new ClienteDto();
        clienteDto.setNombre(clienteCreditoDto.getNombre());
        clienteDto.setTelefono(clienteCreditoDto.getTelefono());
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
        Optional<Cliente> optionalCliente = clienteRepository.findById(clienteDto.getId());
        if (optionalCliente.isPresent()) {
            Cliente cliente = optionalCliente.get();
            cliente.setNombre(clienteDto.getNombre());
            cliente.setTelefono(clienteDto.getTelefono());
            clienteRepository.save(cliente);
            return "Cliente actualizado con ID:" + cliente.getId();
        } else {
            return "Cliente no encontrado con ID:" + clienteDto.getId();
        }
    }

    public String eliminarCliente(Long id) {
        Optional<Cliente> clienteAct = clienteRepository.findById(id);
        String response = null;

        if (clienteAct.isPresent()) {
            Cliente cliente = clienteAct.get();
            cliente.setActivo(false);
            clienteRepository.save(cliente);
            response = "Cliente eliminado correctamente. ID:" + cliente.getId();
        }
        return response;
    }

    public ClienteDto seleccionarCliente(Long id) {
        // Compruebo si es Cliente
        Optional<Cliente> cliente = clienteRepository.findById(id);
        if (cliente.isPresent()) {
            return mapsDtosEntityService.mapToDtoCliente(cliente.get());
        }
        // Si no existe la persona se lanza exepcion
        throw new NoSuchElementException("No se encontró ninguna entidad. ID:" + id);
    }

    //////////////////////////////////PROVEEDOR///////////////////////////////////



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
            // No actualizamos ID ni relaciones por simplicidad
            proveedorRepository.save(proveedor);
            return "Cliente actualizado. ID:" + proveedor.getId();
        } else {
            return "Cliente no encontrado. ID:" + proveedorDto.getId();
        }
    }

    public String eliminarProveedor(Long id) {
        Optional<Proveedor> proveedorAct = proveedorRepository.findById(id);
        String response = null;

        if (proveedorAct.isPresent()) {
            Proveedor proveedor = proveedorAct.get();
            proveedor.setActivo(false);
            proveedorRepository.save(proveedor);
            response = "Cliente eliminado correctamente. ID:" + proveedor.getId();
        }
        return response;
    }

    public ProveedorDto seleccionarProveedor(Long id) {
        Optional<Proveedor> proveedor = proveedorRepository.findById(id);
        if (proveedor.isPresent()) {
            return mapsDtosEntityService.mapToDtoProveedor(proveedor.get());
        }
        // Si no existe la persona se lanza exepcion
        throw new NoSuchElementException("No se encontró ningun proveedor. ID:" + id);
    }



}
