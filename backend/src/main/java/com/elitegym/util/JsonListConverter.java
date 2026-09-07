package com.elitegym.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Converter(autoApply = false)
public class JsonListConverter implements AttributeConverter<List<String>, String> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<String> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return "[]";
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            log.error("Error serializing list to JSON string", e);
            return "[]";
        }
    }

    @Override
    public List<String> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty() || "null".equalsIgnoreCase(dbData.trim())) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(dbData, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            log.warn("Could not parse JSON list directly: {}. Attempting fallback parsing.", dbData);
            try {
                String cleaned = dbData.replaceAll("[\\[\\]\"]", "").trim();
                if (!cleaned.isEmpty()) {
                    List<String> list = new ArrayList<>();
                    for (String part : cleaned.split(",")) {
                        String trimmed = part.trim();
                        if (!trimmed.isEmpty()) {
                            list.add(trimmed);
                        }
                    }
                    return list;
                }
            } catch (Exception ex) {
                log.error("Fallback parsing failed for data: {}", dbData, ex);
            }
            return new ArrayList<>();
        }
    }
}
