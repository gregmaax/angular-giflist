import {Component, computed, effect, ElementRef, Input, signal, ViewChild} from '@angular/core';
import {takeUntilDestroyed, toObservable} from "@angular/core/rxjs-interop";
import {combineLatest, EMPTY, filter, fromEvent, Subject, switchMap} from "rxjs";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

interface GifPlayerState {
  playing: boolean;
  status: 'initial' | 'loading' | 'loaded';
}

@Component({
  selector: 'app-gif-player',
  standalone: true,
  imports: [
    MatProgressSpinner
  ],
  template: `
    @if (status() === 'loading'){
      <mat-progress-spinner mode="indeterminate" diameter="50" />
    }
    <div>
      <video
        (click)="togglePlay$.next()"
        #gifPlayer
        playsinline
        preload="none"
        [loop]="true"
        [muted]="true"
        [src]="src"
      ></video>
    </div>
  `,
  styles: `
    :host {
      display: block;
      position: relative;
      overflow: hidden;
      max-height: 80vh;
    }

    .preload-background {
      width: 100%;
      height: auto;
    }

    video {
      width: 100%;
      max-height: 80vh;
      height: auto;
      margin: auto;
      background: transparent;
    }

    mat-progress-spinner {
      position: absolute;
      top: 2em;
      right: 2em;
      z-index: 1;
    }
  `
})
export class GifPlayerComponent {
  @Input({ required: true }) src!: string;
  @Input({ required: true }) thumbnail!: string;

  //fake new signals API
  videoElement = signal<HTMLVideoElement | undefined>(undefined);
  @ViewChild('gifPlayer') set video(element: ElementRef<HTMLVideoElement>){
    this.videoElement.set(element.nativeElement);
  }
  videoElement$ = toObservable(this.videoElement).pipe(
    filter((element): element is HTMLVideoElement => !!element)
  );

  //state
  state = signal<GifPlayerState>({
    playing: false,
    status: "initial",
  });

  //selectors
  playing = computed(() => this.state().playing);
  status = computed(() => this.state().status);

  //sources
  togglePlay$ = new Subject<void>();

  videoLoadStart$ = combineLatest([
    this.videoElement$, toObservable(this.playing),
  ]).pipe(
    switchMap(([element, playing]) => playing ? fromEvent(element, 'loadstart') : EMPTY)
  );

  videoLoadComplete$ = this.videoElement$.pipe(
    switchMap((element) => fromEvent(element, 'loadeddata'))
  );

  constructor() {
    //reducers
    this.videoLoadStart$.pipe(takeUntilDestroyed()).subscribe(
      () => this.state.update((state) => ({...state, status: "loading"}))
    );

    this.videoLoadComplete$.pipe(takeUntilDestroyed()).subscribe(
      () => this.state.update((state) => ({...state, status: "loaded"}))
    );

    this.togglePlay$.pipe(takeUntilDestroyed()).subscribe(
      () => this.state.update((state) => ({...state, playing: !state.playing}))
    );

    //effects
    effect(() => {
      const video = this.videoElement();
      const playing = this.playing();
      const status = this.status();

      if (!video) return;

      if (playing && status === 'initial'){
        video.load();
      }

      if (status === 'loaded'){
        playing ? video.play() : video.pause();
      }
    });
  }
}
