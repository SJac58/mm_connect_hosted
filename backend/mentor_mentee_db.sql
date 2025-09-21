-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: mentor_mentee_db
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `meetings`
--

DROP TABLE IF EXISTS `meetings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meetings` (
  `meeting_id` int NOT NULL AUTO_INCREMENT,
  `mentor_id` int NOT NULL,
  `student_reg_num` varchar(20) NOT NULL,
  `meeting_date` date NOT NULL,
  `time_slot` time DEFAULT NULL,
  `reason` text,
  `feedback` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`meeting_id`),
  KEY `idx_meet_mentor` (`mentor_id`),
  KEY `idx_meet_student` (`student_reg_num`),
  CONSTRAINT `fk_meet_mentor` FOREIGN KEY (`mentor_id`) REFERENCES `mentors` (`mentor_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_meet_student` FOREIGN KEY (`student_reg_num`) REFERENCES `students` (`student_reg_num`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meetings`
--

LOCK TABLES `meetings` WRITE;
/*!40000 ALTER TABLE `meetings` DISABLE KEYS */;
INSERT INTO `meetings` VALUES (1,1,'S2025001','2025-09-21','14:00:00','Catch up on project',NULL,'2025-09-14 04:39:02','2025-09-14 04:39:02'),(2,1,'S2025002','2025-09-01','09:00:00','Discussing progress',NULL,'2025-09-14 11:03:55','2025-09-14 11:03:55'),(3,1,'S2025002','2025-09-02','19:00:00','Follow up for internship',NULL,'2025-09-14 12:40:22','2025-09-14 12:40:22'),(5,1,'S2025002','2025-09-14','20:30:00','Discussion of attendance shortage',NULL,'2025-09-14 13:52:11','2025-09-14 13:52:11'),(7,1,'S2025002','2025-09-15','20:11:00','Internship report',NULL,'2025-09-15 13:41:11','2025-09-15 13:41:11'),(8,1,'S2025002','2025-09-26','10:11:00','Follow up on doubts',NULL,'2025-09-15 13:41:56','2025-09-15 13:41:56'),(9,1,'S2025002','2025-09-16','14:52:00','Progress discussion',NULL,'2025-09-16 04:22:32','2025-09-16 04:22:32');
/*!40000 ALTER TABLE `meetings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mentor_mentee`
--

DROP TABLE IF EXISTS `mentor_mentee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mentor_mentee` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mentor_id` int NOT NULL,
  `student_reg_num` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_mentor_student` (`mentor_id`,`student_reg_num`),
  KEY `idx_mentor` (`mentor_id`),
  KEY `idx_student` (`student_reg_num`),
  CONSTRAINT `fk_mm_mentor` FOREIGN KEY (`mentor_id`) REFERENCES `mentors` (`mentor_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_mm_student` FOREIGN KEY (`student_reg_num`) REFERENCES `students` (`student_reg_num`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mentor_mentee`
--

LOCK TABLES `mentor_mentee` WRITE;
/*!40000 ALTER TABLE `mentor_mentee` DISABLE KEYS */;
INSERT INTO `mentor_mentee` VALUES (1,1,'S2025001'),(2,1,'S2025002'),(3,2,'S2025003');
/*!40000 ALTER TABLE `mentor_mentee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mentor_notes`
--

DROP TABLE IF EXISTS `mentor_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mentor_notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mentor_id` int NOT NULL,
  `student_reg_num` varchar(50) NOT NULL,
  `note` text NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `mentor_id` (`mentor_id`),
  KEY `student_reg_num` (`student_reg_num`),
  CONSTRAINT `mentor_notes_ibfk_1` FOREIGN KEY (`mentor_id`) REFERENCES `mentors` (`mentor_id`),
  CONSTRAINT `mentor_notes_ibfk_2` FOREIGN KEY (`student_reg_num`) REFERENCES `students` (`student_reg_num`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mentor_notes`
--

LOCK TABLES `mentor_notes` WRITE;
/*!40000 ALTER TABLE `mentor_notes` DISABLE KEYS */;
INSERT INTO `mentor_notes` VALUES (1,1,'S2025001','Student must focus on academics','2025-09-15 19:13:53','2025-09-15 19:13:53'),(2,1,'S2025002','Must attend classes regularly to maintain good attendance','2025-09-15 21:50:17','2025-09-15 21:50:17'),(3,1,'S2025001','Good student','2025-09-15 21:52:02','2025-09-15 21:52:02'),(4,1,'S2025001','good student','2025-09-15 21:59:22','2025-09-15 21:59:22'),(5,1,'S2025001','should do better','2025-09-16 09:30:21','2025-09-16 09:30:21'),(6,1,'S2025002','Focus on academics','2025-09-16 09:53:08','2025-09-16 09:53:08');
/*!40000 ALTER TABLE `mentor_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mentors`
--

DROP TABLE IF EXISTS `mentors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mentors` (
  `mentor_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `dept` varchar(50) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  PRIMARY KEY (`mentor_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mentors`
--

LOCK TABLES `mentors` WRITE;
/*!40000 ALTER TABLE `mentors` DISABLE KEYS */;
INSERT INTO `mentors` VALUES (1,'Priya Sharma','priya.sharma@christuniversity.in','12345','CSE','1985-05-12'),(2,'Alex John','alex.john@christuniversity.in','12345','ECE','1983-06-08');
/*!40000 ALTER TABLE `mentors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_performance`
--

DROP TABLE IF EXISTS `student_performance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_performance` (
  `performance_id` int NOT NULL AUTO_INCREMENT,
  `student_reg_num` varchar(20) NOT NULL,
  `semester` int NOT NULL,
  `CIA1` decimal(5,2) DEFAULT '0.00',
  `CIA2` decimal(5,2) DEFAULT '0.00',
  `CIA3` decimal(5,2) DEFAULT '0.00',
  `ESE` decimal(5,2) DEFAULT '0.00',
  `attendance` decimal(5,2) DEFAULT '0.00',
  `extra_curricular` json DEFAULT NULL,
  `progress_percent` decimal(3,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`performance_id`),
  KEY `idx_perf_student` (`student_reg_num`),
  CONSTRAINT `fk_perf_student` FOREIGN KEY (`student_reg_num`) REFERENCES `students` (`student_reg_num`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_performance`
--

LOCK TABLES `student_performance` WRITE;
/*!40000 ALTER TABLE `student_performance` DISABLE KEYS */;
INSERT INTO `student_performance` VALUES (1,'S2025001',1,18.50,19.00,18.00,70.00,88.50,'[\"Debate\", \"Coding Club\"]',0.00),(2,'S2025001',2,17.00,18.00,16.50,65.00,85.00,'[\"Sports\"]',0.00),(3,'S2025002',2,16.00,17.00,15.50,60.00,80.00,'[\"Music\", \"Volunteering\"]',0.00),(4,'S2025001',3,20.00,16.00,18.50,85.00,90.00,'[\"Basketball\"]',0.00),(5,'S2025002',1,15.00,20.00,13.50,60.50,87.50,'[\"Clubs\"]',0.00),(6,'S2025002',3,14.50,18.50,19.00,90.80,87.00,'[\"NIL\"]',0.00),(7,'S2025002',4,15.00,15.00,19.00,80.50,90.50,'[\"Dance\", \"Hackathon\"]',0.00),(8,'S2025002',5,16.00,17.00,20.00,85.50,95.00,'[\"Choir\", \"Magnovite\", \"Research Paper published\"]',0.00),(9,'S2025003',1,16.00,19.50,20.00,87.50,86.57,'[\"SWO\", \"Volunteering\"]',0.00);
/*!40000 ALTER TABLE `student_performance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `student_reg_num` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `class` varchar(50) DEFAULT NULL,
  `dept` varchar(50) DEFAULT NULL,
  `semester` int DEFAULT NULL,
  `year` int DEFAULT NULL,
  PRIMARY KEY (`student_reg_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES ('S2025001','Rahul Kumar','3BTCS-C','CSE',3,2),('S2025002','Aisha Khan','5BTEC-B','ECE',5,3),('S2025003','Vinay Balaji','1BTCHE-F','CSE AIML',1,1);
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-21 10:09:56
