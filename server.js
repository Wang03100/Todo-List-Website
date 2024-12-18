//------------------------ Setup ------------------------//
const express = require('express')
const session = require('express-session')
const app = express()
const port = 4131

// ------------------------ Static Stuff -------------------------//
app.use("/css/main.css", express.static("resources/css/main.css"))
app.use("/images", express.static("resources/images"))
app.use("/js", express.static("resources/js"))
const sql = require('./data');

//------------------------ Middle Ware ---------------------------//
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set("views", "templates");
app.set("view engine", "pug");

//------------------------ Session Middle Ware ---------------------------//
app.use(session({
    secret: 'awdoawijdoaijd jawdijaowjd aijd ajwpdjapod japdjp aj',
    resave: false,
    saveUninitialized: true
}))
//------------------------ Helper Function ---------------------------//
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
                        //----Checking for Session----//
function isAuthenticated (req, res, next) {
    if (req.session.user){
        next()
    }
    else{
        res.status(302)
        res.redirect("/login")
    }
}

//------------------------ Main Page --------------------------//
app.get("/", isAuthenticated, async (req, res)=>{
    const query = (req.query.query ?? "").toLowerCase();
    const category = req.query.category ?? "";
    const status = req.query.status ?? "";
    const list = await sql.getAllTodo(query, category, status, req.session.user);
    //adjusting date to suitable format:
    for (let item of list){
        item.deadline = date(item.deadline);
    }
    res.render("mainpage.pug", {category: await sql.getAllCategory(req.session.user), list: list, "username": req.session.user})
})

//------------------------ Category Related --------------------------//
app.get("/category", isAuthenticated, async (req, res)=>{
    res.render("category.pug", {category: await sql.getAllCategory(req.session.user), "username": req.session.user})
})
                        //----Change Category----//
app.post("/api/changeCat", async (req, res)=>{
    const user = req.session.user;
    const {category = undefined, other = undefined, id = undefined} = req.body
    // form check 1: values exist in req.body
    if (category == undefined || other == undefined || id == undefined){
        res.status(400).send()
    }
    // form check 2: values are of right value
    else if (typeof(category) != "string" || typeof(other) != "string" || typeof(id) != "number"){
        res.status(400).send()
    }
    // everything checks out change category of todo
    else{
        // step 1: Check for Other
        let cat = category;
        if (cat == "Other"){
            if (other == ""){
                cat = "All"
            } 
            else{
                cat = other;
            }
        }
        //step 2: setup JSON
        const data = {id, cat, user}
        //step 3: change
        if (await sql.changCategory(data)){
            res.status(200).send()
        }
        else{
            res.status(404).send()
        }
    }
})
                        //----Delete Category----//
app.delete("/api/delCat", async (req, res)=>{
    const user = req.session.user ?? "";
    const {category = undefined} = req.body
    if (category == undefined || typeof(category) != "string"){
        res.status(400).send()
    }
    else{
        if (await sql.delCategory(category, user)){
            res.status(204).send()
        }
        else{
            res.status(404).send()
        }
    }
})

//------------------------ Todo Related --------------------------//
                        //----Get Todo----//
app.get("/todo/:id", isAuthenticated, async (req, res)=>{
    const user = req.session.user;
    const id = req.params.id;
    const information = await sql.getTodo(id, user);
    if (information == undefined){
        res.render("404.pug", {category: await sql.getAllCategory(user)})
    }
    else{
        information.deadline = date(information.deadline);
        res.render("todo.pug", {category: await sql.getAllCategory(user), information: information, comments: await sql.getAllComment(id), "username": req.session.user})
    }
})
                        //----Add Todo----//
app.post("/api/addTodo", async (req, res)=>{
    // Get data and make it undefined if its not in req.body
    const {name = undefined, time = undefined, description = undefined, category = undefined, other = undefined} = req.body
    const today = date("");
    const user = req.session.user;
    // form check 1: values exist in req.body
    if (name == undefined || time == undefined || description == undefined || category == undefined || other == undefined){
        res.status(400).send()
    }
    // form check 2: values are of right value
    else if (typeof(name) != "string" || typeof(time) != "string" || typeof(description) != "string" || typeof(category) != "string" || typeof(other) != "string"){
        res.status(400).send()
    }
    // form check 3: time and username
    else if(time <= today && await sql.checkUsername(user)){
        res.status(409).send()
    }
    // everything checks out add todo
    else{
        // step 1: Check for Other
        let cat = category;
        if (cat == "Other"){
            if (other == ""){
                cat = "All"
            } 
            else{
                cat = other;
            }
        }
        //step 2: setup JSON
        const data = {name, time, description, cat, user}
        //step 3: add
        if (await sql.addTodo(data)){
            //step 4: redirect: https://expressjs.com/en/api.html#res.redirect
            res.status(302).send()
        }
        else{
            res.status(500).send()
        }
    }
})
                        //----Delete Todo----//
app.delete("/api/delTodo", async (req, res)=>{
    //Step 1: check if todoId is in req and that id is number
    const id = req.body.todoId ?? undefined;
    if (id != undefined && (typeof(id) == "number")){
        //Step 2: Delete
        if (await sql.delTodo(id)){
            res.status(204).send();
        }
        else{
            res.status(404).send();
        }
    }
    //Step 3: 400 if bad jason
    else{
        res.status(400).send()
    }
})
                        //----Change Todo Status----//
app.post("/api/changeStatus", async (req, res)=>{
    //Step 1: check if todoId and status is in req and that id is number and status is string
    const id = req.body.todoId ?? undefined;
    const status = req.body.status ?? undefined;
    if (id != undefined && (typeof(id) == "number") && status != undefined && (typeof(status) == "string")){
        //Step 2: Update Status
        const key = await sql.todoStatusUpdate(id, status);
        const currentStatus = await sql.currentTodoStatus(id)
        if (key && currentStatus !== "Overdue"){
            res.status(202).send();
        }
        else if (key &&  currentStatus === "Overdue"){
            res.status(200).send();
        }
        else{
            res.status(404).send();
        }
    }
    //Step 3: 400 if bad jason
    else{
        res.status(400).send()
    }
})
                        //----Change Todo Description----//
app.post("/api/changeDescTodo", async (req, res)=>{
    const {change = undefined, id = undefined} = req.body
    // form check 1: not exist
    if (change == undefined || id == undefined){
        res.status(400).send()
    }
    // form check 2: not valid data type
    else if (typeof(change) != "string" || typeof(id) != "number"){
        res.status(400).send()
    }
    //everything is all clear
    else{
        if (await sql.changeDescription({change, id})){
            res.status(302).send()
        }
        else{
            res.status(500).send()
        }
    }
})

//------------------------ Comment Related --------------------------//
                        //----Add Comment----//
app.post("/api/addCom", async (req, res)=>{
    const {commentValue = undefined, id = undefined} = req.body
    // form check 1: not exist
    if (commentValue == undefined || id == undefined){
        res.status(400).send()
    }
    // form check 2: not valid data type
    else if (typeof(commentValue) != "string" || typeof(id) != "number"){
        res.status(400).send()
    }
    // form check 3: not an empty string
    else if(commentValue.length == ""){
        res.status(409).send()
    }
    //everything is all clear
    else{
        if (await sql.addComment({commentValue, id})){
            res.status(302).send()
        }
        else{
            res.status(500).send()
        }
    }
})
                        //----Delete Comment----//
app.delete("/api/delCom", async (req, res)=>{
    const {commentValue = undefined, id = undefined} = req.body
    // form check 1: not exist
    if (commentValue == undefined || id == undefined){
        res.status(400).send()
    }
    // form check 2: not valid data type
    else if (typeof(commentValue) != "string" || typeof(id) != "number"){
        res.status(400).send()
    }
    //everything is all clear
    else{
        if (await sql.delComment({commentValue, id})){
            res.status(200).send()
        }
        else{
            res.status(500).send()
        }
    }
})
//------------------------ Login Related --------------------------//
// Login Resource: https://www.npmjs.com/package/express-session#:~:text=(3000)-,User%20login,-A%20simple%20example
                        //----Login Page----//
app.get("/login", async (req, res)=>{
    res.render("login.pug", {"category": await sql.getAllCategory(""), "username": ""})
})
app.get("/account", isAuthenticated, async (req, res)=>{
    const user = req.session.user;
    res.render("account.pug", {"category": await sql.getAllCategory(user), "username": user})
})
                        //----Login Post----//
app.post("/api/login", async (req, res)=>{
    const {username = undefined, password = undefined} = req.body
    //check form 1:
    if (username == undefined || password == undefined){
        res.status(400).send()
    }
    else if (typeof(username) != "string" || typeof(password) != "string"){
        res.status(400).send()
    }
    //validate login
    if (await sql.checkLogin(username, password)){
        //regenerate to prevent session attack
        req.session.regenerate(function (err) {
            if (err) {
                return res.status(500).send();
            }
            else{
                req.session.user = username
            }
            //save session
            req.session.save(function (err) {
                if (err){
                    res.status(500).send();
                }
                else{
                    res.status(302).send();
                }
              })
        })
    }
})
                        //----Register Post----//
app.post("/api/register", async (req, res)=>{
    const {username = undefined, password = undefined} = req.body
    //check form 1:
    if (username == undefined || password == undefined){
        res.status(400).send()
    }
    else if (typeof(username) != "string" || typeof(password) != "string"){
        res.status(400).send()
    }
    //validate login
    if (!(await sql.checkUsername(username)) && await sql.createAccount(username, password)){
        //regenerate to prevent session attack
        req.session.regenerate(function (err) {
            if (err) {
                return res.status(500).send();
            }
            else{
                req.session.user = username
            }
            //save session
            req.session.save(function (err) {
                if (err){
                    res.status(500).send();
                }
                else{
                    res.status(302).send();
                }
            })
        })
    }
    else{
        res.status(409).send();
    }
})
                        //----Log Out----//
app.post("/api/logout", async (req, res)=>{
    //get rid of curren session
    req.session.user = null

    //save
    req.session.save(function (err) {
        if (err){
            res.status(500).send();
        }
        //regenerate to prevent session attack
        req.session.regenerate(function (err) {
            if (err){
                res.status(500).send();
            }
            res.status(302).send();
          })
    })
})
//------------------------ 404 ------------------------//
app.use(async(req, res, next)=>{
    res.status(404)
    res.render("404.pug", {category: await sql.getAllCategory(req.session.user ?? ""), "username": req.session.user})
})

//------------------------ Port Listening ------------------------//
app.listen (port , () => {
    console.log(`Example app listening on port ${port}`)
})