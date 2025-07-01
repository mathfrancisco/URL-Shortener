package desafiourl.urlshortener.service;

import desafiourl.urlshortener.entities.UserEntity;
import desafiourl.urlshortener.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        log.debug("Carregando usuário: {}", usernameOrEmail);

        UserEntity user = userRepository.findByUsernameOrEmail(usernameOrEmail)
                .orElseThrow(() -> {
                    log.warn("Usuário não encontrado: {}", usernameOrEmail);
                    return new UsernameNotFoundException("Usuário não encontrado: " + usernameOrEmail);
                });

        log.debug("Usuário encontrado: {} - Ativo: {} - Email verificado: {}",
                user.getUsername(), user.isActive(), user.isEmailVerified());

        return user;
    }
}