import dayjs from 'dayjs';

export type Mortgage = {
  /** Montant emprunté, en euros. */
  principal: number;
  /** Taux nominal annuel, en %. */
  annualRate: number;
  durationMonths: number;
  /** Date de la première échéance (AAAA-MM-JJ). */
  firstPaymentDate: string;
  /** Assurance mensuelle, en euros. */
  monthlyInsurance?: number;
};

const monthlyRate = (mortgage: Mortgage) => mortgage.annualRate / 100 / 12;

/** Mensualité hors assurance d'un prêt à échéances constantes. */
export function monthlyPayment(mortgage: Mortgage) {
  const {principal, durationMonths} = mortgage;
  const rate = monthlyRate(mortgage);
  if (rate === 0) return principal / durationMonths;
  return (principal * rate) / (1 - (1 + rate) ** -durationMonths);
}

/** Capital restant dû après `payments` échéances. */
export function remainingPrincipal(mortgage: Mortgage, payments: number) {
  const count = Math.min(Math.max(payments, 0), mortgage.durationMonths);
  if (count === mortgage.durationMonths) return 0;
  const rate = monthlyRate(mortgage);
  const payment = monthlyPayment(mortgage);
  if (rate === 0) return mortgage.principal - payment * count;
  const growth = (1 + rate) ** count;
  return mortgage.principal * growth - (payment * (growth - 1)) / rate;
}

/** Échéances prélevées à la date donnée, celle du jour comprise. */
export function paymentsMade(mortgage: Mortgage, date: Date) {
  const first = dayjs(mortgage.firstPaymentDate);
  const day = dayjs(date);
  if (day.isBefore(first, 'day')) return 0;
  return Math.min(day.diff(first, 'month') + 1, mortgage.durationMonths);
}

export function mortgageStatus(mortgage: Mortgage, date: Date) {
  const payment = monthlyPayment(mortgage);
  const made = paymentsMade(mortgage, date);
  const remaining = remainingPrincipal(mortgage, made);
  const totalInterest = payment * mortgage.durationMonths - mortgage.principal;
  const paidInterest = payment * made - (mortgage.principal - remaining);

  return {
    monthlyPayment: payment,
    paymentsMade: made,
    remainingPrincipal: remaining,
    repaidRatio: 1 - remaining / mortgage.principal,
    paidInterest,
    remainingInterest: totalInterest - paidInterest,
    endDate: dayjs(mortgage.firstPaymentDate)
      .add(mortgage.durationMonths - 1, 'month')
      .toDate(),
  };
}

/** Capital restant dû chaque année jusqu'à la fin du prêt, pour la courbe. */
export function yearlyBalance(mortgage: Mortgage) {
  const first = dayjs(mortgage.firstPaymentDate);
  const months = [];
  for (let month = 0; month < mortgage.durationMonths; month += 12) {
    months.push(month);
  }
  months.push(mortgage.durationMonths);
  return months.map(month => ({
    date: first.add(month, 'month').toDate(),
    remaining: remainingPrincipal(mortgage, month),
  }));
}

const euros = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

export const formatEuros = (value: number) => euros.format(value);
