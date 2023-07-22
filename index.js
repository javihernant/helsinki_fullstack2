const express = require('express')
var morgan = require('morgan')
require('dotenv').config()
const mongoose = require('mongoose')

const Person = require('./models/person')

const app = express()

app.use(express.static('build'))
app.use(express.json())

morgan.token('reqBody', function getBody (req) {
    return JSON.stringify(req.body)
  })

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :reqBody'))

const genBigRandom = () => {
    return Math.floor(Math.random() * (2 ** 20))
}
let persons = [
    { 
        "id": 1,
        "name": "Arto Hellas", 
        "number": "040-123456"
    },
    { 
        "id": 2,
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
    },
    { 
        "id": 3,
        "name": "Dan Abramov", 
        "number": "12-43-234345"
    },
    { 
        "id": 4,
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
    }
]
app.get('/info', (request, response) => {
    Person.find({}).then(persons => {
        response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${Date()}</p>`)
    })
    .catch(error => console.log("error at fetching db entries", error))
    
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
    .catch(error => console.log("error at fetching db entries", error))
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(err => next(err))
})

app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {response.status(204).end()})
        .catch(err => next(err))
})

app.post('/api/persons', (request, response, next) => { 
    const body = request.body

    const person = new Person({
            name: body.name,
            number: body.number
    })
    person.save()
        .then((p)=> {response.json(p)})
        .catch(err => next(err))
})

app.put('/api/persons/:id', (req, resp, next) => {
    const {name, number} = req.body
    const person = {name, number}
    Person.findByIdAndUpdate(req.params.id, person, {new: true, runValidators: true, context: 'query'})
        .then(updatedPerson => {
            if (updatedPerson) {
                resp.json(updatedPerson)
            } else {
                resp.status(404).end()
            }
        })
        .catch(err => next(err))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
  
// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
  
    next(error)
}
  
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})