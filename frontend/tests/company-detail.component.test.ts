import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CompanyDetailComponent } from '../src/app/features/companies/components/company-detail.component';
import { CompaniesService } from '../src/app/features/companies/services/companies.service';
import { WatchlistService } from '../src/app/features/watchlist/services/watchlist.service';

describe('CompanyDetailComponent', () => {
  let fixture: ComponentFixture<CompanyDetailComponent>;
  let companiesService: { getById: jest.Mock; create: jest.Mock; update: jest.Mock };
  let watchlistService: { list: jest.Mock; add: jest.Mock; remove: jest.Mock };

  async function createComponent(id: string | null) {
    await TestBed.configureTestingModule({
      imports: [CompanyDetailComponent],
      providers: [
        { provide: CompaniesService, useValue: companiesService },
        { provide: WatchlistService, useValue: watchlistService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap(id ? { id } : {}) } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyDetailComponent);
    fixture.detectChanges();
  }

  beforeEach(() => {
    companiesService = { getById: jest.fn(), create: jest.fn(), update: jest.fn() };
    watchlistService = { list: jest.fn(), add: jest.fn(), remove: jest.fn() };
  });

  it('loads an existing company into the form and renders watchlist state', async () => {
    companiesService.getById.mockReturnValue(of(company));
    watchlistService.list.mockReturnValue(of([{ id: 'watch-1', companyId: 'company-1' }]));

    await createComponent('company-1');

    expect(fixture.componentInstance.form.getRawValue().name).toBe('Acme');
    expect(fixture.nativeElement.textContent).toContain('Remove from watchlist');
  });

  it('validates required company fields before saving', async () => {
    watchlistService.list.mockReturnValue(of([]));

    await createComponent(null);

    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Registration number is required.');
    expect(fixture.nativeElement.textContent).toContain('Name is required.');
    expect(companiesService.create).not.toHaveBeenCalled();
  });

  it('creates a company and shows a save message', async () => {
    watchlistService.list.mockReturnValue(of([]));
    companiesService.create.mockReturnValue(of({ ...company, id: 'company-99' }));

    await createComponent(null);
    fixture.componentInstance.form.setValue({
      registrationNo: 'REG-99',
      name: 'Acme',
      industry: 'Technology',
      source: 'manual',
      status: 'active',
      annualRevenue: 4500
    });
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(companiesService.create).toHaveBeenCalledWith({
      registrationNo: 'REG-99',
      name: 'Acme',
      industry: 'Technology',
      source: 'manual',
      status: 'active',
      annualRevenue: 4500
    });
    expect(fixture.nativeElement.textContent).toContain('Company created successfully.');
  });

  it('renders a save error for failed updates', async () => {
    companiesService.getById.mockReturnValue(of(company));
    companiesService.update.mockReturnValue(throwError(() => ({ message: 'Unable to save company.' })));
    watchlistService.list.mockReturnValue(of([]));

    await createComponent('company-1');
    fixture.componentInstance.form.patchValue({ industry: 'Fintech' });
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Unable to save company.');
  });

  it('toggles watchlist membership for an existing company', async () => {
    companiesService.getById.mockReturnValue(of(company));
    watchlistService.list.mockReturnValue(of([]));
    watchlistService.add.mockReturnValue(of({ id: 'watch-1', companyId: 'company-1' }));

    await createComponent('company-1');

    const button = Array.from(fixture.nativeElement.querySelectorAll('button'))
      .map((item) => item as HTMLButtonElement)
      .find((item) => item.textContent?.includes('Add to watchlist')) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(watchlistService.add).toHaveBeenCalledWith('company-1');
    expect(fixture.nativeElement.textContent).toContain('Remove from watchlist');
  });
});
  const company = {
    id: 'company-1',
    tenantId: 'tenant-1',
    registrationNo: 'REG-1',
    name: 'Acme',
    industry: 'Technology',
    source: 'manual',
    status: 'active',
    annualRevenue: 1200,
    createdAt: '2026-03-14T00:00:00.000Z',
    updatedAt: '2026-03-15T00:00:00.000Z'
  };
