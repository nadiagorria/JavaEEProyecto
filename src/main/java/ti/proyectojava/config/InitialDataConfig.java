package ti.proyectojava.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import ti.proyectojava.business.entities.RolUsuario;
import ti.proyectojava.business.repositories.RolUsuarioRepository;

@Configuration
public class InitialDataConfig {

    @Autowired
    private RolUsuarioRepository rolUsuarioRepository;

    @Bean
    public CommandLineRunner initRoles() {
        return args -> {
            // Verificar si ya existen roles
            if (rolUsuarioRepository.count() == 0) {

                // Crear rol ADMIN
                RolUsuario rolAdmin = new RolUsuario();
                rolAdmin.setId(1L);
                rolAdmin.setNombre("ADMIN");
                rolUsuarioRepository.save(rolAdmin);

                // Crear rol CAJERO
                RolUsuario rolCajero = new RolUsuario();
                rolCajero.setId(2L);
                rolCajero.setNombre("CAJERO");
                rolUsuarioRepository.save(rolCajero);
            }
        };
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // Aplica a todos los endpoints
                        .allowedOrigins("http://localhost:4200") // Tu frontend Angular
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*");
            }
        };
    }
}