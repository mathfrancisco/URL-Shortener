import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UrlShortnerService {
  private serviceUrl: string = 'http://localhost:8080/shorten-url';

  constructor(private http: HttpClient) {}

  getUrlShortenUrl(url: string) {
    // Envia a URL dentro de um objeto JSON
    const body = { url };

    return this.http.post<any>(this.serviceUrl, body).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    // Trata erros de resposta HTTP aqui
    if (error.error instanceof ErrorEvent) {
      // Um erro do lado do cliente ou um erro de rede aconteceu. Trate-o adequadamente.
      console.error('Um erro ocorreu:', error.error.message);
    } else {
      // O backend retornou um código de resposta falho.
      console.error(`Backend retornou o código ${error.status}, ` + `corpo era: ${error.error}`);
    }
    // Retorna um observable com uma mensagem de erro.
    return throwError(() => new Error('Algo deu errado; tente novamente mais tarde.'));
  }
}
