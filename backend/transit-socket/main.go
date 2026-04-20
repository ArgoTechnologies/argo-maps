package main

import (
	"encoding/json"
	"log"
	"math"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true }, // Accept from Next.js
}

type Vehicle struct {
	ID        string    `json:"id"`
	Type      string    `json:"type"`
	RouteName string    `json:"routeName"`
	Loc       []float64 `json:"loc"`
	Angle     float64   `json:"angle"`
}

func main() {
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("Upgrade error:", err)
			return
		}
		defer conn.Close()

		// Production Polling Loop
		ticker := time.NewTicker(2 * time.Second) // Poll real GPS data every 2s
		defer ticker.Stop()

		var step float64 = 0 // Used only for fallback mock

		for {
			<-ticker.C

			// Here is where the real Yerevan GPS integration happens
			// We try to fetch the live GTFS-RT or JSON from the municipality
			// Example placeholder URL:
			fetchURL := "https://api.yerevan.transport/live" // Placeholder for actual Yerevan API
			
			var vehicles []Vehicle
			
			resp, err := http.Get(fetchURL)
			if err == nil && resp.StatusCode == 200 {
				// REAL DATA PARSING
				json.NewDecoder(resp.Body).Decode(&vehicles)
				resp.Body.Close()
			} else {
				// FALLBACK MOCK DATA (until we get the real API keys from Yandex/Yerevan)
				step += 0.05
				cx, cy := 44.5135, 40.1820
				vehicles = []Vehicle{
					{
						ID:        "bus-am-14",
						Type:      "bus",
						RouteName: "14",
						Loc:       []float64{cx + 0.005*math.Cos(step), cy + 0.005*math.Sin(step)},
						Angle:     step * (180 / math.Pi),
					},
					{
						ID:        "trolley-1",
						Type:      "bus", // mapped as bus for now
						RouteName: "Троллейбус 1",
						Loc:       []float64{cx + 0.008*math.Cos(step+2), cy + 0.003*math.Sin(step+2)},
						Angle:     (step + 2) * (180 / math.Pi),
					},
				}
			}

			payload, _ := json.Marshal(vehicles)
			if err := conn.WriteMessage(websocket.TextMessage, payload); err != nil {
				log.Println("Client disconnected")
				break
			}
		}
	})

	log.Println("🛰️ Argo Maps Live Transit Socket running on ws://localhost:4001/ws")
	err := http.ListenAndServe(":4001", nil)
	if err != nil {
		log.Fatal(err)
	}
}
