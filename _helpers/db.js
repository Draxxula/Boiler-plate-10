const config = require('config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    // create db if it doesn't already exist
    const { host, port, user, password, database } = config.database;
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

    // connect to db
    const sequelize = new Sequelize(database, user, password, { 
        host,
        port,
        dialect: 'mysql',
        logging: console.log   // 🔹 shows SQL queries (so you’ll see CREATE TABLE …)
    }); 

    
    // init models and add them to the exported db object
    db.Account = require('../accounts/account.model')(sequelize);
    db.RefreshToken = require('../accounts/refresh-token.model')(sequelize);
    db.Department = require('../departments/department.model')(sequelize);
    db.Employee = require('../employees/employee.model')(sequelize);
    db.Request = require('../requests/request.model')(sequelize);

    db.sequelize = sequelize;
    db.Sequelize = Sequelize;

    // define relationships
    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);

    //acount and employee one-to-one relationship
    db.Account.hasOne(db.Employee, { foreignKey: 'accountId', onDelete: 'CASCADE' });
    db.Employee.belongsTo(db.Account, { foreignKey: 'accountId' });

    //department and employee one-to-many relationship
    db.Department.hasMany(db.Employee, { as: 'employees', foreignKey: 'departmentId', onDelete: 'CASCADE' });
    db.Employee.belongsTo(db.Department, { as: 'department', foreignKey: 'departmentId' });

    //request and employee many-to-one relationship
    db.Employee.hasMany(db.Request, { foreignKey: 'employeeId', onDelete: 'CASCADE' });
    db.Request.belongsTo(db.Employee, { foreignKey: 'employeeId' });


    // sync departments first
    await db.Department.sync();
    // then employees
    await db.Employee.sync();
    // then accounts and refresh tokens
    await db.Account.sync();
    await db.RefreshToken.sync();
    // then requests
    await db.Request.sync();
    // sync all models with database
    await sequelize.sync({ alter: true });
}