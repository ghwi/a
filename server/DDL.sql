SELECT * FROM wb39.user;

drop table if exists user;
create table user
(
   num  INT auto_increment PRIMARY KEY,
   id varchar(100) NOT NULL,
   pass varchar(100) NOT NULL,
   name varchar(100) NOT NULL, 
   age INT NOT NULL
);
drop table if exists pr_codes;
CREATE TABLE pr_codes (
    code VARCHAR(100) PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

select * from user;	