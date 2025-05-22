SELECT * FROM wb39.user;

drop table if exists user;
create table user
(
   num  int auto_increment PRIMARY KEY,
   id varchar(20) NOT NULL,
   pass varchar(20) NOT NULL,
   name varchar(20) NOT NULL,
   age int not null
);

select * from user;	
insert into user values(null, 'test', '1234', '홍길동', 20);
insert into user values(null, 'abcd', 'abcd', '김길동', 26);
