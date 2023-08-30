class Postava {
  constructor() {
    this.init();
  }

  init() {
    this.jmenoInput = document.getElementById('name');
    this.prijmeniInput = document.getElementById('lname');
    this.narozeniInput = document.getElementById('year');
    this.karmaInput = document.getElementById('karma');
    this.rasaInput = document.getElementById('rasa');
    this.txtareaInput = document.getElementById('txtarea');
    this.potvrditButton = document.getElementById('potvrdit');
    this.vypisElement = document.getElementById('vypis');

    if (
      !this.jmenoInput ||
      !this.prijmeniInput ||
      !this.narozeniInput ||
      !this.karmaInput ||
      !this.rasaInput ||
      !this.txtareaInput ||
      !this.potvrditButton ||
      !this.vypisElement
    ) {
      console.error('Některé z potřebných elementů nejsou k dispozici v DOM.');
      return;
    }

    this.nactiZaznamy();
    this.nastavUdalosti();
  }

  nactiZaznamy() {
    fetch('http://localhost:3000/api/character')
      .then(response => response.json())
      .then(data => {
        this.zaznamy = data;
        this.zobrazZaznamy();
      })
      .catch(error => {
        console.error('Chyba při načítání záznamů:', error);
      });
  }

  zobrazZaznamy() {
    this.vypisElement.innerHTML = '';

    this.zaznamy.forEach(zaznam => {
      const element = document.createElement('div');
      element.classList.add('postava');
      element.dataset.id = zaznam._id;
      const jmeno = zaznam.name || '';
      const prijmeni = zaznam.lname || '';
      const narozeni = zaznam.year || '';
      const karma = zaznam.karma || '';
      const rasa = zaznam.rasa || '';
      const txtarea = zaznam.txtarea || '';

      element.innerHTML = `
        <img class="picture" src="js/postava.jpg"></br>
        <span class="text">Jméno:</span> ${jmeno}</br>
        <span class="text">Příjmení:</span> ${prijmeni}</br>
        <span class="text">Rok narození:</span> ${narozeni}</br>
        <span class="text">Karma:</span> ${karma}<br>
        <span class="text">Rasa:</span> ${rasa}</br></br>
        <span class="text">Lore:</span> ${txtarea}</br>
        <div class="button-container"></br>
          <button class="delete-button">Smazat postavu</button>
          <button class="edit-button">Upravit postavu</button>
        </div>`;

      const deleteButton = element.querySelector('.delete-button');
      deleteButton.addEventListener('click', () => this.smazatZaznam(zaznam._id));

      const editButton = element.querySelector('.edit-button');
      editButton.addEventListener('click', () => this.upravitZaznam(zaznam));

      this.vypisElement.appendChild(element);
    });
  }

  nastavUdalosti() {
    this.potvrditButton.addEventListener('click', event => {
      event.preventDefault();
      const jmeno = this.jmenoInput.value;
      const existujiciZaznam = this.zaznamy.find(zaznam => zaznam.name === jmeno);
      if (existujiciZaznam) {
        this.ulozUpravenyZaznam(existujiciZaznam._id);
      } else {
        this.vytvorZaznam();
      }
    });
  }

  smazatZaznam(id) {
    fetch(`http://localhost:3000/api/character/${id}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(() => {
        this.nactiZaznamy(); // Načte záznamy znovu po smazání
      })
      .catch(error => {
        console.error('Chyba při mazání záznamu:', error);
      });
  }
  upravitZaznam(zaznam) {
    this.jmenoInput.value = zaznam.name || '';
    this.prijmeniInput.value = zaznam.lname || '';
    this.narozeniInput.value = zaznam.year || '';
    this.karmaInput.value = zaznam.karma || '';
    this.rasaInput.value = zaznam.rasa || '';
    this.txtareaInput.value = zaznam.txtarea || '';

    // Zablokovat tlačítko pro úpravu, dokud se neuloží změny
    this.vypisElement.querySelector(`[data-id="${zaznam._id}"] .edit-button`).disabled = true;

    // Přidat tlačítko pro uložení změn
    const ulozitButton = document.createElement('button');
    ulozitButton.innerText = 'Uložit změny';
    ulozitButton.classList.add('save');
    ulozitButton.onclick = () => {
      zaznam.name = this.jmenoInput.value;
      zaznam.lname = this.prijmeniInput.value;
      zaznam.year = this.narozeniInput.value;
      zaznam.karma = this.karmaInput.value;
      zaznam.rasa = this.rasaInput.value;
      zaznam.txtarea = this.txtareaInput.value;

      this.ulozUpravenyZaznam(zaznam._id);

      // Smazat tlačítko pro uložení změn a obnovit původní tlačítko pro úpravu
      ulozitButton.remove();
      this.vypisElement.querySelector(`[data-id="${zaznam._id}"] .edit-button`).disabled = false;
    };

    // Přidat tlačítko pro uložení změn
    this.vypisElement.querySelector(`[data-id="${zaznam._id}"] .button-container`).appendChild(ulozitButton);
  }

  ulozUpravenyZaznam(id) {
    const jmeno = this.jmenoInput.value;
    const prijmeni = this.prijmeniInput.value;
    const narozeni = this.narozeniInput.value;
    const karma = this.karmaInput.value;
    const rasa = this.rasaInput.value;
    const txtarea = this.txtareaInput.value;

    const zaznam = {
      name: jmeno,
      lname: prijmeni,
      year: narozeni,
      karma,
      rasa,
      txtarea
    };

    fetch(`http://localhost:3000/api/character/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(zaznam)
    })
      .then(response => response.json())
      .then(() => {
        this.nactiZaznamy(); // Načte záznamy znovu po uložení úprav
        this.resetFormular();
      })
      .catch(error => {
        console.error('Chyba při ukládání upraveného záznamu:', error);
      });
  }

  vytvorZaznam() {
    const jmeno = this.jmenoInput.value;
    const prijmeni = this.prijmeniInput.value;
    const narozeni = this.narozeniInput.value;
    const karma = this.karmaInput.value;
    const rasa = this.rasaInput.value;
    const txtarea = this.txtareaInput.value;

    const zaznam = {
      name: jmeno,
      lname: prijmeni,
      year: narozeni,
      karma,
      rasa,
      isAvailable: true,
      txtarea
    };

    fetch('http://localhost:3000/api/character', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(zaznam)
    })
      .then(response => response.json())
      .then(() => {
        this.nactiZaznamy(); // Načte záznamy znovu po vytvoření nového záznamu
        this.resetFormular();
      })
      .catch(error => {
        console.error('Chyba při vytváření nového záznamu:', error);
      });
  }

  resetFormular() {
    this.jmenoInput.value = '';
    this.prijmeniInput.value = '';
    this.narozeniInput.value = '';
    this.karmaInput.value = '';
    this.rasaInput.value = '';
    this.txtareaInput.value = '';
  }
}

const postava = new Postava();