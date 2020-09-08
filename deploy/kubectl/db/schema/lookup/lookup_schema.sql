create table comments_seq(id int, next_id bigint, cache bigint, primary key(id)) comment 'vitess_sequence';
create table comment_likes_seq(id int, next_id bigint, cache bigint, primary key(id)) comment 'vitess_sequence';
create table video_likes_seq(id int, next_id bigint, cache bigint, primary key(id)) comment 'vitess_sequence';
create table subscriptions_seq(id int, next_id bigint, cache bigint, primary key(id)) comment 'vitess_sequence';
create table trending_seq(id int, next_id bigint, cache bigint, primary key(id)) comment 'vitess_sequence';

insert into comments_seq(id, next_id, cache) values(0, 1000, 100);
insert into comment_likes_seq(id, next_id, cache) values(0, 1000, 100);
insert into video_likes_seq(id, next_id, cache) values(0, 1000, 100);
insert into subscriptions_seq(id, next_id, cache) values(0, 1000, 100);
insert into trending_seq(id, next_id, cache) values(0, 1000, 100);
