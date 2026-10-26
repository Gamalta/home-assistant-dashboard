import {type EntityName, type FilterByDomain, useEntities} from '@hakit/core';
import {type Loan, loanPayments} from '../utils/mortgage';

/** Prêts lus dans leurs entités Home Assistant, nommés par leur `friendly_name`. */
export function useLoans(
  entityIds: FilterByDomain<EntityName, 'sensor'>[],
): Loan[] {
  const entities = useEntities(entityIds, {
    returnNullIfNotFound: true,
    // Seul l'échéancier des attributs est utilisé.
    historyOptions: {disable: true},
  });

  return entities
    .filter(entity => entity !== null)
    .map(entity => ({
      label: entity.attributes.friendly_name ?? entity.entity_id,
      payments: loanPayments(entity.attributes),
    }));
}
