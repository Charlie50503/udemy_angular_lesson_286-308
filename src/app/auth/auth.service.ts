import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface AuthResponseData {
  idToken:string,
  email:string,
  refreshToken:string,
  expiresIn:string,
  localId:string,
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private http: HttpClient
  ) {

  }

  signup(email: string, password: string) {
    return this.http.post<AuthResponseData>("https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyAcPkOq1nP7_tRkn53f0f5zk05kytcFH7w", {
      email: email,
      password: password,
      returnSecureToken: true
    }).pipe(catchError(errorRes=>{
      let errMessage = "An unknown error occurred!";
      if(!errorRes.error || !errorRes.error.error){
        return throwError(errMessage)
      }
      switch(errorRes.error.error.message){
        case "EMAIL_EXISTS":
          errMessage = "This email exists already"
      }
      return throwError(errMessage);
    }))
  }
}
