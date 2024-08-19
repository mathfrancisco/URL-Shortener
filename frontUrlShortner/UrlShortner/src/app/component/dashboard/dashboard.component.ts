import {Component, OnInit} from '@angular/core';
import {UrlShortnerService} from "../../shared/url-shortner.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  url: string="";
  originalUrl: string="";
  isUrlGenerated : boolean = false;
  isErrorGenerated: boolean = false;
  shortUrl: string="";

  constructor(private urlShortnerService: UrlShortnerService){}

  ngOnInit(): void{
  this.isUrlGenerated= false;
}
  generateShortUrl(){
    this.urlShortnerService.getUrlShortenUrl(this.url).subscribe(res=>{
      if (res==null){
        this.isErrorGenerated=true;
      }else {
        this.isUrlGenerated=true;
        this.shortUrl=res.shortUrl;
        this.originalUrl=res.originalUrl;
      }
    },err=>{
      this.isUrlGenerated=false;
      this.isErrorGenerated=true;
    })
  }
}
