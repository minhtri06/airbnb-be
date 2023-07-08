CREATE TABLE users(  
    user_id int NOT NULL AUTO_INCREMENT,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    user_password VARCHAR(255),
    user_authType VARCHAR(255),
    user_roles VARCHAR(255),
    user_avatar VARCHAR(255),
    user_dateOfBirth VARCHAR(255),
    user_gender VARCHAR(255),
    user_address VARCHAR(255),
    PRIMARY KEY (user_id)
);