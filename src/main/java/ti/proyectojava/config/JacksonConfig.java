package ti.proyectojava.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.time.format.DateTimeFormatter;
import java.util.TimeZone;

@Configuration
@Slf4j
public class JacksonConfig {

    private static final String ISO_DATE_FORMAT = "yyyy-MM-dd";
    private static final String ISO_DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();

        JavaTimeModule javaTimeModule = new JavaTimeModule();
        javaTimeModule.addSerializer(java.time.LocalDate.class, new LocalDateSerializer(DateTimeFormatter.ofPattern(ISO_DATE_FORMAT)));
        javaTimeModule.addSerializer(java.time.LocalDateTime.class, new LocalDateTimeSerializer(DateTimeFormatter.ofPattern(ISO_DATETIME_FORMAT)));

        javaTimeModule.addDeserializer(java.time.LocalDate.class, new com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer(DateTimeFormatter.ofPattern(ISO_DATE_FORMAT)));

        javaTimeModule.addDeserializer(java.time.LocalDateTime.class, new com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer(DateTimeFormatter.ofPattern(ISO_DATETIME_FORMAT)));

        javaTimeModule.addDeserializer(java.time.LocalDateTime.class, new com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer(DateTimeFormatter.ISO_DATE_TIME));

        mapper.registerModule(javaTimeModule);

        mapper.setTimeZone(TimeZone.getTimeZone("America/Montevideo"));

        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

        log.info("Jackson configurado con zona horaria: {} y formatos de fecha: ISO", TimeZone.getTimeZone("America/Montevideo").getID());

        return mapper;
    }
}
