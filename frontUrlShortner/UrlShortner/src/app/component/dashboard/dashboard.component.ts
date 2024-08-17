import {Component, OnInit} from '@angular/core';
import {UrlShortnerService} from "../../shared/url-shortner.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  url: string="";
  constructor(private urlShortnerService: UrlShortnerService){}

  ngOnInit(): void{

}
  generateShortUrl(){
    this.urlShortnerService.getUrlShortenUrl(this.url).subscribe(res=>{
    console.log(res);
    },err=>{
      console.log(err);
    })
  }
}
