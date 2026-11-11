import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BudgetService, HistoryEntry } from '../../services/budget.service';
import { ToastService } from '../../services/toast.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';

const MONTH_NAMES = ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny',
  'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'];

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements OnInit {
  entries: HistoryEntry[] = [];
  months: string[] = [];
  loading = true;

  constructor(private budget: BudgetService, private toast: ToastService) { }

  ngOnInit(): void {
    this.budget.getHistory().subscribe({
      next: data => {
        this.entries = data;
        this.months = [...new Set(data.map(e => e.month))];
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        if (err?.status !== 401) this.toast.error('No s\'ha pogut carregar l\'historial.');
      }
    });
  }

  entriesForMonth(month: string): HistoryEntry[] {
    return this.entries.filter(e => e.month === month);
  }

  totalForMonth(month: string): number {
    return this.entriesForMonth(month).reduce((sum, e) => sum + Number(e.total_spent), 0);
  }

  /** '2026-11' → 'Novembre 2026' */
  monthLabel(month: string): string {
    const [year, m] = month.split('-');
    return `${MONTH_NAMES[Number(m) - 1]} ${year}`;
  }
}
