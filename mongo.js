const mongoose = require('mongoose')

if (process.argv.length !== 3 && process.argv.length !== 5) {
    console.log('Usage: node mongo.js [password] [[name] [number]]')
    process.exit(1)
}
const password = process.argv[2]
const url = `mongodb+srv://hxztnxt:${password}@phonebook.7hdj1mb.mongodb.net/?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)


const personSchema = new mongoose.Schema({
        name: String,
        number: Number,
    })

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})
      

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
    Person.find({}).then(result => {
        console.log('phonebook')
        result.forEach(cont => {
            console.log(cont)
            console.log(cont.name, cont.number)
        })
        mongoose.connection.close()
    })
} else {
    const name = process.argv[3]
    const number = Number(process.argv[4])
    const person = new Person({name, number})
    person.save().then(result => {
        console.log("person saved")
        mongoose.connection.close()
    })
    

}