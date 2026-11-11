import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BudgetService, HistoryEntry } from '../../services/budget.service';
import { ToastService } from '../../services/toast.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { currentYear, monthLabel } from '../../utils/dates';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements OnInit {
  readonly year = currentYear(); // els anys anteriors són a /historial/anys
  entries: HistoryEntry[] = [];
  months: string[] = [];
  loading = true;
  monthLabel = monthLabel;

  constructor(private budget: BudgetService, private toast: ToastService) { }

  ngOnInit(): void {
    this.budget.getHistory(this.year).subscribe({
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
}
