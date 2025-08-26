# Galat - Recherche Sémantique

Application web pour naviguer dans la base de données Galat avec recherche sémantique locale.

## Fonctionnalités

- 🔍 **Recherche sémantique** : Trouve des contenus similaires même sans mots-clés exacts
- 📝 **Recherche par mots-clés** : Recherche traditionnelle dans les titres, textes et auteurs
- 🏷️ **Filtrage par tags** : 7 catégories (REDÉFINITION, NARRATION, etc.)
- 📊 **Filtrage par types** : TEXTE + CITATION, TEXTE + IMAGE, FULL TEXTE
- 📱 **Responsive** : Fonctionne sur mobile et desktop

## Installation

```bash
npm install
npm run dev
```

## Déploiement

```bash
npm run build
npm run deploy  # Deploy sur GitHub Pages
```

## Données

L'application contient 0 entrées avec embeddings précalculés pour la recherche sémantique locale.

## Architecture

- **Frontend** : React + Tailwind CSS
- **Recherche** : Embeddings vectoriels + cosinus similarity
- **Déploiement** : Site statique (pas de serveur nécessaire)

## Performance

- Embeddings stockés localement (~2-5MB)
- Recherche instantanée côté client
- Pas d'API externe requise
