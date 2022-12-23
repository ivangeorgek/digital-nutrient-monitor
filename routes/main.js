module.exports = function (app, recipeAppData) {

    const redirectLogin = (req, res, next) => {
        if (!req.session.userId) {
            res.redirect('./login')
        } else { next(); }
    }

    const { check, validationResult } = require('express-validator')

    // Handle our routes
    app.get('/', function (req, res) {
        res.render('index.ejs', recipeAppData)
    });

    app.get('/about', function (req, res) {
        res.render('about.ejs', recipeAppData);
    });

    // R7A - Form for users to search for food
    app.get('/search', redirectLogin, function (req, res) {
        res.render("search.ejs", recipeAppData);
    });

    // R7B & R7C - Database query with form data
    app.get('/search-result', [
        check("keyword")
            .notEmpty()
            .withMessage("keyword should not be empty")
    ],
        function (req, res) {
            const valErrors = validationResult(req);
            if (!valErrors.isEmpty()) {
                res.redirect('./search');
            }
            else {
                //searching in the database
                let sqlquery = "SELECT * FROM food WHERE food_name LIKE '%" + req.sanitize(req.query.keyword) + "%'";
                // execute sql query
                db.query(sqlquery, (err, result) => {
                    if (err) {
                        res.redirect('./');
                    }
                    if (result.length == 0) {
                        res.send("Food item does not exist")
                    }
                    else {
                        let newData = Object.assign({}, recipeAppData, { availableFoods: result });
                        console.log(newData)
                        res.render("list.ejs", newData)
                    }
                });
            }
        });


    // R9A and R9B - List the food items , no login required.
    app.get('/list', function (req, res) {
        // query database to get all the books
        let sqlquery = "SELECT * FROM food";
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            let newData = Object.assign({}, recipeAppData, { availableFoods: result });
            console.log(newData)
            res.render("list.ejs", newData)
        });
    });

    //R6A - Form for users to add food - Access limited to logged in users
    app.get('/addfood', redirectLogin, function (req, res) {
        res.render('addfood.ejs', recipeAppData);
    });

    //R6B - Form data is stored in the backend
    app.post('/foodadded', [
        //Every input in the form is validated
        check('name')
            .notEmpty()
            .withMessage("The input value should not be empty"),
        check('values')
            .isNumeric()
            .withMessage("Values should be a number"),
        check('units')
            .isAlpha()
            .withMessage("Units should be english character"),
        check('carbs')
            .isNumeric()
            .withMessage("carbs should be a number"),
        check('fat')
            .isNumeric()
            .withMessage("fat should be a number"),
        check('protein')
            .isNumeric()
            .withMessage("protein should be a number"),
        check('salt')
            .isNumeric()
            .withMessage("salt should be a number"),
        check('sugar')
            .isNumeric()
            .withMessage("sugar should be a number")
    ],
        function (req, res) {
            const valErrors = validationResult(req);
            console.log(valErrors)
            if (!valErrors.isEmpty()) {
                res.redirect('./addfood');
            }
            else {
                let sqlquery = "INSERT INTO food (food_name, values_per, units, carbs, fat, protein, salt, sugar, username) VALUES (?,?,?,?,?,?,?,?,?)";
                // Sanitized input stored in newrecord
                let newrecord = [req.sanitize(req.body.name),
                req.sanitize(req.body.values),
                req.sanitize(req.body.units),
                req.sanitize(req.body.carbs),
                req.sanitize(req.body.fat),
                req.sanitize(req.body.protein),
                req.sanitize(req.body.salt),
                req.sanitize(req.body.sugar),
                req.session.userId
                ];
                // execute sql query
                db.query(sqlquery, newrecord, (err, result) => {
                    if (err) {
                        return console.error(err.message);
                    }
                    else
                        // R6C - If successful Displays a message
                        res.send(' This food is added to database: ' + req.sanitize(req.body.name) + "<br><a href=./>Home</a>");
                });
            }
        });

    // R8A - Displays a page containing food items created by the current logged in user
    app.get('/update', redirectLogin, function (req, res) {
        let sqlquery = `SELECT * FROM food WHERE username='${req.session.userId}'`;
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            let newData = Object.assign({}, recipeAppData, { availableFoods: result });
            console.log(newData)
            res.render("update.ejs", newData)
        });
    });

    // R8 B - Edit page for update
    app.get('/edit/:id', redirectLogin, (req, res) => {
        // Extracts the dynamic id from request
        let id = req.params.id;
        let sqlquery = `SELECT * FROM food WHERE id='${id}'`;
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            let newData = Object.assign({}, recipeAppData, { availableFoods: result });
            res.render("edit.ejs", newData)
        });
    })

    // R8 B - Update - backend 
    app.post('/updated', function (req, res) {
        // saving data in database
        let sqlquery = "UPDATE food SET values_per=?, units=?, carbs=?, fat=?, protein=?, salt=?, sugar=? WHERE food_name =?";
        // execute sql query
        // Sanitized input stored in newrecord
        let newrecord = [
            req.sanitize(req.body.values),
            req.sanitize(req.body.units),
            req.sanitize(req.body.carbs),
            req.sanitize(req.body.fat),
            req.sanitize(req.body.protein),
            req.sanitize(req.body.salt),
            req.sanitize(req.body.sugar),
            req.sanitize(req.body.name)
        ];
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
                return console.error(err.message);
            }
            else
                res.send(' This food data is updated: ' + req.sanitize(req.body.name) + "<br><a href=./>Home</a>");
        });
    });

    // R8 C - Delete functionality
    app.get('/delete/:id', redirectLogin, (req, res) => {
        // Extracts the dynamic id from request
        let id = req.params.id;
        let sqlquery = `DELETE FROM food WHERE id='${id}'`
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            res.send("data has been deleted")
        });
    })

    app.get('/register', function (req, res) {
        res.render('register.ejs', recipeAppData);
    });

    //R3 - Register page
    app.post('/registered', [
        check('email')
            .isEmail()
            .withMessage("The input value should be email"),
        check('password')
            .isLength({ min: 4 })
            .withMessage("Password should be 8 characters"),
        check('username')
            .notEmpty()
            .withMessage("username cannot be left empty")
            .isAlphanumeric()
            .withMessage("username should be letters or numbers"),
        check('first')
            .notEmpty()
            .withMessage("first cannot be empty")
            .isAlpha()
            .withMessage("first name should be english character"),
        check('last')
            .notEmpty()
            .withMessage("last cannot be empty")
            .isAlpha()
            .withMessage("first name should be english character")
    ],
        function (req, res) {
            // Hashing password
            const bcrypt = require('bcrypt');
            const saltRounds = 10;
            //Password Sanitization
            const plainPassword = req.sanitize(req.body.password);
            //Store errors from req validation into valErrors
            const valErrors = validationResult(req);
            console.log(valErrors)
            if (!valErrors.isEmpty()) {
                res.redirect('./register');
            }
            else {
                bcrypt.hash(plainPassword, saltRounds, function (hashErr, hashedPassword) {
                    // Store hashed password in your database.
                    let sqlquery = "INSERT INTO users (username, first_name, last_name, email, hashedPassword) VALUES (?,?,?,?,?)";
                    let newRecord = [req.sanitize(req.body.username),
                    req.sanitize(req.body.first),
                    req.sanitize(req.body.last),
                    req.sanitize(req.body.email),
                        hashedPassword];
                    console.log(newRecord);
                    db.query(sqlquery, newRecord, (queryErr, result) => {
                        if (queryErr) {
                            res.redirect('./');
                            console.error(queryErr);
                        }
                        result = 'Hello ' + req.sanitize(req.body.first) + ' ' + req.sanitize(req.body.last) + ' you are now registered! We will send an email to you at ' + req.sanitize(req.body.email);
                        result += 'Your password is: ' + plainPassword + ' and your hashed password is: ' + hashedPassword;
                        result += "<br><a href=./>Home</a>"
                        res.send(result);
                    });
                })
            }

        });


    // Shows all the users as a list to the loggedin users
    app.get('/listusers', redirectLogin, (req, res) => {
        let sqlquery = "SELECT * FROM users";
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            let newData = Object.assign({}, recipeAppData, { availableUsers: result });
            console.log("This is the new data", newData)
            res.render("listusers.ejs", newData)
        });
    })


    app.get('/login', function (req, res) {
        res.render('login.ejs', recipeAppData);
    });

    //R4
    app.post('/loggedin', [
        check('password')
            .isLength({ min: 4 })
            .withMessage("Password should be 4 characters"),
        check('username')
            .notEmpty()
            .withMessage("username cannot be left empty")
            .isAlphanumeric()
            .withMessage("username should be letters or numbers")],
        function (req, res) {
            const valErrors = validationResult(req);
            console.log(valErrors)
            if (!valErrors.isEmpty()) {
                res.redirect('./login');
            }
            else {
                const bcrypt = require('bcrypt');
                const plainPassword = req.sanitize(req.body.password);
                let hash = ""; //Stores the retrieved hashed password from database

                //Database query to find hash for the corresponding username
                let sqlquery = `SELECT hashedPassword FROM users WHERE username="${req.sanitize(req.body.username)}"`
                db.query(sqlquery, (queryErr, queryResult) => {
                    //If username does not exist - database returns an empty array
                    if (queryResult.length == 0) {
                        res.send("Username does not exist")
                    }
                    else {
                        //Extracting hash from sql query result data structure
                        hash = queryResult[0].hashedPassword
                        //Comparing the entered password with hashed value using bcrypt
                        bcrypt.compare(plainPassword, hash, function (bcryptErr, result) {
                            if (bcryptErr) {
                                res.redirect('./');
                                console.error(bcryptErr);
                            }
                            else if (result) { //Password matched : result == true
                                req.session.userId = req.sanitize(req.body.username);
                                res.send("You are now logged in. <br><a href=./>Home</a>")
                            }
                            else {
                                res.send("The password you entered is wrong <a href=./>Home</a>");
                            }
                        });
                    }
                });
            }
        })

    // R5
    app.get('/logout', redirectLogin, (req, res) => {
        req.session.destroy(err => {
            if (err) {
                return res.redirect('./')
            }
            res.send('you are now logged out. <br><a href=./>Home</a>');
        })
    })


    //R10 - API
    app.get('/api', function (req, res) {
        // Query database to get all the foods
        let search_keyword = req.sanitize(req.query.keyword);
        console.log(search_keyword);
        // If user provides a valid keyword 
        if (search_keyword !== undefined) {
            let sqlquery = "SELECT * FROM food WHERE food_name LIKE '%" + search_keyword + "%'";
            // execute sql query
            db.query(sqlquery, (err, result) => {
                if (err) {
                    res.redirect('./');
                }
                let newData = Object.assign({}, recipeAppData, { availableBooks: result });
                console.log(newData)
                res.render("list.ejs", newData)
            });
        }
        else {
            //No keyword provided - JSON result of the books
            let sqlquery = "SELECT * FROM food";
            // Execute the sql query
            db.query(sqlquery, (err, result) => {
                if (err) {
                    res.redirect('./');
                }
                // Return results as a JSON object
                res.json(result);
            });
        }
    });

}
