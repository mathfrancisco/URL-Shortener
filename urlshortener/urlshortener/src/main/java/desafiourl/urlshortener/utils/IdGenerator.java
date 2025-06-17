package desafiourl.urlshortener.utils;

import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.stereotype.Component;

@Component
public class IdGenerator {

    private static final String ALLOWED_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final int DEFAULT_LENGTH = 6;
    private static final int MAX_LENGTH = 10;

    public String generateId() {
        return generateId(DEFAULT_LENGTH);
    }

    public String generateId(int length) {
        if (length > MAX_LENGTH) {
            length = MAX_LENGTH;
        }
        return RandomStringUtils.random(length, ALLOWED_CHARS);
    }

    public boolean isValidCustomAlias(String alias) {
        if (alias == null || alias.trim().isEmpty()) {
            return false;
        }

        alias = alias.trim();

        // Check length
        if (alias.length() < 3 || alias.length() > 50) {
            return false;
        }

        // Check characters (alphanumeric, dash, underscore only)
        return alias.matches("^[a-zA-Z0-9_-]+$");
    }
}
