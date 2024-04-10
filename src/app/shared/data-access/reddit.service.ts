import {computed, inject, Injectable, signal} from '@angular/core';
import {Gif, RedditPost, RedditResponse} from "../interfaces";
import {catchError, concatMap, EMPTY, map, of, startWith, Subject} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {HttpClient} from "@angular/common/http";

export interface GifsState {
  gifs: Gif[];
  error: string | null,
  loading: boolean,
  lastKnownGif: string | null,
}

@Injectable({providedIn: 'root'})
export class RedditService {
  private http = inject(HttpClient);
  //state
  private state = signal<GifsState>({
    gifs: [],
    error: null,
    loading: true,
    lastKnownGif: null,
  });

  //selectors
  gifs = computed(() => this.state().gifs);
  error = computed(() => this.state().error);
  loading = computed(() => this.state().loading);
  lastKnownGif = computed(() => this.state().lastKnownGif);

  //sources
  pagination$ = new Subject<string | null>();
  gifsLoaded$ = this.pagination$.pipe(
    startWith(null),
    concatMap((lastKnownGif) => this.fetchFromReddit('gifs', lastKnownGif, 20))
  );


  constructor() {
    //reducers
    this.gifsLoaded$.pipe(takeUntilDestroyed()).subscribe((response) =>
      this.state.update((state) => ({
        ...state,
        gifs: [...state.gifs, ...response.gifs],
        loading: false,
        lastKnownGif: response.lastKnownGif,
      }))
    );
  }

  private fetchFromReddit(
    subreddit: string,
    after: string | null,
    gifsRequired: number){
    return this.http
      .get<RedditResponse>(
        `https://www.reddit.com/r/${subreddit}/hot/.json?limit=100` + (after ? `&after=${after}` : '')
      ).pipe(
        catchError((err) => EMPTY),
        map((response) => {
          const posts = response.data.children;
          const lastKnownGif = posts.length ? posts[posts.length - 1].data.name : null;

          return {
            gifs: this.convertRedditPostsToGifs(posts),
            gifsRequired,
            lastKnownGif,
          }
        })
      );
  }

  private convertRedditPostsToGifs(posts: RedditPost[]) {
    const defaultThumbnails = ['default', 'none', 'nsfw'];

    return posts
      .map((post) => {
        const thumbnail = post.data.thumbnail;
        const modifiedThumbnail = defaultThumbnails.includes(thumbnail)
          ? `/assets/${thumbnail}.png`
          : thumbnail;

        return {
          src: this.getBestSrcForGif(post),
          author: post.data.author,
          name: post.data.name,
          permalink: post.data.permalink,
          title: post.data.title,
          thumbnail: modifiedThumbnail,
          comments: post.data.num_comments,
        };
      })
      .filter((post): post is Gif => post.src !== null);
  }

  private getBestSrcForGif(post: RedditPost) {
    // If the source is in .mp4 format, leave unchanged
    if (post.data.url.indexOf('.mp4') > -1) {
      return post.data.url;
    }

    // If the source is in .gifv or .webm formats, convert to .mp4 and return
    if (post.data.url.indexOf('.gifv') > -1) {
      return post.data.url.replace('.gifv', '.mp4');
    }

    if (post.data.url.indexOf('.webm') > -1) {
      return post.data.url.replace('.webm', '.mp4');
    }

    // If the URL is not .gifv or .webm, check if media or secure media is available
    if (post.data.secure_media?.reddit_video) {
      return post.data.secure_media.reddit_video.fallback_url;
    }

    if (post.data.media?.reddit_video) {
      return post.data.media.reddit_video.fallback_url;
    }

    // If media objects are not available, check if a preview is available
    if (post.data.preview?.reddit_video_preview) {
      return post.data.preview.reddit_video_preview.fallback_url;
    }

    // No useable formats available
    return null;
  }
}
