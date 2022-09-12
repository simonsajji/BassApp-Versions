import { AnimationStyleMetadata } from '@angular/animations';
import { Component, OnInit,Input,Output,EventEmitter } from '@angular/core';
import { ConfirmBoxComponent } from '../confirm-box/confirm-box.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastrServices } from 'src/app/services/toastr.service';
import { MoveService } from 'src/app/services/move.service';
import { ApiService } from 'src/app/services/api.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.css']
})
export class LeftMenuComponent implements OnInit {

  @Input() branches:any;
  @Input() branchData:any;
  @Input() dropPoint:any;
  @Input() selectedRoute:any;
  @Input() selectedBranch:any;
  @Input() branchView:any;
  @Input() locationsView:any;
  @Input() routesView:any;
  @Input() draggeditem:any;
   // @Output() shrinkBranchEvent = new EventEmitter<any>();
  // @Output() expandBranchEvent = new EventEmitter<any>();
  @Output() branchSelectEvent = new EventEmitter<any>();
  @Output() fetchAllRoutesEvent = new EventEmitter<any>();
  // @Output() fetchAllLocationsEvent = new EventEmitter<any>();
  @Output() selectBranchLocationEvent = new EventEmitter<any>();
  @Output() selectRouteEvent = new EventEmitter<any>();
  dropArea:any;

  constructor(private dialog: MatDialog,private toastr: ToastrServices,private moveService:MoveService,private apiService:ApiService) { }

  ngOnInit(): void {
    this.moveService.getDraggedItems().subscribe((item:any) => {
      this.draggeditem = item;
    })
  }

  shrinkBranch(branch:any){
    this.branchData?.forEach((element:any)=>{
      if(element?.BranchId == branch?.BranchId) element.dropped = false;
    })
  }

  expandBranch(branch:any){
    // this.shrinkAllBranches();
    this.branchData?.forEach((element:any)=>{
      if(element?.BranchId == branch?.BranchId) element.dropped = true;
      // else element.dropped = false;
    })
  }

  currentbranchSelect(branch:any){
    this.branchSelectEvent.emit(branch);
  }

  getAllRoutesofBranch(branch:any,view:any){
    this.fetchAllRoutesEvent.emit({branch:branch,view:view})
  }

  selectBranchLocation(branch:any){
    this.selectBranchLocationEvent.emit(branch);
  }

  allowDrop(ev:any,route:any) {
    ev.preventDefault();
    this.dropPoint = route;
  }

  itemDrop(ev:any,route:any){
    this.dropArea = route;
    console.log(this.dropArea?.RouteId,  this.draggeditem[0]?.RouteId)
    if(this.draggeditem && this.dropArea && (this.dropArea?.RouteId != this.draggeditem[0]?.RouteId)) this.moveLocation();
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
        console.log(this.draggeditem)
        this.branchData?.forEach((element:any) => {
          element?.Routes?.forEach((route:any)=>{
              this.draggeditem?.forEach((item:any)=>{
               route.Locations =  route?.Locations?.filter((loc:any,index:any)=>{return (loc?.LocationId != item?.LocationId)})
              })              
            // })
          })
        });
         // also remove it from selectedRoute
         this.draggeditem?.forEach((item:any)=>{
           this.selectedRoute.Locations =  this.selectedRoute?.Locations?.filter((loc:any,index:any)=>{return (loc?.LocationId != item?.LocationId)})
        })  
        // add location from new route
        this.branchData?.forEach((element:any) => {
          element?.Routes?.forEach((route:any)=>{
            if(this.dropArea?.RouteId == route?.RouteId) route?.Locations?.push(...this.draggeditem)
          })
        });
        this.toastr.success(`Moved  ${this.draggeditem.length} Locations to Route ${this.dropArea?.RouteName}  successfully`);
        this.draggeditem = [];// need to set it in service
        this.moveService.setDraggedItems([])
        this.dropArea = null;
        this.dropPoint = null;
      }
    });
    
  }

  moveLocationOnClick(ev:any){
    if(this.draggeditem && this.dropArea) this.moveLocation();
  }


  getLocationsofRoute(route:any){
    console.log(route?.RouteId);
    this.apiService.get(`http://bassnewapi.testzs.com/api/Branch/LocationList/${route?.RouteId}`).subscribe((res)=>{
      route.Locations = res;
      route.isrouteDropped = true;
      route?.Locations.forEach((item:any)=>{
        item.selected = false;
      })
      console.log(this.branchData);
    })
  }

  selectRoute(route:any){
    this.selectRouteEvent.emit(route);

  }

}
