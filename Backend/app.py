import pickle
import numpy as np
import pandas as pd
import requests
import flask
import ast
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS, cross_origin
import operator

app = Flask(__name__)
CORS(app)

dataset = pickle.load(open('dataset.pkl', 'rb'))
movies = pd.DataFrame(dataset)

similarity = pickle.load(open('similarity.pkl', 'rb'))
popular = pickle.load(open('popular.pkl', 'rb'))
select = pickle.load(open('select.pkl', 'rb'))

movie_names = movies['title'].values

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

def byChoice(genres, castList, obj):
    choice = obj.copy()

    def byChoiceCast():
        cast_fre = []
        for row in choice.iterrows():
            castFre = 0
            for cast in row[1].cast:
                for item in castList:
                    if cast == item:
                        castFre += 1
            cast_fre.append(castFre)
        return cast_fre

    choice['cast_fre'] = byChoiceCast()
    choice = choice[choice['cast_fre'] != 0]

    def byChoiceGenre():
        gen_fre = []
        for row in choice.iterrows():
            genFre = 0
            for gen in row[1].genres:
                for item in genres:
                    if gen == item:
                        genFre += 1
            gen_fre.append(genFre)
        return gen_fre

    choice['gen_fre'] = byChoiceGenre()
    choice = choice[choice['gen_fre'] != 0]

    choice = choice.sort_values('cast_fre', ascending=False)

    choice_movies = []
    counter = 0
    for mov in choice.iterrows():
        if counter != 3:
            choice_movies.append(mov[1].title)
            counter += 1
        else:
            break
    return choice_movies

@app.route('/choices', methods=['GET','POST'])
def choices():

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


def fetchTrailer(movie_id):
    response = requests.get(
        'https://api.themoviedb.org/3/movie/{}/videos?api_key=65669b357e1045d543ba072f7f533bce&language=en-US'.format(
            movie_id))
    data = response.json()
    for vid in data['results']:
        if vid['name'].find("Trailer") != -1:
            return vid['key']

def fetchPoster(movie_id):
    movie_index = movies[movies['movie_id'] == movie_id].index[0]
    poster = movies.iloc[movie_index].poster_path
    return poster

@app.route('/movie/<movie_name>')
def movie(movie_name):
    def recommend(movie):
        movie_index = movies[movies['title'] == movie].index[0]
        distances = similarity[movie_index]
        movies_list = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:7]

        recommended_movies = []
        movie_posters = []
        for i in movies_list:
            rec_movie_id = movies.iloc[i[0]].movie_id
            recommended_movies.append(movies.iloc[i[0]].title)
            movie_posters.append(fetchPoster(rec_movie_id))
        return recommended_movies, movie_posters

    selected_movie = movie_name
    movie_idx = movies[movies['title'] == selected_movie].index[0]
    movie_id = movies.iloc[movie_idx].movie_id
    recommendations, posters = recommend(selected_movie)
    trailer_key = fetchTrailer(movie_id)
    movie_poster = fetchPoster(movie_id)

    return render_template("movie.html", movie_names=movie_names, movies=movies, movie_idx=movie_idx, recommendations=recommendations, posters=posters, trailer_key=trailer_key, movie_poster=movie_poster)

def byGenre(genre):
    counter = 0
    genre_movies = []
    for row in popular.iterrows():
        if counter != 6:
            for gen in row[1].genres:
                if gen == genre:
                    genre_movies.append(row[1].title)
                    counter += 1
                    break
        else:
            break

    genre_posters = []
    for i in genre_movies:
        movie_index = movies[movies['title'] == i].index[0]
        movie_id = movies.iloc[movie_index].movie_id
        genre_posters.append(fetchPoster(movie_id))

    return genre_movies, genre_posters

def byYear(year):
    counter = 0
    year_movies = []
    for row in popular.iterrows():
        if row[1].release_date == year:
            if counter != 6:
                year_movies.append(row[1].title)
                counter = counter + 1
            else:
                break

    year_posters = []
    for i in year_movies:
        movie_index = movies[movies['title'] == i].index[0]
        movie_id = movies.iloc[movie_index].movie_id
        year_posters.append(fetchPoster(movie_id))

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

@app.route('/recommendations', methods=['POST', 'GET'])
def recommendations():
    genre_movies, genre_posters = byGenre("Action")
    year_movies, year_posters = byYear("2016")

    genreList = request.get_json().get('genreList', [])
    castList = request.get_json().get('castList', [])

    selected_genres = [i.replace("-", " ") for i in genreList]
    selected_cast = [i.replace("-", " ") for i in castList]

    choice_movies = byChoice(selected_genres, selected_cast, select)
    choice_idx = []
    choice_posters = []

    for mov in choice_movies:
        movie_idx = movies[movies['title'] == mov].index[0]
        choice_idx.append(int(movie_idx))  # Ensure conversion to regular integer
        movie_id = movies.iloc[movie_idx].movie_id
        choice_posters.append(fetchPoster(movie_id))

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

if __name__ == "__main__":
    app.run()
