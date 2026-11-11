import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BudgetService, Category, Expense, Income } from '../../services/budget.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { MonthCalendarComponent } from '../../components/month-calendar/month-calendar.component';
import { currentMonth, dayLabel, daysInMonth, isReadOnlyMonth, todayISO } from '../../utils/dates';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent, MonthCalendarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  categories: Category[] = [];
  incomes: Income[] = [];
  userName = '';

  // calendari: per defecte, avui
  selectedMonth = currentMonth();
  selectedDay = new Date().getDate();

  // formulari "Afegir despesa" (columna esquerra)
  expenseCategoryId: number | null = null;
  expenseDesc = '';
  expenseAmount: number | null = null;

  // formulari "Nova categoria"
  newCatName = '';
  newCatLimit: number | null = null;

  // rètol: ingressos
  showIncomeForm = false;
  showIncomeList = false;
  incomeDesc = '';
  incomeAmount: number | null = null;

  // cerca i filtre
  search = '';
  filterCategoryId: number | null = null;

  constructor(private budget: BudgetService, auth: AuthService, private toast: ToastService) {
    this.userName = auth.getUser()?.name ?? '';
  }

  ngOnInit(): void {
    this.loadMonth();
  }

  // ---------- calendari ----------

  /** Dia triat en format 'YYYY-MM-DD': és la data amb què es guarden despeses i ingressos nous. */
  get selectedDate(): string {
    return `${this.selectedMonth}-${String(this.selectedDay).padStart(2, '0')}`;
  }

  get selectedDateLabel(): string {
    return dayLabel(this.selectedDay, this.selectedMonth);
  }

  get isToday(): boolean {
    return this.selectedDate === todayISO();
  }

  get readOnly(): boolean {
    return isReadOnlyMonth(this.selectedMonth);
  }

  /** Dies del mes amb alguna despesa (per als puntets del calendari). */
  get markedDays(): number[] {
    const days = new Set<number>();
    this.categories.forEach(c => c.expenses.forEach(e => days.add(Number(e.date.slice(8, 10)))));
    return [...days];
  }

  onMonthChange(month: string): void {
    this.selectedMonth = month;
    // al mes actual, avui; a un mes passat, l'últim dia (es veu el mes sencer)
    this.selectedDay = month === currentMonth() ? new Date().getDate() : daysInMonth(month);
    this.loadMonth();
  }

  onDayChange(day: number): void {
    this.selectedDay = day; // no cal tornar a demanar res: filtrem el que ja tenim del mes
  }

  goToToday(): void {
    if (this.selectedMonth === currentMonth()) {
      this.selectedDay = new Date().getDate();
    } else {
      this.onMonthChange(currentMonth());
    }
  }

  // ---------- dades ----------

  private showError(err: any, fallback: string): void {
    if (err?.status === 401) return; // l'interceptor ja ho gestiona
    this.toast.error(err?.error?.error || fallback);
  }

  /** Categories (amb despeses) i ingressos del mes triat. */
  loadMonth(): void {
    forkJoin({
      categories: this.budget.getCategories(this.selectedMonth),
      incomes: this.budget.getIncomes(this.selectedMonth)
    }).subscribe({
      next: ({ categories, incomes }) => {
        this.categories = categories;
        this.incomes = incomes;
        if (!categories.some(c => c.id === this.expenseCategoryId)) {
          this.expenseCategoryId = categories[0]?.id ?? null;
        }
        if (!categories.some(c => c.id === this.filterCategoryId)) {
          this.filterCategoryId = null;
        }
      },
      error: err => this.showError(err, 'No s\'han pogut carregar les dades del mes.')
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
        this.loadMonth();
      },
      error: err => this.showError(err, 'No s\'ha pogut crear la categoria.')
    });
  }

  deleteCategory(cat: Category): void {
    if (!confirm(`Segur que vols eliminar "${cat.name}" i totes les seves despeses?`)) return;
    this.budget.deleteCategory(cat.id).subscribe({
      next: () => {
        this.toast.success('Categoria eliminada');
        this.loadMonth();
      },
      error: err => this.showError(err, 'No s\'ha pogut eliminar la categoria.')
    });
  }

  addExpense(): void {
    if (!this.expenseCategoryId) {
      this.toast.error('Tria una categoria.');
      return;
    }
    if (!this.expenseAmount || this.expenseAmount <= 0) {
      this.toast.error('Introdueix un import major que 0.');
      return;
    }
    const desc = this.expenseDesc.trim() || 'Despesa';
    this.budget.addExpense(this.expenseCategoryId, this.expenseAmount, desc, this.selectedDate).subscribe({
      next: () => {
        this.expenseAmount = null;
        this.expenseDesc = '';
        this.toast.success(this.isToday ? 'Despesa afegida' : `Despesa afegida el ${this.selectedDateLabel}`);
        this.loadMonth();
      },
      error: err => this.showError(err, 'No s\'ha pogut afegir la despesa.')
    });
  }

  deleteExpense(expenseId: number): void {
    this.budget.deleteExpense(expenseId).subscribe({
      next: () => {
        this.toast.success('Despesa eliminada');
        this.loadMonth();
      },
      error: err => this.showError(err, 'No s\'ha pogut eliminar la despesa.')
    });
  }

  addIncome(): void {
    if (!this.incomeAmount || this.incomeAmount <= 0) {
      this.toast.error('Introdueix un import major que 0.');
      return;
    }
    const desc = this.incomeDesc.trim() || 'Ingrés';
    this.budget.addIncome(this.incomeAmount, desc, this.selectedDate).subscribe({
      next: () => {
        this.incomeAmount = null;
        this.incomeDesc = '';
        this.showIncomeForm = false;
        this.toast.success(this.isToday ? 'Ingrés afegit' : `Ingrés afegit el ${this.selectedDateLabel}`);
        this.loadMonth();
      },
      error: err => this.showError(err, 'No s\'ha pogut afegir l\'ingrés.')
    });
  }

  deleteIncome(id: number): void {
    this.budget.deleteIncome(id).subscribe({
      next: () => {
        this.toast.success('Ingrés eliminat');
        this.loadMonth();
      },
      error: err => this.showError(err, 'No s\'ha pogut eliminar l\'ingrés.')
    });
  }

  // ---------- càlculs (fins al dia triat) ----------

  /** Despeses de la categoria des de l'1 del mes fins al dia triat (inclòs). */
  visibleExpenses(cat: Category): Expense[] {
    return cat.expenses.filter(e => e.date <= this.selectedDate);
  }

  spent(cat: Category): number {
    return this.visibleExpenses(cat).reduce((sum, e) => sum + Number(e.amount), 0);
  }

  remaining(cat: Category): number {
    return Number(cat.limit_amount) - this.spent(cat);
  }

  progressPct(cat: Category): number {
    return Math.min((this.spent(cat) / Number(cat.limit_amount)) * 100, 100);
  }

  get totalSpent(): number {
    return this.categories.reduce((sum, c) => sum + this.spent(c), 0);
  }

  get totalLimit(): number {
    return this.categories.reduce((sum, c) => sum + Number(c.limit_amount), 0);
  }

  /** Ingressos del mes fins al dia triat. */
  get visibleIncomes(): Income[] {
    return this.incomes.filter(i => i.date <= this.selectedDate);
  }

  get totalIncome(): number {
    return this.visibleIncomes.reduce((sum, i) => sum + Number(i.amount), 0);
  }

  /** El que diu el rètol: ingressos − despeses del mes, fins al dia triat. */
  get balance(): number {
    return this.totalIncome - this.totalSpent;
  }

  /** La despesa es va apuntar a l'app en un mes posterior al del dia en què es va gastar. */
  addedLater(e: Expense): boolean {
    return !!e.created_at && new Date(e.created_at) > new Date(`${e.date.slice(0, 7)}-${daysInMonth(e.date.slice(0, 7))}T23:59:59`);
  }

  // ---------- cerca i filtre ----------

  private matches(e: Expense, cat: Category): boolean {
    const q = this.search.trim().toLowerCase();
    if (!q) return true;
    const amount = Number(e.amount).toFixed(2);
    return (e.description ?? '').toLowerCase().includes(q)
      || cat.name.toLowerCase().includes(q)
      || amount.includes(q.replace(',', '.'));
  }

  get isFiltering(): boolean {
    return !!this.search.trim() || this.filterCategoryId !== null;
  }

  /** Despeses que es mostren a la llista d'una categoria (respecten la cerca). */
  listedExpenses(cat: Category): Expense[] {
    return this.visibleExpenses(cat).filter(e => this.matches(e, cat));
  }

  /** Categories que es mostren (respecten el filtre i, si hi ha cerca, només les que tenen resultats). */
  get listedCategories(): Category[] {
    return this.categories
      .filter(c => this.filterCategoryId === null || c.id === this.filterCategoryId)
      .filter(c => !this.search.trim() || this.listedExpenses(c).length > 0);
  }

  get resultCount(): number {
    return this.listedCategories.reduce((n, c) => n + this.listedExpenses(c).length, 0);
  }

  clearFilters(): void {
    this.search = '';
    this.filterCategoryId = null;
  }
}
