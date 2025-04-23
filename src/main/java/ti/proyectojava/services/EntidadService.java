package ti.proyectojava.services;


import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ti.proyectojava.business.entities.Cliente;
import ti.proyectojava.business.entities.Entidad;
import ti.proyectojava.business.entities.Proveedor;
import ti.proyectojava.business.repositories.*;
import ti.proyectojava.dtos.ClienteDto;
import ti.proyectojava.dtos.ProveedorDto;

import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@Slf4j
public class EntidadService {

    private final PersonaRepository personaRepository;
    private final ClienteRepository clienteRepository;
    private final ProveedorRepository proveedorRepository;

    private EntidadService(ClienteRepository clienteRepository, ProveedorRepository proveedorRepository, PersonaRepository personaRepository){
        this.personaRepository=personaRepository;
        this.clienteRepository=clienteRepository;
        this.proveedorRepository=proveedorRepository;
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
        throw new NoSuchElementException("No se encontró ninguna entidad con ID: " + id);
    }

    public Entidad eliminarPersona(Entidad entidad) {
        entidad.setActivo(false);
        personaRepository.save(entidad);
        return entidad;
    }


    //////////////////////////////////CLIENTE////////////////////////////////////////

    public String crearCliente(ClienteDto clienteDto) {
        if(clienteRepository.findById(clienteDto.getId()).isEmpty()){
            return "Venta creada id: " + clienteRepository.save(mapToEntityCliente(clienteDto)).getId();
        }

        return null;
    }

    public String editarCliente(ClienteDto clienteDto) {
        Optional<Cliente> optionalCliente = clienteRepository.findById(clienteDto.getId());
        if (optionalCliente.isPresent()) {
            Cliente cliente = optionalCliente.get();
            cliente.setNombre(clienteDto.getNombre());
            cliente.setTelefono(clienteDto.getTelefono());
            // No actualizamos ID ni relaciones por simplicidad
            clienteRepository.save(cliente);
            return "Cliente actualizado con ID: " + cliente.getId();
        } else {
            return "Cliente no encontrado con ID: " + clienteDto.getId();
        }
    }

   /* public String eliminarCliente(Long id) {
        if (clienteRepository.existsById(id)) {
            clienteRepository.deleteById(id);
            return "Cliente eliminado con ID: " + id;
        } else {
            return "Cliente no encontrado con ID: " + id;
        }
    }
    public String eliminarCliente(Long personaId){
        Optional<Cliente> clienteAct = clienteRepository.findById(personaId);
        String response = null;

        if (clienteAct.isPresent()) {
            Cliente cliente = clienteAct.get();
            cliente.setEliminado(true);
            clienteRepository.save(cliente);
            response = "Cliente " + cliente.getNombre() + " eliminado correctamente.";
        }
        return response;
    }*/

    public Cliente eliminarCliente(Cliente cliente) {
        cliente.setActivo(false);
        clienteRepository.save(cliente);
        return cliente;
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


    //////////////////////////////////PROVEEDOR///////////////////////////////////



    public String crearProveedor(ProveedorDto proveedorDto) {
        if(clienteRepository.findById(proveedorDto.getId()).isEmpty()){
            return "Proveedor creado id: " + proveedorRepository.save(mapToEntityProveedor(proveedorDto)).getId();
        }
        return null;
    }

    public String editarProveedor(ProveedorDto proveedorDto) {
        Optional<Proveedor> optionalProveedor = proveedorRepository.findById(proveedorDto.getId());
        if (optionalProveedor.isPresent()) {
            Proveedor proveedor = optionalProveedor.get();
            proveedor.setNombre(proveedorDto.getNombre());
            proveedor.setTelefono(proveedorDto.getTelefono());
            // No actualizamos ID ni relaciones por simplicidad
            proveedorRepository.save(proveedor);
            return "Cliente actualizado con ID: " + proveedor.getId();
        } else {
            return "Cliente no encontrado con ID: " + proveedorDto.getId();
        }
    }

   /* public String eliminarCliente(Long id) {
        if (clienteRepository.existsById(id)) {
            clienteRepository.deleteById(id);
            return "Cliente eliminado con ID: " + id;
        } else {
            return "Cliente no encontrado con ID: " + id;
        }
    }

   public Cliente eliminarCliente(Cliente cliente) {
        cliente.setEliminado(true);
        clienteRepository.save(cliente);
        return cliente;
    }*/

    public String eliminarProveedor(Long personaId){
        Optional<Proveedor> proveedorAct = proveedorRepository.findById(personaId);
        String response = null;

        if (proveedorAct.isPresent()) {
            Proveedor proveedor = proveedorAct.get();
            proveedor.setActivo(false);
            proveedorRepository.save(proveedor);
            response = "Proveedor " + proveedor.getNombre() + " eliminado correctamente.";
        }
        return response;
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
}
