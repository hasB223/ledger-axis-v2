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
    watchlistService.list.mockReturnValue(of([{ id: 'watch-2', companyId: 'company-2' }]));

    fixture = TestBed.createComponent(CompaniesListComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading companies...');

    companies$.next(companies);
    companies$.complete();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Acme');
    expect(fixture.nativeElement.textContent).toContain('Globex');
    expect(fixture.nativeElement.textContent).toContain('Watching');
  });

  it('renders an empty state when no companies are returned', () => {
    companiesService.list.mockReturnValue(of([]));
    watchlistService.list.mockReturnValue(of([]));

    fixture = TestBed.createComponent(CompaniesListComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No companies found');
  });

  it('renders an error state when company loading fails', () => {
    companiesService.list.mockReturnValue(throwError(() => ({ message: 'Unable to load companies.' })));

    fixture = TestBed.createComponent(CompaniesListComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Unable to load companies.');
  });

  it('applies filters using backend-aligned query params', () => {
    companiesService.list.mockReturnValue(of(companies));
    watchlistService.list.mockReturnValue(of([]));

    fixture = TestBed.createComponent(CompaniesListComponent);
    fixture.detectChanges();

    fixture.componentInstance.filtersForm.patchValue({
      q: 'Acme',
      industry: 'Technology',
      source: 'manual',
      sortBy: 'name',
      sortOrder: 'asc',
      limit: 20
    });
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(companiesService.list).toHaveBeenLastCalledWith({
      q: 'Acme',
      industry: 'Technology',
      source: 'manual',
      sortBy: 'name',
      sortOrder: 'asc',
      limit: 20,
      page: 1
    });
  });

  it('updates the watchlist button after a successful toggle', () => {
    companiesService.list.mockReturnValue(of([companies[0]]));
    watchlistService.list.mockReturnValue(of([]));
    watchlistService.add.mockReturnValue(of({ id: 'watch-1', companyId: 'company-1' }));

    fixture = TestBed.createComponent(CompaniesListComponent);
    fixture.detectChanges();

    const button = Array.from(fixture.nativeElement.querySelectorAll('button'))
      .map((item) => item as HTMLButtonElement)
      .find((item) => item.textContent?.includes('Watch')) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(watchlistService.add).toHaveBeenCalledWith('company-1');
    expect(fixture.nativeElement.textContent).toContain('Watching');
  });

  it('shows a watchlist error without mutating state when toggle fails', () => {
    companiesService.list.mockReturnValue(of([companies[0]]));
    watchlistService.list.mockReturnValue(of([]));
    watchlistService.add.mockReturnValue(throwError(() => ({ message: 'Unable to update watchlist.' })));

    fixture = TestBed.createComponent(CompaniesListComponent);
    fixture.detectChanges();

    const button = Array.from(fixture.nativeElement.querySelectorAll('button'))
      .map((item) => item as HTMLButtonElement)
      .find((item) => item.textContent?.includes('Watch')) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Unable to update watchlist.');
    expect(fixture.nativeElement.textContent).toContain('Watch');
  });
});
  const companies = [
    {
      id: 'company-1',
      tenantId: 'tenant-1',
      registrationNo: 'REG-1',
      name: 'Acme',
      industry: 'Technology',
      source: 'manual',
      status: 'active',
      annualRevenue: 1000,
      createdAt: '2026-03-14T00:00:00.000Z',
      updatedAt: '2026-03-15T00:00:00.000Z'
    },
    {
      id: 'company-2',
      tenantId: 'tenant-1',
      registrationNo: 'REG-2',
      name: 'Globex',
      industry: 'Finance',
      source: 'registry',
      status: 'inactive',
      annualRevenue: 2000,
      createdAt: '2026-03-14T00:00:00.000Z',
      updatedAt: '2026-03-15T00:00:00.000Z'
    }
  ];
