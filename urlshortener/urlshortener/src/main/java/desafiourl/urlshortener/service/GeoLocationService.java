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
import java.net.InetAddress;
import java.net.UnknownHostException;

@Service
public class GeoLocationService {

    private static final Logger logger = LoggerFactory.getLogger(GeoLocationService.class);

    private DatabaseReader databaseReader;

    @PostConstruct
    public void init() {
        try {
            String DATABASE_PATH = "src/main/resources/GeoLite2-City.mmdb";
            File database = new File(DATABASE_PATH);
            if (database.exists()) {
                databaseReader = new DatabaseReader.Builder(database).build();
                logger.info("GeoIP2 database loaded successfully from: {}", DATABASE_PATH);
            } else {
                logger.warn("GeoIP2 database file not found at: {}. Geographic features will be disabled.", DATABASE_PATH);
            }
        } catch (IOException e) {
            logger.error("Failed to initialize GeoIP2 database: {}", e.getMessage());
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
        if (databaseReader == null || ipAddress == null || ipAddress.isEmpty()) {
            return new GeoLocationInfo("Unknown", "Unknown", "Unknown", "Unknown");
        }

        try {
            // Skip local/private IP addresses
            if (isLocalOrPrivateIP(ipAddress)) {
                return new GeoLocationInfo("Local", "Local", "Local", "Local");
            }

            InetAddress inetAddress = InetAddress.getByName(ipAddress);
            CityResponse response = databaseReader.city(inetAddress);

            String country = response.getCountry().getName();
            String countryCode = response.getCountry().getIsoCode();
            String city = response.getCity().getName();
            String subdivision = response.getMostSpecificSubdivision().getName();

            return new GeoLocationInfo(
                    country != null ? country : "Unknown",
                    countryCode != null ? countryCode : "Unknown",
                    city != null ? city : "Unknown",
                    subdivision != null ? subdivision : "Unknown"
            );

        } catch (Exception e) {
            logger.debug("GeoIP2 lookup failed for IP {}: {}", ipAddress, e.getMessage());
            return new GeoLocationInfo("Unknown", "Unknown", "Unknown", "Unknown");
        }
    }

    private boolean isLocalOrPrivateIP(String ipAddress) {
        try {
            InetAddress inetAddress = InetAddress.getByName(ipAddress);
            return inetAddress.isLoopbackAddress() ||
                    inetAddress.isLinkLocalAddress() ||
                    inetAddress.isSiteLocalAddress() ||
                    ipAddress.equals("127.0.0.1") ||
                    ipAddress.equals("0:0:0:0:0:0:0:1") ||
                    ipAddress.equals("::1");
        } catch (UnknownHostException e) {
            return true; // Treat invalid IPs as local
        }
    }

    public boolean isDatabaseAvailable() {
        return databaseReader != null;
    }


}
