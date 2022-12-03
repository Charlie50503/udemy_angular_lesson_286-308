import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { exhaustMap, map, take, tap } from 'rxjs/operators';

import { Recipe } from '../recipes/recipe.model';
import { RecipeService } from '../recipes/recipe.service';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class DataStorageService {
  constructor(private http: HttpClient, private recipeService: RecipeService, private authService: AuthService) { }

  storeRecipes() {
    const recipes = this.recipeService.getRecipes();
    this.http
      .put(
        'https://angular-http-request-dd100-default-rtdb.asia-southeast1.firebasedatabase.app/recipes.json',
        recipes
      )
      .subscribe(response => {
        console.log(response);
      });
  }

  fetchRecipes() {
    return this.authService.user.pipe(
      take(1),
      exhaustMap(user => {
        console.log("user",user);

        return this.http
          .get<Recipe[]>(
            // 'https://angular-http-request-dd100-default-rtdb.asia-southeast1.firebasedatabase.app/recipes.json?auth=' +user.token // 方法一
            'https://angular-http-request-dd100-default-rtdb.asia-southeast1.firebasedatabase.app/recipes.json', // 方法二
            {
              params:new HttpParams().set("auth",user.token)
            }
          )
      }),
      map(recipes => {
        return recipes.map(recipe => {
          return {
            ...recipe,
            ingredients: recipe.ingredients ? recipe.ingredients : []
          };
        });
      }),
      tap(recipes => {
        this.recipeService.setRecipes(recipes);
      }))//使用 take 後 次數用完了就會解除訂閱

  }
}
