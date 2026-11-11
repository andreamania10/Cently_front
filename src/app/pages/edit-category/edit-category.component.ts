import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BudgetService } from '../../services/budget.service';
import { ToastService } from '../../services/toast.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-edit-category',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent],
  templateUrl: './edit-category.component.html',
  styleUrl: './edit-category.component.scss'
})
export class EditCategoryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private budget = inject(BudgetService);
  private toast = inject(ToastService);

  id = Number(this.route.snapshot.paramMap.get('id'));
  loading = true;
  saving = false;

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    limit_amount: [0, [Validators.required, Validators.min(0.01)]]
  });

  ngOnInit(): void {
    this.budget.getCategories().subscribe({
      next: cats => {
        const cat = cats.find(c => c.id === this.id);
        if (!cat) {
          this.toast.error('Categoria no trobada.');
          this.router.navigate(['/dashboard']);
          return;
        }
        this.form.patchValue({ name: cat.name, limit_amount: Number(cat.limit_amount) });
        this.loading = false;
      },
      error: () => this.router.navigate(['/dashboard'])
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    const { name, limit_amount } = this.form.getRawValue();
    this.budget.updateCategory(this.id, name.trim(), limit_amount).subscribe({
      next: () => {
        this.toast.success('Categoria actualitzada');
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.saving = false;
        if (err?.status !== 401) {
          this.toast.error(err?.error?.error || 'No s\'ha pogut actualitzar la categoria.');
        }
      }
    });
  }
}
