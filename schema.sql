-- Data type: https://www.w3schools.com/sql/sql_datatypes.asp
CREATE TABLE Todo (
    id INT AUTO_INCREMENT,
    name TEXT NOT NULL,
    user VARCHAR(255) NOT NULL,
    description TEXT,
    category TEXT,
    status TEXT,
    deadline DATE,
    PRIMARY KEY(id),
    FOREIGN KEY (user) REFERENCES User(username)
);

CREATE TABLE Comments (
    id INT NOT NULL,
    comment TEXT,
    comment_id INT AUTO_INCREMENT,
    PRIMARY KEY(comment_id),
    FOREIGN KEY (id) REFERENCES Todo(id)
);

CREATE TABLE User (
    username VARCHAR(255) NOT NULL,
    password TEXT NOT NULL,
    PRIMARY KEY(username)
);
