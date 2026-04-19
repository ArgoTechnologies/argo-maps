use axum::{extract::Query, routing::get, Json, Router};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};

// ═══════════════════════════════════════════════════
//  K-D TREE: Spatial Index for O(log n) Nearest-Neighbor Search
//  This is the heart of our Reverse Geocoding engine.
//  Instead of scanning every single point in the database (O(n)),
//  we partition 2D space into a binary tree so that finding
//  the closest place runs in O(log n) time on average.
// ═══════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Place {
    id: String,
    name: String,
    name_hy: String,
    place_type: String,
    lat: f64,
    lng: f64,
}

impl Place {
    fn coord(&self, axis: usize) -> f64 {
        if axis == 0 { self.lng } else { self.lat }
    }

    fn dist_sq(&self, lng: f64, lat: f64) -> f64 {
        let dlng = self.lng - lng;
        let dlat = self.lat - lat;
        dlng * dlng + dlat * dlat
    }
}

// ── K-D Tree Node ──
struct KdNode {
    place: Place,
    left: Option<Box<KdNode>>,
    right: Option<Box<KdNode>>,
    axis: usize, // 0 = split on lng, 1 = split on lat
}

impl KdNode {
    /// Build a balanced K-D tree from a list of places.
    /// We alternate the splitting axis at each depth level:
    ///   depth 0 → split on longitude (axis 0)
    ///   depth 1 → split on latitude  (axis 1)
    ///   depth 2 → split on longitude again, etc.
    fn build(mut places: Vec<Place>, depth: usize) -> Option<Box<KdNode>> {
        if places.is_empty() {
            return None;
        }

        let axis = depth % 2;

        // Sort by the current axis coordinate
        places.sort_by(|a, b| a.coord(axis).partial_cmp(&b.coord(axis)).unwrap());

        let median = places.len() / 2;
        let place = places[median].clone();

        let left_places = places[..median].to_vec();
        let right_places = places[median + 1..].to_vec();

        Some(Box::new(KdNode {
            place,
            left: KdNode::build(left_places, depth + 1),
            right: KdNode::build(right_places, depth + 1),
            axis,
        }))
    }

    /// Find the nearest neighbor to (lng, lat).
    /// This is the classic K-D tree nearest-neighbor search:
    ///   1. Recurse into the "closer" subtree first.
    ///   2. Check if the current node is closer than our best so far.
    ///   3. If the splitting plane is closer than our best distance,
    ///      also recurse into the "farther" subtree (it might contain a closer point).
    fn nearest(&self, lng: f64, lat: f64, best: &mut Option<(f64, Place)>) {
        let d = self.place.dist_sq(lng, lat);

        // Update best if this node is closer
        let dominated = match best {
            Some((best_d, _)) => d < *best_d,
            None => true,
        };
        if dominated {
            *best = Some((d, self.place.clone()));
        }

        let query_coord = if self.axis == 0 { lng } else { lat };
        let split_coord = self.place.coord(self.axis);
        let diff = query_coord - split_coord;

        // Decide which side to search first
        let (first, second) = if diff < 0.0 {
            (&self.left, &self.right)
        } else {
            (&self.right, &self.left)
        };

        // Always search the closer side
        if let Some(node) = first {
            node.nearest(lng, lat, best);
        }

        // Only search the farther side if the splitting plane is closer than current best
        let best_dist = best.as_ref().map(|(d, _)| *d).unwrap_or(f64::MAX);
        if diff * diff < best_dist {
            if let Some(node) = second {
                node.nearest(lng, lat, best);
            }
        }
    }

    /// Find the K nearest neighbors
    fn k_nearest(&self, lng: f64, lat: f64, k: usize, results: &mut Vec<(f64, Place)>) {
        let d = self.place.dist_sq(lng, lat);

        // Insert into results, keeping sorted by distance
        let pos = results.iter().position(|(rd, _)| d < *rd);
        match pos {
            Some(i) => results.insert(i, (d, self.place.clone())),
            None => results.push((d, self.place.clone())),
        }
        if results.len() > k {
            results.pop();
        }

        let query_coord = if self.axis == 0 { lng } else { lat };
        let split_coord = self.place.coord(self.axis);
        let diff = query_coord - split_coord;

        let (first, second) = if diff < 0.0 {
            (&self.left, &self.right)
        } else {
            (&self.right, &self.left)
        };

        if let Some(node) = first {
            node.k_nearest(lng, lat, k, results);
        }

        let worst_dist = results.last().map(|(d, _)| *d).unwrap_or(f64::MAX);
        if diff * diff < worst_dist || results.len() < k {
            if let Some(node) = second {
                node.k_nearest(lng, lat, k, results);
            }
        }
    }
}

// ═══════════════════════════════════════════════════
//  DATABASE: Yerevan POI dataset (will be replaced with OSM import later)
// ═══════════════════════════════════════════════════
fn load_yerevan_places() -> Vec<Place> {
    vec![
        Place { id: "s1".into(), name: "Republic Square".into(), name_hy: "Հանրdelays հdelays".into(), place_type: "Plaza".into(), lng: 44.5126, lat: 40.1776 },
        Place { id: "s2".into(), name: "Cascade Complex".into(), name_hy: "Կасկdelays համdelays".into(), place_type: "Landmark".into(), lng: 44.5155, lat: 40.1915 },
        Place { id: "s3".into(), name: "Opera House".into(), name_hy: "Օdelay ու delays".into(), place_type: "Theatre".into(), lng: 44.5145, lat: 40.1860 },
        Place { id: "s4".into(), name: "Blue Mosque".into(), name_hy: "Կapuyт мdelay".into(), place_type: "Place of Worship".into(), lng: 44.5056, lat: 40.1782 },
        Place { id: "s5".into(), name: "Vernissage Market".into(), name_hy: "Վernissage".into(), place_type: "Market".into(), lng: 44.5171, lat: 40.1770 },
        Place { id: "s6".into(), name: "North Avenue".into(), name_hy: "Հyupyp пdelay".into(), place_type: "Street".into(), lng: 44.5120, lat: 40.1815 },
        Place { id: "s7".into(), name: "Yerevan State University".into(), name_hy: "ЕПdelay".into(), place_type: "University".into(), lng: 44.5134, lat: 40.1870 },
        Place { id: "s8".into(), name: "Hrazdan Stadium".into(), name_hy: "Հrdelay".into(), place_type: "Stadium".into(), lng: 44.5020, lat: 40.1888 },
        Place { id: "s9".into(), name: "Erebuni Fortress".into(), name_hy: "Էdelay".into(), place_type: "Historical Site".into(), lng: 44.5280, lat: 40.1495 },
        Place { id: "s10".into(), name: "Tsitsernakaberd Memorial".into(), name_hy: "Ծdelay".into(), place_type: "Memorial".into(), lng: 44.4901, lat: 40.1853 },
        Place { id: "s11".into(), name: "Mashtots Avenue".into(), name_hy: "Маshdelay".into(), place_type: "Street".into(), lng: 44.5100, lat: 40.1830 },
        Place { id: "s12".into(), name: "Victory Park".into(), name_hy: "Հautodelay park".into(), place_type: "Park".into(), lng: 44.5108, lat: 40.1945 },
        Place { id: "s13".into(), name: "Yerevan Train Station".into(), name_hy: "Երevdelay".into(), place_type: "Train Station".into(), lng: 44.5072, lat: 40.1707 },
        Place { id: "s14".into(), name: "Dalma Garden Mall".into(), name_hy: "Далмdelay".into(), place_type: "Shopping Mall".into(), lng: 44.5448, lat: 40.1716 },
        Place { id: "s15".into(), name: "Armenia Marriott Hotel".into(), name_hy: "Мdelay".into(), place_type: "Hotel".into(), lng: 44.5130, lat: 40.1777 },
        Place { id: "s16".into(), name: "Saryan Street".into(), name_hy: "Сарdelay пoгоdelays".into(), place_type: "Street".into(), lng: 44.5080, lat: 40.1795 },
        Place { id: "s17".into(), name: "Lovers Park".into(), name_hy: "Сdelay".into(), place_type: "Park".into(), lng: 44.5140, lat: 40.1902 },
        Place { id: "s18".into(), name: "GUM Market".into(), name_hy: "ГУМ".into(), place_type: "Market".into(), lng: 44.5172, lat: 40.1717 },
        Place { id: "s19".into(), name: "Zoravar Andranik Metro".into(), name_hy: "Зdelay".into(), place_type: "Subway Station".into(), lng: 44.5183, lat: 40.1721 },
        Place { id: "s20".into(), name: "Marshal Baghramyan Metro".into(), name_hy: "Мdelay Б".into(), place_type: "Subway Station".into(), lng: 44.5095, lat: 40.1905 },
    ]
}

// ═══════════════════════════════════════════════════
//  API HANDLERS
// ═══════════════════════════════════════════════════

#[derive(Deserialize)]
struct ReverseGeoQuery {
    lng: f64,
    lat: f64,
}

#[derive(Deserialize)]
struct NearbyQuery {
    lng: f64,
    lat: f64,
    k: Option<usize>,
}

#[derive(Serialize)]
struct GeoResult {
    place: Place,
    distance_meters: f64,
}

/// Convert degrees-squared distance to approximate meters (at Yerevan latitude ~40°N)
fn deg_sq_to_meters(d_sq: f64) -> f64 {
    // At 40°N: 1° lat ≈ 111,035m, 1° lng ≈ 85,394m
    // Rough average: 1° ≈ 98,000m
    let d = d_sq.sqrt();
    d * 98_000.0
}

/// GET /api/reverse?lng=44.51&lat=40.18
/// Returns the single closest place to the given coordinates.
async fn reverse_geocode(
    Query(params): Query<ReverseGeoQuery>,
    tree: axum::Extension<Arc<Option<Box<KdNode>>>>,
) -> Json<Option<GeoResult>> {
    if let Some(root) = tree.as_ref() {
        let mut best: Option<(f64, Place)> = None;
        root.nearest(params.lng, params.lat, &mut best);
        if let Some((d_sq, place)) = best {
            return Json(Some(GeoResult {
                place,
                distance_meters: deg_sq_to_meters(d_sq),
            }));
        }
    }
    Json(None)
}

/// GET /api/nearby?lng=44.51&lat=40.18&k=5
/// Returns the K nearest places to the given coordinates.
async fn nearby_places(
    Query(params): Query<NearbyQuery>,
    tree: axum::Extension<Arc<Option<Box<KdNode>>>>,
) -> Json<Vec<GeoResult>> {
    let k = params.k.unwrap_or(5);
    let mut results = Vec::new();

    if let Some(root) = tree.as_ref() {
        let mut raw: Vec<(f64, Place)> = Vec::new();
        root.k_nearest(params.lng, params.lat, k, &mut raw);
        for (d_sq, place) in raw {
            results.push(GeoResult {
                place,
                distance_meters: deg_sq_to_meters(d_sq),
            });
        }
    }

    Json(results)
}

/// GET /health
async fn health() -> &'static str {
    "🦀 Argo Spatial Engine v0.1.0 — K-D Tree Ready"
}

// ═══════════════════════════════════════════════════
//  MAIN: Build tree + start Axum server
// ═══════════════════════════════════════════════════

#[tokio::main]
async fn main() {
    let places = load_yerevan_places();
    let count = places.len();

    println!("🦀 Building K-D Tree from {} places...", count);
    let tree = KdNode::build(places, 0);
    let tree = Arc::new(tree);
    println!("✅ K-D Tree built successfully!");

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/health", get(health))
        .route("/api/reverse", get(reverse_geocode))
        .route("/api/nearby", get(nearby_places))
        .layer(axum::Extension(tree))
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:4002").await.unwrap();
    println!("🚀 Argo Spatial Engine listening on http://127.0.0.1:4002");
    println!("   → GET /api/reverse?lng=44.51&lat=40.18");
    println!("   → GET /api/nearby?lng=44.51&lat=40.18&k=5");

    axum::serve(listener, app).await.unwrap();
}
