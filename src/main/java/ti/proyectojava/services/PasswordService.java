package ti.proyectojava.services;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordService {
    
    private final PasswordEncoder passwordEncoder;
    
    public PasswordService() {
        this.passwordEncoder = new BCryptPasswordEncoder();
    }
    
    /**
     * Encripta una contraseña en texto plano
     * @param plainPassword La contraseña en texto plano
     * @return La contraseña encriptada
     */
    public String encryptPassword(String plainPassword) {
        return passwordEncoder.encode(plainPassword);
    }
    
    /**
     * Verifica si una contraseña en texto plano coincide con una contraseña encriptada
     * @param plainPassword La contraseña en texto plano
     * @param encodedPassword La contraseña encriptada
     * @return true si las contraseñas coinciden, false en caso contrario
     */
    public boolean matchPassword(String plainPassword, String encodedPassword) {
        return passwordEncoder.matches(plainPassword, encodedPassword);
    }
}
