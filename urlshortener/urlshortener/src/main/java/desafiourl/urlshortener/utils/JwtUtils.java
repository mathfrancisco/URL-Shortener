package desafiourl.urlshortener.utils;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtils {

    @Value("${app.jwtSecret:urlShortenerSecretKey123456789012345678901234567890}")
    private String jwtSecret;

    @Value("${app.jwtExpirationMs:86400000}") // 24 hours
    private int jwtExpirationMs;

    @Value("${app.jwtIssuer:urlshortener}")
    private String jwtIssuer;

    private Algorithm getAlgorithm() {
        return Algorithm.HMAC256(jwtSecret);
    }

    public String generateJwtToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        return generateTokenFromUsername(userPrincipal.getUsername());
    }

    public String generateTokenFromUsername(String username) {
        try {
            Instant now = Instant.now();
            Instant expiration = now.plus(jwtExpirationMs, ChronoUnit.MILLIS);

            return JWT.create()
                    .withIssuer(jwtIssuer)
                    .withSubject(username)
                    .withIssuedAt(Date.from(now))
                    .withExpiresAt(Date.from(expiration))
                    .withClaim("username", username)
                    .sign(getAlgorithm());
        } catch (JWTCreationException e) {
            System.err.println("Error creating JWT token: " + e.getMessage());
            throw new RuntimeException("Error creating JWT token", e);
        }
    }

    public String generateTokenFromUser(desafiourl.urlshortener.entities.UserEntity user) {
        try {
            Instant now = Instant.now();
            Instant expiration = now.plus(jwtExpirationMs, ChronoUnit.MILLIS);

            return JWT.create()
                    .withIssuer(jwtIssuer)
                    .withSubject(user.getUsername())
                    .withIssuedAt(Date.from(now))
                    .withExpiresAt(Date.from(expiration))
                    .withClaim("username", user.getUsername())
                    .withClaim("email", user.getEmail())
                    .withClaim("userId", user.getId())
                    .withClaim("planType", user.getPlanType())
                    .withClaim("emailVerified", user.isEmailVerified())
                    .withArrayClaim("roles", user.getRoles().toArray(new String[0]))
                    .sign(getAlgorithm());
        } catch (JWTCreationException e) {
            System.err.println("Error creating JWT token: " + e.getMessage());
            throw new RuntimeException("Error creating JWT token", e);
        }
    }

    public String getUsernameFromJwtToken(String token) {
        try {
            DecodedJWT decodedJWT = verifyToken(token);
            return decodedJWT.getSubject();
        } catch (JWTVerificationException e) {
            System.err.println("Error extracting username from JWT: " + e.getMessage());
            return null;
        }
    }

    public Date getExpirationDateFromToken(String token) {
        try {
            DecodedJWT decodedJWT = verifyToken(token);
            return decodedJWT.getExpiresAt();
        } catch (JWTVerificationException e) {
            System.err.println("Error extracting expiration date from JWT: " + e.getMessage());
            return null;
        }
    }

    public Boolean isTokenExpired(String token) {
        Date expiration = getExpirationDateFromToken(token);
        return expiration != null && expiration.before(new Date());
    }

    public Boolean validateJwtToken(String authToken) {
        try {
            verifyToken(authToken);
            return true;
        } catch (JWTVerificationException e) {
            System.err.println("JWT validation error: " + e.getMessage());
            return false;
        } catch (Exception e) {
            System.err.println("Unexpected error validating JWT: " + e.getMessage());
            return false;
        }
    }

    public Boolean validateToken(String token, String username) {
        final String tokenUsername = getUsernameFromJwtToken(token);
        return (tokenUsername != null &&
                tokenUsername.equals(username) &&
                !isTokenExpired(token));
    }

    public long getExpirationTime() {
        return jwtExpirationMs;
    }

    private DecodedJWT verifyToken(String token) throws JWTVerificationException {
        JWTVerifier verifier = JWT.require(getAlgorithm())
                .withIssuer(jwtIssuer)
                .build();

        return verifier.verify(token);
    }

    public String getClaimFromToken(String token, String claimName) {
        try {
            DecodedJWT decodedJWT = verifyToken(token);
            return decodedJWT.getClaim(claimName).asString();
        } catch (JWTVerificationException e) {
            System.err.println("Error extracting claim '" + claimName + "' from JWT: " + e.getMessage());
            return null;
        }
    }

    public String getUserIdFromJwtToken(String token) {
        return getClaimFromToken(token, "userId");
    }

    public String getEmailFromJwtToken(String token) {
        return getClaimFromToken(token, "email");
    }

    public String getPlanTypeFromJwtToken(String token) {
        return getClaimFromToken(token, "planType");
    }

    public Boolean getEmailVerifiedFromJwtToken(String token) {
        try {
            DecodedJWT decodedJWT = verifyToken(token);
            return decodedJWT.getClaim("emailVerified").asBoolean();
        } catch (JWTVerificationException e) {
            System.err.println("Error extracting emailVerified from JWT: " + e.getMessage());
            return null;
        }
    }

    public List<String> getRolesFromJwtToken(String token) {
        try {
            DecodedJWT decodedJWT = verifyToken(token);
            return decodedJWT.getClaim("roles").asList(String.class);
        } catch (JWTVerificationException e) {
            System.err.println("Error extracting roles from JWT: " + e.getMessage());
            return List.of();
        }
    }
}