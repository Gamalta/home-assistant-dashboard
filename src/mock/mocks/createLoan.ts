import dayjs from 'dayjs';
import {createSensor} from './createSensor';

type LoanOptions = {
  label: string;
  principal: number;
  /** Taux nominal annuel, en %. */
  annualRate: number;
  durationMonths: number;
  /** Mois de la première échéance, `AAAA-MM`. */
  firstMonth: string;
  monthlyInsurance: number;
};

const cents = (value: number) => Math.round(value * 100) / 100;

/**
 * Prêt fictif à échéances constantes, avec l'échéancier qu'un capteur
 * template de Home Assistant fournit dans ses attributs.
 */
export function createLoan(entity_id: string, options: LoanOptions) {
  const {label, principal, annualRate, durationMonths, firstMonth} = options;
  const rate = annualRate / 100 / 12;
  const payment = rate
    ? (principal * rate) / (1 - (1 + rate) ** -durationMonths)
    : principal / durationMonths;
  const attributes = {
    friendly_name: label,
    principal: {} as Record<string, number>,
    interest: {} as Record<string, number>,
    insurance: {} as Record<string, number>,
  };

  let remaining = principal;
  for (let index = 0; index < durationMonths; index++) {
    const month = dayjs(firstMonth).add(index, 'month').format('YYYY-MM');
    const interest = cents(remaining * rate);
    // La dernière échéance solde le capital, à l'arrondi près.
    const repaid =
      index === durationMonths - 1
        ? cents(remaining)
        : cents(payment - interest);
    attributes.principal[month] = repaid;
    attributes.interest[month] = interest;
    attributes.insurance[month] = options.monthlyInsurance;
    remaining -= repaid;
  }

  return createSensor(entity_id, {state: String(principal), attributes});
}
