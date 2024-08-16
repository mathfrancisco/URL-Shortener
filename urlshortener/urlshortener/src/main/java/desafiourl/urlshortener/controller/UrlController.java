package desafiourl.urlshortener.controller;

import desafiourl.urlshortener.controller.dto.ShortenUrlRequest;
import desafiourl.urlshortener.controller.dto.ShortenUrlResponse;
import desafiourl.urlshortener.entities.UrlEntity;
import desafiourl.urlshortener.repository.UrlRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URL;
import java.time.LocalDateTime;


@RestController

public class UrlController {

    private final UrlRepository urlRepository;

    public UrlController(UrlRepository urlRepository) {
        this.urlRepository = urlRepository;
    }

    @PostMapping(value = "/shorten-url")
    public ResponseEntity<ShortenUrlResponse> shortenUrl(@RequestBody ShortenUrlRequest request,
                                           HttpServletRequest servletRequest) {

     String id;
     do {
         id = RandomStringUtils.randomAlphanumeric(5,10);
     }while (urlRepository.existsById(id));

     urlRepository.save(new UrlEntity(id, request.url(), LocalDateTime.now().plusMinutes(1)));

     var redirectUrl= servletRequest.getRequestURL().toString().replace("shorten-url",id);



    return ResponseEntity.ok(new ShortenUrlResponse(redirectUrl));
    }

    @GetMapping("{id}")
    public ResponseEntity<Void> getUrl(@PathVariable("id") String id) {
        var url = urlRepository.findById(id);

        if ((url.isEmpty())){
            return ResponseEntity.notFound().build();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(url.get().getFullurl()));

        return  ResponseEntity.status(HttpStatus.FOUND).headers(headers).build();


    }

}

