FETCH_ALL_MOVIES='Select * from movies'
INSERT_USER='Insert into users(email,password,selected_genres,selected_cast) value (?,?,?,?)'
FETCH_ALL_CHOICE = "Select * from choice"
SORT_BY_CAST='Select title from choice where (genFre>0 AND castFre>0) order by castFre DESC'
FETCH_GENRES_POPULAR='Select movie_id, genres from popular'