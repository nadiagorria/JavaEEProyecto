package ti.proyectojava.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender emailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.name:KioscoByF}")
    private String appName;

    public void enviarCodigoRecuperacion(String toEmail, String codigo, String nombreUsuario) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("🔐 Código de Recuperación de Contraseña - " + appName);

            String cuerpoMensaje = String.format(
                    "Hola %s,\n\n" +
                            "Has solicitado restablecer tu contraseña en %s.\n\n" +
                            "Tu código de recuperación es: %s\n\n" +
                            "⏰ Este código es válido por 15 minutos solamente.\n\n" +
                            "🔒 Por tu seguridad:\n" +
                            "- No compartas este código con nadie\n" +
                            "- Si no solicitaste este cambio, puedes ignorar este email\n" +
                            "- Tu contraseña actual sigue siendo válida hasta que uses este código\n\n" +
                            "Saludos,\n" +
                            "Equipo %s\n\n" +
                            "---\n" +
                            "Este es un email automático, por favor no respondas a este mensaje.",
                    nombreUsuario != null ? nombreUsuario : "Usuario",
                    appName,
                    codigo,
                    appName
            );

            message.setText(cuerpoMensaje);

            emailSender.send(message);
            System.out.println("✅ Email de recuperación enviado exitosamente a: " + toEmail);

        } catch (Exception e) {
            System.err.println("❌ Error al enviar email a " + toEmail + ": " + e.getMessage());
            throw new RuntimeException("Error al enviar el email de recuperación. Verifica tu configuración de email.");
        }
    }

    public void enviarNotificacionCambioPassword(String toEmail, String nombreUsuario) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("✅ Contraseña Cambiada Exitosamente - " + appName);

            String cuerpoMensaje = String.format(
                    "Hola %s,\n\n" +
                            "Te confirmamos que tu contraseña en %s ha sido cambiada exitosamente.\n\n" +
                            "🔒 Tu cuenta ahora está protegida con la nueva contraseña.\n\n" +
                            "⚠️ Si no realizaste este cambio:\n" +
                            "- Contacta inmediatamente al administrador del sistema\n" +
                            "- Cambia tu contraseña nuevamente por seguridad\n\n" +
                            "Fecha y hora del cambio: %s\n\n" +
                            "Saludos,\n" +
                            "Equipo %s\n\n" +
                            "---\n" +
                            "Este es un email automático, por favor no respondas a este mensaje.",
                    nombreUsuario != null ? nombreUsuario : "Usuario",
                    appName,
                    java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")),
                    appName
            );

            message.setText(cuerpoMensaje);

            emailSender.send(message);

        } catch (Exception e) {
        }
    }

    public void enviarMensajeContacto(String toEmail, String nombreCliente, String emailCliente, String mensaje) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("📧 Nuevo mensaje de contacto - " + appName);

            String cuerpoMensaje = String.format(
                    "Has recibido un nuevo mensaje de contacto desde la página web de %s.\n\n" +
                            "👤 Datos del cliente:\n" +
                            "Nombre: %s\n" +
                            "Email: %s\n\n" +
                            "💬 Mensaje:\n" +
                            "%s\n\n" +
                            "📅 Fecha y hora: %s\n\n" +
                            "---\n" +
                            "Sistema de contacto automático - %s",
                    appName,
                    nombreCliente,
                    emailCliente,
                    mensaje,
                    java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")),
                    appName
            );

            message.setText(cuerpoMensaje);

            emailSender.send(message);

            System.out.println("✅ Mensaje de contacto enviado exitosamente de: " + emailCliente + " a: " + toEmail);

        } catch (Exception e) {
            System.err.println("❌ Error al enviar mensaje de contacto: " + e.getMessage());
            throw new RuntimeException("Error al enviar el mensaje de contacto. Verifica la configuración de email.");
        }
    }
}
