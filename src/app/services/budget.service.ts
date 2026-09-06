import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Expense {
  id: number;
  amount: number;
  description: string;
  date: string;
}

export interface Category {
  id: number;
  name: string;
  limit_amount: number;
  expenses: Expense[];
}

export interface HistoryEntry {
  month: string;
  category_id: number;
  category_name: string;
  limit_amount: number;
  total_spent: number;
}


const API_URL = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {

  constructor(private http: HttpClient) { }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${API_URL}/categories`);
  }

  createCategory(name: string, limit_amount: number): Observable<Category> {
    return this.http.post<Category>(`${API_URL}/categories`, { name, limit_amount });
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/categories/${id}`);
  }

  addExpense(categoryId: number, amount: number, description: string): Observable<Expense> {
    return this.http.post<Expense>(`${API_URL}/categories/${categoryId}/expenses`, { amount, description });
  }

  deleteExpense(expenseId: number): Observable<any> {
    return this.http.delete(`${API_URL}/expenses/${expenseId}`);
  }

  getHistory(): Observable<HistoryEntry[]> {
    return this.http.get<HistoryEntry[]>(`${API_URL}/history`);
  }
}
