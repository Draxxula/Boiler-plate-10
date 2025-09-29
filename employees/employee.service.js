const db = require('_helpers/db');

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: _delete
};

// Get all employees
async function getAll() {
  return await db.Employee.findAll({
    include: [
      { model: db.Account, attributes: ['id','email', 'role', 'status', 'firstName', 'lastName'] },
      { model: db.Department, as: 'department', attributes: ['id', 'name'] }
    ]
  });
}

// Get employee by ID
async function getById(id) {
  const employee = await db.Employee.findByPk(id, {
    include: [
      { model: db.Account, as: 'account', attributes: ['id','email', 'firstName', 'lastName'] },
      { model: db.Department, as: 'department', attributes: ['id', 'name'] }
    ]
  });

  if (!employee) throw "Employee not found";
  return employee; // <-- return full object, not basicDetails
}

// Create new employee
async function create(params) {
  // make sure account exists
  const account = await db.Account.findByPk(params.accountId);
  if (!account) throw 'Account not found';

  // create employee
  const employee = await db.Employee.create(params);
  return employee;
}

// Update employee
async function update(id, params) {
  const employee = await getEmployee(id);

  // Check for duplicate email if updating
  if (
    params.email &&
    employee.email !== params.email &&
    (await db.Employee.findOne({ where: { email: params.email } }))
  ) {
    throw `Email "${params.email}" is already taken`;
  }

  Object.assign(employee, params);
  employee.updated = Date.now();

  await employee.save();

   // Re-fetch employee with relations
  return await db.Employee.findByPk(id, {
    include: [
      { model: db.Account, as: 'account', attributes: ['id', 'email', 'firstName', 'lastName'] },
      { model: db.Department, as: 'department', attributes: ['id', 'name'] }
    ]
  });

  //return basicDetails(employee);
}

// Delete employee
async function _delete(id) {
  const employee = await getEmployee(id);
  await employee.destroy();
}

// Helpers
async function getEmployee(id) {
  const employee = await db.Employee.findByPk(id);
  if (!employee) throw "Employee not found";
  return employee;
}

function basicDetails(employee) {
  const { id, employeeId, email, position, hireDate, department } = employee;
  return { id, employeeId, email, position, hireDate, department };
}