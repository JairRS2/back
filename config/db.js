require("dotenv").config();
const sql = require("mssql");
const odbc = require("odbc"); // Importar odbc

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    port: 1433,
    options: {
        encrypt: false,
        enableArithAbort: true,
    },
};

// Pools de SQL Server
const poolAlmacen = new sql.ConnectionPool({
    ...config,
    database: process.env.DB_DATABASE_ALMACEN,
});

const poolProveedores = new sql.ConnectionPool({
    ...config,
    database: process.env.DB_DATABASE_PROVEEDORES,
});

const poolUREA = new sql.ConnectionPool({
    ...config,
    database: process.env.DB_DATABASE_UREA,
});

// Pool para Access
const connectionString = "Driver={Microsoft Access Driver (*.mdb, *.accdb)};" +
"DBQ=\\\\srv2kas\\Base Deposito Polizas\\PolizasDiarioLP.mdb;" +
"PWD=a9TnX13HHOo;"; // Usa PWD para contraseña en ODBC // ¡AJUSTA ESTO!
let accessConnection = null; // Usaremos una conexión directa en lugar de un poolss

async function connectToDatabases() {
    try {
        await poolAlmacen.connect();
        console.log("✅ Conexión a dbAlmacen (SQL Server) exitosa");

        await poolProveedores.connect();
        console.log("✅ Conexión a dbProveedores (SQL Server) exitosa");

        await poolUREA.connect();
        console.log("✅ Conexión a dbUREA (SQL Server) exitosa");

        try {
            accessConnection = await odbc.connect(connectionString); // Conectar a Access
            console.log("✅ Conexión a Access exitosa");
        } catch (accessError) {
            console.error("❌ Error al conectar a Access:", accessError);
            // Decide si quieres continuar sin la conexión a Access o no.
            // Si es crítico, puedes lanzar el error para que se detenga la aplicación.
            // throw accessError; 
        }

    } catch (error) {
        console.error("❌ Error al conectar a las bases de datos:", error);
    }
}

connectToDatabases();

process.on("SIGINT", async () => {
    try {
        await poolAlmacen.close();
        await poolProveedores.close();
        await poolUREA.close();
        if (accessConnection) await accessConnection.close(); // Cerrar Access si está conectado
        console.log("Conexiones cerradas correctamente");
        process.exit(0);
    } catch (error) {
        console.error("Error al cerrar conexiones:", error);
        process.exit(1);
    }
});

module.exports = { poolAlmacen, poolProveedores, poolUREA, poolAccess: accessConnection }; // Exportar la conexión directa