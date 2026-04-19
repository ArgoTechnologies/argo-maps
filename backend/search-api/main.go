package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
)

type Place struct {
	ID     string    `json:"id"`
	Name   string    `json:"name"`
	NameHy string    `json:"nameHy"`
	Type   string    `json:"type"`
	Cat    string    `json:"cat"`
	Rating string    `json:"rating"`
	Loc    []float64 `json:"loc"`
}

var Database = []Place{
	{ID: "p1", Name: "Republic Square", NameHy: "Հանրապետության հրապարակ", Type: "Plaza", Cat: "nearby", Rating: "4.9", Loc: []float64{44.5126, 40.1776}},
	{ID: "p2", Name: "Republic Square Metro", NameHy: "Հանրապետության հրապարակ (մետրո)", Type: "Subway Station", Cat: "transport", Rating: "4.5", Loc: []float64{44.5147, 40.1784}},
	{ID: "p3", Name: "Cascade Complex", NameHy: "Կասկադ համալիր", Type: "Landmark", Cat: "nearby", Rating: "4.8", Loc: []float64{44.5155, 40.1915}},
	{ID: "p4", Name: "Kond Pedestrian Tunnel", NameHy: "Կոնդի հետիոտնային թունել", Type: "Gateway", Cat: "nearby", Rating: "4.2", Loc: []float64{44.5028, 40.1837}},
	{ID: "p5", Name: "Opera Bus Stop", NameHy: "Օպերայի կանգառ", Type: "Bus Stop", Cat: "transport", Rating: "3.9", Loc: []float64{44.5145, 40.1852}},
	{ID: "p6", Name: "Blue Mosque", NameHy: "Կապույտ մզկիթ", Type: "Place of Worship", Cat: "nearby", Rating: "4.7", Loc: []float64{44.5056, 40.1782}},
	{ID: "p7", Name: "Mirzoyan Library", NameHy: "Միրզոյան գրադարան", Type: "Cafe/Gallery", Cat: "nearby", Rating: "4.9", Loc: []float64{44.5101, 40.1742}},
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000") // Frontend URL
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Levenshtein calculates the edit distance between two strings
func Levenshtein(a, b string) int {
	aRune, bRune := []rune(a), []rune(b)
	n, m := len(aRune), len(bRune)
	if n == 0 { return m }
	if m == 0 { return n }

	d := make([][]int, n+1)
	for i := range d {
		d[i] = make([]int, m+1)
		d[i][0] = i
	}
	for j := range d[0] {
		d[0][j] = j
	}

	for i := 1; i <= n; i++ {
		for j := 1; j <= m; j++ {
			cost := 1
			if aRune[i-1] == bRune[j-1] {
				cost = 0
			}
			minVal := d[i-1][j] + 1
			if d[i][j-1]+1 < minVal {
				minVal = d[i][j-1] + 1
			}
			if d[i-1][j-1]+cost < minVal {
				minVal = d[i-1][j-1] + cost
			}
			d[i][j] = minVal
		}
	}
	return d[n][m]
}

// ScoredPlace helps with sorting search results
type ScoredPlace struct {
	Place Place
	Score int
}

func handleSearch(w http.ResponseWriter, r *http.Request) {
	query := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("q")))
	
	results := make([]Place, 0)
	
	if query != "" {
		var scored []ScoredPlace
		
		for _, p := range Database {
			nameLower := strings.ToLower(p.Name)
			typeLower := strings.ToLower(p.Type)
			
			// 1. Exact or prefix match (Score 0 or very low distance)
			if strings.HasPrefix(nameLower, query) {
				scored = append(scored, ScoredPlace{p, 0})
				continue
			}
			if strings.Contains(nameLower, query) || strings.Contains(typeLower, query) {
				scored = append(scored, ScoredPlace{p, 1})
				continue
			}

			// 2. Fuzzy match (Typo tolerance) using Levenshtein
			// We only run fuzzy search if query length is > 3 to avoid noise
			if len(query) > 3 {
				// Split into words and check distance
				words := strings.Fields(nameLower)
				bestDist := 999
				for _, w := range words {
					dist := Levenshtein(w, query)
					if dist < bestDist {
						bestDist = dist
					}
				}
				
				// If the edit distance is small enough (e.g., 1 or 2 typos)
				maxTypos := 2
				if len(query) > 6 { maxTypos = 3 }
				
				if bestDist <= maxTypos {
					scored = append(scored, ScoredPlace{p, bestDist + 2}) // +2 base score so exact match always wins
				}
			}
		}

		// Sort by score (lower is better)
		for i := 0; i < len(scored)-1; i++ {
			for j := 0; j < len(scored)-i-1; j++ {
				if scored[j].Score > scored[j+1].Score {
					scored[j], scored[j+1] = scored[j+1], scored[j]
				}
			}
		}

		for _, sp := range scored {
			results = append(results, sp.Place)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(results); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/search", handleSearch)

	handler := enableCORS(mux)

	log.Println("🚀 Argo Maps Golang Search API listening on port 4000...")
	if err := http.ListenAndServe(":4000", handler); err != nil {
		log.Fatal(err)
	}
}
