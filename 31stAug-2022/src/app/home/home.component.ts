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
  selectedBranchLoc:any;
  draggeditem:any;
  dropArea:any;
  branches:any = [
    {branchname:'',locations:{dropdown:true,selected:true,unrouted:[],
      routes:[
        {route:'[227] dalhouse/dmtcmbt/edmstn 90 days-jh',routeid:101,locs:[{locname:'Canadian tire gas bar (35 Broadway)',id:82378},{locname:'ultramar ind(2 cameron rd)',id:75612},{locname:'couche tarmac (382 rue street Canada)',id:90234},{locname:'irving mainway - st leonard382 rue st-jean)',id:24556},{locname:'parkland/ultramar55 rosebury st)',id:97685}]}
      ,{route:'bthrst/negac/mramchi/blckvil - 90 days -jh',routeid:102,locs:[{locname:'10105 99 St, Nampa',id:45524},{locname:'AB-690, Deadwood, AB T0H 1A0, Canada',id:23424},{locname:'global fuels (120 canada rd)',id:63453},{locname:'bg fuels/mobil577 victoria street)',id:35735}]}
     ],loclength:0}},
    {branchname:'',locations:{dropdown:false,selected:false,unrouted:[],
      routes:[
        {route:'[227] dalhouse/dmtcmbt/edmstn 90 days-jh',routeid:201,locs:[{locname:'ultramar ind(2 cameron rd)',id:74823},{locname:'bg fuels/mobil577 victoria street)',id:39983}]}
     ],loclength:0}},
    {branchname:'',locations:{dropdown:false,selected:false,unrouted:[],routes:[],loclength:0}}]

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
   this.branches?.forEach((element:any) => {
    element?.locations?.routes?.forEach((route:any)=>{
      element.locations.loclength+=route?.locs?.length;
    })
    element?.locations?.unrouted?.forEach((route:any)=>{
      element.locations.loclength+=route?.locs?.length;
    })
   });
   this.selectedBranchLoc = this.branches[0];
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

  selectBranchLocation(branch:any){
    this.branches?.forEach((element:any) => {
      if(branch?.branchname == element?.branchname){
        element.locations.selected = true;
        this.selectedBranchLoc = branch;
      }
      else element.locations.selected  = false;
    });
  }

  onRightClick(ev:any,item:any){
    ev?.preventDefault();
    console.log("right cliked",item);
    if(item?.route) this.dropArea = item;
    else if(item?.locname) this.draggeditem = item;
    else{
      this.dropArea = null;
      this.draggeditem = null;
    }

    if(this.draggeditem && this.dropArea) this.moveLocation();
    
    return false;

  }

  moveLocation(){
    // remove location from current route
    this.branches?.forEach((element:any) => {
      element?.locations?.routes?.forEach((route:any)=>{
        route?.locs.forEach((loc:any,i:any)=>{
          if(this.draggeditem?.id == loc?.id) route?.locs?.splice(i,1);
        })
      })
     });
    // add location from new route
    this.branches?.forEach((element:any) => {
      element?.locations?.routes?.forEach((route:any)=>{
        if(this.dropArea?.routeid == route?.routeid) route?.locs?.push(this.draggeditem)
      })
     });

     this.draggeditem = null;
     this.dropArea = null;
  }

}
