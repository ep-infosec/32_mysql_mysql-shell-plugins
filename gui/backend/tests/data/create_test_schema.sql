-- Copyright (c) 2021, Oracle and/or its affiliates.

CREATE DATABASE IF NOT EXISTS `test_user_story`;
USE `test_user_story`;

CREATE TABLE `categories` (
  `categoryID` int NOT NULL AUTO_INCREMENT,
  `categoryName` varchar(100) NOT NULL,
  PRIMARY KEY (`categoryID`)
) ENGINE=InnoDB;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` TRIGGER `categories_AFTER_INSERT` AFTER INSERT ON `categories` FOR EACH ROW BEGIN
SET @test=1;
END$$
DELIMITER ;

CREATE TABLE `products` (
  `productID` int NOT NULL AUTO_INCREMENT,
  `productName` varchar(100) NOT NULL,
  `categoryID` int DEFAULT NULL,
  PRIMARY KEY (`productID`),
  KEY `fk_category` (`categoryID`),
  CONSTRAINT `fk_category` FOREIGN KEY (`categoryID`) REFERENCES `categories` (`categoryID`)
) ENGINE=InnoDB;


CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_products`
AS select `productName` from `products`;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `procedure_get_names`()
BEGIN
SELECT productName from products;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` FUNCTION `function_count`() RETURNS int
    NO SQL
BEGIN
RETURN 1;
END$$
DELIMITER ;
