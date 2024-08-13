from utilityFunctions import *
from SqlQuery import *
import pickle
import pandas as pd
import requests
from flask import Flask, redirect, request, jsonify, url_for, session
import operator
import sqlite3
from flask_mail import Mail, Message
from random import randint
from flask_cors import CORS
from annoy import AnnoyIndex
from dotenv import load_dotenv
import os


load_dotenv()


app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])
app.secret_key = "*&adfcd^secret key"


# Configure the session cookie with SameSite=Lax
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True  # Set to True if you're using HTTPS

# Flask mail configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = os.getenv("email")
app.config['MAIL_PASSWORD'] = os.getenv("pass")
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
mail = Mail(app)


# fetch movies data
conn = db_connection("movies")
cursor = conn.cursor()
cursor.execute(FETCH_ALL_MOVIES)
movies_result = cursor.fetchall()
conn.close()



# Signup page
signup_email = ""
signup_password = ""

@app.route('/signup', methods=['GET','POST'])
def signup():
    global signup_email
    global signup_password
    conn=None
    response=''


    if request.method == 'POST':
        conn = db_connection("users")
        cursor = conn.cursor()

        data = request.get_json()

        if data is None:
            return "No JSON data received", 400
        
        print(data)
        signup_email = data.get('email')
        signup_password = data.get('password')

        sql_query = "SELECT email FROM users WHERE email = ?"
        cursor.execute(sql_query, (signup_email,))
        results = cursor.fetchall()

        if len(results) != 0:
            response = "This email is already registered. Please sign-in."
        else:
            # insert_query = "INSERT INTO users (email, password) VALUES (?, ?)"
            # cursor.execute(insert_query, (signup_email, signup_password))
            # conn.commit()  # Commit the transaction
            session["user"] = signup_email
            print("signup  :-",session)
            session["choices"] = 0
            response = "choices"
            
        conn.close()

    return jsonify({"message":response})


# Signin page
signin_email = ""
@app.route('/signin', methods=['GET','POST'])
def signin():
    global signin_email

    if request.method == 'POST':
        conn = db_connection("users")
        cursor = conn.cursor()
        data = request.get_json()

        signin_email = data.get('email')
        password = data.get('password')

        print(data)
        sql_query = "SELECT email, password FROM users WHERE email = ?"
        cursor.execute(sql_query, (signin_email,))
        results = cursor.fetchall()


        if len(results) == 0:
            response = "This email is not registered. Please sign-up first."
        elif password != results[0][1]:
                response = "Incorrect Password."
        else:
            session["user"] = signin_email
            session["choices"] = 1
            print(session)
            response = "recommendations"

    return jsonify({"message": response})

@app.route('/check_signin', methods=['GET'])
def check_signin():
    if 'user' in session:
        return jsonify({"isSignedIn": True, "user": session["user"]})
    else:
        return jsonify({"isSignedIn": False})


# Choices page
@app.route('/choices', methods=['GET','POST'])
def choices():
    global signup_email
    global movies_result
    print(f"Choice Session data: {session}")
 

    if 'user' in session:
        if 'choices' in session and session['choices']==1:
            return jsonify({"message":recommendations})
        else:
            genre_names = []
            cast_dict = {}
            for row in movies_result:
                mov_gen = list(row[5].split("$"))
                for gen in mov_gen:
                    if gen not in genre_names and gen != '':
                        genre_names.append(gen)

                mov_cast = list(row[7].split("$"))
                for cast in mov_cast:
                    if cast in cast_dict and cast != '':
                        cast_dict[cast] = (cast_dict[cast] + 1)
                    else:
                        cast_dict[cast] = 0

            cast_dict = dict(sorted(cast_dict.items(), key=operator.itemgetter(1), reverse=True))
            cast_names = []
            counter = 0
            for key in cast_dict:
                if counter < 30:
                    cast_names.append(key)
                    counter += 1
                else:
                    break

            return jsonify({'genre_names':genre_names,'cast_names':cast_names})

    else:
        print("Session not found")
        return jsonify({"message":"Session not found"})




movie_names = []
for row in movies_result:
    movie_names.append(row[2])


@app.route('/getByGenre', methods=['GET','POST'])
def getByGenre():
    genre = request.json.get("genre") 
    genre_movies, genre_posters = byGenre(genre, movies_result)
    response = jsonify(
        {"genre_movies": genre_movies}, 
        {"genre_posters": genre_posters}
    )
    return response


@app.route('/getByYear', methods=['GET','POST'])
def getByYear():
    year = request.json.get("year")
    year_movies, year_posters = byYear(year, movies_result)
    response = jsonify(
        {"year_movies": year_movies},
        {"year_posters": year_posters}
    )
    return response


# Recommendations page
@app.route('/recommendations', methods=['POST', 'GET'])
def recommendations():
    global signin_email
    global signup_email

    if 'user' in session:
        conn = db_connection("users")
        cursor = conn.cursor()
        selected_genres = []
        selected_cast = []

        sql_query = " Select selected_genres, selected_cast from users where email= ?"
        cursor.execute(sql_query,(session["user"],))
        results = cursor.fetchall()

        # sign-in
        if results and results[0] and results[0][0] and results[0][1]:
            selected_genres = list(results[0][0].split("$"))
            selected_cast = list(results[0][1].split("$"))
        else:
            genreList = request.get_json().get('genreList', [])
            castList = request.get_json().get('castList', [])
            for i in genreList:
                selected_genres.append(i.replace("-", " "))
            for i in castList:
                selected_cast.append(i.replace("-", " "))

            # insert into database on signup
            sg = ("$".join(selected_genres))
            sc = ("$".join(selected_cast))

            global signup_password

            cursor.execute(INSERT_USER, (signup_email, signup_password, sg, sc))
            conn.commit()
            print(cursor.lastrowid)
            # conn.close()

        choice_movies = byChoice(selected_genres, selected_cast)
        choice_idx = []
        choice_posters = []
        for mov in choice_movies:
            for row in movies_result:
                if row[2] == mov:
                    movie_idx = row[0]
                    movie_id = row[1]
                    break
            choice_idx.append(movie_idx)
            choice_posters.append(fetchBackdrop(movie_id))
        genre_movies, genre_posters = byGenre("Action", movies_result)
        year_movies, year_posters = byYear("2016", movies_result)

        response = {
            'genre_movies': genre_movies,
            'year_movies': year_movies,
            'genre_posters': genre_posters,
            'year_posters': year_posters,
            'choice_idx': choice_idx,
            'choice_posters': choice_posters,
            'movie_names': movie_names,  # Ensure conversion to list
            'movies_result': movies_result
            }
        return jsonify(response)    
    else:
        print("Session not found")
        return jsonify({"message":"Session not found"})


# Movie page
@app.route('/movie/<movie_name>')
def movie(movie_name):
    if "user" in session:
        def recommend(movie):
            for row in movies_result:
                if row[2] == movie:
                    movie_index = row[0]
                    break
            u = AnnoyIndex(5000, 'angular')
            u.load('./model/vectors.ann')
            movies_list = (u.get_nns_by_item(movie_index, 7))[1:7] 

            recommended_movies = []
            movie_posters = []
            for i in movies_list:
                rec_movie_id = movies_result[i][1]
                recommended_movies.append(movies_result[i][2])
                movie_posters.append(fetchPoster(rec_movie_id, movies_result))
            return recommended_movies, movie_posters

        selected_movie = movie_name
        for row in movies_result:
            if row[2] == selected_movie:
                movie_idx = row[0]
                movie_id = row[1]
                break
        recommendations, posters = recommend(selected_movie)
        trailer_key = fetchTrailer(movie_id, movies_result)
        movie_poster = fetchPoster(movie_id, movies_result)


        mov_genre = []
        mov_cast = []
        for row in movies_result:
            mg = list(row[5].split("$"))
            mov_genre.append(mg)
            mc = list(row[7].split("$"))
            mov_cast.append(mc)

        return jsonify({
            'movie_names': movie_names,
            'movies': movies_result,
            'movie_idx': movie_idx,
            'recommendations': recommendations,
            'posters': posters,
            'trailer_key': trailer_key,
            'movie_poster': movie_poster,
            'mov_genre': mov_genre,
            'mov_cast': mov_cast
        })
    else:
        print("Session not found")
        return jsonify({"message": "Session not found"})

# Logout
@app.route('/logout')
def logout():
    session.pop("user", None)
    return jsonify({"message": "Logout successful"})



# otp = ""
# # Forgot page
# @app.route('/forgot', methods=['POST', 'GET'])
# def forgot():
#     global signin_email
#     global otp

#     if request.method == 'POST':
#         conn = db_connection("users")
#         cursor = conn.cursor()

#         signin_email = request.get_json().get('email')

#         sql_query = "SELECT email FROM users WHERE email = ?"
#         cursor.execute(sql_query,(signin_email,))
#         results = cursor.fetchall()
#         conn.close()

#         if len(results) == 0:
#             response = "This email is not registered. <br> Please sign-up first."
#         else:
#             response = "forgot"

#     if response == "forgot":
#         range_start = 10**(6-1)
#         range_end = (10**6)-1
#         otp = randint(range_start, range_end)
#         message = Message("NEW3 OTP for password reset", sender=os.getenv("email"), recipients=[signin_email])
#         message.body = "OTP: "+str(otp)
#         mail.send(message)

#     return response


# # reset page
# @app.route('/reset', methods=['GET','POST'])
# def reset():
#     global otp

#     if request.method == 'POST':
#         num=request.get_json().get('otp')
#         if str(num) == str(otp):
#             response = "valid"
#         else:
#             response = "OTP entered is incorrect"

#     return response


# # change password in database
# @app.route('/change', methods=['GET','POST'])
# def change():
#     global signin_email
#     if request.method == 'POST':
#         newPass = request.get_json().get('password')
#         conn = db_connection("users")
#         cursor = conn.cursor()
#         sql_query = "UPDATE users SET password = ? WHERE email = ?"
#         cursor.execute(sql_query,(newPass,signin_email))
#         conn.commit()
#         conn.close()
#         session["user"] = signin_email
#         session["choices"] = 1

#     return "recommendations"




if __name__ == "__main__":
    app.run()


