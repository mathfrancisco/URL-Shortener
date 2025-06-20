package desafiourl.urlshortener.exception;

import desafiourl.urlshortener.entities.dto.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidUrlException.class)
    public ResponseEntity<ErrorResponse> handleInvalidUrl(InvalidUrlException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.of(
                ex.getMessage(),
                "INVALID_URL",
                HttpStatus.BAD_REQUEST.value(),
                request.getRequestURI()
        );
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(UrlNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUrlNotFound(UrlNotFoundException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.of(
                ex.getMessage(),
                "URL_NOT_FOUND",
                HttpStatus.NOT_FOUND.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatus(ResponseStatusException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.of(
                ex.getReason() != null ? ex.getReason() : "Request failed",
                getErrorCode(ex.getStatusCode().value()),
                ex.getStatusCode().value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(ex.getStatusCode()).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .reduce((a, b) -> a + ", " + b)
                .orElse("Validation failed");

        ErrorResponse error = ErrorResponse.of(
                message,
                "VALIDATION_ERROR",
                HttpStatus.BAD_REQUEST.value(),
                request.getRequestURI()
        );
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex, HttpServletRequest request) {
        // Log the exception for debugging
        ex.printStackTrace();

        ErrorResponse error = ErrorResponse.of(
                "Internal server error occurred",
                "INTERNAL_ERROR",
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    private String getErrorCode(int statusCode) {
        return switch (statusCode) {
            case 400 -> "BAD_REQUEST";
            case 401 -> "UNAUTHORIZED";
            case 403 -> "FORBIDDEN";
            case 404 -> "NOT_FOUND";
            case 429 -> "TOO_MANY_REQUESTS";
            case 500 -> "INTERNAL_ERROR";
            default -> "HTTP_" + statusCode;
        };
    }
}