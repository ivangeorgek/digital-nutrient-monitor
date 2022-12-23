# myapp

Dynamic web application that will function as a digital nutrient monitor which interacts with users to calculate and display nutritional facts for their recipes/meals based on food ingredients in the recipe/meal.

# R1 - Home Page
Has Navigation to various pages written in index.ejs file 

# R2 - About Page
about.ejs file - displays information about the application

# R3 - Register Page
Display a form to users to add a new user to the database. The form consist of the following items: first name, last name, email address, username, and password - register.ejs page 
To provide security of data in storage, a hashed password should only be saved in the database, not a plain password using bcrypt.

# R4 Login Page
Displays a form with validation where user can provide password and username to login.
This creates a session using express session library and keeps the user logged in.
The entered password is compared using bcrypt library

# R5 Loggout page
The user is logged out using express-session library.
Logout message is displayed.

# R6
Displays a form to users to add food item - validated using express-validator library.
addfood.ejs
Success message is displayed once the food is entered into the database.

# R7 A,B,C Search Food
form for user to search for food item and sends a message if food item cannot be found
Line 25 - main.js

# R8A 
Displays a page that displays the food items created by the currennt logged in user. 
This is done by using the session variable to get the user ID and using it to query the database 
'SELECT * FROM food WHERE username='${req.session.userId}''

# R8B
Since the user has only access to food items that user created, that's the only items that user can update or delete using this page.
User can click on update page of the corresponding row and that will send that row item id dynamically to an edit page
Edit page is a form where the data is populated by querying the database and the user can edit the value for each column for that particular item.
main.js line 164

# R8C
Delete button sends the food items id dynamically to the deleted post method.
This method runs a sql query to delete the item from the database -
main.js line 190

# R9A and R9B
Querys the database and shows all the food items in a tabular format
Has a link to home page.
main.js - line 51

# R10 API
Basic API that displays all foods stored in database as JSON format
Use keyword search to get the corresponding food item from the database
If the keyword does not match any food item in the database, api returns JSON of all the foods stored.
main.js - line 377

# R11 Form Validation 
Validation done using express-validator library
### Food added - main.js
name - not empty
values_per - is english character
units - is numeric
carbs - is a numeric value
fat - is a numeric value
protein - is a numeric value
salt - is a numeric value
sugar - is a numeric value

### Registering Users - main.js
email - is email format
password - minimun 4 characters
username - cannot be empty and must be alphanumeric character
first name - not empty and english character
last name - not empty and english character

### Login
password - minimun 4 characters
username - cannot be empty and must be alphanumeric character 

