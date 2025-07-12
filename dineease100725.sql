/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.6.22-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: dineease
-- ------------------------------------------------------
-- Server version	10.6.22-MariaDB-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `factura`
--

DROP TABLE IF EXISTS `factura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `factura` (
  `id_factura` int(11) NOT NULL AUTO_INCREMENT,
  `id_pago` int(11) NOT NULL,
  `numero_factura` varchar(50) NOT NULL COMMENT 'Número de factura único, puede tener prefijos',
  `fecha_emision` datetime NOT NULL DEFAULT current_timestamp(),
  `impuestos` decimal(10,2) DEFAULT 0.00,
  `total_factura` decimal(10,2) NOT NULL,
  `datos_cliente_factura` text DEFAULT NULL COMMENT 'Nombre, DNI/RUC, dirección del cliente para la factura',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_eliminacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_factura`),
  UNIQUE KEY `uq_factura_numero_factura` (`numero_factura`),
  KEY `idx_factura_id_pago` (`id_pago`),
  KEY `idx_factura_eliminado` (`eliminado`),
  CONSTRAINT `fk_factura_id_pago` FOREIGN KEY (`id_pago`) REFERENCES `pago` (`id_pago`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `factura`
--

LOCK TABLES `factura` WRITE;
/*!40000 ALTER TABLE `factura` DISABLE KEYS */;
/*!40000 ALTER TABLE `factura` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ingrediente_receta`
--

DROP TABLE IF EXISTS `ingrediente_receta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingrediente_receta` (
  `id_ingrediente_receta` int(11) NOT NULL AUTO_INCREMENT,
  `id_receta` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL COMMENT 'Referencia a un producto que es ingrediente',
  `cantidad` decimal(10,2) NOT NULL COMMENT 'Cantidad del producto necesaria para la receta',
  `unidad_medida_receta` varchar(50) DEFAULT NULL COMMENT 'Ej: gramos, ml, unidades. Puede ser diferente a la unidad_medida del producto base.',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_eliminacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_ingrediente_receta`),
  KEY `idx_ingrediente_receta_id_receta` (`id_receta`),
  KEY `idx_ingrediente_receta_id_producto` (`id_producto`),
  KEY `idx_ingrediente_receta_eliminado` (`eliminado`),
  CONSTRAINT `fk_ingrediente_receta_id_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON UPDATE CASCADE,
  CONSTRAINT `fk_ingrediente_receta_id_receta` FOREIGN KEY (`id_receta`) REFERENCES `receta` (`id_receta`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingrediente_receta`
--

LOCK TABLES `ingrediente_receta` WRITE;
/*!40000 ALTER TABLE `ingrediente_receta` DISABLE KEYS */;
INSERT INTO `ingrediente_receta` VALUES (1,2,5,0.20,'kg','2025-06-18 03:25:12','2025-06-18 03:25:12',0,NULL);
/*!40000 ALTER TABLE `ingrediente_receta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventario`
--

DROP TABLE IF EXISTS `inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventario` (
  `id_inventario` int(11) NOT NULL AUTO_INCREMENT,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_eliminacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_inventario`),
  UNIQUE KEY `uq_inventario_id_producto` (`id_producto`),
  KEY `idx_inventario_eliminado` (`eliminado`),
  CONSTRAINT `fk_inventario_id_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario`
--

LOCK TABLES `inventario` WRITE;
/*!40000 ALTER TABLE `inventario` DISABLE KEYS */;
INSERT INTO `inventario` VALUES (1,5,0,'2025-06-16 02:15:29','2025-06-16 02:15:29',0,NULL);
/*!40000 ALTER TABLE `inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_menu`
--

DROP TABLE IF EXISTS `item_menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_menu` (
  `id_item_menu` int(11) NOT NULL AUTO_INCREMENT,
  `id_menu` int(11) NOT NULL,
  `id_receta` int(11) NOT NULL COMMENT 'La receta que compone este item del menu',
  `precio_item` decimal(10,2) NOT NULL COMMENT 'Precio del item individual dentro del menu',
  `disponible` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1: Disponible, 0: No disponible',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_eliminacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_item_menu`),
  KEY `idx_item_menu_id_menu` (`id_menu`),
  KEY `idx_item_menu_id_receta` (`id_receta`),
  KEY `idx_item_menu_eliminado` (`eliminado`),
  CONSTRAINT `fk_item_menu_id_menu` FOREIGN KEY (`id_menu`) REFERENCES `menu` (`id_menu`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_item_menu_id_receta` FOREIGN KEY (`id_receta`) REFERENCES `receta` (`id_receta`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_menu`
--

LOCK TABLES `item_menu` WRITE;
/*!40000 ALTER TABLE `item_menu` DISABLE KEYS */;
INSERT INTO `item_menu` VALUES (1,2,2,10.00,1,'2025-07-10 03:17:21','2025-07-10 03:17:21',0,NULL);
/*!40000 ALTER TABLE `item_menu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_pedido`
--

DROP TABLE IF EXISTS `item_pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_pedido` (
  `id_item_pedido` int(11) NOT NULL AUTO_INCREMENT,
  `id_pedido` int(11) NOT NULL,
  `id_menu` int(11) NOT NULL COMMENT 'ID del menú que se está pidiendo',
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `precio_unitario_momento` decimal(10,2) NOT NULL COMMENT 'Precio del item al momento del pedido',
  `notas_item` text DEFAULT NULL COMMENT 'Notas específicas para este item en el pedido (ej. sin cebolla)',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_eliminacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_item_pedido`),
  KEY `idx_item_pedido_id_pedido` (`id_pedido`),
  KEY `idx_item_pedido_id_item_menu` (`id_menu`),
  KEY `idx_item_pedido_eliminado` (`eliminado`),
  CONSTRAINT `fk_item_pedido_id_menu` FOREIGN KEY (`id_menu`) REFERENCES `menu` (`id_menu`) ON UPDATE CASCADE,
  CONSTRAINT `fk_item_pedido_id_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_pedido`
--

LOCK TABLES `item_pedido` WRITE;
/*!40000 ALTER TABLE `item_pedido` DISABLE KEYS */;
INSERT INTO `item_pedido` VALUES (1,1,1,1,10.00,'string','2025-07-11 00:55:02','2025-07-11 00:55:02',0,NULL);
/*!40000 ALTER TABLE `item_pedido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu`
--

DROP TABLE IF EXISTS `menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu` (
  `id_menu` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `costo_total` decimal(10,2) DEFAULT NULL COMMENT 'Costo de producción del menú completo si aplica',
  `precio_venta` decimal(10,2) NOT NULL COMMENT 'Precio de venta del menú',
  `estado` varchar(50) DEFAULT 'Activo' COMMENT 'Ej: Activo, Inactivo, Promoción',
  `id_restaurante` int(11) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_eliminacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_menu`),
  KEY `idx_menu_id_restaurante` (`id_restaurante`),
  KEY `idx_menu_eliminado` (`eliminado`),
  CONSTRAINT `fk_menu_id_restaurante` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante` (`id_restaurante`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu`
--

LOCK TABLES `menu` WRITE;
/*!40000 ALTER TABLE `menu` DISABLE KEYS */;
INSERT INTO `menu` VALUES (1,'Pasta','Pasta con pollo',20.00,30.00,'Activo',1,'2025-07-10 01:45:04','2025-07-10 01:45:04',0,NULL),(2,'Arroz Con pollo','arroz con pollo acompañado de papas fritas',25.00,30.00,'Activo',1,'2025-07-10 02:43:14','2025-07-10 02:56:17',0,NULL);
/*!40000 ALTER TABLE `menu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mesa`
--

DROP TABLE IF EXISTS `mesa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `mesa` (
  `id_mesa` int(11) NOT NULL AUTO_INCREMENT,
  `numero` int(11) NOT NULL,
  `capacidad` int(11) DEFAULT 2,
  `estado` enum('Libre','Ocupada','Reservada','Fuera de Servicio') NOT NULL DEFAULT 'Libre',
  `ubicacion` varchar(255) DEFAULT NULL,
  `id_restaurante` int(11) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_eliminacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_mesa`),
  UNIQUE KEY `uq_mesa_restaurante_numero` (`id_restaurante`,`numero`),
  KEY `idx_mesa_eliminado` (`eliminado`),
  CONSTRAINT `fk_mesa_id_restaurante` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante` (`id_restaurante`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mesa`
--

LOCK TABLES `mesa` WRITE;
/*!40000 ALTER TABLE `mesa` DISABLE KEYS */;
INSERT INTO `mesa` VALUES (1,0,2,'Libre','string',1,'2025-06-20 04:29:56','2025-07-11 02:13:56',0,NULL);
/*!40000 ALTER TABLE `mesa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimiento_inventario`
--

DROP TABLE IF EXISTS `movimiento_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimiento_inventario` (
  `id_movimiento` int(11) NOT NULL AUTO_INCREMENT,
  `id_producto` int(11) NOT NULL,
  `id_usuario_responsable` int(11) DEFAULT NULL COMMENT 'Usuario que realizó el movimiento',
  `tipo_movimiento` enum('ENTRADA_COMPRA','ENTRADA_AJUSTE','ENTRADA_DEVOLUCION_CLIENTE','SALIDA_VENTA','SALIDA_CONSUMO_INTERNO','SALIDA_MERMA','SALIDA_AJUSTE','SALIDA_DEVOLUCION_PROVEEDOR') NOT NULL COMMENT 'Tipo de movimiento realizado',
  `cantidad_movida` int(11) NOT NULL COMMENT 'Cantidad (siempre positiva) que se movió. El tipo_movimiento define la dirección.',
  `cantidad_anterior` int(11) NOT NULL COMMENT 'Stock del producto ANTES de este movimiento',
  `cantidad_nueva` int(11) NOT NULL COMMENT 'Stock del producto DESPUÉS de este movimiento',
  `precio_compra_unitario_movimiento` decimal(10,2) DEFAULT NULL COMMENT 'Precio de compra unitario para este movimiento específico (si aplica, ej. ENTRADA_COMPRA)',
  `motivo` varchar(255) DEFAULT NULL COMMENT 'Razón o descripción del movimiento (ej. Compra a proveedor X, Ajuste por conteo)',
  `fecha_movimiento` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Fecha y hora en que se registró el movimiento',
  PRIMARY KEY (`id_movimiento`),
  KEY `idx_movimiento_producto` (`id_producto`),
  KEY `idx_movimiento_usuario_responsable` (`id_usuario_responsable`),
  KEY `idx_movimiento_tipo` (`tipo_movimiento`),
  KEY `idx_movimiento_fecha` (`fecha_movimiento`),
  CONSTRAINT `fk_movimiento_inventario_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON UPDATE CASCADE,
  CONSTRAINT `fk_movimiento_inventario_usuario` FOREIGN KEY (`id_usuario_responsable`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Registra todos los movimientos de entrada y salida del inventario.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimiento_inventario`
--

LOCK TABLES `movimiento_inventario` WRITE;
/*!40000 ALTER TABLE `movimiento_inventario` DISABLE KEYS */;
/*!40000 ALTER TABLE `movimiento_inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pago`
--

DROP TABLE IF EXISTS `pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pago` (
  `id_pago` int(11) NOT NULL AUTO_INCREMENT,
  `id_pedido` int(11) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `cambio` decimal(10,2) DEFAULT 0.00,
  `metodo_pago` varchar(50) NOT NULL COMMENT 'Ej: Efectivo, Tarjeta Credito, Transferencia',
  `estado` varchar(50) NOT NULL DEFAULT 'Pendiente' COMMENT 'Ej: Pendiente, Completado, Fallido, Reembolsado',
  `fecha_pago` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_eliminacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_pago`),
  KEY `idx_pago_id_pedido` (`id_pedido`),
  KEY `idx_pago_eliminado` (`eliminado`),
  CONSTRAINT `fk_pago_id_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pago`
--

LOCK TABLES `pago` WRITE;
/*!40000 ALTER TABLE `pago` DISABLE KEYS */;
/*!40000 ALTER TABLE `pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedido`
--

DROP TABLE IF EXISTS `pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedido` (
  `id_pedido` int(11) NOT NULL AUTO_INCREMENT,
  `id_mesa` int(11) DEFAULT NULL COMMENT 'Puede ser NULL para pedidos para llevar/delivery',
  `id_usuario_empleado` int(11) NOT NULL COMMENT 'Empleado que tomó/gestionó el pedido',
  `id_cliente` int(11) DEFAULT NULL COMMENT 'Cliente que realizó el pedido (si está registrado, FK a usuario.id_usuario)',
  `estado` varchar(50) NOT NULL DEFAULT 'Pendiente' COMMENT 'Ej: Pendiente, En Preparación, Listo para Servir, Servido, Pagado, Cancelado',
  `subtotal` decimal(10,2) DEFAULT 0.00,
  `id_restaurante` int(11) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_eliminacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_pedido`),
  KEY `idx_pedido_id_mesa` (`id_mesa`),
  KEY `idx_pedido_id_usuario_empleado` (`id_usuario_empleado`),
  KEY `idx_pedido_id_cliente` (`id_cliente`),
  KEY `idx_pedido_id_restaurante` (`id_restaurante`),
  KEY `idx_pedido_eliminado` (`eliminado`),
  CONSTRAINT `fk_pedido_id_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pedido_id_mesa` FOREIGN KEY (`id_mesa`) REFERENCES `mesa` (`id_mesa`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pedido_id_restaurante` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante` (`id_restaurante`) ON UPDATE CASCADE,
  CONSTRAINT `fk_pedido_id_usuario_empleado` FOREIGN KEY (`id_usuario_empleado`) REFERENCES `usuario` (`id_usuario`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedido`
--

LOCK TABLES `pedido` WRITE;
/*!40000 ALTER TABLE `pedido` DISABLE KEYS */;
INSERT INTO `pedido` VALUES (1,1,3,5,'Cancelado',10.00,1,'2025-07-11 00:55:02','2025-07-11 02:13:56',0,NULL);
/*!40000 ALTER TABLE `pedido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `perfil_usuario`
--

DROP TABLE IF EXISTS `perfil_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `perfil_usuario` (
  `id_perfil_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `documento_identidad` varchar(20) DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_eliminacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_perfil_usuario`),
  UNIQUE KEY `uq_perfil_usuario_id_usuario` (`id_usuario`),
  KEY `idx_perfil_usuario_eliminado` (`eliminado`),
  CONSTRAINT `fk_perfil_usuario_id_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `perfil_usuario`
--

LOCK TABLES `perfil_usuario` WRITE;
/*!40000 ALTER TABLE `perfil_usuario` DISABLE KEYS */;
INSERT INTO `perfil_usuario` VALUES (1,1,'Calle 45 #23-15, Bucaramanga','+57 301 234 5678','1098765432','Administradora principal del restaurante','2025-06-01 03:13:20','2025-06-01 03:35:41',1,'2025-06-01 03:35:41'),(2,2,'Oficina Central - Calle 100 #15-20, Bucaramanga','+57 305 123 5458','12345678','Super administrador del sistema, acceso a todos los restaurantes','2025-06-01 03:21:29','2025-06-01 22:57:08',0,NULL),(3,3,'Oficina Central - Calle 100 #15-20, Bucaramanga','+57 307 000 0001','1000000001','Super administrador del sistema, acceso a todos los restaurantes','2025-06-01 04:24:46','2025-06-01 04:24:46',0,NULL);
/*!40000 ALTER TABLE `perfil_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permiso`
--

DROP TABLE IF EXISTS `permiso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `permiso` (
  `id_permiso` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_eliminacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_permiso`),
  UNIQUE KEY `uq_permiso_nombre` (`nombre`),
  KEY `idx_permiso_eliminado` (`eliminado`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permiso`
--

LOCK TABLES `permiso` WRITE;
/*!40000 ALTER TABLE `permiso` DISABLE KEYS */;
INSERT INTO `permiso` VALUES (1,'SuperAdmin','Super usuario control total','2025-06-01 01:23:17','2025-06-01 01:23:17',0,NULL);
/*!40000 ALTER TABLE `permiso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producto`
--

DROP TABLE IF EXISTS `producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto` (
  `id_producto` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `unidad_medida` varchar(50) DEFAULT NULL,
  `precio_compra` decimal(10,2) DEFAULT NULL,
  `stock_minimo` int(11) DEFAULT 0,
  `id_usuario_registro` int(11) DEFAULT NULL COMMENT 'Usuario que registró/modificó por última vez',
  `id_restaurante` int(11) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_eliminacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_producto`),
  KEY `idx_producto_id_usuario_registro` (`id_usuario_registro`),
  KEY `idx_producto_id_restaurante` (`id_restaurante`),
  KEY `idx_producto_eliminado` (`eliminado`),
  CONSTRAINT `fk_producto_id_restaurante` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante` (`id_restaurante`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_producto_id_usuario_registro` FOREIGN KEY (`id_usuario_registro`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto`
--

LOCK TABLES `producto` WRITE;
/*!40000 ALTER TABLE `producto` DISABLE KEYS */;
INSERT INTO `producto` VALUES (5,'Arroz Basmati','Arroz de grano largo aromático, ideal para platos indios y orientales','kg',3.50,10,3,1,'2025-06-16 02:15:29','2025-06-16 02:15:29',0,NULL);
/*!40000 ALTER TABLE `producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receta`
--

DROP TABLE IF EXISTS `receta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `receta` (
  `id_receta` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tiempo_preparacion` int(11) DEFAULT NULL COMMENT 'En minutos',
  `instrucciones` text DEFAULT NULL,
  `porciones` int(11) DEFAULT 1,
  `precio_costo` decimal(10,2) DEFAULT NULL COMMENT 'Costo de preparación de la receta',
  `id_restaurante` int(11) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_eliminacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_receta`),
  KEY `idx_receta_id_restaurante` (`id_restaurante`),
  KEY `idx_receta_eliminado` (`eliminado`),
  CONSTRAINT `fk_receta_id_restaurante` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante` (`id_restaurante`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receta`
--

LOCK TABLES `receta` WRITE;
/*!40000 ALTER TABLE `receta` DISABLE KEYS */;
INSERT INTO `receta` VALUES (2,'Salsa de Tomate Casera','string',0,'string',1,0.00,1,'2025-06-18 03:25:12','2025-06-18 03:25:12',0,NULL);
/*!40000 ALTER TABLE `receta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurante`
--

DROP TABLE IF EXISTS `restaurante`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurante` (
  `id_restaurante` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `colores_primarios` varchar(255) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_eliminacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_restaurante`),
  UNIQUE KEY `uq_restaurante_nombre` (`nombre`),
  KEY `idx_restaurante_eliminado` (`eliminado`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurante`
--

LOCK TABLES `restaurante` WRITE;
/*!40000 ALTER TABLE `restaurante` DISABLE KEYS */;
INSERT INTO `restaurante` VALUES (1,'La Parrillas','https://ejemplo.com/logos/parrilla.png','#E74C3C,#F39C12','Av. Principal 123, Ciudad de México','+525512345678','2022-01-15 15:00:00','2025-05-14 01:26:32',0,NULL),(2,'Dineease','logo','#020202','Calle 25 32 65','3001234567','2025-06-01 01:07:34','2025-06-01 01:07:34',0,NULL);
/*!40000 ALTER TABLE `restaurante` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `id_rol` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_eliminacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `uq_rol_nombre` (`nombre`),
  KEY `idx_rol_eliminado` (`eliminado`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES (1,'SuperAdmin','Tiene control total','2025-06-01 01:28:16','2025-06-01 01:28:16',0,NULL);
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol_permiso`
--

DROP TABLE IF EXISTS `rol_permiso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol_permiso` (
  `id_rol_permiso` int(11) NOT NULL AUTO_INCREMENT,
  `id_rol` int(11) NOT NULL,
  `id_permiso` int(11) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_rol_permiso`),
  UNIQUE KEY `uq_rol_permiso_ids` (`id_rol`,`id_permiso`),
  KEY `idx_rol_permiso_id_permiso` (`id_permiso`),
  CONSTRAINT `fk_rol_permiso_id_permiso` FOREIGN KEY (`id_permiso`) REFERENCES `permiso` (`id_permiso`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rol_permiso_id_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol_permiso`
--

LOCK TABLES `rol_permiso` WRITE;
/*!40000 ALTER TABLE `rol_permiso` DISABLE KEYS */;
INSERT INTO `rol_permiso` VALUES (1,1,1,'2025-06-01 01:31:52','2025-06-01 01:31:52');
/*!40000 ALTER TABLE `rol_permiso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL COMMENT 'Almacenar HASH de la contraseña, no texto plano',
  `id_rol` int(11) NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1: Activo, 0: Inactivo',
  `ultimo_acceso` datetime DEFAULT NULL,
  `id_restaurante` int(11) DEFAULT NULL COMMENT 'Puede ser NULL si es un superadmin o un cliente general',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_eliminacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uq_usuario_email` (`email`),
  KEY `idx_usuario_id_rol` (`id_rol`),
  KEY `idx_usuario_id_restaurante` (`id_restaurante`),
  KEY `idx_usuario_eliminado` (`eliminado`),
  CONSTRAINT `fk_usuario_id_restaurante` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante` (`id_restaurante`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_usuario_id_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'María González','maria.gonzalez@email.com','$2b$10$Hv5J3ekyKuctpLXuXXpbe.nJnAaZizyiKFNbdlswMhS7heM6anhTq',1,1,NULL,1,'2025-06-01 03:13:20','2025-06-01 03:35:41',1,'2025-06-01 03:35:41'),(2,'Roberto Carlos Admin','RobertoCarlos@sistema.com','$2b$10$7zvGh3da2./FORZgMjTJ.ueRuZhJZX5NRZcL8yZ3mPEiRTzIy7TOO',1,0,NULL,NULL,'2025-06-01 03:21:28','2025-06-13 20:27:36',0,NULL),(3,'Admin','admin@sistema.com','$2b$10$ubB5kHekUH39SSJWlSBD1.vQJHeS2jzVYtcBWhkzAizNRt6R5qsZm',1,1,'2025-07-11 03:17:22',1,'2025-06-01 04:24:45','2025-07-11 03:17:22',0,NULL),(4,'Ferney','Ferney@sistema.com','$2b$10$Yb/5R94xhcWI2TmOLJvlIeLQrIhZ5c3GQ/KftRpNA6qNNWUiGbzJe',1,1,NULL,NULL,'2025-06-01 23:05:51','2025-06-01 23:05:51',0,NULL),(5,'juan','juan@sistema.com','$2b$10$zUWam3qosIdTDeoW48A9xuzXtKHhV9Hf6frs1cMoehB/6t2f3WHgS',1,1,NULL,NULL,'2025-06-13 20:30:18','2025-06-13 20:30:18',0,NULL);
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-10 22:19:44
