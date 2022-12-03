import { Component } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Observable } from "rxjs";
import { AuthResponseData, AuthService } from "./auth.service";

@Component({
  selector: "app-auth",
  templateUrl: "./auth.component.html"
})
export class AuthComponent {
  isLoginMode = true;
  isLoading = false;
  error: string = null;
  constructor(
    private authService: AuthService
  ) {

  }
  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(form: NgForm) {
    console.log(form.value)
    if (!form.valid) {
      return
    }
    const email = form.value.email;
    const password = form.value.password;

    let autObs : Observable<AuthResponseData>;

    this.isLoading = true;

    if (this.isLoginMode) {
      autObs = this.authService.login(email, password)
    } else {
      autObs = this.authService.signup(email, password)
    }

    autObs.subscribe(resData => {
      console.log(resData);
      this.isLoading = false
    }, errorStr => {
      this.error = errorStr
      this.isLoading = false
    })

    form.reset()

  }
}
