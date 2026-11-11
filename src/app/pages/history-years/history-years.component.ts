import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnalyticsResponse, BudgetService, HistoryEntry } from '../../services/budget.service';
import { ToastService } from '../../services/toast.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { APP_START_YEAR, currentYear, monthLabel } from '../../utils/dates';

interface MonthTotal {
  month: string;
  total: number;
  limit: number;
}

/** Informes per anys, des del 2026 (any de creació de l'app). Els anys passats són només de lectura. */
@Component({
  selector: 'app-history-years',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './history-years.component.html'
})
export class HistoryYearsComponent implements OnInit {
  readonly thisYear = currentYear();
  /** De l'any més recent al 2026. */
  readonly years = Array.from({ length: this.thisYear - APP_START_YEAR + 1 }, (_, i) => this.thisYear - i);

  selectedYear = this.thisYear > APP_START_YEAR ? this.thisYear - 1 : this.thisYear;
  monthTotals: MonthTotal[] = [];
  report: AnalyticsResponse | null = null;
  loading = false;
  monthLabel = monthLabel;

  constructor(private budget: BudgetService, private toast: ToastService) {}

  ngOnInit(): void {
    this.selectYear(this.selectedYear);
  }

  get hasPreviousYears(): boolean {
    return this.years.length > 1;
  }

  get yearTotal(): number {
    return this.monthTotals.reduce((sum, m) => sum + m.total, 0);
  }

  selectYear(year: number): void {
    this.selectedYear = year;
    this.loading = true;
    this.report = null;

    this.budget.getHistory(year).subscribe({
      next: rows => this.monthTotals = this.groupByMonth(rows),
      error: err => this.onError(err)
    });
    // informe de l'any amb els gràfics de pandas
    this.budget.getAnalytics(String(year)).subscribe({
      next: report => { this.report = report; this.loading = false; },
      error: err => this.onError(err)
    });
  }

  private groupByMonth(rows: HistoryEntry[]): MonthTotal[] {
    const map = new Map<string, MonthTotal>();
    for (const r of rows) {
      const m = map.get(r.month) ?? { month: r.month, total: 0, limit: 0 };
      m.total += Number(r.total_spent);
      m.limit += Number(r.limit_amount);
      map.set(r.month, m);
    }
    return [...map.values()].sort((a, b) => a.month.localeCompare(b.month));
  }

  private onError(err: any): void {
    this.loading = false;
    if (err?.status !== 401) this.toast.error('No s\'ha pogut carregar l\'informe de l\'any.');
  }
}
