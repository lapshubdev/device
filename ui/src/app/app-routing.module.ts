import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TrackdrivingComponent } from './trackdriving/trackdriving.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [{
    path: '',
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'laptimes', component: TrackdrivingComponent },
      { path: 'settings', component: SettingsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
