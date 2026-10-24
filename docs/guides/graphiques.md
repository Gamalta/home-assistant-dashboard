# Ajouter un graphique

Tous les graphiques du dashboard passent par le composant `Chart` (`src/components/Charts/Chart.tsx`), qui porte le design de l'historique Climat ([ADR 0031](../adr/0031-un-composant-de-graphique-unique.md), [spec](../specs/graphiques.md)). N'importe pas @mui/x-charts directement : un besoin nouveau s'ajoute à `Chart`, pour tous les graphiques.

## Le design

- Une aire en dégradé, pleine largeur, sans axes ni légende.
- La valeur actuelle en grand, par-dessus, en haut à gauche. Le tiers haut du graphique lui est réservé : la courbe n'y monte pas.
- Les couleurs de la palette du thème (`'warning'`, `'info'`, `'error'`, `'success'`, `'primary'`), qui changent avec le mode clair ou sombre.
- Dans une modale d'appareil, l'historique occupe un second onglet, comme la bascule réglage / historique de `ClimateModal`, et touche les bords de la modale (`bleed`).
- Des barres pour des totaux par période (kWh par jour ou par mois), une aire pour une mesure continue (température, puissance, capital restant dû).

## L'API

```ts
type ChartSeries = {
  id: string;
  label: string; // infobulle et nom accessible du graphique
  data: (number | null)[]; // une valeur par abscisse, null pour un trou
  format: (value: number) => string; // « 21,5°C », « 1,2 kW »
  color?: string; // clé de la palette ou couleur CSS ; 'primary' par défaut
  variant?: 'line' | 'comparison';
  step?: boolean; // tracé en escalier
};

type ChartProps = {
  x: number[]; // millisecondes : instants, ou débuts de période en barres
  series: ChartSeries[];
  formatX: (x: number) => string; // en-tête de l'infobulle
  bars?: boolean; // barres au lieu d'aires ; elles partent de 0
  min?: number; // bornes imposées de l'échelle principale
  max?: number;
  loading?: boolean; // « Chargement… »
  bleed?: boolean; // l'aire touche les bords de la modale
  children?: ReactNode; // valeur actuelle, affichée par-dessus
  sx?: SxProps<Theme>; // taille du graphique, fond d'une carte
};
```

| Série                   | Tracé                                                            | Échelle    |
| ----------------------- | ---------------------------------------------------------------- | ---------- |
| sans `variant`          | aire en dégradé (ou barre) et trait épais ; plusieurs s'empilent | principale |
| `variant: 'line'`       | trait fin, sans aire                                             | la sienne  |
| `variant: 'comparison'` | pointillés gris, sauf `color` donnée                             | principale |

- Sans aucune valeur, le graphique affiche « Aucune donnée ».
- Le nom accessible du graphique (`role="img"`) est la liste des libellés : « Température, Humidité ». Les tests E2E s'en servent.
- Les `children` sont empilés en colonne et répartis entre le haut et le bas. Ils laissent passer le pointeur ; un élément qui doit réagir au survol remet `pointerEvents: 'auto'`.

## Préparer les données

Depuis un historique Home Assistant (`useEntity` avec `historyOptions`), `src/utils/chart.ts` fournit :

- `alignHistories(historiques, pas?)` : abscisses communes et une série de valeurs par historique, à un point par quart d'heure par défaut. Une valeur tient jusqu'au changement suivant, un état indisponible fait un trou.
- `isHistoryLoading(history)` : vrai tant que les états ne sont pas reçus.
- `valueRange(values)` : minimum et maximum connus, pour afficher « min » et « max ».
- `formatTime(time)` : l'heure d'un point, « 14:05 », pour `formatX`.

Pour d'autres sources (statistiques à long terme, calcul), passe directement les abscisses en millisecondes et des tableaux de même longueur, avec `null` là où la valeur manque.

## Exemples

### Historique d'une mesure : puissance d'une prise

```tsx
export function PowerHistory(props: PowerHistoryProps) {
  const {entityId} = props;
  const entity = useEntity(entityId, {
    returnNullIfNotFound: true,
    historyOptions: {disable: false, hoursToShow: 24},
  });
  if (!entity) return null;

  // Un pas de 5 min garde les pics courts, fréquents sur une prise.
  const {
    x,
    data: [power],
  } = alignHistories([entity.history?.entityHistory ?? []], 5 * 60 * 1000);
  const current = parsePower(entity.state);

  return (
    <Chart
      bleed
      loading={isHistoryLoading(entity.history)}
      x={x}
      min={0}
      formatX={formatTime}
      series={[
        {
          id: 'power',
          label: 'Puissance',
          data: power,
          color: 'warning',
          step: true,
          format: formatPower,
        },
      ]}
      sx={{height: 300, width: 500}}
    >
      <Typography variant="h4">
        {current === null ? '—' : formatPower(current)}
      </Typography>
    </Chart>
  );
}
```

### Totaux par jour comparés à une période précédente : consommation électrique

`days` et `previous` ont la même longueur : les jours affichés et ceux de la période de référence (mois précédent, ou même période un an avant).

```tsx
const total = (day: DayConsumption) =>
  day.peak === null || day.offPeak === null ? null : day.peak + day.offPeak;

<Chart
  bleed
  bars
  x={days.map(day => day.start)}
  formatX={start =>
    new Date(start).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }
  series={[
    {
      id: 'offPeak',
      label: TARIFF_PERIODS.offPeak.label,
      data: days.map(day => day.offPeak),
      color: TARIFF_PERIODS.offPeak.color,
      format: formatEnergy,
    },
    {
      id: 'peak',
      label: TARIFF_PERIODS.peak.label,
      data: days.map(day => day.peak),
      color: TARIFF_PERIODS.peak.color,
      format: formatEnergy,
    },
    {
      id: 'previous',
      label: 'Mois précédent',
      data: previous.map(total),
      variant: 'comparison',
      format: formatEnergy,
    },
  ]}
  sx={{height: 300, width: 500}}
>
  <Typography variant="h4">
    {formatEnergy(total(days[days.length - 1]))}
  </Typography>
</Chart>;
```

Par mois, même appel : `x` porte le premier jour de chaque mois et `formatX` affiche `{month: 'long', year: 'numeric'}`.

### Courbe sur des années : capital restant dû

Les années écoulées en aire, la projection en pointillés ; les deux séries se rejoignent au dernier anniversaire du prêt.

```tsx
const points = yearlyBalance(mortgage);
const balance = points.map(point => point.remaining);
const last = Math.floor(status.paymentsMade / 12);

<Chart
  bleed
  x={points.map(point => point.date.getTime())}
  min={0}
  max={mortgage.principal}
  formatX={time => String(new Date(time).getFullYear())}
  series={[
    {
      id: 'balance',
      label: 'Capital restant dû',
      data: balance.map((value, i) => (i <= last ? value : null)),
      format: formatEuros,
    },
    {
      id: 'projection',
      label: 'Projection',
      data: balance.map((value, i) => (i >= last ? value : null)),
      variant: 'comparison',
      format: formatEuros,
    },
  ]}
  sx={{height: 300, width: 500}}
>
  <Typography variant="h4">{formatEuros(status.remainingPrincipal)}</Typography>
</Chart>;
```

### Carte compacte

Les cartes de la modale Système (`SystemGraphDisplay`) montrent le même graphique dans une carte : `sx={{width: 175, height: 150, p: 1.5, bgcolor: 'background.tertiary', borderRadius: 1, overflow: 'hidden'}}`, sans `bleed`, avec le libellé et la valeur sur une ligne.

## Tester

- La préparation des données se teste en unitaire, à côté de sa fonction.
- En E2E, le graphique se trouve par son nom : `page.getByRole('img', {name: 'Puissance'})`. Survoler le graphique (`hover()`) ouvre l'infobulle, un tableau : `page.getByRole('table')`. `e2e/graphiques.spec.ts` montre aussi comment poser un doigt.
- Regarde le rendu en clair et en sombre, à 1280 × 800.
