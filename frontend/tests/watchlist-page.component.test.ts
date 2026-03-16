import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { WatchlistPageComponent } from '../src/app/features/watchlist/pages/watchlist-page.component';
import { WatchlistService } from '../src/app/features/watchlist/services/watchlist.service';

describe('WatchlistPageComponent', () => {
  let fixture: ComponentFixture<WatchlistPageComponent>;
  let watchlistService: { list: jest.Mock; remove: jest.Mock };

  beforeEach(async () => {
    watchlistService = { list: jest.fn(), remove: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [WatchlistPageComponent],
      providers: [{ provide: WatchlistService, useValue: watchlistService }]
    }).compileComponents();
  });

  it('renders watchlist entries and removes one', () => {
    watchlistService.list.mockReturnValue(
      of([{ id: 'watch-1', companyId: 'company-1', companyName: 'Acme', note: 'Review sanctions list', createdAt: '2026-03-15T00:00:00.000Z' }])
    );
    watchlistService.remove.mockReturnValue(of(undefined));

    fixture = TestBed.createComponent(WatchlistPageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Acme');

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(watchlistService.remove).toHaveBeenCalledWith('watch-1');
    expect(fixture.nativeElement.textContent).toContain('No watchlist entries yet');
  });

  it('renders an error state when loading fails', () => {
    watchlistService.list.mockReturnValue(throwError(() => ({ message: 'Unable to load watchlist.' })));

    fixture = TestBed.createComponent(WatchlistPageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Unable to load watchlist.');
  });
});
