import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Tag, Book, User, ExternalLink, Loader2 } from 'lucide-react';
import { GALAT_DATA, GALAT_TAGS, semanticSearch } from './data.js';
import sourceIcon from './assets/source.svg';
import logoBlack from './assets/logo_black.png';
import './App.css';

function GalatSearchApp() {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimeoutRef = useRef(null);

  // Debounce pour la recherche hybride
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      setIsSearching(true);
      debounceTimeoutRef.current = setTimeout(() => {
        setDebouncedQuery(searchQuery);
        setIsSearching(false);
      }, 500); // Attendre 500ms après la dernière frappe
    } else {
      setDebouncedQuery(searchQuery);
      setIsSearching(false);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery]);



  useEffect(() => {
    setData(GALAT_DATA);
    setIsLoading(false);
  }, []);

  // Fonction de recherche par mots-clés
  const keywordSearch = (query, dataToSearch) => {
    const cleanQuery = query.toLowerCase()
      .replace(/[^\w\sàáâäçèéêëìíîïñòóôöùúûü]/g, ' ')
      .trim();
    
    return dataToSearch.filter(item => {
      // Vérifications de sécurité pour s'assurer que les propriétés existent et sont des chaînes
      const titre = typeof item.titre === 'string' ? item.titre : '';
      const texte = typeof item.texte === 'string' ? item.texte : '';
      const auteur = typeof item.auteur === 'string' ? item.auteur : '';
      const citation = typeof item.citation === 'string' ? item.citation : '';
      const tag = typeof item.tag === 'string' ? item.tag : '';
      
      return titre.toLowerCase().includes(cleanQuery) ||
             texte.toLowerCase().includes(cleanQuery) ||
             auteur.toLowerCase().includes(cleanQuery) ||
             citation.toLowerCase().includes(cleanQuery) ||
             tag.toLowerCase().includes(cleanQuery);
    });
  };

  const filteredData = useMemo(() => {
    let filtered = data;

    // Filtre par tag
    if (selectedTag) filtered = filtered.filter(item => item.tag === selectedTag);

    // Recherche hybride
    if (debouncedQuery.trim()) {
      // 1. Recherche sémantique avec Compromise
      const semanticResults = semanticSearch(debouncedQuery, filtered);
      
      // 2. Recherche par mots-clés
      const keywordResults = keywordSearch(debouncedQuery, filtered);
      
      // 3. Combiner les résultats en évitant les doublons
      const combinedResults = [];
      const seenIds = new Set();
      
      // Ajouter d'abord les résultats sémantiques (priorité)
      semanticResults.forEach(item => {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          combinedResults.push({
            ...item,
            searchType: 'semantic'
          });
        }
      });
      
      // Ajouter ensuite les résultats par mots-clés (sans doublons)
      keywordResults.forEach(item => {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          combinedResults.push({
            ...item,
            searchType: 'keyword',
            similarityScore: 0.05 // Score minimal pour les résultats par mots-clés
          });
        }
      });
      
      filtered = combinedResults;
    }

    return filtered;
  }, [data, debouncedQuery, selectedTag]);

  // Fonction pour générer une couleur aléatoire pour les images
  const getRandomColor = () => {
    const colors = ['#f0f8ff', '#f0fff0', '#fff0f0', '#fff8f0', '#f8f0ff', '#f0ffff'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const EntryCard = ({ entry }) => (
    <div className="entry-card">
      {/* Zone pour image en premier */}
      {entry.type === "TEXTE + IMAGE" && (
        <div className="entry-image" style={{ backgroundColor: getRandomColor() }}>
          {entry.image ? (
            <img 
              src={entry.image} 
              alt={entry.titre || 'Image de l\'entrée'} 
              className="entry-image-content"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
          ) : null}
          <div className="image-placeholder" style={{ display: entry.image ? 'none' : 'block' }}>
            Image
          </div>
          {entry.legende && entry.legende.trim() && (
            <div className="image-caption">
              {entry.legende}
            </div>
          )}
        </div>
      )}
      
      {/* Zone pour citation en premier */}
      {entry.type === "TEXTE + CITATION" && entry.citation && (
        <div className="entry-quote" style={{ backgroundColor: getRandomColor() }}>
          <blockquote>{entry.citation}</blockquote>
        </div>
      )}
      
      {/* Zone de titre pour cartes sans image ni citation */}
      {entry.type !== "TEXTE + IMAGE" && (!entry.citation || entry.type !== "TEXTE + CITATION") && (
        <div className="entry-title-square">
          <div className="title-placeholder">{entry.titre || 'Sans titre'}</div>
        </div>
      )}
      
      {/* Catégorie au-dessus du titre */}
      {entry.tag && (
        <div 
          className="entry-category"
          data-category={(entry.tag || '').toLowerCase().replace(/[éèê]/g, 'e')}
        >
          {entry.tag}
        </div>
      )}
      
      <div className="entry-header">
        <h3 className="entry-title">{entry.titre || 'Sans titre'}</h3>
        <div className="entry-tags">
          {entry.source && entry.source.trim() && (
            <a 
              href={entry.source}
              target="_blank"
              rel="noopener noreferrer"
              className="source-icon-link"
              title="Voir la source"
            >
              <img src={sourceIcon} alt="Source" className="source-icon" />
            </a>
          )}
        </div>
      </div>
      
      {/* Auteur sous le titre, sans picto, pas affiché si "collectif" */}
      {entry.auteur && entry.auteur.toLowerCase() !== "collectif" && (
        <div className="entry-author">
          <span>{entry.auteur}</span>
        </div>
      )}
      
      <div className="entry-content">
        <p className="entry-text">{entry.texte || 'Aucun contenu disponible'}</p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Logo et texte de présentation */}
      <section className="intro">
        <div className="intro-content">
          <div className="logo-container">
            <img src={logoBlack} alt="La Galerie des Alternatives" className="logo" />
          </div>
          <p>
          Et si la technologie pouvait servir autre chose que la surveillance et le profit ? Cette galerie explore les initiatives qui hackent, détournent ou réinventent le numérique : des outils libres aux œuvres d'art, des collectifs militants aux médias alternatifs. Face à l'hégémonie des Big Tech, les réponses sont nécessairement protéiformes. Nous avons tenté de documenter cette diversité pour inspirer et outiller de nouveaux imaginaires technologiques.
          </p>
        </div>
      </section>

      {/* Barre de recherche */}
      <section className="search-section">
        <div className="search-content">
          <div className="search-bar">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher dans les titres, textes, auteurs..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isSearching && (
              <div className="search-loading">
                <Loader2 className="loading-icon" />
                <span>Recherche en cours...</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Barre de tags */}
      <section className="tags-section">
        <div className="tags-content">
          <div className="tags-bar">
            <button
              onClick={() => setSelectedTag("")}
              className={`tag-button ${selectedTag === "" ? "active" : ""}`}
            >
              Tous
            </button>
            {GALAT_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`tag-button ${selectedTag === tag ? "active" : ""}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>
        
      {/* Résultats */}
      <section className="results-section">
        {filteredData.length === 0 ? (
          <div className="no-results">
            <Search className="no-results-icon" />
            <p className="no-results-text">Aucun résultat trouvé</p>
            <p className="no-results-subtext">Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          <div className="results-grid">
            {filteredData.map((entry, index) => (
              <EntryCard key={index} entry={entry} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default GalatSearchApp;
