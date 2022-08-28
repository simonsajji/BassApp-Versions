import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  host: {
    '(document:click)': '(onBodyClick($event))'
  }
})
export class HeaderComponent implements OnInit {

  dropDown:any;
  constructor() { }

  ngOnInit(): void {
  }

  onBodyClick(event:any): void {
    if (event.target.classList[0] !== 'no-close') {
      this.dropDown = false;
    }
  }

}
