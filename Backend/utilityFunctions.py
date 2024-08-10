from SqlQuery import *
import requests
import pickle
import pandas as pd
from flask import Flask,redirect,request,jsonify,url_for,session
import operator
import sqlite3
from flask_mail import Mail, Message
import random
from dotenv import load_dotenv
import os


load_dotenv()
API_KEY = os.getenv("API")

# Database connection
def db_connection(db_name):
    conn = None
    try:
        conn = sqlite3.connect("./model/"+ db_name +".sqlite")
    except sqlite3.Error as e:
        print(e)
    return conn


# Get trailer key
def fetchTrailer(movie_id, movies_result):
    for row in movies_result:
        if row[1] == movie_id:
            movie_index = row[0]
            break;
    key = movies_result[movie_index][12]
    return key


# Get Backdrop image path
def fetchBackdrop(movie_id):
    response = requests.get(
        f'https://api.themoviedb.org/3/movie/{movie_id}?api_key={API_KEY}')
    data = response.json()
    backdrop_path = data.get('backdrop_path')
    if backdrop_path:
        return f"https://image.tmdb.org/t/p/original{backdrop_path}"
    else:
        return None


# Get poster image path
def fetchPoster(movie_id, movies_result):
    for row in movies_result:
        if row[1] == movie_id:
            movie_index = row[0]
            break
    poster = movies_result[movie_index][11]
    return poster


# Get 3 recommended movies based on genres and cast chosen by user
def byChoice(genreList, castList):

    conn = db_connection("choice")
    cursor = conn.cursor()
    cursor.execute(FETCH_ALL_CHOICE)
    results = cursor.fetchall()

    for row in results:
        cf = 0
        mov_cast = list(row[4].split("$"))
        for cast in mov_cast:
            for c in castList:
                if cast == c:
                    cf += 1
        if cf != 0:
            sql_query = "Update choice set castFre = ? where movie_id = ?"
            cursor.execute(sql_query,(str(cf),str(row[1])))

    for row in results:
        gf = 0
        mov_gen = list(row[3].split("$"))
        for gen in mov_gen:
            for g in genreList:
                if gen == g:
                    gf += 1
        if gf != 0:
            sql_query = "Update choice set genFre = ? where movie_id = ?"
            cursor.execute(sql_query,(str(gf),str(row[1])))

    cursor.execute(SORT_BY_CAST)
    results = cursor.fetchall()

    choice_movies = []
    counter = 0
    for row in results:
        if counter != 3:
            choice_movies.append(row[0])
            counter += 1
        else:
            break
    
    conn.commit()
    conn.close()
    return choice_movies

# Get most popular movies in that genre
def byGenre(genre, movies_result):
    counter = 0
    genre_movies = []
    genre_posters = []

    conn = db_connection("popular")
    cursor = conn.cursor()
    cursor.execute(FETCH_GENRES_POPULAR)
    results = cursor.fetchall()

    for row in results:
        if counter != 6:
            mov_gen = list(row[1].split("$"))
            for gen in mov_gen:
                if gen == genre:
                    cursor.execute("Select title from popular where movie_id = '"+str(row[0])+"'")
                    title = cursor.fetchall()
                    genre_movies.append(title[0][0])
                    genre_posters.append(fetchPoster(row[0], movies_result))
                    counter += 1
                    break
        else:
            break

    return genre_movies, genre_posters


# Get most popular movies of that year
def byYear(year, movies_result):
    counter = 0
    year_movies = []
    year_posters = []

    conn = db_connection("popular")
    cursor = conn.cursor()
    cursor.execute(FETCH_DATE_POPULAR)
    results = cursor.fetchall()

    for row in results:
        if counter != 6:
            if year == row[1]:
                cursor.execute("Select title from popular where movie_id = '"+str(row[0])+"'")
                title = cursor.fetchall()
                year_movies.append(title[0][0])
                year_posters.append(fetchPoster(row[0], movies_result))
                counter += 1
        else:
            break

    return year_movies, year_posters