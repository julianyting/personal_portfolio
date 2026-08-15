# NBA Web App — backend

A relational MySQL database of the NBA and a Flask REST API over it: teams,
coaches, players, games, and per-game box scores, with joins, aggregations, and
full CRUD.

The React frontend lives in the portfolio at `src/components/nba/` and is served
at `/nba`.

## Schema

Five tables, seeded from `../data_dump.sql` (30 teams, 30 coaches, 150 players,
5 games, 30 box scores):

```
Team ──┬── Coach          (Coach.TeamID       → Team.TeamID)
       ├── Player         (Player.TeamID      → Team.TeamID)
       └── Game           (Game.HomeTeamID    → Team.TeamID)
                          (Game.AwayTeamID    → Team.TeamID)

PlayerGameStatistics      PK (GameID, PlayerID)
                          (GameID   → Game.GameID)
                          (PlayerID → Player.PlayerID)
```

`PlayerGameStatistics` is the fact table — every average the app reports is a
`GROUP BY` over it.

## Running it

```bash
pip install flask flask-cors mysql-connector-python

# Load the schema and seed data into a local MySQL instance.
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS NBA"
mysql -u root -p NBA < ../data_dump.sql

python app.py            # http://localhost:5000
```

Credentials are read from the environment, falling back to the local dev values:

| Variable          | Default     |
| ----------------- | ----------- |
| `NBA_DB_HOST`     | `localhost` |
| `NBA_DB_USER`     | `root`      |
| `NBA_DB_PASSWORD` | `CPSC408!`  |
| `NBA_DB_NAME`     | `NBA`       |

## Connecting the frontend

The React app talks to `src/utils/nbaApi.js`, which picks a backend at build time:

```bash
# Live: every query and write goes to Flask and MySQL.
VITE_API_URL=http://localhost:5000 npm run dev

# Offline (and how the deployed site runs): the same calls are served by
# src/utils/nbaLocalDb.js from the seed data, with identical response shapes.
npm run dev
```

`src/utils/nbaData.js` is generated from `../data_dump.sql` — the dump stays the
source of truth for both paths, so regenerate it rather than editing it by hand.

## API

| Method   | Path                               | Purpose                                        |
| -------- | ---------------------------------- | ---------------------------------------------- |
| `GET`    | `/api/health`                      | Liveness check                                 |
| `GET`    | `/api/teams`                       | All teams                                      |
| `GET`    | `/api/coaches`                     | All coaches, joined to their team              |
| `GET`    | `/api/games`                       | Schedule with both team names resolved         |
| `GET`    | `/api/team/roster`                 | Roster by `team_name`                          |
| `GET`    | `/api/team/players-by-position`    | Roster filtered by `position`                  |
| `GET`    | `/api/player/search`               | Partial name search, `position`/`team` filters |
| `GET`    | `/api/player/<id>`                 | Profile, game log, and season averages         |
| `GET`    | `/api/players/top/{points,assists,rebounds}` | Fixed top-10 leaderboards            |
| `GET`    | `/api/reports/leaders`             | Any stat, any filters — the report builder     |
| `GET`    | `/api/reports/conference-leaders`  | Scoring averages grouped by conference         |
| `POST`   | `/api/team` `/api/player` `/api/coach` `/api/game` | Create                         |
| `PUT`    | `/api/team` `/api/player` `/api/coach` `/api/game` | Update one column              |
| `DELETE` | `/api/team` `/api/player` `/api/coach` `/api/game` | Delete                         |
| `POST`   | `/api/player/trade`                | Move a player to another team                  |
| `POST`   | `/api/player/log-game`             | Insert a box score                             |
| `PUT`    | `/api/player/log-game`             | Correct one stat on a box score                |

`/api/reports/leaders` is the interesting one — it answers questions like
"the top 10 point guards by assists" from a single query:

```
GET /api/reports/leaders?stat=Assists&position=PG&limit=10
GET /api/reports/leaders?stat=Blocks&conference=West&order=desc&limit=5
```

Accepts `stat`, `position`, `team`, `conference`, `division`, `limit`, `order`.

## Notes on the SQL

Values are always passed as query parameters, never interpolated. Column names
can't be parameterised, so the `PUT` endpoints and the report's `stat`/`ORDER BY`
check the requested column against an allowlist first (`PLAYER_COLUMNS`,
`TEAM_COLUMNS`, `STAT_COLUMNS`, …) and return 400 on anything else.

Foreign-key violations come back as `409` with the database's own message —
deleting a team that still has players on its roster is refused rather than
cascaded, which is why "contract a team" in the UI can fail.

## Files

- `app.py` — the Flask API.
- `db_operations.py` — connection, table creation, and the query helpers
  `app.py` builds on (`select_query`, `select_query_params`, `modify_query_params`).
- `helper.py` — CSV parsing and console helpers from the original assignment.
- `NBA.py` — the first pass at the CRUD layer, superseded by `db_operations.py`
  and no longer imported by anything.
- `db_operations (1).py` — a byte-identical duplicate of `db_operations.py`;
  safe to delete.
