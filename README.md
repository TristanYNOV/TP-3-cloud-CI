# TP CI/CD — Notes App API

Ce dépôt contient une API Node/Express dans `notes-app/api`.
Les workflows GitHub Actions sont définis à la racine dans `.github/workflows`.

## Release Process

### 1) CI sur `push` vers `main`
Le workflow `ci-main.yml` exécute d'abord les tests (`npm ci` puis `npm test` dans `notes-app/api`).
Si les tests passent, il construit et pousse l'image Docker Hub avec deux tags :
- `<dockerhub_username>/notes-app:latest`
- `<dockerhub_username>/notes-app:<commit_sha_complet>`

### 2) PR gate sur `pull_request` vers `main`
Le workflow `pr-ci.yml` exécute uniquement les tests (`npm ci` + `npm test`) et ne build/push jamais d'image.
Objectif : bloquer l'entrée sur `main` si la qualité minimale n'est pas respectée.

### 3) Release via tag Git
Le workflow `release.yml` se déclenche sur `push` d'un tag `v*` (ex: `v1.0.0`).
Il construit et pousse **uniquement** l'image taggée avec la version Git (`v1.0.0`), sans pousser `latest`.

### 4) Règles de versioning
- Format recommandé : `vX.Y.Z` (SemVer).
- `X` : rupture de compatibilité majeure.
- `Y` : ajout rétrocompatible.
- `Z` : correctif rétrocompatible.
- Un tag de release publié ne doit plus être reconstruit/modifié.

### 5) Traçabilité commit ↔ tag Git ↔ image Docker
- `ci-main` publie un tag image basé sur le SHA complet (`<github.sha>`), donc 1 image ↔ 1 commit exact.
- `release` publie un tag image de version (`vX.Y.Z`) aligné sur le tag Git.
- Les deux conventions permettent de remonter d'une image vers sa source Git de manière déterministe.

## Réponses courtes aux questions du TP

- **Pourquoi `latest` n’est pas une version ?**
  Parce que `latest` est un pointeur mutable, pas un identifiant immuable d'artefact.

- **Différence entre tag et digest ?**
  Un **tag** est un alias lisible (mutable). Un **digest** (`sha256:...`) identifie le contenu exact (immuable).

- **Pourquoi séparer staging et production ?**
  Pour valider en environnement proche réel avant exposition utilisateur, réduire le risque et contrôler la promotion.

- **Pourquoi une version `vX.Y.Z` ne doit jamais être reconstruite ?**
  Pour garantir reproductibilité, auditabilité et rollback fiable : même version = même artefact.

- **Avantages d’une PR gate ?**
  Détection précoce des régressions, standard qualité minimal, feedback rapide avant merge sur `main`.

- **Qu’est-ce qui garantit la traçabilité ici ?**
  Le tag image au SHA commit + le tag release Git `vX.Y.Z` + l’historique GitHub Actions.
