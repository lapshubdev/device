import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PoweroffComponent } from './dialogs/poweroff/poweroff.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MapComponent } from './trackdriving/map/map.component';
// internal services
import { SocketioService } from './socketio.service';
import { TrackDrivingService } from './trackdriving/trackdriving.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from "@angular/material/dialog";
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatAccordion } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { TrackdrivingComponent } from './trackdriving/trackdriving.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { UserLaptimesComponent } from './trackdriving/user-laptimes/user-laptimes.component';
import { SettingsComponent } from './settings/settings.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { OthersLaptimesComponent } from './trackdriving/others-laptimes/others-laptimes.component';

@NgModule({
  declarations: [
    AppComponent,
    PoweroffComponent,
    DashboardComponent,
    TrackdrivingComponent,
    ToolbarComponent,
    MapComponent,
    UserLaptimesComponent,
    SettingsComponent,
    OthersLaptimesComponent
  ],
  imports: [
    BrowserModule,
    LeafletModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatGridListModule,
    MatCardModule,
    MatButtonModule,
    MatRippleModule,
    MatToolbarModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatBadgeModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatTabsModule,
    MatSelectModule,
    MatInputModule,
    MatMenuModule,
    MatDialogModule,
    FormsModule,
    FlexLayoutModule
  ],
  providers: [SocketioService,TrackDrivingService],
  bootstrap: [AppComponent]
})
export class AppModule { }
