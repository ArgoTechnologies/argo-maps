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
	// ── Landmarks ──
	{ID: "p1", Name: "Republic Square", NameHy: "Hanrapetutyan Hraparak", Type: "Plaza", Cat: "nearby", Rating: "4.9", Loc: []float64{44.5126, 40.1776}},
	{ID: "p2", Name: "Cascade Complex", NameHy: "Kaskad", Type: "Landmark", Cat: "nearby", Rating: "4.8", Loc: []float64{44.5155, 40.1915}},
	{ID: "p3", Name: "Opera House", NameHy: "Opera", Type: "Theatre", Cat: "nearby", Rating: "4.7", Loc: []float64{44.5145, 40.1860}},
	{ID: "p4", Name: "Blue Mosque", NameHy: "Kapuyt Mzkit", Type: "Mosque", Cat: "nearby", Rating: "4.7", Loc: []float64{44.5056, 40.1782}},
	{ID: "p5", Name: "Vernissage Market", NameHy: "Vernisaj", Type: "Market", Cat: "nearby", Rating: "4.6", Loc: []float64{44.5171, 40.1770}},
	{ID: "p6", Name: "Erebuni Fortress", NameHy: "Erebuni Berd", Type: "Historical Site", Cat: "nearby", Rating: "4.5", Loc: []float64{44.5280, 40.1495}},
	{ID: "p7", Name: "Tsitsernakaberd Memorial", NameHy: "Tsitsernakaberd", Type: "Memorial", Cat: "nearby", Rating: "4.9", Loc: []float64{44.4901, 40.1853}},
	{ID: "p8", Name: "Victory Park", NameHy: "Haghtanaki Park", Type: "Park", Cat: "nearby", Rating: "4.6", Loc: []float64{44.5108, 40.1945}},
	{ID: "p9", Name: "Lovers Park", NameHy: "Siraharneri Park", Type: "Park", Cat: "nearby", Rating: "4.5", Loc: []float64{44.5140, 40.1902}},
	{ID: "p10", Name: "Hrazdan Gorge", NameHy: "Hrazdan Kirch", Type: "Nature", Cat: "nearby", Rating: "4.4", Loc: []float64{44.5010, 40.1870}},
	{ID: "p11", Name: "Mother Armenia Statue", NameHy: "Mayr Hayastan", Type: "Monument", Cat: "nearby", Rating: "4.7", Loc: []float64{44.5105, 40.1950}},
	{ID: "p12", Name: "Kond Pedestrian Tunnel", NameHy: "Kondi Tunel", Type: "Gateway", Cat: "nearby", Rating: "4.2", Loc: []float64{44.5028, 40.1837}},
	// ── Streets ──
	{ID: "s1", Name: "North Avenue", NameHy: "Hyusisayin Poghota", Type: "Street", Cat: "nearby", Rating: "4.8", Loc: []float64{44.5120, 40.1815}},
	{ID: "s2", Name: "Mashtots Avenue", NameHy: "Mashtots Poghota", Type: "Street", Cat: "nearby", Rating: "4.6", Loc: []float64{44.5100, 40.1830}},
	{ID: "s3", Name: "Saryan Street", NameHy: "Saryan Poghots", Type: "Street", Cat: "nearby", Rating: "4.9", Loc: []float64{44.5080, 40.1795}},
	{ID: "s4", Name: "Abovyan Street", NameHy: "Abovyan Poghots", Type: "Street", Cat: "nearby", Rating: "4.5", Loc: []float64{44.5135, 40.1800}},
	{ID: "s5", Name: "Tumanyan Street", NameHy: "Tumanyan Poghots", Type: "Street", Cat: "nearby", Rating: "4.6", Loc: []float64{44.5110, 40.1810}},
	{ID: "s6", Name: "Pushkin Street", NameHy: "Pushkin Poghots", Type: "Street", Cat: "nearby", Rating: "4.3", Loc: []float64{44.5095, 40.1825}},
	{ID: "s7", Name: "Amiryan Street", NameHy: "Amiryan Poghots", Type: "Street", Cat: "nearby", Rating: "4.4", Loc: []float64{44.5115, 40.1790}},
	// ── Metro Stations ──
	{ID: "m1", Name: "Republic Square Metro", NameHy: "Hanrapetutyan Hraparak Metro", Type: "Subway Station", Cat: "transport", Rating: "4.5", Loc: []float64{44.5147, 40.1784}},
	{ID: "m2", Name: "Zoravar Andranik Metro", NameHy: "Zoravar Andranik", Type: "Subway Station", Cat: "transport", Rating: "4.3", Loc: []float64{44.5183, 40.1721}},
	{ID: "m3", Name: "Marshal Baghramyan Metro", NameHy: "Marshal Baghramyan", Type: "Subway Station", Cat: "transport", Rating: "4.4", Loc: []float64{44.5095, 40.1905}},
	{ID: "m4", Name: "Yeritasardakan Metro", NameHy: "Yeritasardakan", Type: "Subway Station", Cat: "transport", Rating: "4.3", Loc: []float64{44.5130, 40.1845}},
	{ID: "m5", Name: "Sasuntsi David Metro", NameHy: "Sasuntsi Davit", Type: "Subway Station", Cat: "transport", Rating: "4.2", Loc: []float64{44.5072, 40.1712}},
	{ID: "m6", Name: "Garegin Nzhdeh Metro", NameHy: "Garegin Nzhdeh", Type: "Subway Station", Cat: "transport", Rating: "4.1", Loc: []float64{44.5135, 40.1715}},
	{ID: "m7", Name: "Barekamutyun Metro", NameHy: "Barekamutyun", Type: "Subway Station", Cat: "transport", Rating: "4.3", Loc: []float64{44.5060, 40.1930}},
	// ── Bus Stops ──
	{ID: "b1", Name: "Opera Bus Stop", NameHy: "Opera Kangar", Type: "Bus Stop", Cat: "transport", Rating: "3.9", Loc: []float64{44.5145, 40.1852}},
	{ID: "b2", Name: "Kino Moskva Bus Stop", NameHy: "Kino Moskva", Type: "Bus Stop", Cat: "transport", Rating: "3.8", Loc: []float64{44.5130, 40.1795}},
	{ID: "b3", Name: "Komitas Bus Stop", NameHy: "Komitas", Type: "Bus Stop", Cat: "transport", Rating: "3.7", Loc: []float64{44.5070, 40.2020}},
	// ── Restaurants & Cafes ──
	{ID: "r1", Name: "Dolmama Restaurant", NameHy: "Dolmama", Type: "Restaurant", Cat: "nearby", Rating: "4.8", Loc: []float64{44.5128, 40.1808}},
	{ID: "r2", Name: "Sherep Restaurant", NameHy: "Sherep", Type: "Restaurant", Cat: "nearby", Rating: "4.7", Loc: []float64{44.5133, 40.1812}},
	{ID: "r3", Name: "Lavash Restaurant", NameHy: "Lavash", Type: "Restaurant", Cat: "nearby", Rating: "4.6", Loc: []float64{44.5108, 40.1798}},
	{ID: "r4", Name: "The Green Bean Coffee", NameHy: "Green Bean", Type: "Cafe", Cat: "nearby", Rating: "4.8", Loc: []float64{44.5092, 40.1802}},
	{ID: "r5", Name: "Mirzoyan Library", NameHy: "Mirzoyan Gradaran", Type: "Cafe/Gallery", Cat: "nearby", Rating: "4.9", Loc: []float64{44.5101, 40.1742}},
	{ID: "r6", Name: "Jazzve Cafe", NameHy: "Jazzve", Type: "Cafe", Cat: "nearby", Rating: "4.5", Loc: []float64{44.5118, 40.1820}},
	{ID: "r7", Name: "Pandok Yerevan", NameHy: "Pandok", Type: "Restaurant", Cat: "nearby", Rating: "4.4", Loc: []float64{44.5060, 40.1815}},
	{ID: "r8", Name: "Tufenkian Kharpert", NameHy: "Tufenkian", Type: "Restaurant", Cat: "nearby", Rating: "4.6", Loc: []float64{44.5140, 40.1773}},
	// ── Hotels ──
	{ID: "h1", Name: "Armenia Marriott Hotel", NameHy: "Marriott", Type: "Hotel", Cat: "nearby", Rating: "4.7", Loc: []float64{44.5130, 40.1777}},
	{ID: "h2", Name: "The Alexander Hotel", NameHy: "Alexander", Type: "Hotel", Cat: "nearby", Rating: "4.8", Loc: []float64{44.5142, 40.1810}},
	{ID: "h3", Name: "Grand Hotel Yerevan", NameHy: "Grand Hotel", Type: "Hotel", Cat: "nearby", Rating: "4.5", Loc: []float64{44.5132, 40.1805}},
	{ID: "h4", Name: "Hyatt Place Yerevan", NameHy: "Hyatt", Type: "Hotel", Cat: "nearby", Rating: "4.6", Loc: []float64{44.5150, 40.1830}},
	// ── Museums ──
	{ID: "u1", Name: "History Museum of Armenia", NameHy: "Patmutyan Tangaran", Type: "Museum", Cat: "nearby", Rating: "4.7", Loc: []float64{44.5124, 40.1778}},
	{ID: "u2", Name: "Matenadaran", NameHy: "Matenadaran", Type: "Museum", Cat: "nearby", Rating: "4.9", Loc: []float64{44.5148, 40.1890}},
	{ID: "u3", Name: "Cafesjian Center for the Arts", NameHy: "Cafesjian", Type: "Museum", Cat: "nearby", Rating: "4.8", Loc: []float64{44.5155, 40.1920}},
	{ID: "u4", Name: "Sergei Parajanov Museum", NameHy: "Parajanov Tangaran", Type: "Museum", Cat: "nearby", Rating: "4.7", Loc: []float64{44.5038, 40.1850}},
	{ID: "u5", Name: "Armenian Genocide Museum", NameHy: "Tsitsernakaberd Tangaran", Type: "Museum", Cat: "nearby", Rating: "4.9", Loc: []float64{44.4905, 40.1848}},
	// ── Shopping ──
	{ID: "sh1", Name: "Dalma Garden Mall", NameHy: "Dalma", Type: "Shopping Mall", Cat: "nearby", Rating: "4.5", Loc: []float64{44.5448, 40.1716}},
	{ID: "sh2", Name: "Rossia Mall", NameHy: "Rossia", Type: "Shopping Mall", Cat: "nearby", Rating: "4.2", Loc: []float64{44.5080, 40.1760}},
	{ID: "sh3", Name: "GUM Market", NameHy: "GUM", Type: "Market", Cat: "nearby", Rating: "4.6", Loc: []float64{44.5172, 40.1717}},
	{ID: "sh4", Name: "Tashir Street Mall", NameHy: "Tashir", Type: "Shopping Mall", Cat: "nearby", Rating: "4.3", Loc: []float64{44.5100, 40.1785}},
	// ── Education ──
	{ID: "e1", Name: "Yerevan State University", NameHy: "YSU", Type: "University", Cat: "nearby", Rating: "4.6", Loc: []float64{44.5134, 40.1870}},
	{ID: "e2", Name: "American University of Armenia", NameHy: "AUA", Type: "University", Cat: "nearby", Rating: "4.8", Loc: []float64{44.5095, 40.1912}},
	// ── Sports ──
	{ID: "sp1", Name: "Hrazdan Stadium", NameHy: "Hrazdan Marzadasht", Type: "Stadium", Cat: "nearby", Rating: "4.3", Loc: []float64{44.5020, 40.1888}},
	{ID: "sp2", Name: "Republican Stadium", NameHy: "Hanrapetakan Marzadasht", Type: "Stadium", Cat: "nearby", Rating: "4.2", Loc: []float64{44.5175, 40.1760}},
	// ── Transport Hubs ──
	{ID: "t1", Name: "Yerevan Train Station", NameHy: "Yerevani Kayaran", Type: "Train Station", Cat: "transport", Rating: "4.0", Loc: []float64{44.5072, 40.1707}},
	{ID: "t2", Name: "Kilikia Bus Terminal", NameHy: "Kilikia Avtokayaran", Type: "Bus Terminal", Cat: "transport", Rating: "3.8", Loc: []float64{44.5260, 40.1690}},
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
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
			if len(query) > 3 {
				words := strings.Fields(nameLower)
				bestDist := 999
				for _, w := range words {
					dist := Levenshtein(w, query)
					if dist < bestDist {
						bestDist = dist
					}
				}
				
				maxTypos := 2
				if len(query) > 6 { maxTypos = 3 }
				
				if bestDist <= maxTypos {
					scored = append(scored, ScoredPlace{p, bestDist + 2})
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

	log.Printf("🚀 Argo Search API | %d places loaded | listening on :4000", len(Database))
	if err := http.ListenAndServe(":4000", handler); err != nil {
		log.Fatal(err)
	}
}
