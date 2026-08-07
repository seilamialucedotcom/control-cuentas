import app from './app.js'; // Importamos la app que configuramos arriba
import sequelize from './src/config/database.js';

// Función para validar conexión (usada en Vercel)
let dbConnected = false;
async function ensureDatabaseConnection() {
    if (!dbConnected) {
        try {
            await sequelize.authenticate();
            console.log('Conexión a la base de datos establecida correctamente');
            dbConnected = true;
        } catch (error) {
            console.error('Error conectando a la base de datos:', error);
            throw error;
        }
    }
}

// Función para arranque local
async function main() {
    try {
        // En local, sincronizamos los modelos
        await sequelize.sync({ alter: true });
        console.log('Base de datos Sincronizada!');

        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log('Server is running on port: ' + port);
        });
    } catch (error) {
        console.log(error);
    }
}

// Lógica de detección: Vercel vs Local
if (process.env.VERCEL) {
    // Si estamos en Vercel, exportamos app para que Vercel la gestione
    app.use(async (req, res, next) => {
        await ensureDatabaseConnection();
        next();
    });
} else {
    // Si estamos en tu PC, ejecutamos main()
    main();
}
export default app; 