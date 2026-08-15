# backend/app.py

import mysql.connector
from flask import Flask, request, jsonify
from flask_cors import CORS
from db_operations import db_operations

app = Flask(__name__)
CORS(app)  # allow requests from your Vite dev server

# Single shared DB object
db = db_operations()


# ---------- helpers ----------

def rows_to_dicts(columns, rows):
    """Zip column names with row tuples into list[dict]."""
    return [dict(zip(columns, row)) for row in rows]


def require(data, fields):
    """Return an error response for any missing field, else None."""
    missing = [f for f in fields if f not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400
    return None


# Column allowlists. Every dynamic identifier interpolated into SQL is checked
# against one of these first — parameters can't stand in for column names.
PLAYER_COLUMNS = {"Name", "Height", "Weight", "Age", "Position", "TeamID"}
TEAM_COLUMNS = {"Name", "City", "Division", "Conference"}
COACH_COLUMNS = {"Name", "Salary", "TeamID"}
GAME_COLUMNS = {"Date", "Location", "HomeTeamID", "AwayTeamID", "HomeScore", "AwayScore"}
STAT_COLUMNS = {
    "Points", "Rebounds", "Assists", "Blocks",
    "Steals", "Turnovers", "MinutesPlayed", "Fouls",
}


def check_column(column, allowed):
    """Return an error response if `column` isn't in the allowlist, else None."""
    if column not in allowed:
        return jsonify({"error": f"Invalid column '{column}'"}), 400
    return None


def integrity_error(exc):
    """Turn a FK/constraint violation into a 409 the UI can show."""
    return jsonify({"error": str(exc.msg if hasattr(exc, "msg") else exc)}), 409


# ---------- basic health check ----------

@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


# ---------- TOP 10 QUERIES ----------

@app.route("/api/players/top/points")
def top_players_points():
    query = """
        SELECT
            Player.PlayerID,
            Player.Name,
            AVG(PlayerGameStatistics.Points) AS avg_points
        FROM Player
        JOIN PlayerGameStatistics ON Player.PlayerID = PlayerGameStatistics.PlayerID
        GROUP BY Player.PlayerID, Player.Name
        ORDER BY avg_points DESC
        LIMIT 10;
    """
    rows = db.select_query(query)
    data = [
        {"player_id": r[0], "name": r[1], "avg_points": float(r[2])}
        for r in rows
    ]
    return jsonify(data)


@app.route("/api/players/top/assists")
def top_players_assists():
    query = """
        SELECT
            Player.PlayerID,
            Player.Name,
            AVG(PlayerGameStatistics.Assists) AS avg_assists
        FROM Player
        JOIN PlayerGameStatistics ON Player.PlayerID = PlayerGameStatistics.PlayerID
        GROUP BY Player.PlayerID, Player.Name
        ORDER BY avg_assists DESC
        LIMIT 10;
    """
    rows = db.select_query(query)
    data = [
        {"player_id": r[0], "name": r[1], "avg_assists": float(r[2])}
        for r in rows
    ]
    return jsonify(data)


@app.route("/api/players/top/rebounds")
def top_players_rebounds():
    query = """
        SELECT
            Player.PlayerID,
            Player.Name,
            AVG(PlayerGameStatistics.Rebounds) AS avg_rebounds
        FROM Player
        JOIN PlayerGameStatistics ON Player.PlayerID = PlayerGameStatistics.PlayerID
        GROUP BY Player.PlayerID, Player.Name
        ORDER BY avg_rebounds DESC
        LIMIT 10;
    """
    rows = db.select_query(query)
    data = [
        {"player_id": r[0], "name": r[1], "avg_rebounds": float(r[2])}
        for r in rows
    ]
    return jsonify(data)


# ---------- REPORT BUILDER ----------

@app.route("/api/reports/leaders")
def report_leaders():
    """Leaderboard over any stat, optionally narrowed to a team/position/conference.

    Backs questions like "top 10 point guards by assists" from one query:
    ?stat=Assists&position=PG&limit=10
    """
    stat = request.args.get("stat", "Points")
    err = check_column(stat, STAT_COLUMNS)
    if err:
        return err

    direction = "ASC" if request.args.get("order", "desc").lower() == "asc" else "DESC"

    try:
        limit = max(1, min(int(request.args.get("limit", 10)), 100))
    except ValueError:
        return jsonify({"error": "limit must be an integer"}), 400

    # Optional filters, appended as parameterized predicates.
    filters = []
    params = []
    for arg, predicate in (
        ("team", "Team.Name = %s"),
        ("position", "Player.Position = %s"),
        ("conference", "Team.Conference = %s"),
        ("division", "Team.Division = %s"),
    ):
        value = request.args.get(arg)
        if value:
            filters.append(predicate)
            params.append(value)

    where = f"WHERE {' AND '.join(filters)}" if filters else ""

    query = f"""
        SELECT
            Player.PlayerID,
            Player.Name,
            Player.Position,
            Team.Name AS TeamName,
            Team.Conference,
            COUNT(*) AS GamesPlayed,
            AVG(PlayerGameStatistics.{stat}) AS StatValue
        FROM Player
        INNER JOIN PlayerGameStatistics
            ON Player.PlayerID = PlayerGameStatistics.PlayerID
        LEFT JOIN Team ON Player.TeamID = Team.TeamID
        {where}
        GROUP BY Player.PlayerID, Player.Name, Player.Position,
                 Team.Name, Team.Conference
        ORDER BY StatValue {direction}
        LIMIT {limit};
    """
    rows = db.select_query_params(query, tuple(params)) if params else db.select_query(query)
    cols = ["player_id", "name", "position", "team", "conference", "games_played", "value"]
    data = rows_to_dicts(cols, rows)
    for row in data:
        row["value"] = float(row["value"])
        row["stat"] = stat
    return jsonify(data)


@app.route("/api/reports/conference-leaders")
def report_conference_leaders():
    """Average points per player, grouped by conference."""
    query = """
        SELECT
            Team.Conference,
            Player.Name,
            AVG(PlayerGameStatistics.Points) AS AvgPoints
        FROM Player
        INNER JOIN Team ON Player.TeamID = Team.TeamID
        INNER JOIN PlayerGameStatistics
            ON Player.PlayerID = PlayerGameStatistics.PlayerID
        GROUP BY Team.Conference, Player.PlayerID, Player.Name
        ORDER BY Team.Conference, AvgPoints DESC;
    """
    rows = db.select_query(query)
    data = rows_to_dicts(["conference", "name", "avg_points"], rows)
    for row in data:
        row["avg_points"] = float(row["avg_points"])
    return jsonify(data)


# ---------- TEAM QUERIES ----------

@app.route("/api/teams")
def list_teams():
    query = """
        SELECT TeamID, Name, City, Division, Conference
        FROM Team
        ORDER BY Name;
    """
    rows = db.select_query(query)
    return jsonify(rows_to_dicts(
        ["team_id", "name", "city", "division", "conference"], rows
    ))


@app.route("/api/team/roster")
def team_roster():
    team_name = request.args.get("team_name")
    if not team_name:
        return jsonify({"error": "team_name is required"}), 400

    query = """
        SELECT Player.PlayerID, Player.Name, Player.Position, Player.Age,
               Player.Height, Player.Weight
        FROM Player
        INNER JOIN Team ON Player.TeamID = Team.TeamID
        WHERE Team.Name = %s
        ORDER BY Player.Name;
    """
    rows = db.select_query_params(query, (team_name,))
    cols = ["player_id", "name", "position", "age", "height", "weight"]
    return jsonify(rows_to_dicts(cols, rows))


# optional: search team players by position
@app.route("/api/team/players-by-position")
def team_players_by_position():
    team_name = request.args.get("team_name")
    position = request.args.get("position")
    if not team_name or not position:
        return jsonify({"error": "team_name and position are required"}), 400

    query = """
        SELECT Player.PlayerID, Player.Name, Player.Position, Player.Age
        FROM Player
        INNER JOIN Team ON Player.TeamID = Team.TeamID
        WHERE Team.Name = %s AND Player.Position = %s;
    """
    rows = db.select_query_params(query, (team_name, position))
    cols = ["player_id", "name", "position", "age"]
    return jsonify(rows_to_dicts(cols, rows))


# ---------- COACH QUERIES ----------

@app.route("/api/coaches")
def list_coaches():
    query = """
        SELECT Coach.CoachID, Coach.Name, Coach.Salary,
               Coach.TeamID, Team.Name AS TeamName
        FROM Coach
        LEFT JOIN Team ON Coach.TeamID = Team.TeamID
        ORDER BY Coach.Name;
    """
    rows = db.select_query(query)
    return jsonify(rows_to_dicts(
        ["coach_id", "name", "salary", "team_id", "team"], rows
    ))


@app.route("/api/coach", methods=["POST"])
def add_coach():
    data = request.json or {}
    err = require(data, ["name", "salary", "team_id"])
    if err:
        return err

    query = """
        INSERT INTO Coach (Name, Salary, TeamID)
        VALUES (%s, %s, %s);
    """
    try:
        db.modify_query_params(
            query, (data["name"], int(data["salary"]), int(data["team_id"]))
        )
    except mysql.connector.Error as exc:
        return integrity_error(exc)
    return jsonify({"status": "ok"}), 201


@app.route("/api/coach", methods=["PUT"])
def update_coach():
    data = request.json or {}
    err = require(data, ["coach_id", "column", "new_value"])
    if err:
        return err

    column = data["column"]
    err = check_column(column, COACH_COLUMNS)
    if err:
        return err

    query = f"UPDATE Coach SET {column} = %s WHERE CoachID = %s;"
    try:
        db.modify_query_params(query, (data["new_value"], int(data["coach_id"])))
    except mysql.connector.Error as exc:
        return integrity_error(exc)
    return jsonify({"status": "ok"})


@app.route("/api/coach", methods=["DELETE"])
def delete_coach():
    coach_id = request.args.get("coach_id")
    if not coach_id:
        return jsonify({"error": "coach_id is required"}), 400

    query = "DELETE FROM Coach WHERE CoachID = %s;"
    try:
        db.modify_query_params(query, (int(coach_id),))
    except mysql.connector.Error as exc:
        return integrity_error(exc)
    return jsonify({"status": "ok"})


# ---------- PLAYER QUERIES ----------

@app.route("/api/player/search")
def search_player_by_name():
    """Partial, case-insensitive name search, optionally filtered."""
    name = request.args.get("name", "")
    position = request.args.get("position")
    team = request.args.get("team")

    filters = ["Player.Name LIKE %s"]
    params = [f"%{name}%"]
    if position:
        filters.append("Player.Position = %s")
        params.append(position)
    if team:
        filters.append("Team.Name = %s")
        params.append(team)

    query = f"""
        SELECT Player.PlayerID, Player.Name, Player.Height, Player.Weight,
               Player.Age, Player.Position, Player.TeamID, Team.Name AS TeamName
        FROM Player
        LEFT JOIN Team ON Player.TeamID = Team.TeamID
        WHERE {' AND '.join(filters)}
        ORDER BY Player.Name
        LIMIT 100;
    """
    rows = db.select_query_params(query, tuple(params))
    cols = ["player_id", "name", "height", "weight", "age",
            "position", "team_id", "team"]
    return jsonify(rows_to_dicts(cols, rows))


@app.route("/api/player/<int:player_id>")
def player_detail(player_id):
    """One player: profile, per-game box scores, and season averages."""
    profile_query = """
        SELECT Player.PlayerID, Player.Name, Player.Height, Player.Weight,
               Player.Age, Player.Position, Player.TeamID, Team.Name AS TeamName
        FROM Player
        LEFT JOIN Team ON Player.TeamID = Team.TeamID
        WHERE Player.PlayerID = %s;
    """
    profile_rows = db.select_query_params(profile_query, (player_id,))
    if not profile_rows:
        return jsonify({"error": "Player not found"}), 404

    profile = rows_to_dicts(
        ["player_id", "name", "height", "weight", "age",
         "position", "team_id", "team"],
        profile_rows,
    )[0]

    games_query = """
        SELECT s.GameID, g.Date, g.Location, s.Points, s.Rebounds, s.Assists,
               s.Blocks, s.Steals, s.Turnovers, s.MinutesPlayed, s.Fouls
        FROM PlayerGameStatistics s
        LEFT JOIN Game g ON s.GameID = g.GameID
        WHERE s.PlayerID = %s
        ORDER BY g.Date;
    """
    game_rows = db.select_query_params(games_query, (player_id,))
    game_cols = ["game_id", "date", "location", "points", "rebounds", "assists",
                 "blocks", "steals", "turnovers", "minutes_played", "fouls"]
    game_log = rows_to_dicts(game_cols, game_rows)
    for row in game_log:
        row["date"] = row["date"].isoformat() if row["date"] else None

    averages_query = """
        SELECT COUNT(*), AVG(Points), AVG(Rebounds), AVG(Assists), AVG(Blocks),
               AVG(Steals), AVG(Turnovers), AVG(MinutesPlayed), AVG(Fouls)
        FROM PlayerGameStatistics
        WHERE PlayerID = %s;
    """
    avg_row = db.select_query_params(averages_query, (player_id,))[0]
    avg_keys = ["games_played", "points", "rebounds", "assists", "blocks",
                "steals", "turnovers", "minutes_played", "fouls"]
    averages = {
        key: (float(value) if value is not None else 0.0)
        for key, value in zip(avg_keys, avg_row)
    }
    averages["games_played"] = int(averages["games_played"])

    return jsonify({"profile": profile, "game_log": game_log, "averages": averages})


# ---------- ADD / UPDATE / DELETE ----------

@app.route("/api/team", methods=["POST"])
def add_team():
    data = request.json or {}
    err = require(data, ["name", "city", "division", "conference"])
    if err:
        return err

    query = """
        INSERT INTO Team (Name, City, Division, Conference)
        VALUES (%s, %s, %s, %s);
    """
    params = (data["name"], data["city"], data["division"], data["conference"])
    try:
        db.modify_query_params(query, params)
    except mysql.connector.Error as exc:
        return integrity_error(exc)
    return jsonify({"status": "ok"}), 201


@app.route("/api/team", methods=["PUT"])
def update_team():
    data = request.json or {}
    err = require(data, ["team_id", "column", "new_value"])
    if err:
        return err

    column = data["column"]
    err = check_column(column, TEAM_COLUMNS)
    if err:
        return err

    query = f"UPDATE Team SET {column} = %s WHERE TeamID = %s;"
    try:
        db.modify_query_params(query, (data["new_value"], int(data["team_id"])))
    except mysql.connector.Error as exc:
        return integrity_error(exc)
    return jsonify({"status": "ok"})


@app.route("/api/team", methods=["DELETE"])
def delete_team():
    """Contract a team. Blocked by MySQL while players/coaches still point at it."""
    team_id = request.args.get("team_id")
    if not team_id:
        return jsonify({"error": "team_id is required"}), 400

    query = "DELETE FROM Team WHERE TeamID = %s;"
    try:
        db.modify_query_params(query, (int(team_id),))
    except mysql.connector.Error as exc:
        return integrity_error(exc)
    return jsonify({"status": "ok"})


@app.route("/api/player", methods=["POST"])
def add_player():
    data = request.json or {}
    err = require(data, ["name", "height", "weight", "age", "position", "team_id"])
    if err:
        return err

    query = """
        INSERT INTO Player (Name, Height, Weight, Age, Position, TeamID)
        VALUES (%s, %s, %s, %s, %s, %s);
    """
    params = (
        data["name"],
        int(data["height"]),
        int(data["weight"]),
        int(data["age"]),
        data["position"],
        int(data["team_id"]),
    )
    try:
        db.modify_query_params(query, params)
    except mysql.connector.Error as exc:
        return integrity_error(exc)
    return jsonify({"status": "ok"}), 201


@app.route("/api/player", methods=["PUT"])
def update_player():
    data = request.json or {}
    err = require(data, ["player_id", "column", "new_value"])
    if err:
        return err

    column = data["column"]
    err = check_column(column, PLAYER_COLUMNS)
    if err:
        return err

    query = f"UPDATE Player SET {column} = %s WHERE PlayerID = %s;"
    try:
        db.modify_query_params(query, (data["new_value"], int(data["player_id"])))
    except mysql.connector.Error as exc:
        return integrity_error(exc)
    return jsonify({"status": "ok"})


@app.route("/api/player", methods=["DELETE"])
def delete_player():
    """Cut a player. Their box scores go too, or the FK would block the delete."""
    player_id = request.args.get("player_id")
    if not player_id:
        return jsonify({"error": "player_id is required"}), 400

    try:
        db.modify_query_params(
            "DELETE FROM PlayerGameStatistics WHERE PlayerID = %s;", (int(player_id),)
        )
        db.modify_query_params(
            "DELETE FROM Player WHERE PlayerID = %s;", (int(player_id),)
        )
    except mysql.connector.Error as exc:
        return integrity_error(exc)
    return jsonify({"status": "ok"})


@app.route("/api/player/trade", methods=["POST"])
def trade_player():
    """Move a player to another team — a trade or a signing."""
    data = request.json or {}
    err = require(data, ["player_id", "team_id"])
    if err:
        return err

    query = "UPDATE Player SET TeamID = %s WHERE PlayerID = %s;"
    try:
        db.modify_query_params(query, (int(data["team_id"]), int(data["player_id"])))
    except mysql.connector.Error as exc:
        return integrity_error(exc)
    return jsonify({"status": "ok"})


# ---------- GAMES ----------

@app.route("/api/games")
def list_games():
    query = """
        SELECT g.GameID, g.Date, g.Location,
               g.HomeTeamID, home.Name AS HomeName,
               g.AwayTeamID, away.Name AS AwayName,
               g.HomeScore, g.AwayScore
        FROM Game g
        LEFT JOIN Team home ON g.HomeTeamID = home.TeamID
        LEFT JOIN Team away ON g.AwayTeamID = away.TeamID
        ORDER BY g.Date DESC;
    """
    rows = db.select_query(query)
    cols = ["game_id", "date", "location", "home_team_id", "home_team",
            "away_team_id", "away_team", "home_score", "away_score"]
    data = rows_to_dicts(cols, rows)
    for row in data:
        row["date"] = row["date"].isoformat() if row["date"] else None
    return jsonify(data)


@app.route("/api/game", methods=["POST"])
def add_game():
    data = request.json or {}
    err = require(data, ["date", "location", "home_team_id",
                         "away_team_id", "home_score", "away_score"])
    if err:
        return err

    query = """
        INSERT INTO Game (Date, Location, HomeTeamID, AwayTeamID, HomeScore, AwayScore)
        VALUES (%s, %s, %s, %s, %s, %s);
    """
    params = (
        data["date"],
        data["location"],
        int(data["home_team_id"]),
        int(data["away_team_id"]),
        int(data["home_score"]),
        int(data["away_score"]),
    )
    try:
        db.modify_query_params(query, params)
    except mysql.connector.Error as exc:
        return integrity_error(exc)
    return jsonify({"status": "ok"}), 201


@app.route("/api/game", methods=["PUT"])
def update_game():
    data = request.json or {}
    err = require(data, ["game_id", "column", "new_value"])
    if err:
        return err

    column = data["column"]
    err = check_column(column, GAME_COLUMNS)
    if err:
        return err

    query = f"UPDATE Game SET {column} = %s WHERE GameID = %s;"
    try:
        db.modify_query_params(query, (data["new_value"], int(data["game_id"])))
    except mysql.connector.Error as exc:
        return integrity_error(exc)
    return jsonify({"status": "ok"})


@app.route("/api/game", methods=["DELETE"])
def delete_game():
    game_id = request.args.get("game_id")
    if not game_id:
        return jsonify({"error": "game_id is required"}), 400

    try:
        db.modify_query_params(
            "DELETE FROM PlayerGameStatistics WHERE GameID = %s;", (int(game_id),)
        )
        db.modify_query_params("DELETE FROM Game WHERE GameID = %s;", (int(game_id),))
    except mysql.connector.Error as exc:
        return integrity_error(exc)
    return jsonify({"status": "ok"})


# ---------- LOG PLAYER GAME ----------

@app.route("/api/player/log-game", methods=["POST"])
def log_player_game():
    data = request.json or {}
    err = require(data, ["game_id", "player_id", "points", "rebounds", "assists"])
    if err:
        return err

    query = """
        INSERT INTO PlayerGameStatistics
        (GameID, PlayerID, Points, Rebounds, Assists, Blocks, Steals, Turnovers, MinutesPlayed, Fouls)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
    """
    # The optional half of a box score defaults to zero.
    params = (
        int(data["game_id"]),
        int(data["player_id"]),
        int(data["points"]),
        int(data["rebounds"]),
        int(data["assists"]),
        int(data.get("blocks", 0)),
        int(data.get("steals", 0)),
        int(data.get("turnovers", 0)),
        int(data.get("minutes_played", 0)),
        int(data.get("fouls", 0)),
    )
    try:
        db.modify_query_params(query, params)
    except mysql.connector.Error as exc:
        return integrity_error(exc)
    return jsonify({"status": "ok"}), 201


@app.route("/api/player/log-game", methods=["PUT"])
def update_player_game():
    data = request.json or {}
    err = require(data, ["game_id", "player_id", "column", "new_value"])
    if err:
        return err

    column = data["column"]
    err = check_column(column, STAT_COLUMNS)
    if err:
        return err

    query = f"""
        UPDATE PlayerGameStatistics
        SET {column} = %s
        WHERE GameID = %s AND PlayerID = %s;
    """
    try:
        db.modify_query_params(
            query, (int(data["new_value"]), int(data["game_id"]), int(data["player_id"]))
        )
    except mysql.connector.Error as exc:
        return integrity_error(exc)
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    # run on http://localhost:5000
    app.run(debug=True)
