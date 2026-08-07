import Sequelize from 'sequelize'
import pg from 'pg'

const url = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ce2SFnRtOa1v@ep-calm-recipe-aunuocsf-pooler.c-10.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require'

const sequelize = url
    ? new Sequelize(url, {
        dialect: 'postgres',
        dialectModule: pg,
        dialectOptions: {
            ssl: { require: true, rejectUnauthorized: false }
        },
        pool: { max: 2 }
    })
    : new Sequelize('tiendadb', 'postgres', '1234', {
        host: 'localhost',
        port: 5432,
        dialect: 'postgres',
        dialectModule: pg
    });

export default sequelize;