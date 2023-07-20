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
    response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${Date()}</p>`)
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
    .catch(error => console.log("error at fetching db entries", error))
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(p => p.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

app.post('/api/persons', (request, response) => { 
    const body = request.body
    if (!body.name) {
        return response.status(400).json({ 
          error: 'name is missing' 
        })
    }

    if (!body.number) {
        return response.status(400).json({ 
          error: 'number is missing' 
        })
    }
    if (persons.map(p => p.name ).includes(body.name)) {
        return response.status(400).json({ 
            error: 'contact already stored' 
        })
    }
    const person = new Person({
            name: body.name,
            number: body.number
        })
    person.save().then((p)=> {response.json(p)})
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})