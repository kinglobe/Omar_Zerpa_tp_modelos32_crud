const { response } = require('express');
const db = require('../database/models');
const sequelize = db.sequelize;
const moment = require('moment')

//Otra forma de llamar a los modelos
const Movies = db.Movie;

const moviesController = {
    'list': (req, res) => {
        db.Movie.findAll()
            .then(movies => {
                res.render('moviesList.ejs', { movies })
            })
    },
    'detail': (req, res) => {
        db.Movie.findByPk(req.params.id)
            .then(movie => {
                res.render('moviesDetail.ejs', { movie });
            });
    },
    'new': (req, res) => {
        db.Movie.findAll({
            order: [
                ['release_date', 'DESC']
            ],
            limit: 5
        })
            .then(movies => {
                res.render('newestMovies', { movies });
            });
    },
    'recomended': (req, res) => {
        db.Movie.findAll({
            where: {
                rating: { [db.Sequelize.Op.gte]: 8 }
            },
            order: [
                ['rating', 'DESC']
            ]
        })
            .then(movies => {
                res.render('recommendedMovies.ejs', { movies });
            });
    }, //Aqui debemos modificar y completar lo necesario para trabajar con el CRUD
    add: function (req, res) {
        // TODO   
        return res.render('moviesAdd');
    },
    create: function (req, res) {
        // TODO
        const { title, rating, awards, release_date, length } = req.body
        db.Movie.create({
            title: title.trim(),
            rating,
            awards,
            release_date,
            length

        })

            .then(movie => {
                console.log(movie);
                return res.redirect('/movies')
            })
            .catch(error => console.log(error))
    },
    edit: function (req, res) {
        // TODO
        db.Movie.findByPk(req.params.id)
            .then(movie => {

                return res.render('moviesEdit', {
                    Movie: movie,
                    moment
                })
            }).catch(error => console.log(error))
    },
    update: function (req, res) {
        // TODO   
        const { title, rating, awards, release_date, length } = req.body
        db.Movie.update(
            {
                title: title.trim(),
                rating,
                awards,
                release_date,
                length


            },
            {
                where: {
                    id: req.params.id
                }


            })
            .then(response => {
                console.log(response)
                db.Movie.findByPk(req.params.id)
                    .then(movie => {
                        return res.render('moviesDetail', {
                            movie
                        })
                    })
            }).catch(error => console.log(error));

    },
    delete: function (req, res) {
        db.Movie.findByPk(req.params.id)
            .then(movie => {
                res.render('moviesDelete.ejs', { Movie: movie });
            }).catch(error => console.log(error))
    },
    destroy: function (req, res) {
        //como algunas peliculas estan vinculadas con el findByPk se realiza otro destroy
        db.ActorMovie.destroy({
            where: { movie_id: req.params.id }
        }).then(moviesDestroy => {
            console.log(moviesDestroy);
            db.Actor.update(
                //con el update podemos modificar para poder borrar las peliculas,ya que algunas estan vinculadas con los actores
                {
                    favorite_movie_id: null
                },
                {
                    where: {
                        favorite_movie_id: req.params.id
                    }
                }).then(response => {
                    console.log(response);
                    db.Movie.destroy({
                        where: { id: req.params.id }
                    }).then(response => {
                        console.log(response);
                        res.redirect('/movies')
                    })
                })
        }).catch(error => console.log(error))
    }

}




module.exports = moviesController;