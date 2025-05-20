package ti.proyectojava.business.entities;


import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

import java.util.Objects;

@Data
@Entity
@Table(name = "CLIENTE")
public class Cliente extends Entidad {

    @OneToOne(mappedBy = "cliente")
    @JoinColumn(name = "CLIENTE_CREDITO")
    private Credito credito;


}