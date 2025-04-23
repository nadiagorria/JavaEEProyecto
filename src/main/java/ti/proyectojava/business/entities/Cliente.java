package ti.proyectojava.business.entities;


import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "CLIENTE")
public class Cliente extends Entidad {

    @OneToOne(mappedBy = "cliente")
    @JoinColumn(name = "CLIENTE_CREDITO")
    private Credito credito;

}