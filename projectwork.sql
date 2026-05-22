-- MySQL dump 10.13  Distrib 9.5.0, for macos26.1 (arm64)
--
-- Host: localhost    Database: projectwork
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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'f1897972-edf4-11f0-ad0a-ef4075894fee:1-9398';

--
-- Table structure for table `chat`
--

DROP TABLE IF EXISTS `chat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat` (
  `idChat` int NOT NULL AUTO_INCREMENT,
  `nomeChat` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_group` tinyint(1) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`idChat`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `chat_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`idUtente`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat`
--

LOCK TABLES `chat` WRITE;
/*!40000 ALTER TABLE `chat` DISABLE KEYS */;
INSERT INTO `chat` VALUES (2,NULL,0,'2026-05-18 12:51:12',1),(3,'Gruppo Test',1,'2026-05-18 12:51:12',1),(5,'mario e giulia',1,'2026-05-19 08:06:51',1),(6,NULL,0,'2026-05-19 08:27:33',2);
/*!40000 ALTER TABLE `chat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contatti`
--

DROP TABLE IF EXISTS `contatti`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contatti` (
  `idContatto` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `contact_id` int DEFAULT NULL,
  `added_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idContatto`),
  KEY `user_id` (`user_id`),
  KEY `contact_id` (`contact_id`),
  CONSTRAINT `contatti_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`idUtente`),
  CONSTRAINT `contatti_ibfk_2` FOREIGN KEY (`contact_id`) REFERENCES `users` (`idUtente`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contatti`
--

LOCK TABLES `contatti` WRITE;
/*!40000 ALTER TABLE `contatti` DISABLE KEYS */;
INSERT INTO `contatti` VALUES (1,1,2,'2026-05-18 12:51:02'),(2,1,3,'2026-05-18 12:51:02'),(3,1,4,'2026-05-18 12:51:02'),(4,2,1,'2026-05-18 12:51:02'),(5,2,3,'2026-05-18 12:51:02'),(6,3,1,'2026-05-18 12:51:02'),(7,3,2,'2026-05-18 12:51:02'),(8,4,1,'2026-05-18 12:51:02');
/*!40000 ALTER TABLE `contatti` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `msg`
--

DROP TABLE IF EXISTS `msg`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `msg` (
  `idMsg` int NOT NULL AUTO_INCREMENT,
  `chat_id` int DEFAULT NULL,
  `sender_id` int DEFAULT NULL,
  `message_type` enum('text','image','video','file') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_general_ci,
  `sent_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `statusMsg` enum('inviato','consegnato','letto') COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`idMsg`),
  KEY `chat_id` (`chat_id`),
  KEY `sender_id` (`sender_id`),
  CONSTRAINT `msg_ibfk_1` FOREIGN KEY (`chat_id`) REFERENCES `chat` (`idChat`),
  CONSTRAINT `msg_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`idUtente`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `msg`
--

LOCK TABLES `msg` WRITE;
/*!40000 ALTER TABLE `msg` DISABLE KEYS */;
INSERT INTO `msg` VALUES (1,3,2,'text','wKUCOqFubRaD97Nn:SpPnzxtmLiC2kQk9YaGhRQ==:wusqOwzkXrRG','2026-05-18 13:15:17','letto'),(3,3,2,'text','4T4x2cQ1pfbE3dl2:u86wRjGPZLiCuFYC93WGJw==:3Aoc','2026-05-18 13:15:32','letto'),(12,6,1,'text','yNFGoM0Kqf1zxxoY:cXc2nBbWXbpm+8VekuRKIg==:01SYkw==','2026-05-19 18:38:30','letto'),(13,6,2,'text','EcN+TDu0vSzP/wfS:H29/wdG2sxCZL/xPDkc+3Q==:V1u7DHk=','2026-05-19 18:38:40','letto'),(14,6,1,'text','D/nI2lbuP0gTQjcc:XdCqz0huYEA3MZlf8uBgZQ==:Wpg=','2026-05-19 18:38:55','letto'),(15,6,1,'text','NlAYcqNwWuy/wSUX:Ntqjy12MFhwiu/yZtbw6wg==:M00=','2026-05-19 18:40:27','letto'),(16,6,1,'text','JUoymmmwbwvA98Cl:2UVnHL5SxRlp0b6EWcaqJg==:Iv/E','2026-05-19 18:40:32','letto'),(17,6,1,'text','SqAlgvaNs+EoGclA:V7HgU59hJgkF72xpmNhrSw==:vNc=','2026-05-19 18:45:04','letto'),(18,6,1,'text','Fw3CGTKMFiMj8Neh:+EMpiHVJRDZlgqaeL5z+LQ==:vGg=','2026-05-19 18:45:30','letto'),(19,6,2,'text','3kP2BdvQsS7kKDHZ:S6EuZ0RcqdQARThzQVC5mA==:vwE=','2026-05-19 18:49:06','letto'),(20,6,1,'text','MFnl8tgqzDz9qsQK:5jOSVmZ2WAmIafP+Yop2Dg==:MseBOJlg8F8=','2026-05-19 18:49:12','letto'),(21,6,1,'text','Pf0BwGDWecsVS8Ml:XOd/TEPY99QtPynTc3Y0ig==:iXrztg==','2026-05-19 18:49:37','letto'),(22,6,1,'text','pzjaYXQdiFHTwC7v:fO2r58H+uOKpbTKIviji4g==:KVL8Yw==','2026-05-19 18:49:48','letto'),(23,6,2,'text','jOXt4n6SQdArLCE5:rlfuoV5HgvBwDtgEHHBPjA==:j58XJA==','2026-05-19 18:49:52','letto'),(24,6,1,'text','lj144PZLgavw0YV3:0bBQ50wubUQYJRHbtXpIIw==:6Qk=','2026-05-19 18:50:27','letto'),(25,6,1,'text','o4Jz8/T1VNYeek64:qmPkfbi0kN08EXnFJJZpmA==:x2tlHPA=','2026-05-19 18:50:46','letto'),(26,6,1,'text','djESeZcRY5NdT+IA:JD4xQQgQkQC3uiIPet4g8A==:ut9VzA==','2026-05-19 18:52:01','letto'),(27,6,1,'text','rpwxKBbPeSl3/XDh:R8Q1LeqamWdlMYdO+yn/qQ==:2e+OvYGg/8IbMJ8=','2026-05-19 18:52:50','letto'),(28,6,1,'text','nkcWM79RL6nuapXI:CDaA61NbXk67vTt78uaXIQ==:pCFH','2026-05-19 18:53:04','letto'),(29,6,1,'text','mrCzRQUrn0qV+9YP:/Pt9Si3fObx9ef64vy90VQ==:szhR','2026-05-19 18:55:29','letto'),(30,6,1,'text','KnIiEF1FSSRng1Zo:vmTEtqhbUrBBYvHvT40MXA==:3il9','2026-05-19 18:56:45','letto'),(31,6,1,'text','EQGZzV/w3vAZc7kn:DO3wj6umJahTzlKwzrDVng==:HuncvQ==','2026-05-19 18:57:22','letto'),(32,6,1,'text','shd2m+yWcee69BOr:idue8tYBPHMk7YozdE2SJA==:wJA=','2026-05-19 18:57:44','letto'),(33,6,1,'text','woeZCTuAgGuTY8Nk:SBadVdUUXj9F5UJmZ/n8hQ==:OjE=','2026-05-19 18:57:45','letto'),(34,6,1,'text','4E/+CiFwTdLJkGhK:iqiCiFpdM3v7wrPRWcz49A==:eMg=','2026-05-19 18:57:46','letto'),(35,6,1,'text','5cTkYSEZ+l9AIER8:RtcXzgQtrbnkozU/z/qh2g==:TEU=','2026-05-19 18:57:47','letto'),(36,6,1,'text','kfaJDj+kb0DWoTk8:g+HTQtKBtm5rn8HpcYwNOA==:mqs=','2026-05-19 18:57:47','letto'),(37,6,1,'text','Fn2JYtcMfFz2nYTx:+KmsjjqvOTZl+qNfeWN1cA==:IvE=','2026-05-19 18:57:48','letto'),(38,6,2,'text','R16wyBzCs6VzT5xT:376WGBtOLoGHUQGppasaRQ==:JDI=','2026-05-19 18:58:21','letto'),(39,6,1,'text','FFb3IAInV7+W7iQo:/VynxbbquYVJ/MsMJtu7kA==:8Ck=','2026-05-19 19:00:21','letto'),(40,6,1,'text','N+ID2jJRjYPaVgI0:bPLAJwiNtaQWz54p+AVtbQ==:EWI=','2026-05-19 19:00:24','letto'),(41,6,1,'text','J7pDIIdHlk/hADIn:8ZU1ce6WtDm7FgJS0SkRdw==:Cog=','2026-05-19 19:00:30','letto'),(42,6,1,'text','bhfYP5v9UJN1ccdK:263MnbRqsyl3U+U0L38Oyw==:IPc=','2026-05-19 19:01:02','letto'),(43,6,1,'text','pzABRzcUJGiycmpC:UD5BpKA94+jayJOkhk/nqw==:dyE=','2026-05-19 19:01:04','letto'),(44,6,1,'text','FdFFrNBy/tLTWbBv:YHDohjh3CfNSqgq2HBDLLA==:7io=','2026-05-19 19:01:16','letto'),(45,6,1,'text','N+ue7ZhWw+8j4wy0:+X+nBDXcNtgLvPUb6kOrtg==:eqI=','2026-05-19 19:01:17','letto'),(46,6,1,'text','KWbMw5PBQ/cKCfJe:PdWTP6j3Hly6L8cQa/mlrQ==:1g17eAXniQ8=','2026-05-19 19:01:21','letto'),(47,6,2,'text','7mD/bwzKebRf9Dee:3Q3rJf6e7iH4R48meL/6Vg==:l5s2aRiNgBXP','2026-05-19 19:01:30','letto'),(48,6,1,'text','55uF1sALuxD60CKg:17wvWz9TS+9CqEQZn0CgsQ==:8XWnrGg=','2026-05-21 08:02:09','letto'),(49,6,2,'text','6zkOpHdSMVxwu1eR:4jksXxZ5uFv4xWRN1hUfuA==:pjK14Z4=','2026-05-21 08:02:17','letto'),(50,6,2,'text','GER7lgxkcyrwQ1nm:YABKm86DZv8vpwzY2Nl0vw==:bJj8oB8=','2026-05-21 08:02:19','letto'),(51,6,2,'text','z2yNt5ClR/9TaGCf:4E9yO/wPBtW6vQ8gscgCvw==:75l1oR06','2026-05-21 08:02:21','letto'),(52,6,2,'text','3RPo7xncaX+O7TyO:0dAXpBu0/mM0D/q+gwth7A==:WZH2ykbckGLkz0aQ+niuGpzLqS27ttuFsXAlTWzqNw==','2026-05-21 08:02:25','letto'),(53,6,2,'text','IS25kvjFqLn2Joi7:qUIuYmIFxETLWp7iLEdZPg==:EsXj','2026-05-21 08:25:00','letto'),(54,6,1,'text','dGmzEciFWN4JQY/H:KBTJuRWuUFfvJ3hRXF0HUg==:mtpzDu5j','2026-05-21 08:29:58','letto'),(55,6,1,'text','7sW2/If5mI/XaM4j:7HpHyLS9JzttRSoAr7Dd+Q==:M9TL','2026-05-21 08:30:55','letto'),(56,6,1,'text','C4YHdGSYsDg/LwgF:yQPrId8pdQFi90yDxJnsNA==:W+w6','2026-05-21 08:31:01','letto'),(57,6,1,'text','GyzAUSbiSUg6CEpR:o3ZOnJ0SRkFAj381uDwTKQ==:uicbrjc=','2026-05-21 08:33:11','letto'),(58,6,2,'text','nSkxb6xB7ZXgsQ/i:iIGBq3IZ073YnbcV+e2P7A==:Fxvn','2026-05-21 08:33:47','letto'),(59,6,2,'text','03BxM3VjuBT3GuGD:b/5ylf4DZ/ky8UH3eBsbuw==:fvuL','2026-05-21 08:36:04','letto'),(60,6,1,'text','HrjywDwgXbZ2ZJA3:eQLxufPgKIdjZ/dmjYf3Kg==:vumIY30=','2026-05-21 08:36:15','letto'),(61,6,1,'text','+2FKu1F8hUbpIj0U:olJJ/TxpMHCc2S1Y1bSm8Q==:+kfbJw==','2026-05-21 08:36:17','letto'),(62,6,1,'text','IU5enI4LiKfjL/1T:1lBo23kLQr5ubsvg3IuADw==:f8WOEMe/Iw==','2026-05-21 08:36:19','letto'),(63,6,2,'text','QoxZqtF9jL96glWV:DqtqGNb2uTthwFShwNfQ8Q==:xU/5','2026-05-21 08:36:24','letto'),(64,6,2,'text','oQLG4LqvfDo/s9N5:IzXdl+bvuFRpJgV4QcGxkw==:hqBN','2026-05-21 08:37:13','letto'),(65,6,2,'text','vHFzz2eoNO46Ryme:3sFl99gDUVvNPbTYlTN6Tw==:O6RgMA==','2026-05-21 08:37:23','letto'),(66,6,2,'text','qfxUWyUkx63u++GK:luUD6g4a2v6QszPeoBjGhg==:8RAw','2026-05-21 08:40:37','letto'),(67,6,2,'text','hdmYKLLBeISB6xsu:jNcdvLsGrB14GLAZnH2Vbw==:zL5n','2026-05-21 09:07:30','letto'),(68,6,2,'text','LK1WHLl0yyX4F38i:fnl/W6uR+Q5i89Y47yBttA==:Me8=','2026-05-21 09:07:37','letto'),(69,6,2,'text','vP3G1L63eBnAxu49:UwQiFgz1Um5+7++jNVN1aQ==:u8xV','2026-05-21 09:07:38','letto'),(70,6,2,'text','VBhQthT5p+Z9/Prz:WjYSN2+bfLp+z6Mssu63HA==:0wk=','2026-05-21 09:07:39','letto'),(71,6,2,'text','i2dX9u4s0hywy33I:J3QDckTZ4J7SIukQDz/J4A==:G2E=','2026-05-21 09:07:40','letto'),(72,6,2,'text','zsZ/mAKiv0gwFkaD:8dprh01o+mvCPFp2ZgzfDw==:4jc=','2026-05-21 09:07:40','letto'),(73,6,1,'text','uz0C7FcvG4VKz6TB:pycMKDsibN4dMV1k6DUGcw==:nH0=','2026-05-21 09:08:23','letto'),(74,6,1,'text','NcdysfjitYREv6yJ:BxigV2dTT/9GwlxNErz7dw==:3A==','2026-05-21 09:09:47','letto'),(75,6,1,'text','c5JOXNrimYRo6jan:AkOW0qfyeGt6xIY/9phHdw==:RA==','2026-05-21 09:09:48','letto'),(76,6,1,'text','45iiW/bZXPkNM8Fk:U7qJ5n2v+t/WLVk7Uk36dw==:uA==','2026-05-21 09:09:48','letto'),(77,6,1,'text','eGUL3P/yly3/Lif7:92V6cj01HVYk7jlXU/bgUQ==:9A==','2026-05-21 09:09:48','letto'),(78,6,1,'text','4G9M8+czJ5QZkHrv:ofwbaacybLy1qcAOB69NsA==:7g==','2026-05-21 09:09:49','letto'),(79,6,1,'text','g7dRZINuWkbcpf4Z:Ck6Kw5am9ExJHaGxhyoxKw==:3w==','2026-05-21 09:09:49','letto'),(80,6,1,'text','LKhniwviK1XOF+b/:D3P51AF5PODct5cesD+NVg==:1w==','2026-05-21 09:09:49','letto'),(81,6,1,'text','A3ed/GzgsjKl5uzl:zR7RrrOkcSLDoByE5CBBQg==:cw==','2026-05-21 09:09:50','letto'),(82,6,2,'text','sWrPtuvSFCaCOLU6:96c3iuFlt8vxhnvwCJ3wTQ==:5dPl7A==','2026-05-21 09:26:43','letto'),(83,6,2,'text','B2uepMTou1m2P7ka:KanQb8cqxB1WeHk4n2jXaw==:OxdDhg==','2026-05-21 09:26:52','letto'),(84,6,2,'text','3hsPiHz521VjoJUl:Z98VQoycJRQLjTarSVehmA==:jjs1/Q==','2026-05-21 09:26:53','letto'),(85,6,2,'text','MPKDGdG99Rbe9Ugj:iOccjg2AzPn7W7FLOFIbvQ==:uxWdmQ==','2026-05-21 09:26:54','letto'),(86,6,2,'text','US959Pzn5oKSAZ1j:6MnJSiykZEv8mMcrJIxvPA==:9XK4AA==','2026-05-21 09:26:55','letto'),(87,6,2,'text','2gTjITipirTT1H+j:gLDz8b5bcADXzsKJ5zzwIQ==:9Z/eNA==','2026-05-21 09:26:56','letto'),(88,6,1,'text','2btqHitRk2y4ASst:E/bN5l7SFrzm9OgAuS6uSg==:K8prmmLP','2026-05-21 09:39:29','letto'),(89,6,2,'text','G231ygWyBmDfC4Ti:H4AeWKLF1okGrRCk+dX3fA==:eupgycDuDoWGdHCg','2026-05-22 05:54:06','letto'),(90,6,1,'text','6fQDkFMAXdFe1N1G:F1VmaGBqtz1+C7ojm3Qr5Q==:TkSH0Fs=','2026-05-22 05:54:15','letto'),(91,6,2,'text','FPeqt3ZvefErrBTA:aytx0+WTA4+QmPWHYK42mA==:ZUk1hoSk','2026-05-22 05:55:40','letto'),(92,6,1,'text','FMQooaCOlTly5s+Q:lkAnDbosrXRgsKWHjhAYDA==:es+Y','2026-05-22 06:02:26','letto'),(93,6,1,'text','EqdT4thX62Xt/0yx:pIxf/R+0GkO7xJ3Gx2wZGg==:FGSG','2026-05-22 06:02:31','letto'),(94,6,2,'text','trSJBj5/xc+q0lKQ:POFLi+RuLEX+ntvBN8Xvrg==:0XQYXA==','2026-05-22 06:10:37','letto'),(95,6,2,'text','1IyHlX1IrDz+yNwg:9ba5dNDn06lfFmOyELgV7w==:SL/WnA==','2026-05-22 06:12:18','letto'),(96,6,2,'text','2c5xRbUMI0sR3naD:51oiQKjl+8bAQV5zBd8k8w==:nHtW1g==','2026-05-22 06:19:19','letto'),(97,6,2,'text','PfCYDtQV9VgP6z/Z:v4mYo8O5WW6XAAcKIYCMPQ==:spjgWw==','2026-05-22 06:26:33','letto'),(98,6,2,'text','alv32BF4lAfkOK0w:D/YmkVYpR2gpWCl2M7lE8g==:F1sShg==','2026-05-22 06:26:37','letto'),(99,6,2,'text','+OFjJ8umSeXPHn0X:eG9x2ilOZEY6ZuspVgN0Jg==:yI5dzw==','2026-05-22 06:26:55','letto'),(100,6,2,'text','Mm9E9cGlsByJDa+J:0RWUD2TZ6qg8d7seQKXiLg==:hkvehQ==','2026-05-22 06:27:02','letto'),(101,6,2,'text','8y/DWqU6r1/J86EE:oZkY+EoEJ3Q2Qg1WieayCg==:gUI/FA==','2026-05-22 06:27:03','letto'),(102,6,2,'text','PrfscZC4TFJ/GG+i:h73TaG8vYb8vhwGIhWpYoQ==:Xdr9/A==','2026-05-22 06:27:20','letto');
/*!40000 ALTER TABLE `msg` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `partecipanti_chat`
--

DROP TABLE IF EXISTS `partecipanti_chat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `partecipanti_chat` (
  `idPartecipante` int NOT NULL AUTO_INCREMENT,
  `chat_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `joined_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ruolo` enum('amministratore','membro') COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`idPartecipante`),
  KEY `chat_id` (`chat_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `partecipanti_chat_ibfk_1` FOREIGN KEY (`chat_id`) REFERENCES `chat` (`idChat`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `partecipanti_chat_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`idUtente`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partecipanti_chat`
--

LOCK TABLES `partecipanti_chat` WRITE;
/*!40000 ALTER TABLE `partecipanti_chat` DISABLE KEYS */;
INSERT INTO `partecipanti_chat` VALUES (3,2,1,'2026-05-18 12:51:22','membro'),(4,2,3,'2026-05-18 12:51:22','membro'),(5,3,1,'2026-05-18 12:51:22','amministratore'),(7,3,3,'2026-05-18 12:51:22','membro'),(8,3,4,'2026-05-18 12:51:22','membro'),(11,5,1,'2026-05-19 08:06:51','amministratore'),(13,5,3,'2026-05-19 08:06:51','membro'),(14,5,4,'2026-05-19 08:07:41','membro'),(15,6,2,'2026-05-19 08:27:33','membro'),(16,6,1,'2026-05-19 08:27:33','membro');
/*!40000 ALTER TABLE `partecipanti_chat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(64) COLLATE utf8mb4_general_ci NOT NULL,
  `user_id` int NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`idUtente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('6e1d4a3d23dc05f1d5335c44c2b3b8e4c35c1a154409ccc1bbf76893604b8e29',2,'2026-05-23 15:15:10','2026-05-18 15:15:09'),('a8a59e754fd4083939efccb5e1d271324c226cc5da7a54b8a8e49635eabdab96',1,'2026-05-23 14:51:33','2026-05-18 14:51:32');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `statoMsg`
--

DROP TABLE IF EXISTS `statoMsg`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `statoMsg` (
  `id` int NOT NULL AUTO_INCREMENT,
  `message_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `read_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `message_id` (`message_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `statomsg_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `msg` (`idMsg`),
  CONSTRAINT `statomsg_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`idUtente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `statoMsg`
--

LOCK TABLES `statoMsg` WRITE;
/*!40000 ALTER TABLE `statoMsg` DISABLE KEYS */;
/*!40000 ALTER TABLE `statoMsg` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `idUtente` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(30) COLLATE utf8mb4_general_ci NOT NULL,
  `cognome` varchar(30) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `username` varchar(30) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ultimo_accesso` timestamp NULL DEFAULT NULL,
  `password` text COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`idUtente`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Cristian','Predieri','cristian@test.it','cristian','Online','2026-05-18 12:50:56',NULL,'$2b$10$5ZS8483/c8ro5t/uKpE78eyzVEAxMZHp6n8MwJoPAQajsGvvHz7B2'),(2,'Mario','Rossi','mario@test.it','mario','Disponibile','2026-05-18 12:50:56',NULL,'$2b$10$5ZS8483/c8ro5t/uKpE78eyzVEAxMZHp6n8MwJoPAQajsGvvHz7B2'),(3,'Giulia','Bianchi','giulia@test.it','giulia','A scuola','2026-05-18 12:50:56',NULL,'$2b$10$5ZS8483/c8ro5t/uKpE78eyzVEAxMZHp6n8MwJoPAQajsGvvHz7B2'),(4,'Luca','Verdi','luca@test.it','luca','Occupato','2026-05-18 12:50:56',NULL,'$2b$10$5ZS8483/c8ro5t/uKpE78eyzVEAxMZHp6n8MwJoPAQajsGvvHz7B2');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-22  9:23:13
