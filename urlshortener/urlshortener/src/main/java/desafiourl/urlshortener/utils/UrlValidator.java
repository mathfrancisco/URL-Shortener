package desafiourl.urlshortener.utils;

import org.springframework.stereotype.Component;
import java.net.URL;
import java.util.regex.Pattern;

@Component
public class UrlValidator {

    private static final Pattern URL_PATTERN = Pattern.compile(
            "^(https?)://[-a-zA-Z0-9+&@#/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#/%=~_|]"
    );

    private static final String[] BLOCKED_DOMAINS = {
            "localhost", "127.0.0.1", "0.0.0.0", "::1"
    };

    public boolean isValidUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return false;
        }

        try {
            URL urlObj = new URL(url);
            String host = urlObj.getHost().toLowerCase();

            // Check blocked domains
            for (String blocked : BLOCKED_DOMAINS) {
                if (host.equals(blocked)) {
                    return false;
                }
            }

            return URL_PATTERN.matcher(url).matches();
        } catch (Exception e) {
            return false;
        }
    }

    public String normalizeUrl(String url) {
        if (url == null) return null;

        url = url.trim();
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
        }

        return url;
    }
}

