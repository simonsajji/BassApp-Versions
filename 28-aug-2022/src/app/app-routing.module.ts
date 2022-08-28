import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { AuthenticationComponent } from './authentication/authentication.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  {
    path:'profile',
    component:ProfileComponent,
    canActivate:[MsalGuard]
  },
  {
    path:'home',
    component:HomeComponent,
    canActivate:[MsalGuard]
  },
  {
    path:'',
    component:AuthenticationComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{
    initialNavigation:'enabledBlocking'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
