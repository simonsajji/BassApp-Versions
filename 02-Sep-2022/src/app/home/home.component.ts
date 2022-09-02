import { NavigationEnd, Router } from '@angular/router';
import { Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MsalBroadcastService, MsalGuardConfiguration, MsalService, MSAL_GUARD_CONFIG } from '@azure/msal-angular';
import { InteractionStatus, RedirectRequest } from '@azure/msal-browser';
import { filter, Subject, Subscription, takeUntil } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoginService } from '../login.service';
import { ApiService } from '../api.service';
import { ConfirmBoxComponent } from '../confirm-box/confirm-box.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastrServices} from '../toastr.service';
import { ToastrService } from 'ngx-toastr';
// import { MatProgressSpinner } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  host: {
    '(document:click)': '(onBodyClick($event))'
  }
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
    {branchname:'',locations:{dropdown:false,selected:false,unrouted:[],routes:[],loclength:0}}];

  branchData:any;

  contextmenu = false;
  contextmenuX = 0;
  contextmenuY = 0;
  branchView:boolean = false;
  locationsView:boolean = false;
  routesView:boolean = false;
  selectedBranch:any;

  constructor(@Inject(MSAL_GUARD_CONFIG) private msalGuardConfig:MsalGuardConfiguration,
  private msalBroadCasrService:MsalBroadcastService,
  private authService:MsalService,private loginService:LoginService,private router:Router,private apiService:ApiService,private dialog: MatDialog,private toastr: ToastrServices) { 
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
   this.branchData[0].dropped = true;
   this.branchView = true;
   this.routesView = false;
   this.locationsView = false;
   this.selectedBranch = this.branchData[0];

  }

  logout(ev:any){
    if(ev) this.authService.logoutRedirect({postLogoutRedirectUri:environment.postLogoutUrl});
  }

  getAllBranches(){
    this.apiService.get('http://bassnewapi.testzs.com/api/Branch/BranchList').subscribe((res)=>{
      res.sort((a:any,b:any) => (a.BranchName > b.BranchName) ? 1 : ((b.BranchName > a.BranchName) ? -1 : 0));
      console.log(res);
      this.branchData = res;
      this.branchData.forEach((branch:any)=>{
        branch.selected = false;
        branch.dropped = false;
        branch.routesDropped = false;
        branch.showRoutesList = false;
      })

      // this.branchData[0].selected = true;
      this.branchData[0].dropped = true;
      this.branchView = true;
      this.routesView = false;
      this.locationsView = false;
      this.selectedBranch = this.branchData[0];
            
      console.log(this.branchData);
      res.forEach((element:any,idx:any)=> {
        this.branches.forEach((item:any,index:any)=>{
          if(idx == index) item.branchname = element?.BranchName;
        })
      });

    });
  }

  getAllRoutesofBranch(branch:any,viewtype:any){
    this.apiService.get(`http://bassnewapi.testzs.com/api/Branch/RouteList/${branch?.BranchId}`).subscribe((res)=>{
      console.log(res);
      if(branch.branchId == res[0].branchId){
        if(viewtype == 'locationsView'){
          this.branchData.forEach((item:any)=>{
            if(item.BranchId != branch?.BranchId) item.showRoutesList = false;
          })
          branch.showRoutesList = true;
        }
        else if(viewtype == 'dropView') branch.routesDropped = true;
        branch.Routes = res;
      }
    })
  }

  getLocationsofRoute(route:any){
    console.log(route?.RouteId);
    console.log(this.branchData)
    this.apiService.get(`http://bassnewapi.testzs.com/api/Branch/LocationList/${route?.RouteId}`).subscribe((res)=>{
      // console.log(res);
      route.Locations = res;
      route.isrouteDropped = true;
      console.log(this.branchData)
    })

  }

  currentbranchSelect(branch:any){
    this.branchView = true;
    this.locationsView = false;
    this.routesView = false;
    this.selectedBranch = branch;
    branch.showRoutesList = false;
    // this.locationsView = false;
    // branch.selected = true;
    // this.getAllRoutesofBranch(branch);

  }

  
  expandBranch(branch:any){
    this.shrinkAllBranches();
    this.branchData?.forEach((element:any)=>{
      if(element?.BranchId == branch?.BranchId) element.dropped = true;
      else element.dropped = false;
    })
  }

  shrinkBranch(branch:any){
    this.branchData?.forEach((element:any)=>{
      if(element?.BranchId == branch?.BranchId) element.dropped = false;
    })
  }

  shrinkAllBranches(){
    this.branchData?.forEach((branch:any)=>{
      branch.dropped = false;
    });
    console.log(this.branchData)
  }

  onTabChanged(event:any): void {
    this.selectedTabIndex = event?.index;
  }

  selectBranchLocation(branch:any){
    // this.branches?.forEach((element:any) => {
    //   if(branch?.branchname == element?.branchname){
    //     element.locations.selected = true;
    //     this.selectedBranchLoc = branch;
    //   }
    //   else element.locations.selected  = false;
    // });
    this.getAllRoutesofBranch(branch,'locationsView')
    this.branchView = false;
    this.routesView = false;
    this.locationsView = true;
    branch.showRoutesList = true;


  }

  onRightClick(ev:any,item:any){
    ev?.preventDefault();
    console.log("right cliked",item);
    if(item?.RouteName){
      this.dropArea = item;
      this.contextmenuX = ev?.clientX
      this.contextmenuY = ev?.clientY
      this.contextmenu=true;
    } 
    else {this.dropArea = null;}
    // if(this.draggeditem && this.dropArea) this.moveLocation();
    return false;
  }

  selectLocationCard(ev:any,item:any){
    if(item?.LocationId) this.draggeditem = item;
    else{ this.draggeditem = null;}
  }

  //disables the menu
  disableContextMenu(){
    this.contextmenu= false;
 }

  moveLocation(){
    const dialogRef = this.dialog.open(ConfirmBoxComponent, {
      data: {
        message: 'Are you sure want to Move?',
      },
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed == true) {
        // remove location from current route
        this.branchData?.forEach((element:any) => {
          element?.Routes?.forEach((route:any)=>{
            route?.Locations.forEach((loc:any,i:any)=>{
              if(this.draggeditem?.LocationId == loc?.LocationId) route?.Locations?.splice(i,1);
            })
          })
        });
        // add location from new route
        this.branchData?.forEach((element:any) => {
          element?.Routes?.forEach((route:any)=>{
            if(this.dropArea?.RouteId == route?.RouteId) route?.Locations?.push(this.draggeditem)
          })
        });
        this.toastr.success(`"Moved Location ${this.draggeditem.LocationId} to Route ${this.dropArea?.RouteId}  successfully`);
        this.draggeditem = null;
        this.dropArea = null;
        
      }
    });
    
  }

  moveLocationOnClick(ev:any){
    if(this.draggeditem && this.dropArea) this.moveLocation();
  }

  onBodyClick(event:any): void {
    if (event.target.classList[0] !== 'no-close') {
      this.contextmenu = false;
    }
  }

}
