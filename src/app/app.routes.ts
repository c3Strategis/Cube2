import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AppComponent } from './app.component';
import { MapComponent } from './map/map/map.component';
import { authenticationGuard } from '../_guards/auth.guard';
import { CrashAnalysisComponent } from './feature-modules/feature-modules/crash/crash-analysis/crash-analysis.component';
import { FeatureModuleConnectComponent } from './feature-modules/feature-module-connect/feature-module-connect.component';

export const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: '', component: MapComponent, canActivate: [authenticationGuard()]},
    {path: 'crashanalysis', component: CrashAnalysisComponent, canActivate: [authenticationGuard()]},
    {path: 'moduleinstance/:id', component: FeatureModuleConnectComponent}
    
];
