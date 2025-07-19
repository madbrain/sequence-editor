# Sequence Diagram Editor

Éditeur de diagrammes de séquences minimaliste. Prétexte pour la définition d'une méthodologie
de conception d'éditeur visuel.

# Méthodologie

## Affichage

- faire en sorte de que le svg est la taille de sa div parente
- écrire le svg en statique de ce que l'on veut réaliser
- concevoir un modèle d'entré de ce que l'on veut représenter
  - liste ordonée de nom de lifelines et message nommé (origin, dest)
  - pour le tester création randomiser de ce modèle
- transformer ce modèle en modèle graphique (correspond à la dynamisation du SVG statique)
- appliquer un layout au modèle graphique => définir les constantes de style
  - utiliser un canvas pour mesurer le texte
  - property based testing : les entêtes ne doivent pas se superposer et les messages contenus entre les lignes source et destination

## Gestion des événements

- intercepter les événements et trouver l'élément concerné
- ajouter au modèle de vue la présentation de la sélection/hover/points d'interraction
  - lifeline (hover the head)
  - message
  - points de contact des messages
- Ajouter un automate pour la gestion des événements
- Ajouter une pile de commandes pour les modifications

# TODO

- [ ] Start a new diagram type
- [ ] Experiment with "a la Svelte" dynamic template generator
