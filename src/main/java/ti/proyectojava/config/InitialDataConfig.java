package ti.proyectojava.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import ti.proyectojava.business.entities.RolUsuario;
import ti.proyectojava.business.entities.Usuario;
import ti.proyectojava.business.repositories.RolUsuarioRepository;
import ti.proyectojava.business.repositories.UsuarioRepository;
import ti.proyectojava.services.PasswordService;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class InitialDataConfig {
    @Autowired
    private RolUsuarioRepository rolUsuarioRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordService passwordService;

    @Bean
    public CommandLineRunner initRoles() {
        return args -> {
            if (rolUsuarioRepository.count() == 0) {

                RolUsuario rolAdmin = new RolUsuario();
                rolAdmin.setId(1L);
                rolAdmin.setNombre("ADMIN");
                rolUsuarioRepository.save(rolAdmin);

                RolUsuario rolCajero = new RolUsuario();
                rolCajero.setId(2L);
                rolCajero.setNombre("CAJERO");
                rolUsuarioRepository.save(rolCajero);
            }

            if (usuarioRepository.findByNombreIgnoreCase("admin").isEmpty()) {
                Usuario adminUser = new Usuario();
                adminUser.setNombre("admin");
                adminUser.setMail("admin@byf.com");
                adminUser.setContrasenia(passwordService.encryptPassword("admin123"));
                adminUser.setActivo(true);

                List<RolUsuario> adminRoles = new ArrayList<>();
                rolUsuarioRepository.findById(1L).ifPresent(adminRoles::add);
                adminUser.setRoles(adminRoles);

                usuarioRepository.save(adminUser);
            }
        };
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:4200")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS").allowedHeaders("*");
            }
        };
    }
}