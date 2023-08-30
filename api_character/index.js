const API_PORT = 3000;
const mongoose = require("mongoose");
const Joi = require('joi');
const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.static('public'));
app.use(cors());
app.use(express.json());
app.listen(API_PORT, () => console.log('Listening on port ' + API_PORT + '...'));

mongoose.connect('mongodb://127.0.0.1:27017/characterdb', { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB!'))
  .catch(error => console.error('Could not connect to MongoDB:', error));

const characterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true // Přidáno unikátní omezení pro pole "name"
  },
  lname: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  karma: {
    type: String,
    enum: ['Dobrá', 'Neutrální', 'Zlá'],
    required: true
  },
  rasa: {
    type: String,
    enum: ['Člověk', 'Elf', 'Humanoid', 'Trpaslík'],
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  txtarea: String
});

const Character = mongoose.model("Character", characterSchema);

app.get('/api/character', (req, res) => {
  Character.find()
    .then(characters => res.json(characters))
    .catch(error => {
      console.error('Could not fetch characters:', error);
      res.status(500).send('Could not fetch characters');
    });
});

app.get('/api/character/:id', (req, res) => {
  const id = String(req.params.id);
  Character.findById(id)
    .then(character => {
      if (!character) {
        res.status(404).send("Character not found!");
      } else {
        res.json(character);
      }
    })
    .catch(error => {
      console.error('Could not fetch character:', error);
      res.status(500).send('Could not fetch character');
    });
});

function validateCharacter(character, required = true) {
  const schema = Joi.object({
    name: Joi.string().required(),
    lname: Joi.string().required(),
    year: Joi.number().required(),
    karma: Joi.string().valid('Dobrá', 'Neutrální', 'Zlá').required(),
    rasa: Joi.string().valid('Člověk', 'Elf', 'Humanoid', 'Trpaslík').required(),
    isAvailable: Joi.bool(),
    txtarea: Joi.string()
  });

  return schema.validate(character, { presence: (required) ? "required" : "optional" });
}

app.get('/api/moje_postavy', (req, res) => {
  Character.find()
    .then(characters => {
      res.json(characters);
    })
    .catch(error => {
      console.error('Could not fetch characters:', error);
      res.status(500).send('Could not fetch characters');
    });
});

app.post('/api/character', (req, res) => {
  const { error } = validateCharacter(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const { name, lname, year, karma, rasa, txtarea } = req.body;
  const character = new Character({
    name,
    lname,
    year,
    karma,
    rasa,
    txtarea
  });

  Character.findOne({ name: name }) // Kontrola duplicity pro pole "name"
    .then(existingCharacter => {
      if (existingCharacter) {
        res.status(400).send("Character with the same name already exists!");
      } else {
        character.save()
          .then(savedCharacter => {
            res.json(savedCharacter);
          })
          .catch(error => {
            console.error('Could not save character:', error);
            res.status(500).send('Could not save character');
          });
      }
    })
    .catch(error => {
      console.error('Could not check duplicate characters:', error);
      res.status(500).send('Could not check duplicate characters');
    });
});

app.get('/', (req, res) => {
  res.send('API běží!'); // Můžete změnit tento text na cokoli chcete
});

app.get('/moje_postavy', (req, res) => {
  res.sendFile(__dirname + '/public/moje_postavy.html');
});

app.delete('/api/character/:id', (req, res) => {
  Character.findByIdAndDelete(req.params.id)
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        res.status(404).send("Postava s daným ID nenalezena!");
      }
    })
    .catch(err => {
      res.status(500).send("Chyba při mazání postavy!")
    })
})

app.put('/api/character/:id', (req, res) => {
  const { error } = validateCharacter(req.body, false);
  if (error) {
    res.status(400).send(error.details[0].message);
  } else {
    Character.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(result => res.json(result))
      .catch(err => res.send("Nepodařilo se editovat postavu"));
  }
});