import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Router } from '@angular/router';
import { throwError, Subject, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from './user.model';

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
  user = new BehaviorSubject<User>(null);
  constructor(
    private http: HttpClient,
    private router : Router
  ) {

  }

  signup(email: string, password: string) {
    return this.http.post<AuthResponseData>("https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyAcPkOq1nP7_tRkn53f0f5zk05kytcFH7w", {
      email: email,
      password: password,
      returnSecureToken: true
    }).pipe(
      catchError(this.handleError),
      tap(resData => {
        this.handleAuthentication(resData.email,resData.localId,resData.idToken,+resData.expiresIn)
      }))
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponseData>("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAcPkOq1nP7_tRkn53f0f5zk05kytcFH7w", {
      email: email,
      password: password,
      returnSecureToken: true
    }).pipe(catchError(errorRes => {
      return this.handleError(errorRes);
    }),tap(resData => {
      this.handleAuthentication(resData.email,resData.localId,resData.idToken,+resData.expiresIn)
    }))
  }

  logout(){
    this.user.next(null);
    this.router.navigate(["/auth"])
  }

  private handleAuthentication(email: string, userId: string, token: string, expiresIn: number) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(email, userId, token, expirationDate);
    this.user.next(user);
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
