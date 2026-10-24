/** État d'un historique Home Assistant : valeur brute et mise à jour, en secondes. */
type HistoryState = {s: string; lu: number};

type Values = (number | null)[];

const QUARTER_HOUR = 15 * 60 * 1000;

/** Valeur numérique d'un état, `null` s'il est indisponible : un trou dans la courbe. */
export function parseValue(state: string) {
  const value = Number.parseFloat(state);
  return Number.isFinite(value) ? value : null;
}

/** Heure d'un point ou d'une mise à jour : « 14:05 ». */
export function formatTime(time: number | string) {
  return new Date(time).toLocaleTimeString('fr', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Historique pas encore reçu : hakit annonce la fin du chargement un rendu avant de fournir les états. */
export function isHistoryLoading(history?: {
  loading: boolean;
  entityHistory?: HistoryState[];
}) {
  return !history?.entityHistory || history.loading;
}

/**
 * Aligne des historiques sur une même grille de `step` ms, pour les tracer ensemble.
 * Home Assistant n'enregistre que les changements : une valeur tient jusqu'au suivant.
 */
export function alignHistories(
  histories: HistoryState[][],
  step = QUARTER_HOUR,
) {
  const buckets = histories.map(
    history =>
      // Dans un pas, le dernier état l'emporte.
      new Map(
        history.map(({s, lu}) => [
          Math.floor((lu * 1000) / step) * step,
          parseValue(s),
        ]),
      ),
  );
  const x = [...new Set(buckets.flatMap(bucket => [...bucket.keys()]))].sort(
    (a, b) => a - b,
  );
  const data = buckets.map(bucket => {
    let last: number | null = null;
    return x.map(time => {
      if (bucket.has(time)) last = bucket.get(time) ?? null;
      return last;
    });
  });
  return {x, data};
}

/** Plus petite et plus grande valeur connues, `null` sans valeur. */
export function valueRange(values: Values) {
  const known = values.filter(value => value !== null);
  if (!known.length) return null;
  return {min: Math.min(...known), max: Math.max(...known)};
}

/** Somme point par point de séries empilées, `null` là où aucune n'a de valeur. */
export function stackValues(series: Values[]) {
  const length = Math.max(0, ...series.map(values => values.length));
  return Array.from({length}, (_, i) =>
    series.reduce<number | null>(
      (sum, values) => (values[i] == null ? sum : (sum ?? 0) + values[i]),
      null,
    ),
  );
}

/**
 * Domaine de l'axe vertical : la courbe occupe les deux tiers bas, avec 10 % de marge
 * dessous ; le tiers haut reste à la valeur affichée par-dessus. Les bornes imposées priment.
 */
export function chartDomain(
  values: Values,
  bounds: {min?: number; max?: number} = {},
) {
  const range = valueRange(values);
  if (!range) return bounds;
  const min = bounds.min ?? range.min - (range.max - range.min || 1) * 0.1;
  const max = bounds.max ?? range.max + (range.max - min || 1) * 0.5;
  return {min, max};
}
