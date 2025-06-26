package ti.proyectojava.dtos;

import lombok.Data;

@Data
public class RecuperacionPasswordDto {

    private String email;

    private String codigo;

    private String nuevaPassword;
}
