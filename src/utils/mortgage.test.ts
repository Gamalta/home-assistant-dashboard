import {describe, expect, it} from 'vitest';
import {
  formatEuros,
  monthlyPayment,
  mortgageStatus,
  paymentsMade,
  remainingPrincipal,
  yearlyBalance,
  type Mortgage,
} from './mortgage';

const mortgage: Mortgage = {
  principal: 200_000,
  annualRate: 3.5,
  durationMonths: 300,
  firstPaymentDate: '2020-01-05',
};

describe('monthlyPayment', () => {
  it('calcule la mensualité d’un prêt à échéances constantes', () => {
    expect(monthlyPayment(mortgage)).toBeCloseTo(1001.25, 2);
  });

  it('divise le capital sans intérêts quand le taux est nul', () => {
    expect(monthlyPayment({...mortgage, annualRate: 0})).toBeCloseTo(666.67, 2);
  });
});

describe('remainingPrincipal', () => {
  it('vaut le capital emprunté avant la première échéance', () => {
    expect(remainingPrincipal(mortgage, 0)).toBeCloseTo(200_000, 6);
  });

  it('retire la part de capital de la première échéance', () => {
    const interest = 200_000 * (0.035 / 12);
    expect(remainingPrincipal(mortgage, 1)).toBeCloseTo(
      200_000 - (monthlyPayment(mortgage) - interest),
      6,
    );
  });

  it('vaut zéro une fois la dernière échéance payée, et au-delà', () => {
    expect(remainingPrincipal(mortgage, 300)).toBe(0);
    expect(remainingPrincipal(mortgage, 400)).toBe(0);
  });
});

describe('paymentsMade', () => {
  it('ne compte rien avant la première échéance', () => {
    expect(paymentsMade(mortgage, new Date(2020, 0, 4))).toBe(0);
  });

  it('compte l’échéance le jour même du prélèvement', () => {
    expect(paymentsMade(mortgage, new Date(2020, 0, 5))).toBe(1);
    expect(paymentsMade(mortgage, new Date(2020, 1, 4))).toBe(1);
    expect(paymentsMade(mortgage, new Date(2020, 1, 5))).toBe(2);
  });

  it('s’arrête au nombre total d’échéances', () => {
    expect(paymentsMade(mortgage, new Date(2060, 0, 1))).toBe(300);
  });
});

describe('mortgageStatus', () => {
  it('donne l’avancement du prêt à une date', () => {
    const status = mortgageStatus(mortgage, new Date(2025, 0, 5));

    expect(status.paymentsMade).toBe(61);
    expect(status.remainingPrincipal).toBeCloseTo(
      remainingPrincipal(mortgage, 61),
      6,
    );
    // En début de prêt, les échéances remboursent surtout des intérêts.
    expect(status.repaidRatio).toBeCloseTo(0.139, 3);
    expect(status.paidInterest + status.remainingInterest).toBeCloseTo(
      1001.25 * 300 - 200_000,
      -1,
    );
    expect(status.endDate).toEqual(new Date(2044, 11, 5));
  });

  it('compte les intérêts payés comme un tableau d’amortissement mois par mois', () => {
    let remaining = mortgage.principal;
    let interest = 0;
    for (let month = 0; month < 61; month++) {
      const monthInterest = remaining * (0.035 / 12);
      interest += monthInterest;
      remaining -= monthlyPayment(mortgage) - monthInterest;
    }

    const status = mortgageStatus(mortgage, new Date(2025, 0, 5));
    expect(status.paidInterest).toBeCloseTo(interest, 6);
    expect(status.remainingPrincipal).toBeCloseTo(remaining, 6);
  });
});

describe('yearlyBalance', () => {
  it('suit le capital restant dû d’année en année jusqu’à zéro', () => {
    const points = yearlyBalance(mortgage);

    expect(points).toHaveLength(26);
    expect(points[0]).toEqual({
      date: new Date(2020, 0, 5),
      remaining: 200_000,
    });
    expect(points[points.length - 1].remaining).toBe(0);
    for (let i = 1; i < points.length; i++) {
      expect(points[i].remaining).toBeLessThan(points[i - 1].remaining);
    }
  });
});

describe('formatEuros', () => {
  it('arrondit à l’euro, au format français', () => {
    // Intl sépare par des espaces insécables.
    expect(formatEuros(154320.4).replace(/\s/g, ' ')).toBe('154 320 €');
  });
});
