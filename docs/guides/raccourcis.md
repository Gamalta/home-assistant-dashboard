# Raccourcis de la barre latérale

Les tuiles de la barre latérale donnent accès aux actions qui concernent toute la maison ([ADR 0016](../adr/0016-tuiles-de-raccourcis.md)). Elles se déclarent dans `SideBarConfig.shortcuts`, dans le `House.ts` de la maison, et s'affichent dans l'ordre de la liste.

```ts
export const SideBarConfig: SideBarConfigType = {
  // …
  shortcuts: [{type: 'allLightsOff'}],
};
```

Sans `shortcuts`, la carte reste vide.

## Tout éteindre

`{type: 'allLightsOff'}`

La tuile affiche le nombre de lumières allumées. Un appui ouvre la liste de ces lumières, et le bouton « Éteindre » les éteint toutes en un seul appel à `light.turn_off`. Seules les lumières déclarées dans les pièces de la maison sont concernées.

| Option           | Rôle                                                                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `scriptEntityId` | Script Home Assistant lancé à la place, par exemple pour éteindre aussi la TV ou les prises. Le dashboard n'éteint alors rien lui-même. |

## Crédit immobilier

```ts
{
  type: 'mortgage',
  label: 'Crédit maison',
  principal: 250_000,
  annualRate: 1.45,
  durationMonths: 300,
  firstPaymentDate: '2021-06-05',
  monthlyInsurance: 28,
}
```

La tuile affiche la part du capital déjà remboursée. La modale détaille le capital restant dû, la courbe d'amortissement, la mensualité, les échéances payées, les intérêts payés et restants, et la date de fin. Le calcul suppose un prêt à taux fixe et à échéances constantes ([ADR 0022](../adr/0022-credit-calcule-par-le-dashboard.md)).

| Option             | Rôle                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------- |
| `principal`        | Montant emprunté, en euros                                                                  |
| `annualRate`       | Taux nominal annuel, en %                                                                   |
| `durationMonths`   | Nombre d'échéances                                                                          |
| `firstPaymentDate` | Date de la première échéance, au format `AAAA-MM-JJ` ; le jour donne le jour de prélèvement |
| `monthlyInsurance` | Assurance mensuelle, facultative                                                            |
| `label`            | Libellé de la tuile, `Crédit` par défaut ; utile pour plusieurs prêts                       |

Après un remboursement anticipé, remplacer `principal`, `durationMonths` et `firstPaymentDate` par les valeurs du nouvel échéancier.

## Ajouter un type de tuile

1. Ajouter son type à l'union `ShortcutConfigType` de `src/configs/sidebar.d.ts`.
2. Créer `src/components/SideBar/Shortcuts/<Type>Shortcut.tsx`, qui rend un `ShortcutTile` et sa modale avec le même `id`.
3. Ajouter le `case` correspondant dans `src/components/SideBar/Shortcuts/index.tsx`.
4. Documenter la tuile dans ce guide, et ajouter ses entités au mock pour la démo et les tests.
