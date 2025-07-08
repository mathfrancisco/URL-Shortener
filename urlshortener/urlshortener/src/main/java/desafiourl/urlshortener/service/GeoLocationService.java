package desafiourl.urlshortener.service;

import com.maxmind.geoip2.DatabaseReader;
import com.maxmind.geoip2.exception.GeoIp2Exception;
import com.maxmind.geoip2.model.CityResponse;
import com.maxmind.geoip2.record.City;
import com.maxmind.geoip2.record.Country;
import desafiourl.urlshortener.entities.dto.GeoLocationInfo;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Service
public class GeoLocationService {

    private static final Logger logger = LoggerFactory.getLogger(GeoLocationService.class);
    private DatabaseReader databaseReader;

    @PostConstruct
    public void init() {
        logger.info("Initializing GeoIP2 database...");

        try {
            // ESTRATÉGIA 1: Tentar carregar do classpath primeiro (melhor para JAR)
            if (loadFromClasspath()) {
                logger.info("✅ GeoIP2 database loaded successfully from classpath");
                return;
            }

            // ESTRATÉGIA 2: Tentar caminhos físicos (para desenvolvimento)
            if (loadFromFilePaths()) {
                logger.info("✅ GeoIP2 database loaded successfully from file system");
                return;
            }

            // Se chegou aqui, não conseguiu carregar
            logger.warn("❌ GeoIP2 database could not be loaded from any source. Geographic features will be disabled.");
            logTroubleshootingInfo();

        } catch (Exception e) {
            logger.error("❌ Failed to initialize GeoIP2 database: {}", e.getMessage(), e);
            logTroubleshootingInfo();
        }
    }

    private boolean loadFromClasspath() {
        try {
            logger.debug("🔍 Attempting to load GeoIP2 database from classpath...");

            InputStream inputStream = getClass().getClassLoader().getResourceAsStream("GeoLite2-City.mmdb");
            if (inputStream != null) {
                databaseReader = new DatabaseReader.Builder(inputStream).build();
                logger.debug("✅ Successfully loaded from classpath");
                return true;
            } else {
                logger.debug("❌ GeoLite2-City.mmdb not found in classpath");
                return false;
            }
        } catch (IOException e) {
            logger.debug("❌ Failed to load from classpath: {}", e.getMessage());
            return false;
        }
    }

    private boolean loadFromFilePaths() {
        String[] possiblePaths = {
                "src/main/resources/GeoLite2-City.mmdb",
                "GeoLite2-City.mmdb",
                "./src/main/resources/GeoLite2-City.mmdb",
                "./GeoLite2-City.mmdb",
                System.getProperty("user.dir") + "/src/main/resources/GeoLite2-City.mmdb",
                System.getProperty("user.dir") + "/GeoLite2-City.mmdb"
        };

        logger.debug("🔍 Attempting to load GeoIP2 database from file paths...");
        logger.debug("Working directory: {}", System.getProperty("user.dir"));

        for (String path : possiblePaths) {
            try {
                File database = new File(path);
                logger.debug("Trying path: {} (exists: {})", path, database.exists());

                if (database.exists() && database.canRead()) {
                    databaseReader = new DatabaseReader.Builder(database).build();
                    logger.debug("✅ Successfully loaded from: {}", database.getAbsolutePath());
                    return true;
                }
            } catch (IOException e) {
                logger.debug("❌ Failed to load from {}: {}", path, e.getMessage());
            }
        }

        logger.debug("❌ Could not load from any file path. Tried: {}", Arrays.toString(possiblePaths));
        return false;
    }

    private void logTroubleshootingInfo() {
        logger.warn("🔧 TROUBLESHOOTING GEOLOCATION:");
        logger.warn("   1. Check if GeoLite2-City.mmdb exists in src/main/resources/");
        logger.warn("   2. Verify file is not corrupted (size should be ~60MB)");
        logger.warn("   3. Check file permissions (must be readable)");
        logger.warn("   4. Current working directory: {}", System.getProperty("user.dir"));

        // Verificar se arquivo existe no classpath
        InputStream testStream = getClass().getClassLoader().getResourceAsStream("GeoLite2-City.mmdb");
        logger.warn("   5. File in classpath: {}", testStream != null ? "YES" : "NO");
        if (testStream != null) {
            try {
                testStream.close();
            } catch (IOException ignored) {}
        }
    }

    @PreDestroy
    public void cleanup() {
        if (databaseReader != null) {
            try {
                databaseReader.close();
                logger.info("GeoIP2 database connection closed");
            } catch (IOException e) {
                logger.error("Error closing GeoIP2 database: {}", e.getMessage());
            }
        }
    }

    public String getCountry(String ipAddress) {
        if (databaseReader == null || ipAddress == null || ipAddress.isEmpty()) {
            return "Unknown";
        }

        try {
            // Skip local/private IP addresses
            if (isLocalOrPrivateIP(ipAddress)) {
                return "Local";
            }

            InetAddress inetAddress = InetAddress.getByName(ipAddress);
            CityResponse response = databaseReader.city(inetAddress);
            Country country = response.getCountry();

            if (country != null && country.getName() != null) {
                return country.getName();
            }

        } catch (UnknownHostException e) {
            logger.debug("Invalid IP address format: {}", ipAddress);
        } catch (GeoIp2Exception e) {
            logger.debug("GeoIP2 lookup failed for IP {}: {}", ipAddress, e.getMessage());
        } catch (IOException e) {
            logger.error("IO error during GeoIP2 lookup for IP {}: {}", ipAddress, e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error during GeoIP2 lookup for IP {}: {}", ipAddress, e.getMessage());
        }

        return "Unknown";
    }

    public String getCity(String ipAddress) {
        if (databaseReader == null || ipAddress == null || ipAddress.isEmpty()) {
            return "Unknown";
        }

        try {
            // Skip local/private IP addresses
            if (isLocalOrPrivateIP(ipAddress)) {
                return "Local";
            }

            InetAddress inetAddress = InetAddress.getByName(ipAddress);
            CityResponse response = databaseReader.city(inetAddress);
            City city = response.getCity();

            if (city != null && city.getName() != null) {
                return city.getName();
            }

        } catch (UnknownHostException e) {
            logger.debug("Invalid IP address format: {}", ipAddress);
        } catch (GeoIp2Exception e) {
            logger.debug("GeoIP2 lookup failed for IP {}: {}", ipAddress, e.getMessage());
        } catch (IOException e) {
            logger.error("IO error during GeoIP2 lookup for IP {}: {}", ipAddress, e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error during GeoIP2 lookup for IP {}: {}", ipAddress, e.getMessage());
        }

        return "Unknown";
    }

    public GeoLocationInfo getLocationInfo(String ipAddress) {
        logger.debug("🌍 Getting location info for IP: {}", ipAddress);

        if (databaseReader == null) {
            logger.debug("❌ Database reader is null for IP: {}", ipAddress);
            return new GeoLocationInfo("Unknown", "Unknown", "Unknown", "Unknown");
        }

        if (ipAddress == null || ipAddress.isEmpty()) {
            logger.debug("❌ Empty or null IP address provided");
            return new GeoLocationInfo("Unknown", "Unknown", "Unknown", "Unknown");
        }

        try {
            // Skip local/private IP addresses
            if (isLocalOrPrivateIP(ipAddress)) {
                logger.debug("🏠 Local/private IP detected: {}", ipAddress);
                return new GeoLocationInfo("Local", "Local", "Local", "Local");
            }

            InetAddress inetAddress = InetAddress.getByName(ipAddress);
            CityResponse response = databaseReader.city(inetAddress);

            String country = response.getCountry().getName();
            String countryCode = response.getCountry().getIsoCode();
            String city = response.getCity().getName();
            String subdivision = response.getMostSpecificSubdivision().getName();

            GeoLocationInfo result = new GeoLocationInfo(
                    country != null ? country : "Unknown",
                    countryCode != null ? countryCode : "Unknown",
                    city != null ? city : "Unknown",
                    subdivision != null ? subdivision : "Unknown"
            );

            logger.debug("✅ GeoLocation resolved for IP {}: {}", ipAddress, result);
            return result;

        } catch (Exception e) {
            logger.debug("❌ GeoIP2 lookup failed for IP {}: {}", ipAddress, e.getMessage());
            return new GeoLocationInfo("Unknown", "Unknown", "Unknown", "Unknown");
        }
    }

    private boolean isLocalOrPrivateIP(String ipAddress) {
        try {
            InetAddress inetAddress = InetAddress.getByName(ipAddress);
            boolean isLocal = inetAddress.isLoopbackAddress() ||
                    inetAddress.isLinkLocalAddress() ||
                    inetAddress.isSiteLocalAddress() ||
                    ipAddress.equals("127.0.0.1") ||
                    ipAddress.equals("0:0:0:0:0:0:0:1") ||
                    ipAddress.equals("::1");

            if (isLocal) {
                logger.debug("🏠 IP {} identified as local/private", ipAddress);
            }

            return isLocal;
        } catch (UnknownHostException e) {
            logger.debug("❌ Invalid IP format: {}", ipAddress);
            return true; // Treat invalid IPs as local
        }
    }

    public boolean isDatabaseAvailable() {
        boolean available = databaseReader != null;
        logger.debug("🔍 GeoIP database availability check: {}", available);
        return available;
    }

    // MÉTODO ADICIONAL: Para debug e testes
    public Map<String, Object> getDebugInfo() {
        Map<String, Object> debug = new HashMap<>();
        debug.put("databaseLoaded", databaseReader != null);
        debug.put("workingDirectory", System.getProperty("user.dir"));

        // Verificar se arquivo existe no classpath
        InputStream testStream = getClass().getClassLoader().getResourceAsStream("GeoLite2-City.mmdb");
        debug.put("fileInClasspath", testStream != null);
        if (testStream != null) {
            try {
                testStream.close();
            } catch (IOException ignored) {}
        }

        // Verificar arquivos físicos
        String[] paths = {
                "src/main/resources/GeoLite2-City.mmdb",
                "GeoLite2-City.mmdb"
        };

        Map<String, Boolean> fileExists = new HashMap<>();
        for (String path : paths) {
            fileExists.put(path, new File(path).exists());
        }
        debug.put("physicalFiles", fileExists);

        return debug;
    }

    // MÉTODO ADICIONAL: Para testar com IP específico
    public Map<String, Object> testIpLookup(String ipAddress) {
        Map<String, Object> result = new HashMap<>();
        result.put("inputIp", ipAddress);
        result.put("databaseAvailable", isDatabaseAvailable());
        result.put("isLocalPrivate", isLocalOrPrivateIP(ipAddress));

        if (isDatabaseAvailable()) {
            GeoLocationInfo info = getLocationInfo(ipAddress);
            result.put("locationInfo", info);
        } else {
            result.put("error", "Database not available");
        }

        return result;
    }
}