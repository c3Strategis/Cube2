import { Component, OnInit, input, effect } from '@angular/core';
import { Command } from '../feature-module.model';
import { CrashMapComponent } from '../feature-modules/crash/crash-map/crash-map.component';
import { CrashAnalysisComponent } from '../feature-modules/crash/crash-analysis/crash-analysis.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-feature-module-connect',
  standalone: true,
  imports: [CrashMapComponent, CrashAnalysisComponent],
  templateUrl: './feature-module-connect.component.html',
  styleUrl: './feature-module-connect.component.scss'
})


export class FeatureModuleConnectComponent implements OnInit{
  // command = input.required<Command>({alias: 'c'})
  module_instance: string = ''

  public FMC!: string
  public module_show!: string
  constructor(private route:ActivatedRoute) {
    // effect(() => {
    //   this.FMCCommand = this.command()
    // }, {allowSignalWrites: true})
  }
  public FMCCommand!: Command
  ngOnInit(): void {
    //need to search for the module indenty from the instance via http
    this.module_instance = this.route.snapshot.paramMap.get('id') || ''
    switch (this.module_instance) {
      case '1':
        this.module_show = "crashanalysis"
    }
    //if 'id' is null, then redirect to root
  }
}
