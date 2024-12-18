// this package behaves just like the mysql one, but uses async await instead of callbacks.
const mysql = require(`mysql-await`); // npm install mysql-await

// first -- I want a connection pool: https://www.npmjs.com/package/mysql#pooling-connections
// this is used a bit differently, but I think it's just better -- especially if server is doing heavy work.
var connPool = mysql.createPool({
  connectionLimit: 5, // it's a shared resource, let's not go nuts.
  host: "127.0.0.1",
  user: "user",
  database: "database",
  password: "password"
});

//------------------------ Helper Functions --------------------------//
                        //----Date String Creator----//
// @return: date: String
function date(date){
  let d = new Date();
  if (date.length != 0){
    d = new Date(date);
  }
  let currentTime = "";
  // date and month is smaller then 10
  if (d.getDate() < 10 && d.getMonth() + 1 < 10) {
    currentTime = d.getFullYear() + "-0" + (d.getMonth() + 1) + "-0" + d.getDate();
  }
  //just month is smaller then 10
  else if (d.getMonth() + 1 < 10) {
    currentTime = d.getFullYear() + "-0" + (d.getMonth() + 1) + "-" + d.getDate();
  }
  // date is smaller then 10
  else if (d.getDate() < 10) {
    currentTime = d.getFullYear() + "-" + (d.getMonth() + 1) + "-0" + d.getDate();
  }
  else {
    currentTime = d.getFullYear() + "-"+ (d.getMonth()+1) + "-" + d.getDate();
  }
  return currentTime;
}
                        //----Update Status of Overdue Todo----//
// @return: Nothing
async function checkStatus() {
  const today = date("");
  const result = await connPool.awaitQuery(`
    UPDATE Todo
    SET status = 'Overdue'
    WHERE deadline < ? AND status != 'Done';`, today);
  return result;
}

//------------------------ Todo Related Functions --------------------------//
                        //----Add Todo----//
// @return: bool - if adding was successful or not
async function addTodo(data) {
  const {name, time, description, cat, user} = data;
  const result = await connPool.awaitQuery(`INSERT INTO Todo 
      (name, user, description, category, status, deadline)
    VALUES (?, ?, ?, ?, ?, ?);`, [name, user, description, cat, "Not-Done", time]);
  return result.affectedRows > 0;
}
                        //----Delete Todo----//
// @return: boolean - if delete was successful or not
async function delTodo(id) {
  await connPool.awaitQuery(`DELETE FROM Comments WHERE id=?;`, id);
  const result = await connPool.awaitQuery(`DELETE FROM Todo WHERE id=?;`, id);
  if (result.affectedRows == 0){
    return false
  }
  else{
    return true
  }
}
                        //----get Todo----//
// @return: {id: int, name: str, user: str, description: str, category: str, status: str, deadline: Date} || undefined
async function getTodo(id, user) {
  const result = await connPool.awaitQuery(`SELECT * FROM Todo WHERE id LIKE ? AND user LIKE ?;`, [id, user]);
  if (result.length == 0){
    return undefined;
  }
  return result[0];
}
                        //----get All Todo----//
// @return: [RowDataPacket {id: int, name: str, user: str, description: str, category: str, status: str, deadline: Date}, ...]
async function getAllTodo(query, category, status, user) {
  //ensure overdue are overdue
  await checkStatus()
  //resource: https://www.w3schools.com/sql/func_sqlserver_lower.asp
  const q = "%" + query + "%";
  let c = "";
  (category == "") ? c = "%%" : c = category;
  let s = "";
  (status == "") ? s = "%" + status + "%" : s = status;
  const result = await connPool.awaitQuery(`SELECT * FROM Todo 
    WHERE 
      LOWER(name) LIKE LOWER(?) AND 
      LOWER(category) LIKE LOWER(?) AND 
      user LIKE ? AND
      status LIKE ?
    ORDER BY status DESC, deadline;`, [q, c, user, s]);
  return result;
}
                        //----Todo Status Change----//
// @return: boolean: if status change was successful or not
async function todoStatusUpdate(id, status) {
  const result = await connPool.awaitQuery(`UPDATE Todo SET status=? WHERE id LIKE ?;`, [status, id]);
  if (result.affectedRows == 0){
    return false;
  }
  return true;
}
                        //----Current Todo Status----//
// @return: status: str
async function currentTodoStatus(id) {
  //ensure overdue are overdue
  await checkStatus()
  const result = await connPool.awaitQuery(`SELECT status FROM Todo WHERE id LIKE ?;`, id);
  return result[0].status;
}
                        //----Change Todo Description----//
// @return: boolean - if changing description was successful
async function changeDescription(data) {
  const {change, id} = data;
  const result = await connPool.awaitQuery(`UPDATE Todo SET description = ? WHERE id like ?;`, [change, id]);
  return result.affectedRows>0;
}
//------------------------ Comment Related Functions --------------------------//
                        //----add Comment----//
// @return: bool - if adding comment was successful or not
async function addComment(data) {
  const {commentValue, id} = data;
  const result = await connPool.awaitQuery(`INSERT INTO Comments (id, comment) VALUES (?,?);`, [id, commentValue])
  return result.affectedRows > 0;
}
                        //----Delete Comment----//
// @return: bool - if deleting comment was successful
async function delComment(data) {
  const {commentValue, id} = data;
  const result = await connPool.awaitQuery(`DELETE FROM Comments WHERE comment LIKE ? AND id LIKE ?;`, [commentValue, id])
  return result.affectedRows > 0;
}
                        //----get Comment----//
// @return: [{ id: int, comment: str }, ... ]
async function getAllComment(id) {
  const result = await connPool.awaitQuery(`SELECT * FROM Comments WHERE id like ? ORDER BY comment_id DESC;`, id);
  return result;
}

//------------------------ Category Related Functions --------------------------//
                        //----change Category----//
// @return: bool - if change was successful
async function changCategory(data) {
  const {id, cat, user} = data;
  const result = await connPool.awaitQuery(`UPDATE Todo SET category=? WHERE id=? AND user LIKE ?;`, [cat, id, user])
  return result.affectedRows > 0;
}
                        //----delete Category----//
// @return: boolean - if deleting category was successful or not
async function delCategory(category, user) {
  const result = await connPool.awaitQuery(`UPDATE Todo SET category='All' WHERE LOWER(category) LIKE LOWER(?) AND user LIKE ?;`, [category, user])
  return result.affectedRows > 0;
}
                        //----get All Category----//
// @return: [ RowDataPacket {category: str}, ... ]
async function getAllCategory(user) {
  //resource: https://www.w3schools.com/sql/sql_distinct.asp
  const result = await connPool.awaitQuery("SELECT DISTINCT category FROM Todo WHERE user=?;", user)
  return result;
}
//------------------------ Log In Functions --------------------------//
// @return: boolean - if username exist or not
async function checkUsername(username) {
  const result = await connPool.awaitQuery("SELECT username FROM User WHERE username LIKE ?;", username);
  return result.length > 0;
}
// @return: boolean - if username and password combo are correct
async function checkLogin(username, password) {
  const result = await connPool.awaitQuery("SELECT password FROM User WHERE username LIKE ?;", username);
  return (result.length == 0) ? false : ((password == result[0].password) ? true : false)
}
// @return: boolean - account creation was successful
async function createAccount(username, password) {
  const result = await connPool.awaitQuery("INSERT INTO User VALUES (?, ?);", [username, password]);
  return result.affectedRows > 0;
}

module.exports = {
    addTodo,
    delTodo,
    getTodo,
    getAllTodo,
    todoStatusUpdate,
    changeDescription,
    currentTodoStatus,
    addComment,
    delComment,
    getAllComment,
    changCategory,
    delCategory,
    getAllCategory,
    checkUsername,
    checkLogin,
    createAccount
};