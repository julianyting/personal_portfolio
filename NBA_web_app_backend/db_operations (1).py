import mysql.connector
from helper import helper

class db_operations():

    def __init__(self):
        # Make connection
        self.connection = mysql.connector.connect(host="localhost",
            user= "root",
            password= "CPSC408!",
            auth_plugin= 'mysql_native_password',
            database = "NBA"
            )
        print("Connection made...")
        self.cursor = self.connection.cursor()
        print("Cursor object made...")

#=============================================================
# FUNCTIONS FOR CREATING TABLES AND POPULATING
    def create_team(self):
        query = '''
        CREATE TABLE Team (
            TeamID INT PRIMARY KEY AUTO_INCREMENT,
            Name VARCHAR(70),
            City VARCHAR(70),
            Division VARCHAR(30),
            Conference VARCHAR(30),
        );
        '''
        self.cursor.execute(query)
        print('Team Table Created')

    def create_coach(self):
        query = '''
        CREATE TABLE Coach (
            CoachID INT PRIMARY KEY AUTO_INCREMENT,
            Name VARCHAR(80),
            Salary INT,
            TeamID INT
        );
        '''
        self.cursor.execute(query)
        print('Coach Table Created')

    def create_player(self):
        query = '''
        CREATE TABLE Player (
            PlayerID INT PRIMARY KEY AUTO_INCREMENT,
            Name VARCHAR(70),
            Height INT,
            Weight INT,
            Age INT,
            Position VARCHAR(2),
            TeamID INT
        );
        '''
        self.cursor.execute(query)
        print('Player Table Created')

    def create_game(self):
        query = '''
        CREATE TABLE Game (
            GameID INT PRIMARY KEY AUTO_INCREMENT,
            Date DATE,
            Location VARCHAR(80),
            HomeTeamID INT,
            AwayTeamID INT,
            HomeScore INT,
            AwayScore INT
        );
        '''
        self.cursor.execute(query)
        print('Game Table Created')        

    def create_playergamestatistics(self):
        query = '''
        CREATE TABLE PlayerGameStatistics (
            GameID INT,
            PlayerID INT,
            Points INT,
            Rebounds INT,
            Assists INT,
            Blocks INT,
            Steals INT,
            Turnovers INT,
            MinutesPlayed INT,
            Fouls INT,
            PRIMARY KEY (GameID, PlayerID),
            FOREIGN KEY (GameID) REFERENCES Game(GameID),
            FOREIGN KEY (PlayerID) REFERENCES Player(PlayerID)
        );
        '''
        self.cursor.execute(query)
        print('PlayerGameStatistics Table Created')   

    def update_fk_tables(self):
        query = '''
        ALTER TABLE Coach
        ADD CONSTRAINT fk_coach_team
        FOREIGN KEY (TeamID) REFERENCES Team(TeamID);

        ALTER TABLE Player
        ADD CONSTRAINT fk_player_team
        FOREIGN KEY (TeamID) REFERENCES Team(TeamID);

        ALTER TABLE Game
        ADD CONSTRAINT fk_home_game_team
        FOREIGN KEY (HomeTeamID) REFERENCES Team(TeamID),
        ADD CONSTRAINT fk_away_game_team
        FOREIGN KEY (AwayTeamID) REFERENCES Team(TeamID);
        '''
        self.cursor.execute(query)
        print('Foreign Keys Updated')    

    def create_all_tables(self):
        self.create_team()
        self.create_coach()
        self.create_player()
        self.create_game()
        self.create_playergamestatistics()
        self.update_fk_tables()

    #incase tables are messed up and need to be deleted and readded
    def reset(self):
        query = '''
        DROP TABLE Team;
        DROP TABLE Coach;
        DROP TABLE Player;
        DROP TABLE Game;
        DROP TABLE PlayerGameStatistics;
        '''
        self.cursor.execute(query)
        print('All tables deleted')

    def populate_table(self, table, filepath, values):
        data = helper.data_cleaner(filepath)
        attribute_count = len(data[0])
        placeholders = ("%s,"*attribute_count)[:-1]
        query = f"INSERT INTO {table} ({values}) VALUES("+placeholders+")"
        self.bulk_insert(query, data)
        print(f"Populated {table}")

#=============================================================



# -----------------------------
# REPORTS & SPECIAL QUERIES
# -----------------------------
    def get_top_players_by_avg_points(self):
        query = f'''
        SELECT PlayerID, Name, avg_points
        FROM PlayerAvgPoints
        ORDER BY avg_points DESC
        LIMIT 10;
        '''
        result = self.select_query(query)
        return helper.pretty_print(result)

    #SQL code to create view in database
    '''
    CREATE OR REPLACE VIEW PlayerAvgPoints AS
    (SELECT
        Player.PlayerID,
        Player.Name,
        AVG(PlayerGameStatistics.Points) AS avg_points
    FROM Player
    JOIN PlayerGameStatistics ON Player.PlayerID = PlayerGameStatistics.PlayerID
    GROUP BY Player.PlayerID, Player.name);
    '''


    def get_top_players_by_avg_assists(self):
        query = f'''
        SELECT
            Player.PlayerID,
            Player.Name,
            AVG(PlayerGameStatistics.Assists) AS avg_assists
        FROM Player
        INNER JOIN PlayerGameStatistics ON Player.PlayerID = PlayerGameStatistics.PlayerID
        GROUP BY Player.PlayerID, Player.name
        ORDER BY avg_assists DESC
        LIMIT 10;
        '''
        result = self.select_query(query)
        return helper.pretty_print(result)

    def get_top_players_by_avg_rebounds(self):
        query = f'''
        SELECT
            Player.PlayerID,
            Player.Name,
            AVG(PlayerGameStatistics.Rebounds) AS avg_rebounds
        FROM Player
        INNER JOIN PlayerGameStatistics ON Player.PlayerID = PlayerGameStatistics.PlayerID
        GROUP BY Player.PlayerID, Player.name
        ORDER BY avg_rebounds DESC
        LIMIT 10;
        '''
        result = self.select_query(query)
        return helper.pretty_print(result)

    def get_top_players_by_avg_points_conference(self):
        query = f'''
        SELECT
            t.Conference,
            p.Name AS PlayerName,
            AVG(s.Points) AS AvgPointsPerGame
        FROM Player p
        INNER JOIN Team t ON p.TeamID = t.TeamID
        INNER JOIN PlayerGameStatistics s ON p.PlayerID = s.PlayerID
        GROUP BY t.Conference, p.PlayerID, p.Name
        ORDER BY t.Conference, AvgPointsPerGame DESC;
        '''
        result = self.select_query(query)
        return helper.pretty_print(result)
    
    def get_team_roster(self, team_name):
        query = '''
        SELECT PlayerID, Player.Name, Position, Player.Age
        FROM Player
        INNER JOIN Team ON Player.TeamID = Team.TeamID
        WHERE Team.name = %s
        '''
        record = (team_name,)
        result = self.select_query_params(query, record)
        return helper.pretty_print(result)



    def search_player_by_name(self, name):
        query = '''
        SELECT *
        FROM Player
        WHERE Player.name = %s
        '''
        record = (name,)
        result = self.select_query_params(query, record)
        return helper.pretty_print(result)

#=============================================================


# -----------------------------
# TRADE OPERATIONS
# -----------------------------

    def get_player_id(self, name):
        query = '''
        SELECT PlayerID
        FROM Player
        WHERE name = %s;
        '''
        record = (name,)
        result = self.select_query_params(query, record)
        return result[0][0]
     
        
    def get_team_id(self, name):
        query = '''
        SELECT TeamID
        FROM Team
        WHERE name = %s;
        '''
        record = (name,)
        result = self.select_query_params(query, record)
        return result[0][0]
    
    def trade_player(self, playername, newteamname):
        player_id = self.get_player_id(playername)
        team_id = self.get_team_id(newteamname)
        query = '''
        UPDATE Player
        SET TeamID = %s
        WHERE PlayerID = %s;
        '''
        record = (team_id, player_id)
        self.modify_query_params(query, record)
        print("Traded Player: " + playername)

    #Takes in list of players
    def trade_multiple_players(self, playernames, newteamname):
        team_id = self.get_team_id(newteamname)
        if team_id is None:
            print(f"Error: Team '{newteamname}' not found.")
            return
        query = '''
            UPDATE Player
            SET TeamID = %s
            WHERE PlayerID = %s;
        '''
        for playername in playernames:
            player_id = self.get_player_id(playername)
            if player_id is None:
                print(f"Error: Player '{playername}' not found. Skipping.")
                continue
            record = (team_id, player_id)
            self.modify_query_params(query, record)
            print("Traded Player: " + playername)

    
#=============================================================
#Julians Code
    def add_player(self, name, height, weight, age, position, team_id):
        query = '''
        INSERT INTO player (Name, Height, Weight, Age, Position, TeamID)
        VALUES (%s, %s, %s, %s, %s, %s'''
        self.cursor.execute(query, (name, height, weight, age, position, team_id))
        self.connection.commit()

    def delete_player(self, player_name): 
        query = '''
        DELETE FROM player
        WHERE Name = %s
        '''
        self.cursor.execute(query, (player_name,))
        self.connection.commit()

    def update_player(self, player_id, column, new_value):
        query = f'''
        UPDATE player
        SET {column} = %s
        WHERE PlayerID = %s'''
        self.cursor.execute(query, (new_value, player_id))
        self.connection.commit()
        

    def get_player(self, player_name):
        query = '''
        SELECT * FROM player
        WHERE Name = %s'''
        self.cursor.execute(query, (player_name,))
        return self.cursor.fetchall()

    def get_players_by_team(self, team_name):
        query = '''
        SELECT * FROM player
        INNER JOIN Team ON players.TeamID = Team.TeamID
        WHERE Team.Name = %s'''
        self.cursor.execute(query, (team_name,))
        return self.cursor.fetchall()

    def get_players_by_position(self, position):
        query = '''
        SELECT * FROM player
        WHERE Position = %s'''
        self.cursor.execute(query, (position,))
        return self.cursor.fetchall()


    # -----------------------------
    # TEAM CRUD
    # -----------------------------
    def add_team(self, name, city, division, conference):
        query = '''
        INSERT INTO Team (Name, City, Division, Conference)
        VALUES (%s, %s, %s, %s)'''
        self.cursor.execute(query, (name, city, division, conference))
        self.connection.commit()

    def delete_team(self, team_name):
        query = '''
        START TRANSACTION;
        DELETE FROM Team
        WHERE Name = %s
        COMMIT;
        '''
        self.cursor.execute(query, (team_name,))
        self.connection.commit()

    def update_team(self, team_id, column, new_value):
        query = f'''
        UPDATE Team
        SET {column} = %s
        WHERE TeamID = %s'''
        self.cursor.execute(query, (new_value, team_id))
        self.connection.commit()

    def get_team(self, team_name):
        query = '''
        SELECT * FROM Team
        WHERE Name = %s'''
        self.cursor.execute(query, (team_name,))
        return self.cursor.fetchall()

    def get_all_teams(self):
        query = '''
        SELECT * FROM Team'''
        self.cursor.execute(query)
        return self.cursor.fetchall()


    # -----------------------------
    # COACH CRUD
    # -----------------------------
    def add_coach(self, name, salary, team_id):
        query = '''
        INSERT INTO Coach (Name, Salary, TeamID)
        VALUES (%s, %s, %s)'''
        self.cursor.execute(query, (name, salary, team_id))
        self.connection.commit()

    def delete_coach(self, coach_name):
        query = '''
        DELETE FROM Coach
        WHERE Name = %s'''
        self.cursor.execute(query, (coach_name,))
        self.connection.commit()

    def update_coach(self, coach_id, column, new_value):
        query = f'''
        UPDATE Coach
        SET {column} = %s
        WHERE CoachID = %s'''
        self.cursor.execute(query, (new_value, coach_id))
        self.connection.commit()
        

    def get_coach(self, coach_name):
        query = '''
        SELECT * FROM Coach
        WHERE Name = %s'''
        self.cursor.execute(query, (coach_name,))
        return self.cursor.fetchall()

    def get_coach_by_team(self, team_name):
        query = '''
        SELECT *
        FROM Coach
        WHERE Coach.TeamID = (
            SELECT TeamID
            FROM Team
            WHERE Name = %s
        );
        '''
        self.cursor.execute(query, (team_name,))
        return self.cursor.fetchall()


    # -----------------------------
    # GAME CRUD
    # -----------------------------
    def add_game(self, date, location, home_team_id, away_team_id, home_score, away_score):
        query = '''
        INSERT INTO Game (Date, Location, HomeTeamID, AwayTeamID, HomeScore, AwayScore)
        VALUES (%s, %s, %s, %s, %s, %s)'''
        self.cursor.execute(query, (date, location, home_team_id, away_team_id, home_score, away_score))
        self.connection.commit()

    def delete_game(self, game_id):
        query = '''
        DELETE FROM Game
        WHERE GameID = %s'''
        self.cursor.execute(query, (game_id,))
        self.connection.commit()

    def update_game(self, game_id, column, new_value):
        query = '''
        UPDATE Game
        SET {column} = %s
        WHERE GameID = %s'''
        self.cursor.execute(query, (new_value, game_id))
        self.connection.commit()

    def get_game(self, game_id):
        query = '''
        SELECT * FROM Game
        WHERE GameID = %s'''
        self.cursor.execute(query, (game_id,))
        return self.cursor.fetchall()

    def get_games_by_team(self, team_name):
        query = '''
        SELECT * FROM Game
        INNER JOIN Team AS home_team ON Game.HomeTeamId = home_team.team_id
        INNER JOIN Team AS away_team ON Game.AwayTeamId = away_team.team_id
        WHERE home_team.Name = %s OR away_team.Name = %s'''
        self.cursor.execute(query, (team_name, team_name))
        return self.cursor.fetchall()
        

    def get_games_by_date(self, date):
        query = '''
        SELECT * FROM Game
        WHERE Date = %s'''
        self.cursor.execute(query, (date,))
        return self.cursor.fetchall()

    # -----------------------------
    # PLAYER STATISTICS (BOX SCORE)
    # -----------------------------
    def add_player_statistics(self, game_id, player_id, points, rebounds, assists, blocks, steals, turnovers, minutes_played, fouls):
        query = '''
        INSERT INTO PlayerStatistics (GameID, PlayerID, Points, Rebounds, Assists, Blocks, Steals, Turnovers, MinutesPlayed, Fouls)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)'''
        self.cursor.execute(query, (game_id, player_id, points, rebounds, assists, blocks, steals, turnovers, minutes_played, fouls))
        self.connection.commit()

    def update_player_statistics(self, game_id, player_id, column, new_value):
        query = f'''
        UPDATE PlayerStatistics
        SET {column} = %s
        WHERE GameID = %s AND PlayerID = %s'''
        self.cursor.execute(query, (new_value, game_id, player_id))
        self.connection.commit()
        

    def get_player_statistics(self, game_id, player_id):
        query = '''
        SELECT * FROM PlayerStatistics
        WHERE GameID = %s AND PlayerID = %s'''
        self.cursor.execute(query, (game_id, player_id))
        return self.cursor.fetchall()

    def get_statistics_by_player(self, player_id):
        query = '''
        SELECT * FROM PlayerStatistics
        WHERE PlayerID = %s'''
        self.cursor.execute(query, (player_id,))
        return self.cursor.fetchall()

    def get_statistics_by_game(self, game_id):
        query = '''
        SELECT * FROM PlayerStatistics
        WHERE GameID = %s'''
        self.cursor.execute(query, (game_id,))
        return self.cursor.fetchall()

    def get_average_statistics_by_player(self, player_name):
        query = '''
        
        SELECT AVG(Points) AS AvgPoints, AVG(Rebounds) AS AvgRebounds, AVG(Assists) AS AvgAssists,
            AVG(Blocks) AS AvgBlocks, AVG(Steals) AS AvgSteals, AVG(Turnovers) AS AvgTurnovers,
            AVG(MinutesPlayed) AS AvgMinutesPlayed, AVG(Fouls) AS AvgFouls
        FROM PlayerStatistics
        INNER JOIN Player ON PlayerStatistics.PlayerID = Player.PlayerID
        WHERE Player.Name = %s'''
        self.cursor.execute(query, (player_name,))
        return self.cursor.fetchall()




#=============================================================


    #-----------------------
    # ASSIGNMENT 4 CODE
    #------------------------

    # function to simply execute a DDL or DML query.
    # commits query, returns no results. 
    # best used for insert/update/delete queries with no parameters
    def modify_query(self, query):
        self.cursor.execute(query)
        self.connection.commit()

    # function to simply execute a DDL or DML query with parameters
    # commits query, returns no results. 
    # best used for insert/update/delete queries with named placeholders
    def modify_query_params(self, query, dictionary):
        self.cursor.execute(query, dictionary)
        self.connection.commit()

    # function to simply execute a DQL query
    # does not commit, returns results
    # best used for select queries with no parameters
    # slight edit for mysql
    def select_query(self, query):
        self.cursor.execute(query)
        result = self.cursor.fetchall()
        return result
    
    # function to simply execute a DQL query with parameters
    # does not commit, returns results
    # best used for select queries with named placeholders
    # slight edit for mysql
    def select_query_params(self, query, dictionary):
        self.cursor.execute(query, dictionary)
        result = self.cursor.fetchall()     
        return result
    
    # function to return the value of the first row's 
    # first attribute of some select query.
    # best used for querying a single aggregate select 
    # query with no parameters
    # slight edit for mysql
    def single_record(self, query):
        self.cursor.execute(query)
        return self.cursor.fetchone()[0]
    
    # function to return the value of the first row's 
    # first attribute of some select query.
    # best used for querying a single aggregate select 
    # query with named placeholders
    def single_record_params(self, query, dictionary):
        self.cursor.execute(query, dictionary)
        return self.cursor.fetchone()[0]
    
    # function to return a single attribute for all records 
    # from some table.
    # best used for select statements with no parameters
    def single_attribute(self, query):
        self.cursor.execute(query)
        results = self.cursor.fetchall()
        results = [i[0] for i in results]
        results.remove(None)
        return results
    
    # function to return a single attribute for all records 
    # from some table.
    # best used for select statements with named placeholders
    def single_attribute_params(self, query, dictionary):
        self.cursor.execute(query,dictionary)
        results = self.cursor.fetchall()
        results = [i[0] for i in results]
        return results
    
    # function for bulk inserting records
    # best used for inserting many records with parameters
    def bulk_insert(self, query, data):
        self.cursor.executemany(query, data)
        self.connection.commit()
    
    #-------------------------------
    #END OF ASSIGNMENT 4 CODE
    #-------------------------------

    def destructor(self):
        self.cursor.close()
        self.connection.close()