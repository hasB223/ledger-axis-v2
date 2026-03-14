import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  InjectionToken,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import ChartLib from 'chart.js/auto';

export const CHART_CONSTRUCTOR = new InjectionToken<typeof ChartLib>('CHART_CONSTRUCTOR', {
  providedIn: 'root',
  factory: () => ChartLib
});

@Component({
  selector: 'ledger-axis-analytics-chart',
  standalone: true,
  imports: [CommonModule],
  template: `<canvas #canvas></canvas>`
})
export class AnalyticsChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() labels: string[] = [];
  @Input() values: number[] = [];
  @Input() title = 'Series';

  @ViewChild('canvas', { static: true }) private readonly canvas?: ElementRef<HTMLCanvasElement>;

  private readonly chartConstructor = inject(CHART_CONSTRUCTOR);
  private chart: ChartLib | null = null;

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.chart) {
      this.chart.destroy();
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private renderChart(): void {
    const canvas = this.canvas?.nativeElement;

    if (!canvas) {
      return;
    }

    this.chart = new this.chartConstructor(canvas, {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: [{ label: this.title, data: this.values }]
      }
    });
  }
}
