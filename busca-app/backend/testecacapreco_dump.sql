-- MySQL dump 10.13  Distrib 9.2.0, for Win64 (x86_64)
--
-- Host: localhost    Database: testecacapreco
-- ------------------------------------------------------
-- Server version	9.2.0

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
-- Table structure for table `administrador`
--

DROP TABLE IF EXISTS `administrador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administrador` (
  `ID_Admin` int NOT NULL AUTO_INCREMENT,
  `ID_Usuario` int NOT NULL,
  `Nome` varchar(255) NOT NULL,
  `Cargo` varchar(100) DEFAULT NULL,
  `Permissoes` text,
  PRIMARY KEY (`ID_Admin`),
  UNIQUE KEY `ID_Usuario` (`ID_Usuario`),
  CONSTRAINT `administrador_ibfk_1` FOREIGN KEY (`ID_Usuario`) REFERENCES `usuario` (`ID_Usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `administrador`
--

LOCK TABLES `administrador` WRITE;
/*!40000 ALTER TABLE `administrador` DISABLE KEYS */;
INSERT INTO `administrador` VALUES (1,7,'Administrador Master','CEO','{\"gerenciar_usuarios\":true, \"gerenciar_produtos\":true, \"gerenciar_lojas\":true}'),(2,12,'Admin Log├¡stica','Log├¡stica','{\"visualizar_pedidos\":true}'),(3,13,'Admin Marketing','Marketing','{\"gerenciar_campanhas\":true}'),(4,14,'Admin Suporte','Suporte','{\"responder_chamados\":true}'),(5,15,'Admin RH','Recursos Humanos','{\"gerenciar_funcionarios\":true}');
/*!40000 ALTER TABLE `administrador` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `avaliacao_loja`
--

DROP TABLE IF EXISTS `avaliacao_loja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avaliacao_loja` (
  `ID_Avaliacao` int NOT NULL AUTO_INCREMENT,
  `ID_Cliente` int NOT NULL,
  `ID_Vendedor` int NOT NULL,
  `Nota` int NOT NULL,
  `Comentario` text,
  `DataAvaliacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_Avaliacao`),
  UNIQUE KEY `UK_AvaliacaoUnica` (`ID_Cliente`,`ID_Vendedor`),
  KEY `idx_cliente_id` (`ID_Cliente`),
  KEY `idx_vendedor_id` (`ID_Vendedor`),
  CONSTRAINT `avaliacao_loja_ibfk_1` FOREIGN KEY (`ID_Cliente`) REFERENCES `cliente` (`ID_Cliente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `avaliacao_loja_ibfk_2` FOREIGN KEY (`ID_Vendedor`) REFERENCES `vendedor` (`ID_Vendedor`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `avaliacao_loja_chk_1` CHECK ((`Nota` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avaliacao_loja`
--

LOCK TABLES `avaliacao_loja` WRITE;
/*!40000 ALTER TABLE `avaliacao_loja` DISABLE KEYS */;
INSERT INTO `avaliacao_loja` VALUES (1,1,1,5,'Excelente loja, entrega r├ípida!','2025-07-04 13:28:17'),(2,2,2,4,'Roupas de boa qualidade, mas demorou um pouco.','2025-07-04 13:28:17'),(3,1,2,3,'Pre├ºo bom, mas o atendimento poderia melhorar.','2025-07-04 13:28:17'),(4,5,1,4,'Sempre encontro o que preciso na TechMania.','2025-07-04 13:28:17'),(5,5,3,5,'Produtos frescos e saborosos na padaria.','2025-07-04 13:28:17');
/*!40000 ALTER TABLE `avaliacao_loja` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categoria_loja`
--

DROP TABLE IF EXISTS `categoria_loja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria_loja` (
  `ID_CategoriaLoja` int NOT NULL AUTO_INCREMENT,
  `NomeCategoria` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Descricao` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`ID_CategoriaLoja`),
  UNIQUE KEY `NomeCategoria` (`NomeCategoria`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria_loja`
--

LOCK TABLES `categoria_loja` WRITE;
/*!40000 ALTER TABLE `categoria_loja` DISABLE KEYS */;
INSERT INTO `categoria_loja` VALUES (1,'Tecnologia e Eletrônicos','Dispositivos eletrônicos, gadgets, informática e acessórios de última geração.'),(2,'Moda e Vestuário','Roupas, calçados, joias, acessórios e tudo para se vestir bem.'),(3,'Alimentos e Bebidas','Produtos alimentícios, bebidas, mercearia, orgânicos e delivery de refeições.'),(4,'Casa e Decoração','Móveis, itens decorativos, utensílios domésticos, jardinagem e materiais de construção.'),(5,'Automotivo','Peças, acessórios, serviços e tudo para veículos automotores.'),(6,'Saúde e Beleza','Cosméticos, produtos de higiene pessoal, suplementos, artigos para bem-estar e farmácia.'),(7,'Esportes e Lazer','Artigos esportivos, equipamentos para atividades ao ar livre, camping, fitness e hobbies.'),(8,'Livros, Filmes e Música','Livros físicos e digitais, filmes, séries, CDs, vinis e instrumentos musicais.'),(9,'Brinquedos e Jogos','Brinquedos educativos, jogos de tabuleiro, videogames e artigos para festas.'),(10,'Pet Shop','Alimentos, acessórios, brinquedos e serviços para animais de estimação.'),(11,'Jardim e Ferramentas','Ferramentas manuais e elétricas, materiais para jardinagem e construção.'),(12,'Bebês e Crianças','Roupas, brinquedos, móveis e produtos essenciais para bebês e crianças.'),(13,'Papelaria e Escritório','Materiais escolares, de escritório, artigos para desenho e arte.'),(14,'Serviços','Prestadores de serviços como reformas, limpeza, consultoria, reparos e aulas.'),(15,'Artesanato','Produtos feitos à mão, materiais para artesanato e cursos.'),(16,'Viagens e Turismo','Pacotes de viagem, passagens aéreas, hospedagem e experiências turísticas.'),(17,'Flores e Presentes','Arranjos de flores, cestas de presente, chocolates e lembrancinhas.'),(18,'Joias e Relógios','Joias finas, bijuterias, relógios e artigos de luxo.'),(19,'Instrumentos Musicais','Violões, guitarras, teclados, baterias e acessórios para músicos.'),(20,'Artigos para Festas','Decorações, fantasias, balões e tudo para sua celebração.'),(21,'Supermercado','Venda de alimentos, produtos de limpeza, higiene pessoal e itens essenciais para o lar.'),(22,'Farmácia','Venda de medicamentos, produtos de saúde, beleza e bem-estar, com ou sem prescrição.'),(23,'Fast-Food','Restaurantes que oferecem refeições rápidas e convenientes, ideais para consumo no local ou delivery.'),(24,'Doceria','Lojas especializadas na venda de doces, bolos, sobremesas, chocolates e confeitos artesanais ou industrializados.'),(25,'Tabacaria','Venda de cigarros, charutos, cachimbos, fumo, isqueiros e acessórios para fumantes.'),(26,'Produtos e Artigos Religiosos','Artigos de fé, imagens sacras, velas, incensos, livros e objetos para diversas religiões.'),(27,'Roupas Íntimas','Lingerie, pijamas, meias, e moda íntima feminina, masculina e infantil.'),(28,'Sex Shop','Produtos eróticos, brinquedos sexuais, fantasias e cosméticos sensuais.'),(29,'Manicure e Pedicure','Serviços de cuidados para unhas das mãos e pés, esmaltação e alongamentos.'),(30,'Padaria','Produção e venda de pães, bolos, doces, salgados e outros produtos de panificação e confeitaria, muitas vezes com serviço de café.');
/*!40000 ALTER TABLE `categoria_loja` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente` (
  `ID_Cliente` int NOT NULL AUTO_INCREMENT,
  `ID_Usuario` int NOT NULL,
  `Nome` varchar(255) NOT NULL,
  `Telefone` varchar(20) DEFAULT NULL,
  `Endereco` varchar(255) DEFAULT NULL,
  `CPF` varchar(14) NOT NULL,
  `DataNascimento` date DEFAULT NULL,
  `ID_Endereco` int DEFAULT NULL,
  PRIMARY KEY (`ID_Cliente`),
  UNIQUE KEY `ID_Usuario` (`ID_Usuario`),
  UNIQUE KEY `CPF` (`CPF`),
  KEY `idx_cliente_usuario` (`ID_Usuario`),
  KEY `fk_cliente_endereco` (`ID_Endereco`),
  CONSTRAINT `cliente_ibfk_1` FOREIGN KEY (`ID_Usuario`) REFERENCES `usuario` (`ID_Usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cliente_endereco` FOREIGN KEY (`ID_Endereco`) REFERENCES `endereco` (`ID_Endereco`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente`
--

LOCK TABLES `cliente` WRITE;
/*!40000 ALTER TABLE `cliente` DISABLE KEYS */;
INSERT INTO `cliente` VALUES (1,1,'Alice Silva','11987654321','Rua A, 123','111.111.111-11','1990-05-15',NULL),(2,2,'Bruno Costa','21998765432','Av B, 45','222.222.222-22','1988-11-20',NULL),(3,3,'Carla Dias','31976543210','Trav C, 78','333.333.333-33','1995-03-10',NULL),(4,4,'Lucas Lima','11999999999','Rua D, 10','444.444.444-44','1992-07-25',NULL),(5,5,'Mariana Alves','21988888888','Av E, 22','555.555.555-55','1991-09-01',NULL),(6,16,'Cid','21971583118','Rua Mario Garbelini, 200','12817374703','1988-02-08',NULL),(8,24,'cidao teste','21977777777','rua abc, 123','12345678999','2018-01-01',NULL),(9,31,'cola','21987654321','rua abc, 123, centro, macae - rj','98765432112','2020-09-29',NULL);
/*!40000 ALTER TABLE `cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `endereco`
--

DROP TABLE IF EXISTS `endereco`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `endereco` (
  `ID_Endereco` int NOT NULL AUTO_INCREMENT,
  `Logradouro` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Numero` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Complemento` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Bairro` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Cidade` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Estado` varchar(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `CEP` varchar(9) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Pais` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Brasil',
  `Latitude` decimal(10,8) DEFAULT NULL,
  `Longitude` decimal(11,8) DEFAULT NULL,
  `DataCadastro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_Endereco`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `endereco`
--

LOCK TABLES `endereco` WRITE;
/*!40000 ALTER TABLE `endereco` DISABLE KEYS */;
INSERT INTO `endereco` VALUES (1,'Avenida Náutica','816','zero','Fronteira','Macaé','RJ','27961-258','Brasil',NULL,NULL,'2025-07-15 22:11:46'),(2,'Avenida Náutica','816','zero','Fronteira','Macaé','RJ','27961-258','Brasil',NULL,NULL,'2025-07-15 22:12:38');
/*!40000 ALTER TABLE `endereco` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `imagem_variacao`
--

DROP TABLE IF EXISTS `imagem_variacao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `imagem_variacao` (
  `ID_Imagem` int NOT NULL AUTO_INCREMENT,
  `ID_Variacao` int NOT NULL,
  `URL_Imagem` varchar(255) NOT NULL,
  `Ordem` int DEFAULT '0',
  PRIMARY KEY (`ID_Imagem`),
  KEY `ID_Variacao` (`ID_Variacao`),
  CONSTRAINT `imagem_variacao_ibfk_1` FOREIGN KEY (`ID_Variacao`) REFERENCES `variacao_produto` (`ID_Variacao`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `imagem_variacao`
--

LOCK TABLES `imagem_variacao` WRITE;
/*!40000 ALTER TABLE `imagem_variacao` DISABLE KEYS */;
INSERT INTO `imagem_variacao` VALUES (1,1,'http://example.com/img/smartphone_preto1.jpg',1),(2,1,'http://example.com/img/smartphone_preto2.jpg',2),(3,2,'http://example.com/img/smartphone_128gb.jpg',1),(4,3,'http://example.com/img/camiseta_branca.jpg',1),(5,4,'http://example.com/img/camiseta_azul.jpg',1),(6,13,'uploads/1754529358917-SAP.png',0),(7,14,'uploads/1754530586457-logo.png',0),(8,15,'uploads/1754534738214-ludeeu.jpg',0);
/*!40000 ALTER TABLE `imagem_variacao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `indicacao_vendedor`
--

DROP TABLE IF EXISTS `indicacao_vendedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `indicacao_vendedor` (
  `ID_Indicacao` int NOT NULL AUTO_INCREMENT,
  `ID_Cliente` int DEFAULT NULL,
  `ID_Vendedor` int DEFAULT NULL,
  `NomeIndicado` varchar(255) NOT NULL,
  `EmailIndicado` varchar(255) NOT NULL,
  `TelefoneIndicado` varchar(20) DEFAULT NULL,
  `Mensagem` text,
  `DataIndicacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `StatusIndicacao` enum('Pendente','Contatado','Convertido','Recusado') DEFAULT 'Pendente',
  PRIMARY KEY (`ID_Indicacao`),
  KEY `idx_indicacao_cliente` (`ID_Cliente`),
  KEY `idx_indicacao_vendedor` (`ID_Vendedor`),
  CONSTRAINT `indicacao_vendedor_ibfk_1` FOREIGN KEY (`ID_Cliente`) REFERENCES `cliente` (`ID_Cliente`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `indicacao_vendedor_ibfk_2` FOREIGN KEY (`ID_Vendedor`) REFERENCES `vendedor` (`ID_Vendedor`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `indicacao_vendedor`
--

LOCK TABLES `indicacao_vendedor` WRITE;
/*!40000 ALTER TABLE `indicacao_vendedor` DISABLE KEYS */;
INSERT INTO `indicacao_vendedor` VALUES (1,1,NULL,'Fernando','fernando@email.com','551199998888','Gostaria de indicar um amigo para vender.','2025-07-04 13:28:17','Pendente'),(2,NULL,2,'Gabriela','gabriela@email.com','5521977776666','Soube da plataforma e quero me cadastrar.','2025-07-04 13:28:17','Pendente'),(3,2,NULL,'Heitor','heitor@email.com','5531955554444','Meu primo tamb├®m quer vender eletr├┤nicos.','2025-07-04 13:28:17','Contatado'),(4,NULL,3,'Isabela','isabela@email.com','5541933332222','Indica├º├úo via site para loja de moda.','2025-07-04 13:28:17','Convertido'),(5,5,NULL,'Juliana','juliana@email.com','5551911110000','Colega de trabalho quer abrir um e-commerce.','2025-07-04 13:28:17','Pendente');
/*!40000 ALTER TABLE `indicacao_vendedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oferta_produto`
--

DROP TABLE IF EXISTS `oferta_produto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oferta_produto` (
  `ID_Oferta` int NOT NULL AUTO_INCREMENT,
  `ID_Vendedor` int NOT NULL,
  `ID_Variacao` int NOT NULL,
  `Preco` decimal(10,2) NOT NULL,
  `QuantidadeDisponivel` int DEFAULT '0',
  `DataCadastro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UltimaAtualizacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `Ativo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`ID_Oferta`),
  UNIQUE KEY `UK_OfertaProduto` (`ID_Vendedor`,`ID_Variacao`),
  KEY `idx_variacao_id` (`ID_Variacao`),
  CONSTRAINT `oferta_produto_ibfk_1` FOREIGN KEY (`ID_Vendedor`) REFERENCES `vendedor` (`ID_Vendedor`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `oferta_produto_ibfk_2` FOREIGN KEY (`ID_Variacao`) REFERENCES `variacao_produto` (`ID_Variacao`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `oferta_produto_chk_1` CHECK ((`Preco` > 0)),
  CONSTRAINT `oferta_produto_chk_2` CHECK ((`QuantidadeDisponivel` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oferta_produto`
--

LOCK TABLES `oferta_produto` WRITE;
/*!40000 ALTER TABLE `oferta_produto` DISABLE KEYS */;
INSERT INTO `oferta_produto` VALUES (1,1,1,2500.00,50,'2025-07-04 13:28:17','2025-07-04 13:28:17',1),(2,1,2,2800.00,30,'2025-07-04 13:28:17','2025-07-04 13:28:17',1),(3,2,3,59.90,100,'2025-07-04 13:28:17','2025-07-04 13:28:17',1),(4,3,4,65.00,80,'2025-07-04 13:28:17','2025-07-04 13:28:17',1),(5,4,5,15.50,200,'2025-07-04 13:28:17','2025-07-04 13:28:17',1),(7,19,7,10.81,50,'2025-07-11 03:32:50','2025-07-11 03:32:50',1),(8,19,8,10.00,5,'2025-07-11 19:01:36','2025-07-11 19:01:36',1),(11,21,11,51.00,3,'2025-08-06 19:48:27','2025-08-08 01:28:26',1),(13,21,13,1741.00,50,'2025-08-07 01:15:59','2025-08-07 01:24:04',1),(14,21,14,10.00,1,'2025-08-07 01:36:26','2025-08-07 01:36:26',1),(15,21,15,1000000.00,1,'2025-08-07 02:45:38','2025-08-07 02:45:38',1);
/*!40000 ALTER TABLE `oferta_produto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produto`
--

DROP TABLE IF EXISTS `produto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produto` (
  `ID_Produto` int NOT NULL AUTO_INCREMENT,
  `NomeProduto` varchar(255) NOT NULL,
  `Descricao` text,
  `ID_Subcategoria` int NOT NULL,
  `DataCadastro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_Produto`),
  KEY `idx_subcategoria_id` (`ID_Subcategoria`),
  CONSTRAINT `produto_ibfk_1` FOREIGN KEY (`ID_Subcategoria`) REFERENCES `subcategoria_produto` (`ID_Subcategoria`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produto`
--

LOCK TABLES `produto` WRITE;
/*!40000 ALTER TABLE `produto` DISABLE KEYS */;
INSERT INTO `produto` VALUES (1,'Smartphone X','Celular de última geração com câmera avançada.',1,'2025-07-04 13:28:17'),(2,'Camiseta Algodão','Camiseta básica 100% algodão diversas cores.',2,'2025-07-04 13:28:17'),(3,'Pão Integral Artesanal','Pão caseiro de fermentação natural.',3,'2025-07-04 13:28:17'),(4,'Sofá 3 Lugares','Sofá confortável para sua sala.',4,'2025-07-04 13:28:17'),(5,'Óleo Sintético 5W-30','Óleo lubrificante de alta performance para motores.',5,'2025-07-04 13:28:17'),(7,'leite','leite ninho morango',106,'2025-07-11 03:32:50'),(8,'flores','rosas',138,'2025-07-11 19:01:36'),(9,'produto um','teste produto um',169,'2025-07-15 22:47:11'),(10,'imagem logo','teste imagem produto',13,'2025-07-15 22:49:09'),(11,'Igreja','Imagem de igreja em Paraty',208,'2025-08-06 19:48:27'),(12,'SAP','IMAGEM SAP',13,'2025-08-06 19:59:31'),(19,'SAP2','IMAGEM SAP2',120,'2025-08-07 01:15:59'),(20,'Logo CDK','Logo da Companhia',13,'2025-08-07 01:36:26'),(21,'Lourdes','foto da minha filhota',85,'2025-08-07 02:45:38');
/*!40000 ALTER TABLE `produto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produtos_monitorados_externos`
--

DROP TABLE IF EXISTS `produtos_monitorados_externos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produtos_monitorados_externos` (
  `ID_Monitoramento` int NOT NULL AUTO_INCREMENT,
  `ID_Vendedor` int NOT NULL,
  `URL_Produto` varchar(2048) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Nome_Produto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Preco_Atual` decimal(10,2) DEFAULT NULL,
  `Ultima_Coleta` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_Monitoramento`),
  KEY `ID_Vendedor` (`ID_Vendedor`),
  CONSTRAINT `produtos_monitorados_externos_ibfk_1` FOREIGN KEY (`ID_Vendedor`) REFERENCES `vendedor` (`ID_Vendedor`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produtos_monitorados_externos`
--

LOCK TABLES `produtos_monitorados_externos` WRITE;
/*!40000 ALTER TABLE `produtos_monitorados_externos` DISABLE KEYS */;
INSERT INTO `produtos_monitorados_externos` VALUES (5,21,'https://www.amazon.com.br/Echo-Dot-5%C2%AA-gera%C3%A7%C3%A3o-Cor-Preta/dp/B09B8V1CC3/','Produto Fictício da URL: https://www.amazon.com.br/Echo...',39.39,'2025-08-06 14:32:27'),(6,21,'https://www.amazon.com.br/Echo-Dot-5%C2%AA-gera%C3%A7%C3%A3o-Cor-Preta/dp/B09B8V1CC3/','Produto Fictício da URL: https://www.amazon.com.br/Echo...',46.53,'2025-08-06 16:16:06'),(7,21,'https://www.paramountplus.com/home/','Produto Fictício da URL: https://www.paramountplus.com/...',59.19,'2025-08-07 08:28:51');
/*!40000 ALTER TABLE `produtos_monitorados_externos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subcategoria_produto`
--

DROP TABLE IF EXISTS `subcategoria_produto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subcategoria_produto` (
  `ID_Subcategoria` int NOT NULL AUTO_INCREMENT,
  `NomeSubcategoria` varchar(255) NOT NULL,
  `ID_CategoriaLoja` int NOT NULL,
  PRIMARY KEY (`ID_Subcategoria`),
  UNIQUE KEY `UK_SubcategoriaPorCategoria` (`NomeSubcategoria`,`ID_CategoriaLoja`),
  KEY `idx_categoria_id` (`ID_CategoriaLoja`),
  CONSTRAINT `subcategoria_produto_ibfk_1` FOREIGN KEY (`ID_CategoriaLoja`) REFERENCES `categoria_loja` (`ID_CategoriaLoja`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=236 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subcategoria_produto`
--

LOCK TABLES `subcategoria_produto` WRITE;
/*!40000 ALTER TABLE `subcategoria_produto` DISABLE KEYS */;
INSERT INTO `subcategoria_produto` VALUES (17,'Acessórios de Celular',1),(24,'Acessórios de Moda (Bolsas, Cintos)',2),(229,'Acessórios de Unha',29),(80,'Acessórios Musicais',8),(107,'Acessórios para Amamentação',12),(156,'Acessórios para Instrumentos',19),(69,'Acessórios para Natação',7),(91,'Acessórios para Pets (Coleiras, Guias)',10),(106,'Alimentação Infantil',12),(177,'Alimentos Diet e Light',21),(135,'Aluguel de Carros',16),(155,'Amplificadores e Pedais',19),(144,'Anéis',18),(138,'Arranjos Florais',17),(109,'Artigos de Higiene para Bebês',12),(158,'Artigos de Mesa (Pratos, Copos)',20),(72,'Artigos para Camping',7),(211,'Artigos para Rituais',26),(121,'Assinaturas de Software',14),(159,'Balões',20),(152,'Baterias e Percussão',19),(192,'Bebidas (Fast-Food)',23),(169,'Bebidas (Supermercado)',21),(34,'Bebidas Alcoólicas',3),(33,'Bebidas Não Alcoólicas',3),(130,'Bijuterias e Acessórios (DIY)',15),(195,'Bolos e Tortas',24),(232,'Bolos e Tortas (Padaria)',30),(197,'Bombons e Chocolates Artesanais',24),(85,'Bonecas e Acessórios',9),(198,'Brigadeiros',24),(146,'Brincos',18),(82,'Brinquedos Educativos',9),(81,'Brinquedos para Bebês',9),(111,'Brinquedos para Crianças Pequenas',12),(92,'Brinquedos para Pets',10),(112,'Cadernos e Agendas',13),(235,'Café e Bebidas (Padaria)',30),(42,'Cafés e Chás',3),(12,'Caixas de Som',1),(23,'Calçados',2),(67,'Calçados Esportivos',7),(214,'Calcinhas',27),(118,'Calculadoras',13),(48,'Cama, Mesa e Banho',4),(19,'Câmeras Digitais',1),(94,'Caminhas e Casinhas',10),(2,'Camisetas',2),(113,'Canetas e Lápis',13),(28,'Carnes e Aves',3),(164,'Carnes e Aves',21),(108,'Carrinhos e Cadeirinhas',12),(86,'Carrinhos e Veículos',9),(141,'Cartões e Embalagens',17),(6,'Celulares',1),(39,'Cereais e Matinais',3),(176,'Cereais e Matinais',21),(139,'Cestas de Presente',17),(202,'Charutos',25),(140,'Chocolates e Bombons (Presente)',17),(38,'Chocolates e Doces',3),(175,'Chocolates e Doces (Supermercado)',21),(201,'Cigarros',25),(206,'Cinzeiros',25),(145,'Colares',18),(14,'Componentes de PC',1),(9,'Computadores de Mesa',1),(40,'Condimentos e Temperos',3),(35,'Congelados',3),(172,'Congelados',21),(228,'Cremes para Mãos e Pés',29),(215,'Cuecas',27),(59,'Cuidados com a Pele (Skincare)',6),(61,'Cuidados com o Cabelo',6),(186,'Cuidados para Bebês (Farmácia)',22),(124,'Cupons e Vouchers',14),(120,'Cursos e Workshops',14),(157,'Decoração de Festas',20),(184,'Dermocosméticos',22),(234,'Doces (Padaria)',30),(160,'Doces e Salgados para Festa',20),(196,'Doces Finos',24),(75,'E-books',8),(18,'Eletrodomésticos Pequenos',1),(36,'Enlatados e Conservas',3),(173,'Enlatados e Conservas',21),(102,'Equipamentos de Proteção',11),(68,'Equipamentos para Academia',7),(70,'Equipamentos para Ciclismo',7),(128,'Escultura e Modelagem',15),(225,'Esmaltes',29),(223,'Estimulantes',28),(162,'Fantasias e Adereços',20),(221,'Fantasias Eróticas',28),(227,'Ferramentas (Alicates, Lixas)',29),(54,'Ferramentas Automotivas',5),(98,'Ferramentas Elétricas',11),(97,'Ferramentas Manuais',11),(88,'Figuras de Ação',9),(76,'Filmes (DVD, Blu-ray)',8),(11,'Fones de Ouvido',1),(188,'Fraldas (Adulto e Infantil)',22),(105,'Fraldas e Lenços Umedecidos',12),(203,'Fumos',25),(200,'Geleias e Compotas',24),(150,'Guitarras e Baixos',19),(189,'Hambúrgueres',23),(63,'Higiene Íntima',6),(93,'Higiene para Pets',10),(183,'Higiene Pessoal (Farmácia)',22),(62,'Higiene Pessoal (Geral)',6),(171,'Higiene Pessoal (Supermercado)',21),(163,'Hortifrúti',21),(27,'Hortifrúti (Frutas, Verduras)',3),(133,'Hospedagem (Hotéis, Pousadas)',16),(45,'Iluminação',4),(207,'Imagens e Esculturas',26),(187,'Incontinência e Geriatria',22),(123,'Ingressos para Eventos',14),(154,'Instrumentos de Corda (Outros)',19),(153,'Instrumentos de Sopro',19),(79,'Instrumentos Musicais',8),(99,'Irrigação',11),(204,'Isqueiros',25),(83,'Jogos de Tabuleiro',9),(73,'Jogos de Tabuleiro e Cartas',7),(87,'Jogos Eletrônicos',9),(222,'Jogos Sensuais',28),(226,'Kits de Manicure',29),(30,'Laticínios e Frios',3),(166,'Laticínios e Frios',21),(161,'Lembrancinhas',20),(55,'Limpeza Automotiva',5),(170,'Limpeza Doméstica',21),(218,'Lingerie',27),(74,'Livros (Ficção, Não-Ficção)',8),(209,'Livros Sagrados',26),(220,'Lubrificantes',28),(58,'Maquiagem',6),(103,'Máquinas de Jardinagem',11),(37,'Massas e Molhos',3),(174,'Massas e Molhos',21),(115,'Materiais de Escritório (Grampeadores, Tesouras)',13),(125,'Materiais para Crochê',15),(126,'Materiais para Tricô',15),(114,'Material Escolar (Geral)',13),(180,'Medicamentos (Eticos)',22),(179,'Medicamentos (Genéricos)',22),(95,'Medicamentos Veterinários (com receita)',10),(216,'Meias',27),(32,'Mercearia (Arroz, Feijão, Óleos)',3),(168,'Mercearia (Geral)',21),(25,'Moda Praia',2),(4,'Móveis',4),(44,'Móveis (Pequenos e Decorativos)',4),(110,'Móveis Infantis',12),(78,'Música (CD, Vinil, Digital)',8),(205,'Narguilés e Acessórios',25),(8,'Notebooks',1),(49,'Objetos Decorativos (Quadros, Vasos)',4),(52,'Óleos e Fluidos Automotivos',5),(5,'Óleos e Lubrificantes',5),(47,'Organização e Limpeza (Decoração)',4),(119,'Pacotes de Viagem',14),(134,'Pacotes Turísticos',16),(3,'Padaria',3),(31,'Padaria e Confeitaria',3),(167,'Padaria e Confeitaria',21),(230,'Pães Artesanais',30),(231,'Pães de Sal',30),(116,'Papéis e Envelopes',13),(132,'Passagens Aéreas',16),(136,'Passeios e Excursões',16),(117,'Pastas e Arquivadores',13),(53,'Peças e Acessórios (Interno)',5),(29,'Peixes e Frutos do Mar',3),(165,'Peixes e Frutos do Mar',21),(60,'Perfumaria e Colônias',6),(13,'Periféricos (Teclado, Mouse)',1),(43,'Petiscos e Snacks',3),(96,'Petiscos para Pets',10),(217,'Pijamas',27),(149,'Pingentes',18),(127,'Pintura (Tintas, Pincéis)',15),(190,'Pizzas',23),(143,'Plantas Decorativas',17),(56,'Pneus e Rodas',5),(142,'Presentes Personalizados',17),(224,'Preservativos',28),(182,'Primeiros Socorros e Curativos',22),(65,'Produtos para Barbear',6),(64,'Protetores Solares',6),(147,'Pulseiras',18),(84,'Quebra-Cabeças',9),(89,'Rações para Cães',10),(90,'Rações para Gatos',10),(148,'Relógios de Pulso',18),(26,'Roupas Esportivas',2),(20,'Roupas Femininas',2),(22,'Roupas Infantis',2),(21,'Roupas Masculinas',2),(104,'Roupas para Bebês',12),(191,'Salgados',23),(233,'Salgados e Lanches (Padaria)',30),(194,'Sanduíches',23),(185,'Saúde e Bem-Estar (Termômetros, Medidores)',22),(129,'Scrapbooking',15),(137,'Seguro Viagem',16),(100,'Sementes e Fertilizantes',11),(77,'Séries de TV',8),(122,'Serviços de Manutenção',14),(57,'Sistemas de Som Automotivo',5),(1,'Smartphones',1),(10,'Smartwatches',1),(193,'Sobremesas (Fast-Food)',23),(199,'Sorvetes Artesanais',24),(41,'Sucos e Néctares',3),(178,'Sucos e Refrigerantes',21),(71,'Suplementos Alimentares (Esportivos)',7),(213,'Sutiãs',27),(7,'Tablets',1),(131,'Tecidos e Aviamentos',15),(151,'Teclados e Pianos',19),(210,'Terços e Rosários',26),(50,'Textura e Papel de Parede',4),(15,'TVs',1),(46,'Utensílios de Cozinha',4),(101,'Vasos e Jardineiras',11),(51,'Velas e Aromas',4),(208,'Velas Religiosas',26),(212,'Vestes Litúrgicas',26),(66,'Vestuário Esportivo',7),(219,'Vibradores',28),(16,'Video Games e Consoles',1),(181,'Vitaminas e Suplementos',22);
/*!40000 ALTER TABLE `subcategoria_produto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `ID_Usuario` int NOT NULL AUTO_INCREMENT,
  `Email` varchar(255) NOT NULL,
  `Senha` varchar(255) NOT NULL,
  `TipoUsuario` enum('Cliente','Vendedor','Administrador') NOT NULL,
  `UltimoLogin` timestamp NULL DEFAULT NULL,
  `DataCadastro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `Ativo` tinyint(1) DEFAULT '1',
  `TokenConfirmacao` varchar(255) DEFAULT NULL,
  `EmailConfirmado` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`ID_Usuario`),
  UNIQUE KEY `Email` (`Email`),
  KEY `idx_usuario_tipo` (`TipoUsuario`),
  KEY `idx_usuario_email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'cliente1@example.com','senhaHash123','Cliente','2025-07-04 13:28:17','2025-07-04 13:28:17',1,NULL,1),(2,'cliente2@example.com','outraSenha456','Cliente','2025-07-04 13:28:17','2025-07-04 13:28:17',1,NULL,1),(3,'cliente3@example.com','finalSenhaABC','Cliente','2025-07-04 13:28:17','2025-07-04 13:28:17',1,NULL,0),(4,'cliente4@example.com','quartaSenhaDEF','Cliente','2025-07-04 13:28:17','2025-07-04 13:28:17',1,NULL,1),(5,'cliente5@example.com','quintaSenhaGHI','Cliente','2025-07-04 13:28:17','2025-07-04 13:28:17',1,NULL,1),(6,'vendedor1@example.com','lojaSenha789','Vendedor','2025-07-04 13:28:17','2025-07-04 13:28:17',1,NULL,1),(7,'admin1@example.com','adminSenhaXYZ','Administrador','2025-07-04 13:28:17','2025-07-04 13:28:17',1,NULL,1),(8,'vendedor2@example.com','vendeSenhaJKL','Vendedor','2025-07-04 13:28:17','2025-07-04 13:28:17',1,NULL,1),(9,'vendedor3@example.com','vendeSenhaMNO','Vendedor','2025-07-04 13:28:17','2025-07-04 13:28:17',1,NULL,1),(10,'vendedor4@example.com','vendeSenhaPQR','Vendedor','2025-07-04 13:28:17','2025-07-04 13:28:17',1,NULL,1),(11,'vendedor5@example.com','vendeSenhaSTU','Vendedor','2025-07-04 13:28:17','2025-07-04 13:28:17',1,NULL,1),(12,'admin2@example.com','senhaAdmin2','Administrador','2025-07-04 13:28:17','2025-07-04 13:28:17',1,NULL,1),(13,'admin3@example.com','senhaAdmin3','Administrador','2025-07-04 13:28:17','2025-07-04 13:28:17',1,NULL,1),(14,'admin4@example.com','senhaAdmin4','Administrador','2025-07-04 13:28:17','2025-07-04 13:28:17',1,NULL,1),(15,'admin5@example.com','senhaAdmin5','Administrador','2025-07-04 13:28:17','2025-07-04 13:28:17',1,NULL,1),(16,'cydy@gmail.com','$2b$10$ufI6ENxi27eLziORn5XwI.XOSmxSyk1pzmq3xO6ibuhGQl37efnLK','Administrador',NULL,'2025-07-04 16:57:32',1,NULL,0),(17,'cidao@gmail.com','$2a$10$32QUqz4C3HTQXSQt0sLAZORQseJ4rH8lsW9PIVt/nh/j7lmsFLTUa','Cliente',NULL,'2025-07-06 22:33:57',1,NULL,0),(18,'cidinho@gmail.com','$2a$10$0q4am0GcMzWywpQa9EhxrehCrnO1hgWjFQEMNThsHO5fwNGgfmJDW','Vendedor',NULL,'2025-07-06 22:45:47',1,NULL,0),(19,'cidola@gmail.com','$2a$10$GVlAf.lFcoDYIxuyg5qdXeAZFJdy.rCd68sB843Wqd88pbj/uBFTm','Cliente',NULL,'2025-07-06 23:21:10',1,NULL,0),(24,'cidx@gmail.com','$2a$10$l1fJIJSCKY.35Fy7bKO9e.LEdrJf9.CLuB3/gNnxqw29JJM19kICu','Cliente',NULL,'2025-07-08 15:25:55',1,NULL,1),(25,'vend@gmail.com','$2a$10$kJFSrexe1KVs0kLdkVdGfewFiuGB4VJ461irot6RukyqNYCFryg3.','Vendedor',NULL,'2025-07-08 15:33:02',1,NULL,1),(26,'vendor@gmail.com','$2a$10$pXF1kze5a5kH/dchqkZTF.jm2iggnct.X9AST3cFfMKCWrKEKF3IW','Vendedor',NULL,'2025-07-08 23:08:28',1,NULL,1),(27,'vivo@gmail.com','$2a$10$nVvQRy9sMzuWz1qcvjfGKukmGPZNXpwzOVPzkioCZPLX1wZpogrna','Vendedor',NULL,'2025-07-08 23:19:54',1,NULL,1),(28,'sola@gmail.com','12345','Vendedor',NULL,'2025-07-09 00:34:58',0,'123456',0),(29,'silva@gmail.com','$2a$10$vJ8QyI.flOjCahaRboixH.HRYE6z8cIIqN/HAMzBUpLO02.AiQXde','Vendedor',NULL,'2025-07-09 00:41:55',0,'123456',0),(30,'coco@gmail.com','$2a$10$n.pA98BTzoMavXsyzc4Dju3zkkx2gVDeHZuFqFm0RH0PqloYSg92W','Vendedor',NULL,'2025-07-09 00:50:03',0,'123456',0),(31,'cola@gmail.com','$2a$10$WsiDyPZgZ37JhByzSHGQyeooxKdpZrlIBJXBuOE4.TYkBsNsQQd0m','Cliente',NULL,'2025-07-09 01:04:40',1,NULL,1),(32,'banco@gmail.com','$2a$10$XSn.lX1g3Fc8THaaKHgJA.OQky9QqEiC999YiIZG.830fqkIO6852','Vendedor',NULL,'2025-07-09 01:06:46',1,NULL,1),(33,'teste1@gmail.com','$2a$10$c3TDsMz.I2seA1O.MzNiiezIJtGElHzZs2mZ.8wtVunsSymvUWBni','Vendedor',NULL,'2025-07-09 01:09:06',1,NULL,1),(34,'bola@gmail.com','$2a$10$0DYvJR5iK6LhY1TgfMmpkOOAFQNdSBxf06pjCPSK38hAJ.90sAjbq','Vendedor',NULL,'2025-07-09 01:53:40',1,NULL,1),(35,'codigo@gmail.com','$2a$10$QPMFik3AKo.6dtNSX2kERugpYbEZudvbWvuNHFgHRUoh643aw4qgy','Vendedor','2025-07-12 01:22:22','2025-07-09 02:55:43',1,NULL,1),(36,'vendedor@gmail.com','$2a$10$lM6BeBALgMm/NTDook23q.LChfeJa0TtkIOC.Fv1w/S5XN.KMFkZ.','Vendedor','2025-08-11 21:24:25','2025-07-12 01:25:07',1,NULL,1);
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variacao_produto`
--

DROP TABLE IF EXISTS `variacao_produto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variacao_produto` (
  `ID_Variacao` int NOT NULL AUTO_INCREMENT,
  `ID_Produto` int NOT NULL,
  `NomeVariacao` varchar(255) NOT NULL,
  `ValorVariacao` varchar(255) NOT NULL,
  PRIMARY KEY (`ID_Variacao`),
  UNIQUE KEY `UK_VariacaoProduto` (`ID_Produto`,`NomeVariacao`,`ValorVariacao`),
  KEY `idx_produto_id` (`ID_Produto`),
  CONSTRAINT `variacao_produto_ibfk_1` FOREIGN KEY (`ID_Produto`) REFERENCES `produto` (`ID_Produto`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variacao_produto`
--

LOCK TABLES `variacao_produto` WRITE;
/*!40000 ALTER TABLE `variacao_produto` DISABLE KEYS */;
INSERT INTO `variacao_produto` VALUES (2,1,'Armazenamento','128GB'),(1,1,'Cor','Preto'),(4,2,'Cor','Branco'),(3,2,'Tamanho','M'),(5,3,'Peso','500g'),(7,7,'ninho','morango'),(8,8,'orquidia','2kg'),(9,9,'teste','teste'),(10,10,'logo pagina','icone'),(11,11,'Azul','Paraty'),(12,12,'Print','bootcamp'),(13,19,'CURSO','BOOTCAMP'),(14,20,'Cerebro','CID centralizado'),(15,21,'Lud','Milla');
/*!40000 ALTER TABLE `variacao_produto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendedor`
--

DROP TABLE IF EXISTS `vendedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendedor` (
  `ID_Vendedor` int NOT NULL AUTO_INCREMENT,
  `ID_Usuario` int NOT NULL,
  `NomeLoja` varchar(255) NOT NULL,
  `CNPJ` varchar(18) DEFAULT NULL,
  `Telefone` varchar(20) DEFAULT NULL,
  `Fundacao` date DEFAULT NULL,
  `HorarioFuncionamento` varchar(255) DEFAULT NULL,
  `NomeResponsavel` varchar(255) DEFAULT NULL,
  `CPF_Responsavel` varchar(14) DEFAULT NULL,
  `BreveDescricaoLoja` text,
  `LogotipoLoja` varchar(255) DEFAULT NULL,
  `WebsiteRedesSociais` varchar(255) DEFAULT NULL,
  `ID_CategoriaLoja` int NOT NULL,
  `AvaliacaoLoja` decimal(3,2) DEFAULT NULL,
  `StatusAprovacao` enum('Pendente','Aprovado','Rejeitado') DEFAULT 'Pendente',
  `ID_Endereco` int DEFAULT NULL,
  PRIMARY KEY (`ID_Vendedor`),
  UNIQUE KEY `ID_Usuario` (`ID_Usuario`),
  UNIQUE KEY `CNPJ` (`CNPJ`),
  KEY `idx_vendedor_categoria` (`ID_CategoriaLoja`),
  KEY `idx_vendedor_usuario` (`ID_Usuario`),
  KEY `fk_vendedor_endereco` (`ID_Endereco`),
  CONSTRAINT `fk_vendedor_endereco` FOREIGN KEY (`ID_Endereco`) REFERENCES `endereco` (`ID_Endereco`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `vendedor_ibfk_1` FOREIGN KEY (`ID_Usuario`) REFERENCES `usuario` (`ID_Usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `vendedor_ibfk_2` FOREIGN KEY (`ID_CategoriaLoja`) REFERENCES `categoria_loja` (`ID_CategoriaLoja`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `vendedor_chk_1` CHECK ((`AvaliacaoLoja` between 0 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendedor`
--

LOCK TABLES `vendedor` WRITE;
/*!40000 ALTER TABLE `vendedor` DISABLE KEYS */;
INSERT INTO `vendedor` VALUES (1,6,'TechMania','00.111.222/0001-33','1133334444','2010-01-01','Seg-Sex 9h-18h','Jo├úo Silva','123.456.789-01','Tudo em tecnologia!',NULL,NULL,1,4.50,'Aprovado',NULL),(2,8,'ModaTop','00.333.444/0001-55','2155556666','2015-06-10','Seg-Sab 10h-20h','Maria Souza','987.654.321-02','As ├║ltimas tend├¬ncias da moda.',NULL,NULL,2,4.20,'Aprovado',NULL),(3,9,'P├úo Fresco','00.555.666/0001-77','3177778888','2018-03-20','Diariamente 7h-19h','Pedro Santos','456.789.012-03','Padaria com produtos artesanais.',NULL,NULL,3,4.80,'Pendente',NULL),(4,10,'Lar Doce Lar','00.777.888/0001-99','4199990000','2012-09-05','Seg-X 9h-17h','Ana Paula','789.012.345-04','Decora├º├úo e utilidades para sua casa.',NULL,NULL,4,4.00,'Aprovado',NULL),(5,11,'Auto Pe├ºas Express','00.999.000/0001-11','5188887777','2008-02-14','Seg-Sex 8h-18h','Carlos Souza','678.901.234-05','Pe├ºas e acess├│rios para todos os ve├¡culos.',NULL,NULL,5,4.70,'Aprovado',NULL),(6,1,'Minha Loja',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,NULL,'Pendente',NULL),(9,25,'cix','12345678978977','21999999999','1987-05-04','08:00','cildo','12345678999','loja ficticia','www.cid.com','www.cid.com',1,NULL,'Pendente',NULL),(10,28,'cidao','12345678912345','21999888777','2019-08-27','0800','cidao','12345678977','descricao','www','www',2,NULL,'Pendente',NULL),(12,29,'silva','12345678912344','21978985784','2019-09-28','0800','silva2','12345678977','loja','www1','www1',3,NULL,'Pendente',NULL),(13,30,'soares','98765432178945','21654878485','2022-10-29','0800','soares','98765432111','cresce loja','www','www',8,NULL,'Pendente',NULL),(14,32,'loja 1000','12345678912346','21985465841','2020-10-25','0800','banco','12345678910','bancos','www2','www2',5,NULL,'Pendente',NULL),(15,33,'teste1','98745612378946','21985645644','2021-09-29','0800','teste1','12345678910','teste','www3','www3',30,NULL,'Pendente',NULL),(17,34,'bola','12345678912347','21987787545','2001-02-22','0800','bola','12345678910','lojao','www4','www4',5,NULL,'Pendente',NULL),(19,35,'Looks 5','12345678912349','21987654321','2020-05-14','0700','Ciso ','12345678978','Minha loja ','Www5','Www5',7,NULL,'Pendente',NULL),(21,36,'loja do vendedor um','12548765984521','21971583118','2009-01-21','08:00','cidao','12346578911','loja do vendedor','www1','www2',3,NULL,'Pendente',2);
/*!40000 ALTER TABLE `vendedor` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-11 19:17:14
