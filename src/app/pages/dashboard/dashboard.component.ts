import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BudgetService, Category } from '../../services/budget.service';
import { ToastService } from '../../services/toast.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  categories: Category[] = [];
  newCatName = '';
  newCatLimit: number | null = null;

  // valors temporals per als inputs de despesa de cada categoria
  expenseAmount: { [key: number]: number | null } = {};
  expenseDesc: { [key: number]: string } = {};

  constructor(private budget: BudgetService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  private showError(err: any, fallback: string): void {
    if (err?.status === 401) return; // l'interceptor ja ho gestiona
    this.toast.error(err?.error?.error || fallback);
  }

  loadCategories(): void {
    this.budget.getCategories().subscribe({
      next: data => this.categories = data,
      error: err => this.showError(err, 'No s\'han pogut carregar les categories.')
    });
  }

  addCategory(): void {
    if (!this.newCatName.trim() || !this.newCatLimit || this.newCatLimit <= 0) {
      this.toast.error('Posa un nom i un límit major que 0.');
      return;
    }
    this.budget.createCategory(this.newCatName.trim(), this.newCatLimit).subscribe({
      next: () => {
        this.newCatName = '';
        this.newCatLimit = null;
        this.toast.success('Categoria creada');
        this.loadCategories();
      },
      error: err => this.showError(err, 'No s\'ha pogut crear la categoria.')
    });
  }

  deleteCategory(cat: Category): void {
    if (!confirm(`Segur que vols eliminar "${cat.name}" i totes les seves despeses?`)) return;
    this.budget.deleteCategory(cat.id).subscribe({
      next: () => {
        this.toast.success('Categoria eliminada');
        this.loadCategories();
      },
      error: err => this.showError(err, 'No s\'ha pogut eliminar la categoria.')
    });
  }

  addExpense(categoryId: number): void {
    const amount = this.expenseAmount[categoryId];
    if (!amount || amount <= 0) {
      this.toast.error('Introdueix un import major que 0.');
      return;
    }
    const desc = this.expenseDesc[categoryId] || 'Despesa';
    this.budget.addExpense(categoryId, amount, desc).subscribe({
      next: () => {
        this.expenseAmount[categoryId] = null;
        this.expenseDesc[categoryId] = '';
        this.toast.success('Despesa afegida');
        this.loadCategories();
      },
      error: err => this.showError(err, 'No s\'ha pogut afegir la despesa.')
    });
  }

  deleteExpense(expenseId: number): void {
    this.budget.deleteExpense(expenseId).subscribe({
      next: () => {
        this.toast.success('Despesa eliminada');
        this.loadCategories();
      },
      error: err => this.showError(err, 'No s\'ha pogut eliminar la despesa.')
    });
  }

  spent(cat: Category): number {
    return cat.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  }

  remaining(cat: Category): number {
    return Number(cat.limit_amount) - this.spent(cat);
  }

  progressPct(cat: Category): number {
    return Math.min((this.spent(cat) / Number(cat.limit_amount)) * 100, 100);
  }
}
