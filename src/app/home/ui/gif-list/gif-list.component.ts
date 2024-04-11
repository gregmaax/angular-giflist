import {Component, inject, Input} from '@angular/core';
import {Gif} from "../../../shared/interfaces";
import {GifPlayerComponent} from "../gif-player/gif-player.component";
import {MatToolbar} from "@angular/material/toolbar";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {WINDOW} from "../../../shared/utils/injection-tokens";

@Component({
  selector: 'app-gif-list',
  standalone: true,
  imports: [
    GifPlayerComponent,
    MatToolbar,
    MatIcon,
    MatIconButton
  ],
  template: `
    @for (gif of gifs; track gif.permalink){
      <div>
        <app-gif-player
          [src]="gif.src"
          [thumbnail]="gif.thumbnail"
          data-testid="gif-list-item"
        ></app-gif-player>
        <mat-toolbar color="primary">
          <span>{{ gif.title }}</span>
          <span class="toolbar-spacer"></span>
          <button
            mat-icon-button
            (click)="window.open('https://reddit.com/' + gif.permalink)"
          >
            <mat-icon>comment</mat-icon>
          </button>
        </mat-toolbar>
      </div>
    } @empty {
      <p>Can't find any gifs 🤷</p>
    }
  `,
  styles: `
    div {
      margin: 1rem;
      filter: drop-shadow(0px 0px 6px #0e0c1ba8);
    }

    mat-toolbar {
      white-space: break-spaces;
    }

    p {
      font-size: 2em;
      width: 100%;
      text-align: center;
      margin-top: 4rem;
    }
  `
})
export class GifListComponent {
  @Input({required: true}) gifs!: Gif[];

  window = inject(WINDOW);
}
