package desafiourl.urlshortener.entities.dto.request;

import jakarta.validation.constraints.Size;

public record UpdateUrlMetadataRequest(
        @Size(max = 200, message = "Title must not exceed 200 characters")
        String title,

        @Size(max = 500, message = "Description must not exceed 500 characters")
        String description
) {
}