const db = require('_helpers/db');

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: _delete
};

// Get all requests (with employee info)
async function getAll() {
  return await db.Request.findAll({
    include: [
      {
        model: db.Employee,
        as: 'employee',
        attributes: ['id', 'employeeId', 'position', 'status'],
        include: [
          {
            model: db.Account,
            as: 'account',
            attributes: ['email', 'firstName', 'lastName', 'role']
          }
        ]
      }
    ]
  });
}

// Get request by ID
async function getById(id) {
  const request = await getRequest(id);
  return request;
}

// Create new request
async function create(params) {
  // make sure employee exists
  const employee = await db.Employee.findByPk(params.employeeId);
  if (!employee) throw 'Employee not found';

  const request = await db.Request.create(params);
  return request;
}

// Update request
async function update(id, params) {
  const request = await getRequest(id);

  Object.assign(request, params);
  request.updated = Date.now();

  await request.save();
  return request;
}

// Delete request
async function _delete(id) {
  const request = await getRequest(id);
  await request.destroy();
}

// Helpers
async function getRequest(id) {
  const request = await db.Request.findByPk(id, {
    include: [{ model: db.Employee, as: 'employee' }]
  });
  if (!request) throw 'Request not found';
  return request;
}
