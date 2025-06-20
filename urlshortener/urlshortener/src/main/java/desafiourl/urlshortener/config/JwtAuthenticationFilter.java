package desafiourl.urlshortener.config;

import desafiourl.urlshortener.entities.UserEntity;

import desafiourl.urlshortener.repository.UserRepository;
import desafiourl.urlshortener.utils.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = parseJwt(request);
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                String username = jwtUtils.getUsernameFromJwtToken(jwt);

                if (username != null) {
                    // Buscar o usuário no banco para ter as informações completas
                    Optional<UserEntity> userOptional = userRepository.findByUsername(username);

                    if (userOptional.isPresent()) {
                        UserEntity user = userOptional.get();

                        // Verificar se o usuário ainda está ativo e não bloqueado
                        if (user.isEnabled() && user.isAccountNonLocked()) {
                            UsernamePasswordAuthenticationToken authentication =
                                    new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                            SecurityContextHolder.getContext().setAuthentication(authentication);
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Cannot set user authentication: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }

    /**
     * Método auxiliar para obter o usuário autenticado atual
     * @return UserEntity do usuário autenticado ou null se não autenticado
     */
    public static UserEntity getCurrentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() &&
                authentication.getPrincipal() instanceof UserEntity) {
            return (UserEntity) authentication.getPrincipal();
        }
        return null;
    }

    /**
     * Método auxiliar para obter o username do usuário autenticado atual
     * @return username do usuário autenticado ou null se não autenticado
     */
    public static String getCurrentUsername() {
        UserEntity user = getCurrentUser();
        return user != null ? user.getUsername() : null;
    }

    /**
     * Método auxiliar para obter o ID do usuário autenticado atual
     * @return ID do usuário autenticado ou null se não autenticado
     */
    public static String getCurrentUserId() {
        UserEntity user = getCurrentUser();
        return user != null ? user.getId() : null;
    }

    /**
     * Método auxiliar para verificar se o usuário está autenticado
     * @return true se autenticado, false caso contrário
     */
    public static boolean isAuthenticated() {
        return getCurrentUser() != null;
    }

    /**
     * Método auxiliar para verificar se o usuário atual é premium
     * @return true se premium, false caso contrário
     */
    public static boolean isPremiumUser() {
        UserEntity user = getCurrentUser();
        return user != null && user.isPremiumUser();
    }

    /**
     * Método auxiliar para verificar se o usuário pode criar URLs
     * @return true se pode criar, false caso contrário
     */
    public static boolean canCreateUrl() {
        UserEntity user = getCurrentUser();
        return user != null && user.canCreateUrl();
    }

    /**
     * Método auxiliar para verificar se o usuário tem uma role específica
     * @param role a role a ser verificada (sem o prefixo ROLE_)
     * @return true se tem a role, false caso contrário
     */
    public static boolean hasRole(String role) {
        UserEntity user = getCurrentUser();
        if (user == null) return false;

        return user.getRoles().contains(role);
    }
}