import { NavigationEnd, Router } from '@angular/router';
import { Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MsalBroadcastService, MsalGuardConfiguration, MsalService, MSAL_GUARD_CONFIG } from '@azure/msal-angular';
import { InteractionStatus, RedirectRequest } from '@azure/msal-browser';
import { filter, Subject, Subscription, takeUntil } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoginService } from '../login.service';
import { ApiService } from '../api.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  isUserLoggedIn:boolean = false;
  _routeListener: any;
  currentAccount:any;
  selectedTabIndex: number = 1;
  fetchedBranches:any;
  branches:any = [{branchname:'',machinery:{},technicians:[{name:"Bryan Phillip",selected:true,routes:[{route:'route-1',locations:['Canadian tire gas bar (35 Broadway)','ultramar ind(2 cameron rd)','couche tarmac (382 rue street Canada)']},{route:'route-2',locations:['10105 99 St, Nampa','AB-690, Deadwood, AB T0H 1A0, Canada','global fuels (120 canada rd)']},{route:'route-3'}]},{name:"Owen Jackson",selected:false,routes:[{route:'route-1',locations:['irwing/main tire convienience (20 po 2004)','uijpjpajidavavd tryr','4 St, Wawanesa, MB R0K 2G0','couche tarmac (382 rue street Canada)']}]}]},{branchname:'Canada-West'},{branchname:'Ontario',machinery:{},technicians:[{name:"Jake Reynolds",selected:true,routes:[{route:'route-1',locations:['parkland/ultramar(55 rosebury st)','couche tarmac (382 rue street Canada)']},{route:'route-2',locations:['couche tarmac (382 rue street Canada)']}]},{name:"Patrick James",selected:false,routes:[{route:'route-1',locations:['County, AB, Canada','16826 107 Ave NW, Edmonton, AB T5P 4C3','265 Sturgeon Rd, St. Albert']}]}]}]

  constructor(@Inject(MSAL_GUARD_CONFIG) private msalGuardConfig:MsalGuardConfiguration,
  private msalBroadCasrService:MsalBroadcastService,
  private authService:MsalService,private loginService:LoginService,private router:Router,private apiService:ApiService) { 
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
   console.log(this.currentAccount);
   this.getAllBranches();
  }

  logout(ev:any){
    if(ev) this.authService.logoutRedirect({postLogoutRedirectUri:environment.postLogoutUrl});
  }

  getAllBranches(){
    this.apiService.get('http://bassnewapi.testzs.com/api/Branch/BranchList').subscribe((res)=>{
      res.sort((a:any,b:any) => (a.BranchName > b.BranchName) ? 1 : ((b.BranchName > a.BranchName) ? -1 : 0));
      console.log(res);
      res.forEach((element:any,idx:any)=> {
        this.branches.forEach((item:any,index:any)=>{
          if(idx == index) item.branchname = element?.BranchName;
        })
      });

    });
  }

  onTabChanged(event:any): void {
    this.selectedTabIndex = event?.index;
  }

}
