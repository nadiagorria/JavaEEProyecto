package ti.proyectojava.api.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ti.proyectojava.dtos.ContactoDto;
import ti.proyectojava.services.EmailService;

@RestController
@RequestMapping(value = "api/v1/contacto")
public class ContactoController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/enviar")
    public ResponseEntity<?> enviarMensajeContacto(@RequestBody ContactoDto contactoDto) {
        try {
            emailService.enviarMensajeContacto(
                    "nadia.gorria@estudiantes.utec.edu.uy",
                    contactoDto.getNombre(),
                    contactoDto.getEmail(),
                    contactoDto.getMensaje()
            );

            return new ResponseEntity<>("Mensaje enviado exitosamente", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error al enviar el mensaje: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
