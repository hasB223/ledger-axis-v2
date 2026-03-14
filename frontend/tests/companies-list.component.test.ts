import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { CompaniesListComponent } from '../src/app/features/companies/components/companies-list.component';
import { CompaniesService } from '../src/app/features/companies/services/companies.service';
import { WatchlistService } from '../src/app/features/watchlist/services/watchlist.service';

describe('CompaniesListComponent', () => {
  let fixture: ComponentFixture<CompaniesListComponent>;
  let companiesService: { list: jest.Mock };
  let watchlistService: { list: jest.Mock; add: jest.Mock; remove: jest.Mock };

  beforeEach(async () => {
    companiesService = { list: jest.fn() };
    watchlistService = { list: jest.fn(), add: jest.fn(), remove: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [CompaniesListComponent],
      providers: [
        provideRouter([]),
        { provide: CompaniesService, useValue: companiesService },
        { provide: WatchlistService, useValue: watchlistService }
      ]
    }).compileComponents();
  });

  it('renders a loading state and then the company list with watchlist state', () => {
    const companies$ = new Subject<any[]>();
    companiesService.list.mockReturnValue(companies$);
    watchlistService.list.mockReturnValue(of([{ companyId: 'company-2' }]));

    fixture = TestBed.createComponent(CompaniesListComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading companies...');

    companies$.next([
      { id: 'company-1', name: 'Acme', country: 'MY', status: 'active', description: 'First company' },
      { id: 'company-2', name: 'Globex', country: 'SG', status: 'inactive', description: 'Second company' }
    ]);
    companies$.complete();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Acme');
    expect(fixture.nativeElement.textContent).toContain('Globex');
    expect(fixture.nativeElement.textContent).toContain('Remove from watchlist');
  });

  it('renders an empty state when no companies are returned', () => {
    companiesService.list.mockReturnValue(of([]));
    watchlistService.list.mockReturnValue(of([]));

    fixture = TestBed.createComponent(CompaniesListComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No companies found.');
  });

  it('renders an error state when company loading fails', () => {
    companiesService.list.mockReturnValue(throwError(() => ({ message: 'Unable to load companies.' })));

    fixture = TestBed.createComponent(CompaniesListComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Unable to load companies.');
  });

  it('updates the watchlist button after a successful toggle', () => {
    companiesService.list.mockReturnValue(
      of([{ id: 'company-1', name: 'Acme', country: 'MY', status: 'active', description: 'First company' }])
    );
    watchlistService.list.mockReturnValue(of([]));
    watchlistService.add.mockReturnValue(of({ companyId: 'company-1' }));

    fixture = TestBed.createComponent(CompaniesListComponent);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(watchlistService.add).toHaveBeenCalledWith('company-1');
    expect(fixture.nativeElement.textContent).toContain('Remove from watchlist');
  });

  it('shows a watchlist error without mutating state when toggle fails', () => {
    companiesService.list.mockReturnValue(
      of([{ id: 'company-1', name: 'Acme', country: 'MY', status: 'active', description: 'First company' }])
    );
    watchlistService.list.mockReturnValue(of([]));
    watchlistService.add.mockReturnValue(throwError(() => ({ message: 'Unable to update watchlist.' })));

    fixture = TestBed.createComponent(CompaniesListComponent);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Unable to update watchlist.');
    expect(fixture.nativeElement.textContent).toContain('Add to watchlist');
  });
});
