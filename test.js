const odbc = require('odbc');

async function testConnection() {
    try {
        // Conexión con contraseña correctamente formateada
        const connectionString = "Driver={Microsoft Access Driver (*.mdb, *.accdb)};" +
                               "DBQ=\\\\srv2kas\\Base Deposito Polizas\\PolizasDiarioLP.mdb;" +
                               "PWD=a9TnX13HHOo;"; // Usa PWD para contraseña en ODBC

        console.log("Intentando conectar con:", connectionString);
        
        const connection = await odbc.connect(connectionString);
        console.log("✅ Conexión exitosa");
        
        const result = await connection.query("SELECT TOP 1 * FROM POLIG2");
        console.log("Resultados:", result);
        
        await connection.close();
    } catch (error) {
        console.error("❌ Error de conexión:");
        
        if (error.odbcErrors) {
            error.odbcErrors.forEach(err => {
                console.error(`Código: ${err.code}, Estado: ${err.state}, Mensaje: ${err.message}`);
            });
        } else {
            console.error(error);
        }
    }
}

testConnection();