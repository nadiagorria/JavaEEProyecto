/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package ti.proyectojava.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.http.HttpMethod;

import static org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher;

import org.springframework.security.config.Customizer;
/**
 * @author Usuario
 */
@EnableMethodSecurity(prePostEnabled = true)
@EnableWebSecurity
@Configuration
public class WebSecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http    .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .addFilterBefore(new FiltroJWTAutorizacion(), UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        //.requestMatchers(antMatcher("/**")).permitAll()
                        .requestMatchers(antMatcher("/api/v1/seguridad/**")).permitAll()
                        .requestMatchers(antMatcher("/swagger-ui.html")).permitAll()
                        .requestMatchers(antMatcher("/webjars/**")).permitAll()
                        .requestMatchers(antMatcher("/swagger-ui/**")).permitAll()
                        .requestMatchers(antMatcher("/v3/api-docs/**")).permitAll()
                        .requestMatchers(antMatcher("/swagger-resources/**")).permitAll()
                        .requestMatchers(antMatcher("/configuration/**")).permitAll()
                        //.requestMatchers(HttpMethod.POST, "/api/v1/usuarios").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/usuarios/solicitar-recuperacion").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/usuarios/restablecer-password").permitAll()
                        //.requestMatchers(antMatcher("/api/v1/entidad/**")).permitAll()


                        .anyRequest()
                        .authenticated());

        return http.build();
    }

    @Bean
    public WebMvcConfigurer configurarCorsGlobal() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:4200")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
        }
    };
    }

}
