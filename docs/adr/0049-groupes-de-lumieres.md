# 0049 — Piloter les lumières des membres d'un groupe

- Statut : Proposé
- Date : 2026-11-01
- Issue : à créer

## Contexte

- Chaque entité lumière pilote la première lumière du modèle dont le nom commence par l'identifiant de l'entité, sans le domaine ([conventions](../conventions.md)). Les spots du modèle portent donc le nom de l'entité de leur ampoule.
- Home Assistant réunit plusieurs lumières dans un groupe : une entité `light` qui liste ses membres dans l'attribut `entity_id`. Il est allumé dès qu'un membre l'est, avec la luminosité et la couleur moyennes des membres allumés.
- Le propriétaire passe sa maison à des groupes, pour piloter une pièce d'une seule entité et d'un seul bouton. Configuré dans une pièce, un groupe ne trouve aucune lumière du modèle : ses spots ne sont pilotés par personne. Ils ne s'allument jamais et restent visibles, donc comptés dans chaque shader et, pour les premiers, dans les ombres.
- Le nombre de lumières visibles fait partie de la clé des programmes : chaque combinaison allumée se compile, en arrière-plan ([ADR 0015](0015-compilation-asynchrone.md)).

## Décision

Quand l'entité configurée liste des membres, chaque membre pilote la première lumière du modèle dont le nom commence par son identifiant sans le domaine. Les lumières trouvées suivent ensemble l'état, la luminosité et la couleur du groupe. Une entité sans membres garde la règle d'avant.

- La correspondance est une fonction pure, `findModelLights` (`src/utils/modelLights.ts`), qui reçoit les identifiants du groupe ou de l'entité seule.
- `RoomLight3d` anime toutes les lumières du groupe comme une seule : même transition, et un seul `compileAsync` quand elles deviennent visibles ou invisibles.
- Les lumières sont recherchées de nouveau si la liste des membres change.

## Conséquences

- Le modèle ne change pas : passer d'ampoules à un groupe se fait dans la config seule, sans réexport.
- Un membre sans lumière dans le modèle, comme un ruban LED, est ignoré. L'avertissement « Aucune lumière 3D trouvée » ne sort que si aucun membre n'en a.
- Tous les spots d'un groupe montrent l'état du groupe, pas celui de leur ampoule. Configurer les ampoules une à une reste possible quand leurs états divergent souvent.
- La règle de nom garde son piège, plus fréquent dans un groupe : un nom qui en prolonge un autre (`corridor_light_2` après `corridor_light`) doit venir après lui dans le modèle, sinon les deux membres pilotent le même spot.
- Les spots d'un groupe éteint ne comptent plus dans les shaders. Sur la démo, le couloir devient le groupe fictif `light.corridor_spots`, qui pilote enfin son second spot : un spot visible de moins au repos. Mesuré deux fois sur M4 (`pnpm bench --compare`), les draw calls et les programmes ne changent pas, le GPU passe de 4,5 à 3,8–3,9 ms par image, et de 6,3 à 5,5–5,6 ms avec les ombres.

## Alternatives considérées

- **Ajouter au modèle une lumière par groupe** : écarté par le propriétaire. Un spot de plus à placer et à réexporter par groupe, et un spot unique n'éclaire pas comme plusieurs.
- **Lire l'état de chaque membre** : fidèle quand les membres divergent, mais un abonnement par membre, et une compilation par combinaison chaque fois que les membres changent d'état l'un après l'autre.
- **Piloter toutes les lumières qui commencent par l'identifiant** : sans lire les membres, mais le nom d'un groupe ne préfixe pas forcément ceux de ses spots, et la règle changerait aussi pour les entités simples : `light.corridor_light` allumerait `corridor_light_2`.
