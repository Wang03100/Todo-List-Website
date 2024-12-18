# Watermelon Todo Website
### Libraries:
1. express
2. express-session
3. mysql-await
4. pug
### Advanced Features:
1. Comments and Description
    * Each Todos has dedicated page via Todo Id
        * Get to Todo by clicking the light green highlighted text on "Name" column in "List" page  
    * Each todo list item has a editable description
        *   Changed by pressing the "Gear" icon then "Change Description" button in dedicated todo page
    * Each todo list item should have a list of comments that can be deleted and created
        * Create comment via form located below the description 
        * Delete via trash icon in comment box
        * Page is refreshed when adding. Deleting causes DOM manipulation
2. Categorization
    * Todo has category
    * Every page should contain a menu letting user choose over all available categories of that user
    * View all todo list items based on their category
        * Filtered via upper nav bar
    * Create category in Todo item page by choosing "Other" in Category drop down located left of "Description"
    * Delete category via a category page by clicking "Category" in upper nav
    * Changing or Deleting Category is user based and will not affect other user's todo list
3. Deadlines
    * All todo items have a deadline
    * You can sort all todo list items by their deadline - List Page is filtered by upcoming deadlines
    * You can view a list containing only overdue todo list items: "Overdue" table in "List" page
## Initialization of Website
1. Run on local Machine
2. In terminal type "npm install" to install all library
3. In terminal type "node server.js"
4. Go to "http://localhost:4131/"
5. Will automatically redirect you too "http://localhost:4131/login"
6. Sign in or Create an account
    a. Account: {Username: "admin", Password: "secretsafepassword"}
    b. You can also create an account to mess around
7. Redirect you to "http://localhost:4131/" - List Page
    a. List page related features:
    b. Tables are filtered on deadlines with closet deadline on top
    c. Adding Todo: Plus Icon located left and below of "Up Coming List" Header
    d. Delete Todo: Trash Icon located right of todo item
    e. Selecting "Other" in Category will reveal a text input for custom category
    f. Form accepts date further then "today". 
    g. Pressing "Minus" icon hides form and clears it
    h. Check mark changes todo item status asynchronously 
    i. If todo is overdue and you check mark it then it will move down to "Up Coming List"
8. Click light green highlighted text to go to dedicated todo item page
    a. Read advanced features 1 and 2 for todo item page features
    b. Summary Feature: Change Category, Edit Description, Add and Delete Comments
9. Click "Category" on Navigation bar
    a. page of all existing categories for that user
    b. Delete category via trash icon in table
        - This updates todo of that category to be "All"
10. Logout:
    a. Click username on top right which will bring you to "http://localhost:4131/account"
    b. Click "Sign Out"

# Known Bugs:
### List Page:
    1. Checking an todo item will move it to the bottom but unchecking will cause it to stay
        a. Refreshing it will move it to the right place
### Most Category Drop Down:
    1. Sometimes "All" will appear along with "All Category" in category drop down
        a. No fix yet 
    
