-- MySQL dump 10.13  Distrib 9.5.0, for macos15.4 (arm64)
--
-- Host: localhost    Database: NBA
-- ------------------------------------------------------
-- Server version	9.5.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Coach`
--

DROP TABLE IF EXISTS `Coach`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Coach` (
  `CoachID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(80) DEFAULT NULL,
  `Salary` int DEFAULT NULL,
  `TeamID` int DEFAULT NULL,
  PRIMARY KEY (`CoachID`),
  KEY `fk_coach_team` (`TeamID`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Coach`
--

LOCK TABLES `Coach` WRITE;
/*!40000 ALTER TABLE `Coach` DISABLE KEYS */;
INSERT INTO `Coach` VALUES (1,'Quin Snyder',4000000,1),(2,'Joe Mazzulla',4200000,2),(3,'Jordi Fernandez',3500000,3),(4,'Charles Lee',3500000,4),(5,'Billy Donovan',4000000,5),(6,'Kenny Atkinson',3500000,6),(7,'Jason Kidd',8000000,7),(8,'Michael Malone',5000000,8),(9,'J.B. Bickerstaff',3500000,9),(10,'Steve Kerr',9500000,10),(11,'Ime Udoka',7000000,11),(12,'Rick Carlisle',7000000,12),(13,'Tyronn Lue',7000000,13),(14,'Darvin Ham',3000000,14),(15,'Taylor Jenkins',4500000,15),(16,'Erik Spoelstra',12000000,16),(17,'Doc Rivers',8000000,17),(18,'Chris Finch',4500000,18),(19,'Willie Green',3500000,19),(20,'Tom Thibodeau',5200000,20),(21,'Mark Daigneault',4000000,21),(22,'Jamahl Mosley',3500000,22),(23,'Nick Nurse',8000000,23),(24,'Frank Vogel',7000000,24),(25,'Chauncey Billups',3500000,25),(26,'Mike Brown',4500000,26),(27,'Gregg Popovich',16000000,27),(28,'Darko Rajakovic',3500000,28),(29,'Will Hardy',4500000,29),(30,'Brian Keefe',3400000,30);
/*!40000 ALTER TABLE `Coach` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Game`
--

DROP TABLE IF EXISTS `Game`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Game` (
  `GameID` int NOT NULL AUTO_INCREMENT,
  `Date` date DEFAULT NULL,
  `Location` varchar(80) DEFAULT NULL,
  `HomeTeamID` int DEFAULT NULL,
  `AwayTeamID` int DEFAULT NULL,
  `HomeScore` int DEFAULT NULL,
  `AwayScore` int DEFAULT NULL,
  PRIMARY KEY (`GameID`),
  KEY `HomeTeamID` (`HomeTeamID`),
  KEY `AwayTeamID` (`AwayTeamID`),
  CONSTRAINT `game_ibfk_1` FOREIGN KEY (`HomeTeamID`) REFERENCES `Team` (`TeamID`),
  CONSTRAINT `game_ibfk_2` FOREIGN KEY (`AwayTeamID`) REFERENCES `Team` (`TeamID`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Game`
--

LOCK TABLES `Game` WRITE;
/*!40000 ALTER TABLE `Game` DISABLE KEYS */;
INSERT INTO `Game` VALUES (6,'2025-03-01','TD Garden',2,10,118,112),(7,'2025-03-02','Crypto.com Arena',14,13,109,105),(8,'2025-03-03','Kaseya Center',16,17,102,98),(9,'2025-03-04','Target Center',18,8,120,115),(10,'2025-03-05','Paycom Center',21,23,124,116);
/*!40000 ALTER TABLE `Game` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Player`
--

DROP TABLE IF EXISTS `Player`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Player` (
  `PlayerID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(70) DEFAULT NULL,
  `Height` int DEFAULT NULL,
  `Weight` int DEFAULT NULL,
  `Age` int DEFAULT NULL,
  `Position` varchar(2) DEFAULT NULL,
  `TeamID` int DEFAULT NULL,
  PRIMARY KEY (`PlayerID`),
  KEY `TeamID` (`TeamID`),
  CONSTRAINT `player_ibfk_1` FOREIGN KEY (`TeamID`) REFERENCES `Team` (`TeamID`)
) ENGINE=InnoDB AUTO_INCREMENT=301 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Player`
--

LOCK TABLES `Player` WRITE;
/*!40000 ALTER TABLE `Player` DISABLE KEYS */;
INSERT INTO `Player` VALUES (151,'Trae Young',73,164,26,'PG',1),(152,'Dejounte Murray',77,180,27,'SG',1),(153,'De’Andre Hunter',80,225,26,'SF',1),(154,'Clint Capela',82,240,29,'C',1),(155,'Bogdan Bogdanovic',78,220,31,'SF',1),(156,'Jayson Tatum',80,210,26,'SF',2),(157,'Jaylen Brown',78,220,27,'SG',2),(158,'Kristaps Porzingis',87,240,28,'C',2),(159,'Jrue Holiday',75,205,33,'PG',2),(160,'Al Horford',82,240,37,'C',2),(161,'Mikal Bridges',78,210,27,'SF',3),(162,'Cam Thomas',75,210,23,'SG',3),(163,'Nic Claxton',83,220,24,'C',3),(164,'Ben Simmons',82,230,27,'PG',3),(165,'Dorian Finney-Smith',80,220,29,'PF',3),(166,'LaMelo Ball',79,180,22,'PG',4),(167,'Brandon Miller',81,200,21,'SF',4),(168,'Miles Bridges',79,230,25,'PF',4),(169,'Mark Williams',84,240,22,'C',4),(170,'Terry Rozier',75,185,29,'SG',4),(171,'DeMar DeRozan',78,220,34,'SF',5),(172,'Zach LaVine',77,200,28,'SG',5),(173,'Nikola Vucevic',83,260,32,'C',5),(174,'Alex Caruso',77,195,29,'PG',5),(175,'Patrick Williams',79,215,22,'PF',5),(176,'Donovan Mitchell',75,215,27,'SG',6),(177,'Darius Garland',73,185,24,'PG',6),(178,'Jarrett Allen',82,235,25,'C',6),(179,'Evan Mobley',83,215,23,'PF',6),(180,'Max Strus',77,215,27,'SF',6),(181,'Luka Doncic',79,230,25,'PG',7),(182,'Kyrie Irving',74,195,32,'PG',7),(183,'Dereck Lively II',85,220,20,'C',7),(184,'Tim Hardaway Jr.',78,205,31,'SG',7),(185,'Grant Williams',78,235,25,'PF',7),(186,'Nikola Jokic',83,285,29,'C',8),(187,'Jamal Murray',76,215,26,'PG',8),(188,'Aaron Gordon',80,235,28,'PF',8),(189,'Michael Porter Jr.',82,210,25,'SF',8),(190,'Kentavious Caldwell-Pope',77,205,30,'SG',8),(191,'Cade Cunningham',79,215,22,'PG',9),(192,'Jaden Ivey',76,200,21,'SG',9),(193,'Jalen Duren',82,250,20,'C',9),(194,'Ausar Thompson',79,215,21,'SF',9),(195,'Isaiah Stewart',80,250,22,'PF',9),(196,'Stephen Curry',75,185,36,'PG',10),(197,'Klay Thompson',78,215,34,'SG',10),(198,'Draymond Green',78,230,34,'PF',10),(199,'Andrew Wiggins',79,210,28,'SF',10),(200,'Kevon Looney',81,235,28,'C',10),(201,'Jalen Green',76,186,22,'SG',11),(202,'Alperen Sengun',83,243,21,'C',11),(203,'Fred VanVleet',72,197,29,'PG',11),(204,'Dillon Brooks',79,225,27,'SF',11),(205,'Jabari Smith Jr.',82,220,20,'PF',11),(206,'Tyrese Haliburton',77,190,24,'PG',12),(207,'Myles Turner',83,250,27,'C',12),(208,'Bennedict Mathurin',78,210,21,'SG',12),(209,'Buddy Hield',76,210,31,'SG',12),(210,'Obi Toppin',81,220,25,'PF',12),(211,'Kawhi Leonard',79,225,32,'SF',13),(212,'Paul George',80,220,33,'SG',13),(213,'James Harden',77,220,34,'PG',13),(214,'Ivica Zubac',84,240,27,'C',13),(215,'Norman Powell',76,215,30,'SG',13),(216,'LeBron James',81,250,39,'SF',14),(217,'Anthony Davis',82,253,30,'PF',14),(218,'Austin Reaves',77,197,25,'SG',14),(219,'D’Angelo Russell',76,193,27,'PG',14),(220,'Rui Hachimura',80,230,25,'PF',14),(221,'Ja Morant',74,175,24,'PG',15),(222,'Jaren Jackson Jr.',83,242,24,'PF',15),(223,'Desmond Bane',77,215,25,'SG',15),(224,'Marcus Smart',76,220,29,'PG',15),(225,'Steven Adams',83,265,30,'C',15),(226,'Jimmy Butler',79,231,34,'SF',16),(227,'Bam Adebayo',81,255,26,'C',16),(228,'Tyler Herro',76,195,24,'SG',16),(229,'Terry Rozier',73,190,29,'PG',16),(230,'Caleb Martin',77,205,27,'PF',16),(231,'Giannis Antetokounmpo',83,242,29,'PF',17),(232,'Damian Lillard',74,195,33,'PG',17),(233,'Khris Middleton',79,222,32,'SF',17),(234,'Brook Lopez',84,282,35,'C',17),(235,'Bobby Portis',82,250,28,'PF',17),(236,'Anthony Edwards',76,225,22,'SG',18),(237,'Karl-Anthony Towns',83,248,28,'C',18),(238,'Rudy Gobert',85,258,31,'C',18),(239,'Mike Conley',73,175,36,'PG',18),(240,'Jaden McDaniels',81,205,23,'SF',18),(241,'Brandon Ingram',81,190,25,'SF',19),(242,'Zion Williamson',78,284,23,'PF',19),(243,'CJ McCollum',75,190,32,'SG',19),(244,'Herbert Jones',79,206,25,'SF',19),(245,'Jonas Valanciunas',83,265,31,'C',19),(246,'Jalen Brunson',74,190,27,'PG',20),(247,'Julius Randle',80,250,29,'PF',20),(248,'RJ Barrett',78,214,23,'SG',20),(249,'Mitchell Robinson',84,240,25,'C',20),(250,'Josh Hart',77,215,28,'SF',20),(251,'Shai Gilgeous-Alexander',78,195,25,'PG',21),(252,'Chet Holmgren',85,208,21,'C',21),(253,'Jalen Williams',78,210,22,'SF',21),(254,'Josh Giddey',80,210,21,'SG',21),(255,'Lu Dort',75,220,24,'PF',21),(256,'Paolo Banchero',82,250,21,'PF',22),(257,'Franz Wagner',81,220,22,'SF',22),(258,'Markelle Fultz',76,210,25,'PG',22),(259,'Jalen Suggs',77,205,22,'SG',22),(260,'Wendell Carter Jr.',82,270,24,'C',22),(261,'Joel Embiid',84,280,29,'C',23),(262,'Tyrese Maxey',74,200,23,'PG',23),(263,'Tobias Harris',80,235,31,'SF',23),(264,'Kelly Oubre Jr.',79,220,28,'SG',23),(265,'Nicolas Batum',80,230,34,'PF',23),(266,'Kevin Durant',82,240,35,'SF',24),(267,'Devin Booker',77,206,27,'SG',24),(268,'Bradley Beal',75,207,30,'SG',24),(269,'Jusuf Nurkic',84,290,29,'C',24),(270,'Eric Gordon',76,222,35,'PG',24),(271,'Anfernee Simons',76,180,24,'SG',25),(272,'Scoot Henderson',76,202,19,'PG',25),(273,'Deandre Ayton',83,250,25,'C',25),(274,'Jerami Grant',80,210,29,'SF',25),(275,'Shaedon Sharpe',78,200,21,'SG',25),(276,'De’Aaron Fox',75,185,26,'PG',26),(277,'Domantas Sabonis',83,240,27,'C',26),(278,'Keegan Murray',80,215,22,'PF',26),(279,'Kevin Huerter',79,200,25,'SG',26),(280,'Malik Monk',75,205,25,'SG',26),(281,'Victor Wembanyama',87,225,20,'C',27),(282,'Devin Vassell',79,200,23,'SG',27),(283,'Tre Jones',73,185,24,'PG',27),(284,'Zach Collins',83,250,26,'C',27),(285,'Keldon Johnson',77,210,24,'SF',27),(286,'Scottie Barnes',81,230,22,'SF',28),(287,'RJ Barrett',78,214,23,'SG',28),(288,'Immanuel Quickley',75,190,24,'PG',28),(289,'Jakob Poeltl',84,245,28,'C',28),(290,'Chris Boucher',81,200,30,'PF',28),(291,'Lauri Markkanen',84,240,26,'PF',29),(292,'Jordan Clarkson',77,194,31,'SG',29),(293,'Collin Sexton',73,190,25,'PG',29),(294,'Walker Kessler',84,245,21,'C',29),(295,'Kelly Olynyk',84,240,32,'PF',29),(296,'Kyle Kuzma',81,221,28,'SF',30),(297,'Jordan Poole',76,195,24,'SG',30),(298,'Tyus Jones',73,196,27,'PG',30),(299,'Marvin Bagley III',83,235,24,'PF',30),(300,'Daniel Gafford',82,230,25,'C',30);
/*!40000 ALTER TABLE `Player` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PlayerGameStatistics`
--

DROP TABLE IF EXISTS `PlayerGameStatistics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PlayerGameStatistics` (
  `GameID` int NOT NULL,
  `PlayerID` int NOT NULL,
  `Points` int DEFAULT NULL,
  `Rebounds` int DEFAULT NULL,
  `Assists` int DEFAULT NULL,
  `Blocks` int DEFAULT NULL,
  `Steals` int DEFAULT NULL,
  `Turnovers` int DEFAULT NULL,
  `MinutesPlayed` int DEFAULT NULL,
  `Fouls` int DEFAULT NULL,
  PRIMARY KEY (`GameID`,`PlayerID`),
  KEY `PlayerID` (`PlayerID`),
  CONSTRAINT `playergamestatistics_ibfk_1` FOREIGN KEY (`GameID`) REFERENCES `Game` (`GameID`),
  CONSTRAINT `playergamestatistics_ibfk_2` FOREIGN KEY (`PlayerID`) REFERENCES `Player` (`PlayerID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PlayerGameStatistics`
--

LOCK TABLES `PlayerGameStatistics` WRITE;
/*!40000 ALTER TABLE `PlayerGameStatistics` DISABLE KEYS */;
INSERT INTO `PlayerGameStatistics` VALUES (6,156,32,7,5,1,2,3,36,2),(6,157,24,6,4,0,1,2,35,3),(6,158,18,10,3,2,0,1,33,4),(6,196,34,4,6,0,2,3,38,2),(6,197,19,3,2,1,0,1,34,3),(6,198,12,8,7,1,2,2,30,3),(7,211,21,6,4,2,2,3,35,3),(7,212,19,5,5,1,1,2,33,2),(7,213,14,3,9,0,1,3,34,2),(7,216,27,8,7,1,1,3,36,2),(7,217,22,11,3,3,0,2,34,3),(7,218,15,3,4,0,1,1,32,2),(8,226,25,7,6,1,1,2,36,3),(8,227,17,10,3,2,1,2,33,3),(8,228,16,3,3,0,1,1,30,2),(8,231,30,11,5,2,2,4,37,4),(8,232,22,3,8,0,1,2,34,2),(8,233,14,6,4,2,1,3,31,3),(9,186,29,12,10,2,1,3,38,3),(9,187,24,3,7,0,1,2,36,2),(9,188,15,7,4,1,1,2,34,2),(9,236,31,6,5,1,2,4,38,2),(9,237,22,9,4,1,1,2,35,3),(9,238,16,13,3,2,0,3,34,3),(10,251,33,5,8,1,2,2,38,3),(10,252,18,9,3,2,1,3,34,3),(10,253,16,3,4,0,1,1,30,2),(10,261,34,12,5,2,1,4,37,3),(10,262,24,3,7,0,2,3,35,2),(10,263,15,4,3,0,1,1,31,3);
/*!40000 ALTER TABLE `PlayerGameStatistics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Team`
--

DROP TABLE IF EXISTS `Team`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Team` (
  `TeamID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(70) DEFAULT NULL,
  `City` varchar(70) DEFAULT NULL,
  `Division` varchar(30) DEFAULT NULL,
  `Conference` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`TeamID`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Team`
--

LOCK TABLES `Team` WRITE;
/*!40000 ALTER TABLE `Team` DISABLE KEYS */;
INSERT INTO `Team` VALUES (1,'Hawks','Atlanta','Southeast','East'),(2,'Celtics','Boston','Atlantic','East'),(3,'Nets','Brooklyn','Atlantic','East'),(4,'Hornets','Charlotte','Southeast','East'),(5,'Bulls','Chicago','Central','East'),(6,'Cavaliers','Cleveland','Central','East'),(7,'Mavericks','Dallas','Southwest','West'),(8,'Nuggets','Denver','Northwest','West'),(9,'Pistons','Detroit','Central','East'),(10,'Warriors','San Francisco','Pacific','West'),(11,'Rockets','Houston','Southwest','West'),(12,'Pacers','Indianapolis','Central','East'),(13,'Clippers','Los Angeles','Pacific','West'),(14,'Lakers','Los Angeles','Pacific','West'),(15,'Grizzlies','Memphis','Southwest','West'),(16,'Heat','Miami','Southeast','East'),(17,'Bucks','Milwaukee','Central','East'),(18,'Timberwolves','Minnesota','Northwest','West'),(19,'Pelicans','New Orleans','Southwest','West'),(20,'Knicks','New York','Atlantic','East'),(21,'Thunder','Oklahoma City','Northwest','West'),(22,'Magic','Orlando','Southeast','East'),(23,'76ers','Philadelphia','Atlantic','East'),(24,'Suns','Phoenix','Pacific','West'),(25,'Trail Blazers','Portland','Northwest','West'),(26,'Kings','Sacramento','Pacific','West'),(27,'Spurs','San Antonio','Southwest','West'),(28,'Raptors','Toronto','Atlantic','East'),(29,'Jazz','Salt Lake City','Northwest','West'),(30,'Wizards','Washington','Southeast','East');
/*!40000 ALTER TABLE `Team` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-12 20:07:52
