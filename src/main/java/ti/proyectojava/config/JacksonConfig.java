package ti.proyectojava.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

@Configuration
@Slf4j
public class JacksonConfig {    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        
        // Registrar el módulo para Java 8 time types
        mapper.registerModule(new JavaTimeModule());
        
        // Configurar para manejar fechas como timezone local
        mapper.configure(DeserializationFeature.ADJUST_DATES_TO_CONTEXT_TIME_ZONE, false);
        
        // Registrar deserializador custom para fechas Date (legacy)
        SimpleModule module = new SimpleModule();
        module.addDeserializer(Date.class, new LocalDateDeserializer());
        mapper.registerModule(module);
        
        return mapper;
    }

    public static class LocalDateDeserializer extends JsonDeserializer<Date> {
        @Override
        public Date deserialize(JsonParser parser, DeserializationContext context) throws IOException {
            String dateString = parser.getText();

            try {
                // Si la fecha viene en formato YYYY-MM-DD, tratarla como fecha local
                if (dateString.matches("\\d{4}-\\d{2}-\\d{2}")) {
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                    // Importante: usar timezone local, no UTC
                    sdf.setTimeZone(TimeZone.getDefault());
                    Date result = sdf.parse(dateString);
                    return result;
                }
                
                // Para otros formatos, usar el comportamiento por defecto
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ");
                sdf.setTimeZone(TimeZone.getDefault());
                return sdf.parse(dateString);
                
            } catch (ParseException e) {
                throw new IOException("Error parsing date: " + dateString, e);
            }
        }
    }
}
