/*
SQLyog Ultimate v10.00 Beta1
MySQL - 5.5.54-cll : Database - contrib_rdb
*********************************************************************
*/


/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`liverep` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `liverep`;

/*Table structure for table `ChatMessages` */

DROP TABLE IF EXISTS `ChatMessages`;

CREATE TABLE `ChatMessages` (
  `msg_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `member_id` int(11) NOT NULL,
  `message` text,
  `read` tinyint(1) DEFAULT '0',
  `date_sent` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `room` varchar(200) DEFAULT '0',
  `mtimestamp` varchar(200) DEFAULT NULL,
  `domain` varchar(100) DEFAULT 'contrib.com',
  `user_session` varchar(200) DEFAULT NULL,
  `guest_email` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`msg_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Table structure for table `Members` */

DROP TABLE IF EXISTS `Members`;

CREATE TABLE `Members` (
  `MemberId` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `Username` varchar(128) NOT NULL,
  `EmailAddress` varchar(255) NOT NULL,
  `FirstName` varchar(63) NOT NULL,
  `LastName` varchar(63) NOT NULL,
  `LinkedinProfile` varchar(255) DEFAULT NULL,
  `SignupDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `LastLogin` datetime DEFAULT NULL,
  `IsAdmin` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`MemberId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
