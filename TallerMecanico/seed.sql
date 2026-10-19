USE TallerMecanicoDB;
GO

-- 1. Roles
IF NOT EXISTS (SELECT * FROM roles WHERE nombre = 'Admin') 
    INSERT INTO roles (nombre, descripcion) VALUES ('Admin', 'Administrador del sistema con acceso total');
IF NOT EXISTS (SELECT * FROM roles WHERE nombre = 'Mecanico') 
    INSERT INTO roles (nombre, descripcion) VALUES ('Mecanico', 'Mecánico u operador de taller');

-- 2. Clientes
IF NOT EXISTS (SELECT * FROM clientes WHERE correo = 'juan.perez@email.com')
    INSERT INTO clientes (nombre, apellido, telefono, correo, direccion) VALUES ('Juan', 'Pérez', '+56911112222', 'juan.perez@email.com', 'Av. Libertador 123');
IF NOT EXISTS (SELECT * FROM clientes WHERE correo = 'maria.gonzalez@email.com')
    INSERT INTO clientes (nombre, apellido, telefono, correo, direccion) VALUES ('María', 'González', '+56933334444', 'maria.gonzalez@email.com', 'Calle Los Alerces 456');
IF NOT EXISTS (SELECT * FROM clientes WHERE correo = 'carlos.soto@email.com')
    INSERT INTO clientes (nombre, apellido, telefono, correo, direccion) VALUES ('Carlos', 'Soto', '+56955556666', 'carlos.soto@email.com', 'Pasaje Las Flores 789');

-- 3. Marcas
IF NOT EXISTS (SELECT * FROM marcas WHERE nombre = 'Toyota') INSERT INTO marcas (nombre) VALUES ('Toyota');
IF NOT EXISTS (SELECT * FROM marcas WHERE nombre = 'Ford') INSERT INTO marcas (nombre) VALUES ('Ford');
IF NOT EXISTS (SELECT * FROM marcas WHERE nombre = 'Chevrolet') INSERT INTO marcas (nombre) VALUES ('Chevrolet');
IF NOT EXISTS (SELECT * FROM marcas WHERE nombre = 'Nissan') INSERT INTO marcas (nombre) VALUES ('Nissan');

-- 4. Modelos
IF NOT EXISTS (SELECT * FROM modelos WHERE nombre = 'Corolla') 
    INSERT INTO modelos (nombre, marca_id) VALUES ('Corolla', (SELECT TOP 1 marca_id FROM marcas WHERE nombre='Toyota'));
IF NOT EXISTS (SELECT * FROM modelos WHERE nombre = 'Yaris') 
    INSERT INTO modelos (nombre, marca_id) VALUES ('Yaris', (SELECT TOP 1 marca_id FROM marcas WHERE nombre='Toyota'));
IF NOT EXISTS (SELECT * FROM modelos WHERE nombre = 'Mustang') 
    INSERT INTO modelos (nombre, marca_id) VALUES ('Mustang', (SELECT TOP 1 marca_id FROM marcas WHERE nombre='Ford'));
IF NOT EXISTS (SELECT * FROM modelos WHERE nombre = 'Sail') 
    INSERT INTO modelos (nombre, marca_id) VALUES ('Sail', (SELECT TOP 1 marca_id FROM marcas WHERE nombre='Chevrolet'));
IF NOT EXISTS (SELECT * FROM modelos WHERE nombre = 'Versa') 
    INSERT INTO modelos (nombre, marca_id) VALUES ('Versa', (SELECT TOP 1 marca_id FROM marcas WHERE nombre='Nissan'));

-- 5. Especialidades
IF NOT EXISTS (SELECT * FROM especialidades WHERE nombre = 'Frenos') 
    INSERT INTO especialidades (nombre, descripcion) VALUES ('Frenos', 'Especialista en frenos y pastillas');
IF NOT EXISTS (SELECT * FROM especialidades WHERE nombre = 'Motor') 
    INSERT INTO especialidades (nombre, descripcion) VALUES ('Motor', 'Reparación y ajuste general de motor');
IF NOT EXISTS (SELECT * FROM especialidades WHERE nombre = 'Electricidad') 
    INSERT INTO especialidades (nombre, descripcion) VALUES ('Electricidad', 'Diagnóstico eléctrico e inyección');

-- 6. Mecánicos
IF NOT EXISTS (SELECT * FROM mecanicos WHERE nombre = 'Pedro' AND apellido = 'Martínez') 
    INSERT INTO mecanicos (nombre, apellido, especialidad_id, telefono) 
    VALUES ('Pedro', 'Martínez', (SELECT TOP 1 especialidad_id FROM especialidades WHERE nombre='Frenos'), '+56955559999');
IF NOT EXISTS (SELECT * FROM mecanicos WHERE nombre = 'Luis' AND apellido = 'García') 
    INSERT INTO mecanicos (nombre, apellido, especialidad_id, telefono) 
    VALUES ('Luis', 'García', (SELECT TOP 1 especialidad_id FROM especialidades WHERE nombre='Motor'), '+56955558888');
IF NOT EXISTS (SELECT * FROM mecanicos WHERE nombre = 'Andrés' AND apellido = 'Valenzuela') 
    INSERT INTO mecanicos (nombre, apellido, especialidad_id, telefono) 
    VALUES ('Andrés', 'Valenzuela', (SELECT TOP 1 especialidad_id FROM especialidades WHERE nombre='Electricidad'), '+56955557777');

-- 7. Vehículos
IF NOT EXISTS (SELECT * FROM vehiculos WHERE patente = 'AB123CD') 
    INSERT INTO vehiculos (patente, modelo_id, cliente_id, color, anio) 
    VALUES ('AB123CD', (SELECT TOP 1 modelo_id FROM modelos WHERE nombre='Corolla'), (SELECT TOP 1 cliente_id FROM clientes WHERE correo='juan.perez@email.com'), 'Blanco', 2020);
IF NOT EXISTS (SELECT * FROM vehiculos WHERE patente = 'XY987ZT') 
    INSERT INTO vehiculos (patente, modelo_id, cliente_id, color, anio) 
    VALUES ('XY987ZT', (SELECT TOP 1 modelo_id FROM modelos WHERE nombre='Mustang'), (SELECT TOP 1 cliente_id FROM clientes WHERE correo='maria.gonzalez@email.com'), 'Rojo', 2021);
IF NOT EXISTS (SELECT * FROM vehiculos WHERE patente = 'BB456CC') 
    INSERT INTO vehiculos (patente, modelo_id, cliente_id, color, anio) 
    VALUES ('BB456CC', (SELECT TOP 1 modelo_id FROM modelos WHERE nombre='Versa'), (SELECT TOP 1 cliente_id FROM clientes WHERE correo='carlos.soto@email.com'), 'Gris', 2022);

-- 8. Servicios
IF NOT EXISTS (SELECT * FROM servicios WHERE nombre = 'Cambio de pastillas de freno')
    INSERT INTO servicios (nombre, descripcion, costo) VALUES ('Cambio de pastillas de freno', 'Reemplazo de pastillas delanteras y traseras', 45000.00);
IF NOT EXISTS (SELECT * FROM servicios WHERE nombre = 'Afinamiento de motor')
    INSERT INTO servicios (nombre, descripcion, costo) VALUES ('Afinamiento de motor', 'Cambio de bujías, filtros y puesta a punto', 85000.00);
IF NOT EXISTS (SELECT * FROM servicios WHERE nombre = 'Cambio de aceite y filtro')
    INSERT INTO servicios (nombre, descripcion, costo) VALUES ('Cambio de aceite y filtro', 'Aceite 10W-40 sintético y filtro nuevo', 38000.00);

-- 9. Repuestos
IF NOT EXISTS (SELECT * FROM repuestos WHERE nombre = 'Pastillas de freno cerámicas')
    INSERT INTO repuestos (nombre, descripcion, precio, stock) VALUES ('Pastillas de freno cerámicas', 'Juego de pastillas de alto rendimiento', 28000.00, 15);
IF NOT EXISTS (SELECT * FROM repuestos WHERE nombre = 'Filtro de aceite Mann')
    INSERT INTO repuestos (nombre, descripcion, precio, stock) VALUES ('Filtro de aceite Mann', 'Filtro para motor 1.6 - 2.0', 9500.00, 30);
IF NOT EXISTS (SELECT * FROM repuestos WHERE nombre = 'Aceite sintético 5W-30')
    INSERT INTO repuestos (nombre, descripcion, precio, stock) VALUES ('Aceite sintético 5W-30', 'Bidón 4 litros Shell Helix Ultra', 32000.00, 20);

-- 10. Órdenes de Trabajo
IF NOT EXISTS (SELECT * FROM ordenes_trabajo WHERE observaciones LIKE '%Cambio de pastillas%') 
    INSERT INTO ordenes_trabajo (vehiculo_id, cliente_id, mecanico_id, fecha_ingreso, estado, observaciones) 
    VALUES (
        (SELECT TOP 1 vehiculo_id FROM vehiculos WHERE patente='AB123CD'), 
        (SELECT TOP 1 cliente_id FROM clientes WHERE correo='juan.perez@email.com'), 
        (SELECT TOP 1 mecanico_id FROM mecanicos WHERE nombre='Pedro'), 
        '2026-10-15', 
        'En Proceso', 
        'Cambio de pastillas y revisión de discos delanteros'
    );

IF NOT EXISTS (SELECT * FROM ordenes_trabajo WHERE observaciones LIKE '%cascabeleo%') 
    INSERT INTO ordenes_trabajo (vehiculo_id, cliente_id, mecanico_id, fecha_ingreso, estado, observaciones) 
    VALUES (
        (SELECT TOP 1 vehiculo_id FROM vehiculos WHERE patente='XY987ZT'), 
        (SELECT TOP 1 cliente_id FROM clientes WHERE correo='maria.gonzalez@email.com'), 
        (SELECT TOP 1 mecanico_id FROM mecanicos WHERE nombre='Luis'), 
        '2026-10-16', 
        'Pendiente', 
        'Revisión motor por cascabeleo y pérdida de potencia'
    );

IF NOT EXISTS (SELECT * FROM ordenes_trabajo WHERE observaciones LIKE '%preventivo%') 
    INSERT INTO ordenes_trabajo (vehiculo_id, cliente_id, mecanico_id, fecha_ingreso, estado, observaciones) 
    VALUES (
        (SELECT TOP 1 vehiculo_id FROM vehiculos WHERE patente='BB456CC'), 
        (SELECT TOP 1 cliente_id FROM clientes WHERE correo='carlos.soto@email.com'), 
        (SELECT TOP 1 mecanico_id FROM mecanicos WHERE nombre='Andrés'), 
        '2026-10-17', 
        'Completada', 
        'Mantenimiento preventivo 20.000 km y cambio de aceite'
    );
