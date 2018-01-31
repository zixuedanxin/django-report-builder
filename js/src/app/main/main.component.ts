import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { setSearch } from './utils/filterSearch';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/fromEventPattern';
import { RightSidebarComponent } from './right-sidebar/right-sidebar.component';

import {
  State,
  getReports,
  getRelatedFields,
  getFields,
  getRightNavIsOpen,
  getLeftNavIsOpen,
  getReportSearchTerm,
  getFieldSearchTerm,
  getRelationsSearchTerm,
  getSelectedReport,
  getActiveTab,
} from '../reducers';
import { IRelatedField } from '../api.interfaces';
import {
  GetReportList,
  GetReport,
  GetFields,
  GetRelatedFields,
  SetReportSearchText,
  SetFieldSearchText,
  SetRelationsSearchText,
  ToggleLeftNav,
  ToggleRightNav,
} from '../actions/reports';
import { AddOne as AddDisplayField } from '../actions/display-field';

@Component({
  selector: 'app-main',
  template: `
    <mat-sidenav-container class="left-sidenav-container">
      <app-left-sidebar
        [listReports]="listReports$ | async"
        (onClickReport)="onClickReport($event)"
        (searchReports)="searchReports($event)"
        (onToggleLeftNav)="onToggleLeftNav()"
        (onToggleRightNav)="onToggleRightNav()"
        [leftNavIsOpen]="leftNavIsOpen$ | async"
        [rightNavIsOpen]="rightNavIsOpen$ | async"
      ></app-left-sidebar>
      <div class="example-sidenav-content" style="padding-left: 100px;">
        <app-tabs>
        </app-tabs>
      </div>
      <app-right-sidebar #rightMenu
        [modelName]="(selectedReport$ | async)?.name"
        [relatedFields]="relatedFields$ | async"
        [fields]="fields$ | async"
        (selectRelatedField)="selectRelatedField($event)"
        (searchFields)="searchFields($event)"
        (searchRelations)="searchRelations($event)"
        (onToggleRightNav)="onToggleRightNav()"
        [rightNavIsOpen]="rightNavIsOpen$ | async"
      ></app-right-sidebar>
    </mat-sidenav-container>
  `,
})
export class MainComponent implements OnInit {
  listReports$ = Observable.combineLatest(
    this.store.select(getReports),
    this.store.select(getReportSearchTerm),
    setSearch
  );

  fields$ = Observable.combineLatest(
    this.store.select(getFields),
    this.store.select(getFieldSearchTerm),
    setSearch
  );

  relatedFields$ = Observable.combineLatest(
    this.store.select(getRelatedFields),
    this.store.select(getRelationsSearchTerm),
    setSearch
  );

  selectedReport$ = this.store.select(getSelectedReport);
  leftNavIsOpen$ = this.store.select(getLeftNavIsOpen);
  rightNavIsOpen$ = this.store.select(getRightNavIsOpen);
  getFields$ = this.store.select(getFields);
  currentTab$ = this.store.select(getActiveTab);
  @ViewChild('rightMenu') rightMenu: RightSidebarComponent;

  constructor(private store: Store<State>) {}

  ngOnInit() {
    this.store.dispatch(new GetReportList());
    this.rightMenu.addReportField
      .asObservable()
      .withLatestFrom(this.currentTab$)
      .subscribe(([field, tabI]) => {
        switch (tabI) {
          case 0:
            this.store.dispatch(new AddDisplayField(field));
        }
      });
  }

  onClickReport(reportId: number) {
    this.store.dispatch(new GetReport(reportId));
  }

  selectRelatedField(relatedField: IRelatedField) {
    this.store.dispatch(new GetFields(relatedField));
    this.store.dispatch(new GetRelatedFields(relatedField));
  }

  searchReports(searchTerm: string) {
    this.store.dispatch(new SetReportSearchText(searchTerm));
  }

  searchFields(searchTerm: string) {
    this.store.dispatch(new SetFieldSearchText(searchTerm));
  }

  searchRelations(searchTerm: string) {
    this.store.dispatch(new SetRelationsSearchText(searchTerm));
  }

  onToggleLeftNav() {
    this.store.dispatch(new ToggleLeftNav());
  }

  onToggleRightNav() {
    this.store.dispatch(new ToggleRightNav());
  }
}