-- Argo Maps — PostGIS initialization
-- Creates the OpenMapTiles-compatible schema for Armenia OSM data

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS hstore;

-- Transportation (roads, railways, paths)
CREATE TABLE IF NOT EXISTS transportation (
    osm_id BIGINT PRIMARY KEY,
    geometry GEOMETRY(LINESTRING, 3857),
    class TEXT,        -- motorway, trunk, primary, secondary, tertiary, minor, path, rail
    subclass TEXT,     -- residential, service, track, etc.
    name TEXT,
    "name:hy" TEXT,    -- Armenian
    "name:ru" TEXT,    -- Russian
    "name:en" TEXT,    -- English
    oneway BOOLEAN DEFAULT FALSE,
    surface TEXT,
    ref TEXT
);

CREATE INDEX IF NOT EXISTS idx_transport_geom ON transportation USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_transport_class ON transportation (class);

-- Water polygons
CREATE TABLE IF NOT EXISTS water (
    osm_id BIGINT PRIMARY KEY,
    geometry GEOMETRY(POLYGON, 3857),
    class TEXT,  -- lake, river, reservoir, ocean
    name TEXT,
    "name:hy" TEXT,
    "name:ru" TEXT
);

CREATE INDEX IF NOT EXISTS idx_water_geom ON water USING GIST (geometry);

-- Landuse polygons
CREATE TABLE IF NOT EXISTS landuse (
    osm_id BIGINT PRIMARY KEY,
    geometry GEOMETRY(POLYGON, 3857),
    class TEXT,  -- residential, park, forest, commercial, industrial, cemetery
    name TEXT
);

CREATE INDEX IF NOT EXISTS idx_landuse_geom ON landuse USING GIST (geometry);

-- Buildings
CREATE TABLE IF NOT EXISTS building (
    osm_id BIGINT PRIMARY KEY,
    geometry GEOMETRY(POLYGON, 3857),
    render_height FLOAT DEFAULT 10,
    render_min_height FLOAT DEFAULT 0,
    name TEXT,
    "name:hy" TEXT
);

CREATE INDEX IF NOT EXISTS idx_building_geom ON building USING GIST (geometry);

-- Places (cities, towns, villages, suburbs)
CREATE TABLE IF NOT EXISTS place (
    osm_id BIGINT PRIMARY KEY,
    geometry GEOMETRY(POINT, 3857),
    class TEXT,  -- city, town, village, suburb, neighbourhood
    name TEXT,
    "name:hy" TEXT,
    "name:ru" TEXT,
    "name:en" TEXT,
    rank INT
);

CREATE INDEX IF NOT EXISTS idx_place_geom ON place USING GIST (geometry);

-- Transportation names (for label layer)
CREATE VIEW transportation_name AS
SELECT osm_id, geometry, class, name, "name:hy", "name:ru", "name:en", ref
FROM transportation
WHERE name IS NOT NULL;

-- POI (Points of Interest)
CREATE TABLE IF NOT EXISTS poi (
    osm_id BIGINT PRIMARY KEY,
    geometry GEOMETRY(POINT, 3857),
    class TEXT,    -- restaurant, cafe, shop, hotel, museum, pharmacy, atm, etc.
    subclass TEXT,
    name TEXT,
    "name:hy" TEXT,
    "name:ru" TEXT,
    "name:en" TEXT,
    rank INT
);

CREATE INDEX IF NOT EXISTS idx_poi_geom ON poi USING GIST (geometry);

-- Grant read access
GRANT SELECT ON ALL TABLES IN SCHEMA public TO argo;
