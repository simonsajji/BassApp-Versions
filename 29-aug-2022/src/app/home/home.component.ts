import { NavigationEnd, Router } from '@angular/router';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MsalBroadcastService, MsalGuardConfiguration, MsalService, MSAL_GUARD_CONFIG } from '@azure/msal-angular';
import { InteractionStatus, RedirectRequest } from '@azure/msal-browser';
import { filter, Subject, Subscription, takeUntil } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoginService } from '../login.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isUserLoggedIn:boolean = false;
  _routeListener: any;
  currentAccount:any;
  branches:any = [{branchname:'Canada-East',machinery:{},technicians:[{name:"Jay",routes:[{route:'route-1'},{route:'route-2'},{route:'route-3'}]},{name:"Owen Jackson",routes:[{route:'route-1'},{route:'route-2'},{route:'route-3'}]}]},{},{}]

  constructor(@Inject(MSAL_GUARD_CONFIG) private msalGuardConfig:MsalGuardConfiguration,
  private msalBroadCasrService:MsalBroadcastService,
  private authService:MsalService,private loginService:LoginService,private router:Router) { 
    this._routeListener = router.events.subscribe((event) => {
      if (event instanceof NavigationEnd){
         this.isUserLoggedIn = true;
      }
    })
  }

  ngOnInit(): void {
    // this.loginService.getLoginStatus().subscribe((item) => {
    //   this.isUserLoggedIn = item;
    // })
   this.currentAccount =  this.authService?.instance?.getAllAccounts()[0];
   console.log(this.currentAccount)
  }

  logout(ev:any){
    if(ev) this.authService.logoutRedirect({postLogoutRedirectUri:environment.postLogoutUrl});
  }

}
