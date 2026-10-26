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

const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0);

/** État d'ensemble de plusieurs prêts à une date. */
export function mortgagesStatus(mortgages: Mortgage[], date: Date) {
  const statuses = mortgages.map(mortgage => mortgageStatus(mortgage, date));
  const running = mortgages.filter(
    (_, i) => statuses[i].remainingPrincipal > 0,
  );
  const principal = sum(mortgages.map(mortgage => mortgage.principal));
  const remaining = sum(statuses.map(status => status.remainingPrincipal));
  const endDate = new Date(
    Math.max(...statuses.map(status => status.endDate.getTime())),
  );

  return {
    principal,
    remainingPrincipal: remaining,
    repaidRatio: 1 - remaining / principal,
    monthlyPayment: sum(running.map(monthlyPayment)),
    monthlyInsurance: sum(running.map(m => m.monthlyInsurance ?? 0)),
    paidInterest: sum(statuses.map(status => status.paidInterest)),
    remainingInterest: sum(statuses.map(status => status.remainingInterest)),
    endDate,
    remainingYears: Math.max(
      0,
      Math.ceil(dayjs(endDate).diff(date, 'month', true) / 12),
    ),
  };
}

export type MortgagesStatus = ReturnType<typeof mortgagesStatus>;

/**
 * Capital restant dû de chaque prêt, de la première échéance au 1er janvier
 * qui suit la dernière, pour des aires empilées.
 */
export function yearlyBalances(mortgages: Mortgage[]) {
  const starts = mortgages.map(mortgage => dayjs(mortgage.firstPaymentDate));
  const start = dayjs(Math.min(...starts.map(day => day.valueOf())));
  const endYear = Math.max(
    ...mortgages.map((mortgage, i) =>
      starts[i].add(mortgage.durationMonths - 1, 'month').year(),
    ),
  );
  const dates = [start.toDate()];
  for (let year = start.year() + 1; year <= endYear + 1; year++) {
    dates.push(new Date(year, 0, 1));
  }

  return {
    x: dates.map(date => date.getTime()),
    balances: mortgages.map(mortgage =>
      dates.map(date => {
        const made = paymentsMade(mortgage, date);
        // Avant sa première échéance, un prêt ne compte pas encore.
        return made ? remainingPrincipal(mortgage, made) : 0;
      }),
    ),
  };
}

/** Capital, intérêts et assurance payés chaque année civile, tous prêts confondus. */
export function yearlyCosts(mortgages: Mortgage[]) {
  const years = new Map<
    number,
    {principal: number; interest: number; insurance: number}
  >();
  for (const mortgage of mortgages) {
    const first = dayjs(mortgage.firstPaymentDate);
    const payment = monthlyPayment(mortgage);
    for (let month = 0; month < mortgage.durationMonths; month++) {
      const year = first.add(month, 'month').year();
      const repaid =
        remainingPrincipal(mortgage, month) -
        remainingPrincipal(mortgage, month + 1);
      const costs = years.get(year) ?? {
        principal: 0,
        interest: 0,
        insurance: 0,
      };
      costs.principal += repaid;
      costs.interest += payment - repaid;
      costs.insurance += mortgage.monthlyInsurance ?? 0;
      years.set(year, costs);
    }
  }
  return [...years]
    .sort(([a], [b]) => a - b)
    .map(([year, costs]) => ({year, ...costs}));
}

const euros = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

export const formatEuros = (value: number) => euros.format(value);
