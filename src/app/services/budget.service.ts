import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Expense {
  id: number;
  amount: number;
  description: string;
  date: string;        // 'YYYY-MM-DD': el dia en què es va gastar
  created_at?: string; // quan es va apuntar a l'app
}

export interface Category {
  id: number;
  name: string;
  limit_amount: number;
  expenses: Expense[];
}

export interface Income {
  id: number;
  amount: number;
  description: string;
  date: string;        // 'YYYY-MM-DD': el dia que entra
  created_at?: string;
}

export interface HistoryEntry {
  month: string;
  category_id: number;
  category_name: string;
  limit_amount: number;
  total_spent: number;
}

export interface AnalyticsCategory {
  category: string;
  total: number;
  pct: number;
}

export interface AnalyticsResponse {
  month: string;
  months: string[];
  total: number;
  categories: AnalyticsCategory[];
  monthly: { month: string; total: number }[];
  chart_categories: string | null; // PNG en base64 generat amb Python
  chart_monthly: string | null;
}

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class BudgetService {

  constructor(private http: HttpClient) { }

  /** Categories amb les despeses del mes indicat ('YYYY-MM'; per defecte, l'actual). */
  getCategories(month?: string): Observable<Category[]> {
    const params: Record<string, string> = month ? { month } : {};
    return this.http.get<Category[]>(`${API_URL}/categories`, { params });
  }

  createCategory(name: string, limit_amount: number): Observable<Category> {
    return this.http.post<Category>(`${API_URL}/categories`, { name, limit_amount });
  }

  updateCategory(id: number, name: string, limit_amount: number): Observable<Category> {
    return this.http.put<Category>(`${API_URL}/categories/${id}`, { name, limit_amount });
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/categories/${id}`);
  }

  /** `date` és el dia triat al calendari ('YYYY-MM-DD'), no el dia d'avui. */
  addExpense(categoryId: number, amount: number, description: string, date: string): Observable<Expense> {
    return this.http.post<Expense>(`${API_URL}/categories/${categoryId}/expenses`, { amount, description, date });
  }

  deleteExpense(expenseId: number): Observable<any> {
    return this.http.delete(`${API_URL}/expenses/${expenseId}`);
  }

  /** Ingressos del mes indicat ('YYYY-MM'). */
  getIncomes(month: string): Observable<Income[]> {
    return this.http.get<Income[]>(`${API_URL}/incomes`, { params: { month } });
  }

  addIncome(amount: number, description: string, date: string): Observable<Income> {
    return this.http.post<Income>(`${API_URL}/incomes`, { amount, description, date });
  }

  deleteIncome(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/incomes/${id}`);
  }

  getHistory(year?: number): Observable<HistoryEntry[]> {
    const params: Record<string, string> = year ? { year: String(year) } : {};
    return this.http.get<HistoryEntry[]>(`${API_URL}/history`, { params });
  }

  /** month: 'all', un any 'YYYY' o un mes 'YYYY-MM'. */
  getAnalytics(month: string = 'all'): Observable<AnalyticsResponse> {
    return this.http.get<AnalyticsResponse>(`${API_URL}/analytics`, { params: { month } });
  }
}
