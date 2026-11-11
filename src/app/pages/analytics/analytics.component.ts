import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsResponse, BudgetService } from '../../services/budget.service';
import { ToastService } from '../../services/toast.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';

const MONTH_NAMES = ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny',
  'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'];

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent implements OnInit {
  data: AnalyticsResponse | null = null;
  months: string[] = [];
  selectedMonth = 'all';
  loading = false;

  constructor(private budget: BudgetService, private toast: ToastService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.budget.getAnalytics(this.selectedMonth).subscribe({
      next: data => {
        this.data = data;
        this.months = data.months;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        if (err?.status !== 401) {
          this.toast.error(err?.error?.error || 'No s\'ha pogut carregar l\'anàlisi.');
        }
      }
    });
  }

  /** La categoria on s'ha gastat més (la primera, ja ve ordenada del backend). */
  get topCategory() {
    return this.data?.categories[0] ?? null;
  }

  monthLabel(month: string): string {
    const [year, m] = month.split('-');
    return `${MONTH_NAMES[Number(m) - 1]} ${year}`;
  }
}
