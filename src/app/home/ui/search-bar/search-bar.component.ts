import {Component, Input} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatToolbar} from "@angular/material/toolbar";
import {MatFormField, MatSuffix} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatToolbar,
    MatFormField,
    MatInput,
    MatIcon,
    MatSuffix
  ],
  template: `
    <mat-toolbar>
      <mat-form-field appearance="outline">
        <input
          matInput placeholder="subreddit..."
          type="text"
          [formControl]="subredditFormControl"
        />
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>
    </mat-toolbar>
  `,
  styles: [
    `
      mat-toolbar {
        height: 80px;
      }

      mat-form-field {
        width: 100%;
        padding-top: 20px;
      }
    `,
  ]
})
export class SearchBarComponent {
  @Input({required: true}) subredditFormControl!: FormControl;
}
