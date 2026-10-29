# 0042 — Emojis d'Apple par CDN et mots-clés d'emojibase

- Statut : Proposé
- Date : 2026-10-27
- Issue : #21

## Contexte

La liste de courses montre un emoji par article. Le propriétaire veut le dessin d'iOS partout, alors que la tablette, sous Android, affiche ceux de Google. Il veut aussi plus d'articles reconnus que les 35 motifs du dictionnaire `groceryEmoji`.

## Décision

- **Images** : les emojis sont des PNG 64 px d'Apple, ceux du paquet `emoji-datasource-apple`, servis par jsDelivr à une version figée. Ils ne sont ni installés ni versionnés. Si une image ne charge pas (hors ligne, emoji trop récent), l'emoji du système la remplace (`AppleEmoji`).
- **Banque** : le dictionnaire garde la priorité, puis on cherche les mots de l'article dans les noms français d'emojibase (`emojibase-data/fr`), puis dans leurs mots-clés. Seuls les groupes nature, nourriture et objets sont retenus. Les données sont importées dynamiquement à la première ouverture de la modale.

## Conséquences

- Le même dessin sur la tablette, les téléphones et l'ordinateur.
- Les dessins d'Apple lui appartiennent et aucune licence n'en autorise l'usage : c'est toléré pour un usage personnel, pas permis. Le dépôt, public, n'en contient aucun.
- La première ouverture charge 92 Ko compressés de données, hors du bundle principal, et chaque emoji est une requête vers jsDelivr, mise en cache par le navigateur.
- Emojibase seul se trompe sur des articles courants (« Oranges » donne un livre orange, « Pâtes » un ravioli) : le dictionnaire corrige ces cas et s'enrichit au fil des erreurs.
- Les tests E2E servent eux-mêmes les images, pour ne pas dépendre du CDN.

## Alternatives considérées

- **Images d'Apple dans le dépôt** : rendu hors ligne, mais redistribution publique des dessins d'Apple.
- **Fluent Emoji 3D de Microsoft** : licence MIT et style proche, mais pas le dessin d'iOS demandé.
- **Dictionnaire écrit à la main seulement** : prévisible, mais chaque article doit être ajouté un par un.
