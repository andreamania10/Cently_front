import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { APP_START_YEAR, addMonths, currentMonth, daysInMonth, monthLabel, todayISO } from '../../utils/dates';

interface DayCell {
  day: number;
  iso: string;
  future: boolean;
  today: boolean;
  marked: boolean;
}

/**
 * Calendari mensual petit. Mostra un mes, marca els dies amb despeses i
 * deixa triar un dia (mai futur). Navega entre gener de 2026 i el mes actual.
 */
@Component({
  selector: 'app-month-calendar',
  standalone: true,
  template: `
    <div class="cal">
      <div class="cal-head">
        <button type="button" class="btn btn-sm btn-light" (click)="go(-1)" [disabled]="!canGoBack"
          aria-label="Mes anterior">‹</button>
        <span class="fw-semibold">{{ label }}</span>
        <button type="button" class="btn btn-sm btn-light" (click)="go(1)" [disabled]="!canGoForward"
          aria-label="Mes següent">›</button>
      </div>

      <div class="cal-grid" role="grid" [attr.aria-label]="label">
        @for (w of weekdays; track w) {
          <span class="cal-wd" aria-hidden="true">{{ w }}</span>
        }
        @for (blank of blanks; track $index) {
          <span></span>
        }
        @for (c of cells; track c.iso) {
          <button type="button" class="cal-day"
            [class.selected]="c.day === selectedDay"
            [class.today]="c.today"
            [disabled]="c.future"
            [attr.aria-pressed]="c.day === selectedDay"
            [attr.aria-label]="c.day + ' ' + label + (c.marked ? ', amb despeses' : '')"
            (click)="dayChange.emit(c.day)">
            {{ c.day }}
            @if (c.marked) { <i class="dot" aria-hidden="true"></i> }
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .cal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: .5rem; }
    .cal-head .btn { width: 2rem; font-size: 1.1rem; line-height: 1; }
    .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center; }
    .cal-wd { font-size: .75rem; color: var(--bs-secondary-color); padding-bottom: .25rem; }
    .cal-day {
      position: relative; border: 0; background: none; border-radius: .5rem;
      aspect-ratio: 1 / 1; max-height: 2.6rem; font-size: .9rem; color: var(--bs-body-color);
    }
    .cal-day:hover:not(:disabled) { background: var(--bs-tertiary-bg); }
    .cal-day:disabled { color: var(--bs-tertiary-color); opacity: .45; }
    .cal-day.today { font-weight: 700; }
    .cal-day.selected { background: var(--bs-warning); color: #000; font-weight: 700; }
    .cal-day:focus-visible { outline: 2px solid var(--bs-warning-text-emphasis); outline-offset: 1px; }
    .dot {
      position: absolute; left: 50%; bottom: 3px; width: 5px; height: 5px; margin-left: -2.5px;
      border-radius: 50%; background: var(--bs-warning-text-emphasis);
    }
    .cal-day.selected .dot { background: #000; }
  `]
})
export class MonthCalendarComponent implements OnChanges {
  /** Mes mostrat, 'YYYY-MM'. */
  @Input({ required: true }) month!: string;
  /** Dia triat (1-31). */
  @Input({ required: true }) selectedDay!: number;
  /** Dies del mes que tenen alguna despesa. */
  @Input() markedDays: number[] = [];

  @Output() monthChange = new EventEmitter<string>();
  @Output() dayChange = new EventEmitter<number>();

  readonly weekdays = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'];
  cells: DayCell[] = [];
  blanks: number[] = [];
  label = '';
  canGoBack = false;
  canGoForward = false;

  ngOnChanges(): void {
    const today = todayISO();
    const marked = new Set(this.markedDays);
    const [y, m] = this.month.split('-').map(Number);
    const firstWeekday = (new Date(y, m - 1, 1).getDay() + 6) % 7; // dilluns = 0

    this.label = monthLabel(this.month);
    this.blanks = Array(firstWeekday).fill(0);
    this.cells = Array.from({ length: daysInMonth(this.month) }, (_, i) => {
      const day = i + 1;
      const iso = `${this.month}-${String(day).padStart(2, '0')}`;
      return { day, iso, future: iso > today, today: iso === today, marked: marked.has(day) };
    });
    this.canGoBack = this.month > `${APP_START_YEAR}-01`;
    this.canGoForward = this.month < currentMonth();
  }

  go(delta: number): void {
    this.monthChange.emit(addMonths(this.month, delta));
  }
}
