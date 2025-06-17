package desafiourl.urlshortener.entities.dto;

import lombok.NonNull;

public record GeoLocationInfo(String country, String countryCode, String city, String subdivision) {

    @Override
    @NonNull
    public String toString() {
        return String.format("GeoLocationInfo{country='%s', countryCode='%s', city='%s', subdivision='%s'}",
                country, countryCode, city, subdivision);
    }
}
