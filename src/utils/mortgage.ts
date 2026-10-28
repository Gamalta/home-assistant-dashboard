import dayjs from 'dayjs';

/** Une échéance : le mois (`AAAA-MM`) et ses parts de capital, d'intérêts et d'assurance. */
export type Payment = {
  month: string;
  principal: number;
  interest: number;
  insurance: number;
};

export type Loan = {
  label: string;
  payments: Payment[];
};

type Amounts = Record<string, number>;

// Les attributs Home Assistant sont du JSON sans type.
const amountsOf = (value: unknown) =>
  (value && typeof value === 'object' ? value : {}) as Amounts;

/**
 * Échéancier lu dans les attributs `principal`, `interest` et `insurance`
 * d'une entité : chacun associe un mois `AAAA-MM` à un montant.
 */
export function loanPayments(attributes: Record<string, unknown>): Payment[] {
  const principal = amountsOf(attributes.principal);
  const interest = amountsOf(attributes.interest);
  const insurance = amountsOf(attributes.insurance);

  return Object.keys(principal)
    .sort()
    .map(month => ({
      month,
      principal: principal[month],
      interest: interest[month] ?? 0,
      insurance: insurance[month] ?? 0,
    }));
}

const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0);

// Au centime : la somme des parts de capital ne retombe pas pile sur zéro.
const cents = (value: number) => Math.round(value * 100) / 100;

/** État d'ensemble des prêts à une date : l'échéance d'un mois compte dès son 1er jour. */
export function loansStatus(loans: Loan[], date: Date) {
  const current = dayjs(date).format('YYYY-MM');
  const payments = loans.flatMap(loan => loan.payments);
  const paid = payments.filter(payment => payment.month <= current);
  const thisMonth = payments.filter(payment => payment.month === current);
  const months = [...new Set(payments.map(payment => payment.month))].sort();
  const principal = sum(payments.map(payment => payment.principal));
  const remaining = cents(
    principal - sum(paid.map(payment => payment.principal)),
  );
  const paidInterest = sum(paid.map(payment => payment.interest));

  return {
    principal,
    remainingPrincipal: remaining,
    repaidRatio: principal ? 1 - remaining / principal : 0,
    monthlyPayment: sum(
      thisMonth.map(payment => payment.principal + payment.interest),
    ),
    monthlyInsurance: sum(thisMonth.map(payment => payment.insurance)),
    paidInterest,
    remainingInterest:
      sum(payments.map(payment => payment.interest)) - paidInterest,
    paymentsMade: months.filter(month => month <= current).length,
    paymentsTotal: months.length,
    endDate: dayjs(months[months.length - 1]).toDate(),
  };
}

export type LoansStatus = ReturnType<typeof loansStatus>;

/**
 * Capital restant dû de chaque prêt, de la première échéance au 1er janvier
 * qui suit la dernière, pour des aires empilées.
 */
export function yearlyBalances(loans: Loan[]) {
  const months = loans
    .flatMap(loan => loan.payments.map(payment => payment.month))
    .sort();
  if (!months.length) return {x: [], balances: loans.map(() => [])};

  const first = dayjs(months[0]);
  const lastYear = dayjs(months[months.length - 1]).year();
  const dates = [first.toDate()];
  for (let year = first.year() + 1; year <= lastYear + 1; year++) {
    dates.push(new Date(year, 0, 1));
  }

  return {
    x: dates.map(date => date.getTime()),
    balances: loans.map(loan =>
      dates.map(date => {
        const status = loansStatus([loan], date);
        // Avant sa première échéance, un prêt ne compte pas encore.
        return status.paymentsMade ? status.remainingPrincipal : 0;
      }),
    ),
  };
}

/** Capital, intérêts et assurance payés chaque année civile, tous prêts confondus. */
export function yearlyCosts(loans: Loan[]) {
  const years = new Map<
    number,
    {principal: number; interest: number; insurance: number}
  >();
  for (const payment of loans.flatMap(loan => loan.payments)) {
    const year = Number(payment.month.slice(0, 4));
    const costs = years.get(year) ?? {principal: 0, interest: 0, insurance: 0};
    costs.principal += payment.principal;
    costs.interest += payment.interest;
    costs.insurance += payment.insurance;
    years.set(year, costs);
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
