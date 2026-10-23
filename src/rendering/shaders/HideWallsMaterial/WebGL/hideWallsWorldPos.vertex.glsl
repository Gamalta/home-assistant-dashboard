#include <worldpos_vertex>

// Calcul indépendant de `worldPosition`, que three.js ne définit que si une
// carte d'environnement, des ombres ou la transmission sont actives.
vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
