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

func handleSearch(w http.ResponseWriter, r *http.Request) {
	query := strings.ToLower(r.URL.Query().Get("q"))
	
	// Pre-allocate to prevent nil slice encoding to json "null"
	results := make([]Place, 0)
	
	if query != "" {
		for _, p := range Database {
			if strings.Contains(strings.ToLower(p.Name), query) || strings.Contains(strings.ToLower(p.Type), query) {
				results = append(results, p)
			}
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
