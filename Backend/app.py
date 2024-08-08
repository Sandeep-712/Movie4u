import pickle
import pandas as pd
import requests
from flask import Flask, request, jsonify,session,url_for
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import operator
import mysql.connector
from flask_mail import Mail, Message
import random

app = Flask(__name__)
CORS(app)
app.secret_key = '#_secret_key'

app.config['Mail_SERVER'] = 'smtp.gmail.com'
app.config['Mail_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = '21adv3cse0148@sageuniversity.in'
app.config['MAIL_PASSWORD'] = 'Sage123@'

mail = Mail(app)    


# database connection
def db_user_connection():
    try:
        conn=mysql.connector.connect ('./models/users.db')
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    return conn


def db_popular_connection():
    conn=None
    try:
        conn=mysql.connector.connect ('./models/popular.db')
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    return conn

def db_choice_connection():
    conn=None
    try:
        conn=mysql.connector.connect ('./models/choice.db')
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    return conn
        
dataset = pickle.load(open('./model/data/dataset.pkl', 'rb'))
movies = pd.DataFrame(dataset)

select = pickle.load(open('choice.pkl', 'rb'))

movie_names = movies['title'].values


signup_email=""
signup_password=""

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        try:
            conn = db_user_connection()
            cursor = conn.cursor()

            data = request.get_json()

            signup_email = data.get('email')
            signup_password = data.get('password')

            if not signup_email or not signup_password:
                return jsonify({'error': 'Email and password are required'}), 400

            sql_query = "SELECT email FROM users WHERE email = %s"
            cursor.execute(sql_query, (signup_email,))
            result = cursor.fetchall()

            if len(result) != 0:
                response = "This email is already registered. Please Sign-in."
            else:
                insert_query = "INSERT INTO users (email, password) VALUES (%s, %s)"
                cursor.execute(insert_query, (signup_email, signup_password))
                conn.commit()  # Commit the transaction
                session['user']=signup_email
                response = "choices"

            cursor.close()
            conn.close()

            return jsonify({'message': response})

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    return jsonify({'message': 'Use POST method to sign up'})



signin_email=""
@app.route('/signin', methods=['GET', 'POST'])
def signin():
    if request.method == 'POST':
        try:
            conn = db_user_connection()
            cursor = conn.cursor()

            data = request.get_json()

            signin_email = data.get('email')
            signin_password = data.get('password')

            if not signin_email or not signin_password:
                return jsonify({'error': 'Email and password are required'}), 400

            sql_query = "SELECT email, password FROM users WHERE email = %s"
            cursor.execute(sql_query, (signin_email,))
            result = cursor.fetchone()

            if result is None:
                response = "This email is not registered. Please Sign-up."
            elif signin_password != result[1]:
                response = "Incorrect password"
            else:
                session['user']=signin_email
                response = "recommendations"

            cursor.close()
            conn.close()

            return jsonify({'message': response})

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    return jsonify({'message': 'Use POST method to sign in'})


genre_names = []
for i in movies['genres']:
    for gen in i:
        if gen not in genre_names:
            genre_names.append(gen)

cast_dict = {}
for row in movies.iterrows():
    for cast in row[1].cast:
        if cast in cast_dict:
            cast_dict[cast] = (cast_dict[cast] + 1)
        else:
            cast_dict[cast] = 0
cast_dict = dict(sorted(cast_dict.items(), key=operator.itemgetter(1), reverse=True))
cast_names = []
counter = 0
for key in cast_dict:
    if counter < 25:
        cast_names.append(key)
        counter += 1
    else:
        break

def byChoice(genreList, castList):
    conn = db_choice_connection()
    cursor = conn.cursor()
    sql_query = "Select * from choice"
    cursor.execute(sql_query)
    results = cursor.fetchall()

    for row in results:
        cf = 0
        mov_cast = list(row[4].split("$"))
        for cast in mov_cast:
            for c in castList:
                if cast == c:
                    cf += 1
        if cf != 0:
            sql_query = "Update choice set castFre = " + str(cf)+" where movie_id = "+str(row[1])
            cursor.execute(sql_query)

    for row in results:
        gf = 0
        mov_gen = list(row[3].split("$"))
        for gen in mov_gen:
            for g in genreList:
                if gen == g:
                    gf += 1
        if gf != 0:
            sql_query = "Update choice set genFre = "+str(gf)+" where movie_id = "+str(row[1])
            cursor.execute(sql_query)

    sql_query = "Select * from choice where (genFre>0 AND castFre >0) order by castFre DESC"
    cursor.execute(sql_query)
    results = cursor.fetchall()

    choice_movies = []
    counter = 0
    for row in results:
        if counter != 3:
            choice_movies.append(row[2])
            counter += 1
        else:
            break

    return choice_movies



def fetchTrailer(movie_id):
    response = requests.get(
        'https://api.themoviedb.org/3/movie/{}/videos?api_key=65669b357e1045d543ba072f7f533bce&language=en-US'.format(
            movie_id))
    data = response.json()
    for vid in data['results']:
        if vid['name'].find("Trailer") != -1:
            return vid['key']
        
def fetchBackdrop(movie_id):
    response = requests.get(
        'https://api.themoviedb.org/3/movie/{}?api_key=65669b357e1045d543ba072f7f533bce&language=en-US'.format(
        movie_id))
    
    data=response.json()
    backdrop_url = "https://image.tmdb.org/t/p/original" + str(data['backdrop_path'])

    print(backdrop_url)
    return backdrop_url

def fetchPoster(movie_id):
    movie_index = movies[movies['movie_id'] == movie_id].index[0]
    poster = movies.iloc[movie_index].poster_path
    return poster



def byGenre(genre):
    counter = 0
    genre_movies = []
    genre_posters=[]

    conn = db_popular_connection()
    cursor = conn.cursor()
    sql_query = "Select movie_id, genres from popular"
    cursor.execute(sql_query)
    results = cursor.fetchall()

    for row in results:
        if counter != 6:
            mov_gen = list(row[1].split("$"))
            for gen in mov_gen:
                if gen == genre:
                    cursor.execute("Select title from popular where movie_id = '"+str(row[0])+"'")
                    title = cursor.fetchall()
                    genre_movies.append(title[0][0])
                    genre_posters.append(fetchPoster(row[0]))
                    counter += 1
                    break
        else:
            break

    return genre_movies, genre_posters

def byYear(year):
    counter = 0
    year_movies = []
    year_posters = []

    conn = db_popular_connection()
    cursor = conn.cursor()
    sql_query = "Select movie_id, release_date from popular"
    cursor.execute(sql_query)
    results = cursor.fetchall()

    for row in results:
        if counter != 6:
            if year == row[1]:
                cursor.execute("Select title from popular where movie_id = '"+str(row[0])+"'")
                title = cursor.fetchall()
                year_movies.append(title[0][0])
                year_posters.append(fetchPoster(row[0]))
                counter += 1
        else:
            break

    return year_movies, year_posters

@app.route('/getByGenre', methods=['POST','GET'])
def getByGenre():
    genre = request.json.get("genre")  # Using request.json.get to access the JSON data

    if not genre:
        return jsonify({"error": "Genre not provided"}), 
    
    genre_movies, genre_posters = byGenre(genre)
    response = {
        "genre_movies": genre_movies,
        "genre_posters": genre_posters
    }
    return jsonify(response)

@app.route('/getByYear', methods=['GET', 'POST'])
def getByYear():
    year = request.json.get("year")

    if not year:
        return jsonify({"error": "Year not provided"}),

    year_movies, year_posters = byYear(year)
    response = {
        "year_movies": year_movies,
        "year_posters": year_posters
    }
    return jsonify(response)



@app.route('/choices', methods=['GET','POST'])
def choices():
    global signup_email

    if 'user' in session and session['user'] == signup_email:

        genre_names = []
        for i in movies['genres']:
            for gen in i:
                if gen not in genre_names:
                    genre_names.append(gen)

        cast_dict = {}
        for row in movies.iterrows():
            for cast in row[1].cast:
                if cast in cast_dict:
                    cast_dict[cast] = (cast_dict[cast] + 1)
                else:
                    cast_dict[cast] = 0
        cast_dict = dict(sorted(cast_dict.items(), key=operator.itemgetter(1), reverse=True))
        cast_names = []
        counter = 0
        for key in cast_dict:
            if counter < 25:
                cast_names.append(key)
                counter += 1
            else:
                break
        return jsonify({'genre_names':genre_names,'cast_names':cast_names})
    else:
        print("Session not found")

@app.route('/movie/<movie_name>')
def movie(movie_name):
    if 'user' in session:
        def recommend(movie):
            movie_index = int(movies[movies['title'] == movie].index[0])
            similar=AnnoyIndex(5000,'angular')
            similar.load('./model/vectors.ann')

            movies_list=(similar.get_nns_by_item(movie_index,7))[1:7]
            recommended_movies = []
            movie_posters = []
            for i in movies_list:
                rec_movie_id = int( movies.iloc[i[i]].movie_id)
                recommended_movies.append(movies.iloc[i[i]].title)
                movie_posters.append(fetchPoster(rec_movie_id))
            return recommended_movies, movie_posters

        selected_movie = movie_name
        movie_idx = int(movies[movies['title'] == selected_movie].index[0])
        movie_id = int(movies.iloc[movie_idx].movie_id)
        recommendations, posters = recommend(selected_movie)
        trailer_key = fetchTrailer(movie_id)
        movie_poster = fetchPoster(movie_id)

        movies_json = movies.astype(object).where(pd.notnull(movies), None).to_dict(orient='records')

        combined_recommendations = [
            {"title": rec, "poster": poster}
            for rec, poster in zip(recommendations, posters)
        ]


        return jsonify({'movie_names':movie_names.tolist(),
                    'movies':movies_json,
                    'movie_idx':movie_idx,
                    'recommendations':combined_recommendations, 
                    'posters':posters, 
                    'trailer_key':trailer_key,
                    'movie_poster':movie_poster
                })
    else:
        print("Session not found")


@app.route('/recommendations', methods=['POST', 'GET'])
def recommendations():
    global signin_email
    global signup_email

    conn=db_user_connection()
    cursor=conn.cursor()
    
    if request.method=='POST':
        genreList = request.get_json().get('genreList', [])
        castList = request.get_json().get('castList', [])
        
        genre_movies, genre_posters = byGenre("Action")
        year_movies, year_posters = byYear("2016")
        
        selected_genres = [i.replace("-", " ") for i in genreList]
        selected_cast = [i.replace("-", " ") for i in castList]

        global signup_email
        global signup_password

        sg=("$".join(selected_genres))
        sc=("$".join(selected_cast))

        sql_query="Insert into users(email,password,selected_genres,selected_cast) value (%s,%s,%s,%s)"
        cursor.execute(sql_query,(signup_email,signup_password,sg,sc))

        conn.commit()
        conn.close()
    
    # sign in
    else:
        sql_query="Select selected_genres,selected_cast from users where email=%s"
        cursor.execute(sql_query,(signin_email,))
        result=cursor.fetchall()
        selected_genres=list(result[0][0].split("$"))
        selected_cast=list(result[0][1].split("$"))

    if 'user' in session:
        choice_movies = byChoice(selected_genres, selected_cast, select)
        choice_idx = []
        choice_posters = []

        for mov in choice_movies:
            movie_idx = movies[movies['title'] == mov].index[0]
            choice_idx.append(int(movie_idx))  # Ensure conversion to regular integer
            movie_id = movies.iloc[movie_idx].movie_id
            choice_posters.append(fetchBackdrop(movie_id))

        response = {
            'genre_movies': genre_movies,
            'year_movies': year_movies,
            'genre_posters': genre_posters,
            'year_posters': year_posters,
            'choice_idx': choice_idx,
            'choice_posters': choice_posters,
            'movie_names': movie_names.tolist()  # Ensure conversion to list
        }
        return jsonify(response)
    
    else:
        print('Session not found')


@app.route('/logout')
def logout():
    return session.pop("user", None)

otp=''
@app.route('/forget', methods=['POST'])
def forget_password():
    global signin_email
    global otp

    if request.method == 'POST':
        conn=db_user_connection()
        cursor=conn.cursor()

        signin_email = request.get_json().get('email')

        sql_query = "SELECT email FROM users WHERE email = %s"
        cursor.execute(sql_query,(signin_email,))
        result=cursor.fetchone()

        if len(result) == 0:
            return jsonify({'message': 'Email does not exist'}), 404
        else:
            response='forget'
    
    if response=='forget':
        otp = random.randint(100000, 999999)
        message=Message('OTP',sender='21adv3cse0148@sageuniversity.in', recipients=[signin_email])
        message.body=f'Your OTP is {str(otp)}'
        mail.send(message)
        return jsonify({'message': 'OTP has been sent to your email'}), 200
    return response
    
        
@app.route('/reset', methods=['POST', 'GET'])
def reset_password():
    global otp

    if request.method == 'POST':
        sms=request.get_json().get('otp')
        if str(sms)==str(otp):
            response = "valid"
        else:
            response = "OTP entered is incorrect"
        
    return response

@app.route('/change', methods=['POST','GET'])
def change_password():
    global signin_email
    
    if request.method == 'POST':
        signup_password = request.get_json().get('password')
        conn=db_user_connection()
        cursor=conn.cursor()
        sql_query = "UPDATE users SET password = %s WHERE email = %s"
        cursor.execute(sql_query,(signup_password,signin_email))
        conn.commit()
        conn.close()
        session["user"] = signin_email

    return jsonify({'recommendations': 'recommendations'}), 200

if __name__ == "__main__":
    app.run()