import {Component, inject} from '@angular/core';
import {GifListComponent} from "./ui/gif-list/gif-list.component";
import {RedditService} from "../shared/data-access/reddit.service";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {SearchBarComponent} from "./ui/search-bar/search-bar.component";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    GifListComponent,
    InfiniteScrollModule,
    SearchBarComponent,
    MatProgressSpinner
  ],
  template: `
    <app-search-bar [subredditFormControl]="redditService.subredditFormControl"/>

    @if (redditService.loading()){
      <mat-progress-spinner mode="indeterminate" diameter="50" />
    } @else {
      <app-gif-list
        [gifs]="redditService.gifs()"
        infiniteScroll
        (scrolled)="redditService.pagination$.next(redditService.lastKnownGif())"
        class="grid-container"
      />
    }
  `,
  styles: `
    mat-progress-spinner {
      margin: 2rem auto;
    }
  `
})
export default class HomeComponent {
  redditService = inject(RedditService);
}
