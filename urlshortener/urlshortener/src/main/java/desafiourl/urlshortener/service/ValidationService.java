package desafiourl.urlshortener.service;

import desafiourl.urlshortener.exception.InvalidUrlException;

import desafiourl.urlshortener.utils.IdGenerator;
import desafiourl.urlshortener.utils.UrlValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ValidationService {

    @Autowired
    private UrlValidator urlValidator;

    @Autowired
    private IdGenerator idGenerator;

    public String validateAndNormalizeUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            throw new InvalidUrlException("URL cannot be empty");
        }

        String normalizedUrl = urlValidator.normalizeUrl(url);

        if (!urlValidator.isValidUrl(normalizedUrl)) {
            throw new InvalidUrlException("Invalid URL format");
        }

        return normalizedUrl;
    }

    public void validateCustomAlias(String alias) {
        if (alias != null && !idGenerator.isValidCustomAlias(alias)) {
            throw new InvalidUrlException("Custom alias must be 3-50 characters long and contain only letters, numbers, dashes and underscores");
        }
    }
}
