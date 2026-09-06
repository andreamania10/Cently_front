import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BudgetService, HistoryEntry } from '../../services/budget.service';


@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styles: './history.components.scss'
})
export class HistoryComponent implements OnInit {
  entries: HistoryEntry[] = [];
  months: string[] = [];

  constructor(private budget: BudgetService) { }

  ngOnInit(): void {
    this.budget.getHistory().subscribe(data => {
      this.entries = data;
      this.months = [...new Set(data.map(e => e.month))];
    });
  }

  entriesForMonth(month: string): HistoryEntry[] {
    return this.entries.filter(e => e.month === month);
  }
}
