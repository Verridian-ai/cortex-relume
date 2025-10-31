'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { componentSearch, SearchSuggestion, SearchOptions } from '@/lib/search/component-search';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ComponentSearchBarProps {
  onSearch: (options: SearchOptions) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function ComponentSearchBar({
  onSearch,
  placeholder = 'Search components...',
  className = '',
  autoFocus = false
}: ComponentSearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trendingTerms, setTrendingTerms] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Load search history
    const history = componentSearch.getSearchHistory();
    setSearchHistory(history.slice(0, 5));

    // Load trending terms
    loadTrendingTerms();

    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const loadTrendingTerms = async () => {
    // In a real app, this would fetch trending search terms
    const trending = [
      'button', 'form', 'modal', 'navigation', 'card',
      'chart', 'table', 'input', 'dropdown', 'calendar'
    ];
    setTrendingTerms(trending);
  };

  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    
    // Debounced suggestion fetching
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    if (value.trim().length > 0) {
      setIsLoading(true);
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 200);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }
  }, []);

  const fetchSuggestions = async (searchQuery: string) => {
    try {
      const result = await componentSearch.search({
        query: searchQuery,
        limit: 8
      });
      
      setSuggestions(result.suggestions);
      setIsLoading(false);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setIsLoading(false);
    }
  };

  const handleSearch = useCallback((searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    
    setShowSuggestions(false);
    
    onSearch({
      query: searchQuery,
      limit: 20,
      offset: 0,
      semantic: true
    });

    // Add to history
    const historyItem = {
      id: Date.now().toString(),
      query: searchQuery,
      timestamp: new Date(),
      resultsCount: 0
    };
    
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.query !== searchQuery);
      return [historyItem, ...filtered].slice(0, 5);
    });
  }, [query, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.value);
    handleSearch(suggestion.value);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleHistoryClick = (historyItem: any) => {
    setQuery(historyItem.query);
    handleSearch(historyItem.query);
  };

  const displaySuggestions = () => {
    if (isLoading) {
      return (
        <div className="p-4 text-center text-sm text-muted-foreground">
          Loading suggestions...
        </div>
      );
    }

    const combinedSuggestions = [
      ...suggestions,
      ...searchHistory.map(item => ({
        type: 'component' as const,
        value: item.query,
        score: 0.5,
        count: 0,
        isHistory: true
      }))
    ];

    return (
      <div className="py-2">
        {suggestions.length > 0 && (
          <div className="px-3 py-2">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              SUGGESTIONS
            </div>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded flex items-center gap-2"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <Search className="h-3 w-3" />
                <span>{suggestion.value}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {suggestion.type}
                </span>
              </button>
            ))}
          </div>
        )}

        {searchHistory.length > 0 && query === '' && (
          <div className="px-3 py-2 border-t">
            <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              RECENT SEARCHES
            </div>
            {searchHistory.map((item, index) => (
              <button
                key={index}
                className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded flex items-center gap-2"
                onClick={() => handleHistoryClick(item)}
              >
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>{item.query}</span>
              </button>
            ))}
          </div>
        )}

        {trendingTerms.length > 0 && query === '' && (
          <div className="px-3 py-2 border-t">
            <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              TRENDING
            </div>
            <div className="flex flex-wrap gap-1">
              {trendingTerms.slice(0, 8).map((term, index) => (
                <button
                  key={index}
                  className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80"
                  onClick={() => {
                    setQuery(term);
                    handleSearch(term);
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {suggestions.length === 0 && !isLoading && query.trim() && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No suggestions found
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={clearSearch}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-80 overflow-y-auto"
        >
          {displaySuggestions()}
        </div>
      )}
    </div>
  );
}