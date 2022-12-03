import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface AuthResponseData {
  idToken: string,
  email: string,
  refreshToken: string,
  expiresIn: string,
  localId: string,
  registered?: boolean
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user = new Subject<User>();
  constructor(
    private http: HttpClient
  ) {

  }

  signup(email: string, password: string) {
    return this.http.post<AuthResponseData>("https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyAcPkOq1nP7_tRkn53f0f5zk05kytcFH7w", {
      email: email,
      password: password,
      returnSecureToken: true
    }).pipe(catchError(this.handleError),tap(resData=>{
      const expirationDate = new Date(new Date().getTime() + resData.expiresIn * 1000);
      const user = new User(resData.email,resData.localId,resData.idToken,expirationDate);
      this.user.next(user);
    }))
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponseData>("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAcPkOq1nP7_tRkn53f0f5zk05kytcFH7w", {
      email: email,
      password: password,
      returnSecureToken: true
    }).pipe(catchError(errorRes => {
      return this.handleError(errorRes);
    }))
  }

  private handleError(errorRes: HttpErrorResponse) {
    let errMessage = "An unknown error occurred!";
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errMessage)
    }
    switch (errorRes.error.error.message) {
      case "EMAIL_EXISTS":
        errMessage = "This email exists already"
        break;
      case "EMAIL_NOT_FOUND":
        errMessage = "This email does not exist"
        break;
      case "INVALID_PASSWORD":
        errMessage = "This password is not correct."
        break;
    }
    return throwError(errMessage);
  }
}
