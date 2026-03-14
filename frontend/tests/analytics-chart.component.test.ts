import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnalyticsChartComponent, CHART_CONSTRUCTOR } from '../src/app/shared/components/analytics-chart.component';
import { jest } from '@jest/globals';

describe('AnalyticsChartComponent', () => {
  let fixture: ComponentFixture<AnalyticsChartComponent>;
  const chartConstructor = jest.fn().mockImplementation(() => ({
    destroy: jest.fn()
  }));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsChartComponent],
      providers: [{ provide: CHART_CONSTRUCTOR, useValue: chartConstructor }]
    }).compileComponents();

    chartConstructor.mockClear();
    fixture = TestBed.createComponent(AnalyticsChartComponent);
  });

  it('creates a chart with the provided config and recreates it on input change', () => {
    fixture.componentRef.setInput('labels', ['Jan', 'Feb']);
    fixture.componentRef.setInput('values', [10, 20]);
    fixture.componentRef.setInput('title', 'Revenue');
    fixture.detectChanges();

    expect(chartConstructor).toHaveBeenCalledWith(
      expect.any(HTMLCanvasElement),
      expect.objectContaining({
        type: 'bar',
        data: expect.objectContaining({
          labels: ['Jan', 'Feb'],
          datasets: [expect.objectContaining({ label: 'Revenue', data: [10, 20] })]
        })
      })
    );

    const firstInstance = chartConstructor.mock.results[0]?.value as { destroy: jest.Mock };
    fixture.componentRef.setInput('values', [30, 40]);
    fixture.detectChanges();

    expect(firstInstance.destroy).toHaveBeenCalled();
    expect(chartConstructor).toHaveBeenCalledTimes(2);
  });
});
