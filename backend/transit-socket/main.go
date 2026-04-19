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

		ticker := time.NewTicker(600 * time.Millisecond) // Broadcast often
		defer ticker.Stop()

		// Yerevan center
		cx, cy := 44.5135, 40.1820
		step := 0.0

		for {
			<-ticker.C
			step += 0.05

			vehicles := []Vehicle{
				{
					ID:        "bus-1",
					Type:      "bus",
					RouteName: "14",
					Loc:       []float64{cx + 0.005*math.Cos(step), cy + 0.005*math.Sin(step)},
					Angle:     step * (180 / math.Pi),
				},
				{
					ID:        "taxi-2",
					Type:      "taxi",
					RouteName: "Argo",
					Loc:       []float64{cx + 0.008*math.Cos(step+2), cy + 0.003*math.Sin(step+2)},
					Angle:     (step + 2) * (180 / math.Pi),
				},
				{
					ID:        "bus-3",
					Type:      "bus",
					RouteName: "47",
					Loc:       []float64{cx + 0.002*math.Cos(-step), cy + 0.009*math.Sin(-step)},
					Angle:     -step * (180 / math.Pi),
				},
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
