package desafiourl.urlshortener.entities;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Document(collection = "users")
public class UserEntity implements UserDetails {

    @Id
    @Getter @Setter
    private String id;

    @Indexed(unique = true)
    @Getter @Setter
    private String email;

    @Indexed(unique = true)
    @Getter @Setter
    private String username;

    @Setter
    private String password;

    @Getter @Setter
    private String firstName;

    @Getter @Setter
    private String lastName;

    @Getter @Setter
    private String phoneNumber;

    @Getter @Setter
    private boolean emailVerified;

    @Getter @Setter
    private boolean active;

    @Getter @Setter
    private LocalDateTime createdAt;

    @Getter @Setter
    private LocalDateTime lastLoginAt;

    @Getter @Setter
    private String creatorIp;

    @Getter @Setter
    private List<String> roles;

    // Subscription/Plan fields
    @Getter @Setter
    private String planType; // FREE, PREMIUM, ENTERPRISE

    @Getter @Setter
    private LocalDateTime planExpiresAt;

    @Getter @Setter
    private int monthlyUrlLimit;

    @Getter @Setter
    private int currentMonthUrlCount;

    @Getter @Setter
    private LocalDateTime monthlyCountResetDate;

    // Security fields
    @Getter @Setter
    private String emailVerificationToken;

    @Getter @Setter
    private String passwordResetToken;

    @Getter @Setter
    private LocalDateTime passwordResetTokenExpiry;

    @Getter @Setter
    private int failedLoginAttempts;

    @Getter @Setter
    private LocalDateTime lockoutUntil;

    public UserEntity() {
        this.createdAt = LocalDateTime.now();
        this.active = true;
        this.emailVerified = false;
        this.roles = List.of("USER");
        this.planType = "FREE";
        this.monthlyUrlLimit = 50; // Free plan limit
        this.currentMonthUrlCount = 0;
        this.monthlyCountResetDate = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        this.failedLoginAttempts = 0;
    }

    public UserEntity(String email, String username, String password, String firstName, String lastName) {
        this();
        this.email = email;
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    // UserDetails implementation - these methods override Lombok's generated methods
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .toList();
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return active;
    }

    @Override
    public boolean isAccountNonLocked() {
        return lockoutUntil == null || lockoutUntil.isBefore(LocalDateTime.now());
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active && emailVerified;
    }

    // Business methods
    public boolean canCreateUrl() {
        resetMonthlyCountIfNeeded();
        return currentMonthUrlCount < monthlyUrlLimit;
    }

    public void incrementUrlCount() {
        resetMonthlyCountIfNeeded();
        this.currentMonthUrlCount++;
    }

    private void resetMonthlyCountIfNeeded() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime currentMonthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);

        if (monthlyCountResetDate.isBefore(currentMonthStart)) {
            this.currentMonthUrlCount = 0;
            this.monthlyCountResetDate = currentMonthStart;
        }
    }

    public void incrementFailedLoginAttempts() {
        this.failedLoginAttempts++;
        if (this.failedLoginAttempts >= 5) {
            this.lockoutUntil = LocalDateTime.now().plusMinutes(30);
        }
    }

    public void resetFailedLoginAttempts() {
        this.failedLoginAttempts = 0;
        this.lockoutUntil = null;
    }

    public String getFullName() {
        if (firstName != null && lastName != null) {
            return firstName + " " + lastName;
        }
        return username;
    }

    public boolean isPremiumUser() {
        return "PREMIUM".equals(planType) || "ENTERPRISE".equals(planType);
    }

    public boolean isSubscriptionActive() {
        return planExpiresAt == null || planExpiresAt.isAfter(LocalDateTime.now());
    }

    public void setEmailVerifiedAt(LocalDateTime now) {
        this.emailVerified = true;
        this.emailVerificationToken = null; // Clear token after verification
        this.lastLoginAt = now; // Update last login time
    }
}