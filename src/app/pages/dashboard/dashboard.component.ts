import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BudgetService, Category } from '../../services/budget.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  categories: Category[] = [];
  newCatName = '';
  newCatLimit: number | null = null;

  // valors temporals per als inputs de despesa de cada categoria
  expenseAmount: { [key: number]: number } = {};
  expenseDesc: { [key: number]: string } = {};

  constructor(private budget: BudgetService, public auth: AuthService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.budget.getCategories().subscribe(data => this.categories = data);
  }

  addCategory(): void {
    if (!this.newCatName || !this.newCatLimit || this.newCatLimit <= 0) return;
    this.budget.createCategory(this.newCatName, this.newCatLimit).subscribe(() => {
      this.newCatName = '';
      this.newCatLimit = null;
      this.loadCategories();
    });
  }

  deleteCategory(id: number): void {
    this.budget.deleteCategory(id).subscribe(() => this.loadCategories());
  }

  addExpense(categoryId: number): void {
    const amount = this.expenseAmount[categoryId];
    if (!amount || amount <= 0) return;
    const desc = this.expenseDesc[categoryId] || 'Despesa';
    this.budget.addExpense(categoryId, amount, desc).subscribe(() => {
      this.expenseAmount[categoryId] = 0;
      this.expenseDesc[categoryId] = '';
      this.loadCategories();
    });
  }

  deleteExpense(expenseId: number): void {
    this.budget.deleteExpense(expenseId).subscribe(() => this.loadCategories());
  }

  spent(cat: Category): number {
    return cat.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  }

  remaining(cat: Category): number {
    return cat.limit_amount - this.spent(cat);
  }

  progressPct(cat: Category): number {
    return Math.min((this.spent(cat) / cat.limit_amount) * 100, 100);
  }

  logout(): void {
    this.auth.logout();
  }
}
