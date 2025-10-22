class NotesManager {
    constructor() {
        this.notesContainer = document.getElementById('notes-container');
        this.addNoteBtn = document.getElementById('add-note-btn');
        this.init();
    }

    init() {
        this.addNoteBtn.addEventListener('click', () => { this.addNote() });
    }
    
    addNote() {
        const noteClone = this.getNoteDiv();
        this.notesContainer.append(noteClone);
        console.log("Added note");
    }

    getNoteDiv() {
        const note = document.createElement('div');
        note.classList.add('note');
        note.innerHTML = `
            <textarea class="note-text" placeholder="67 is..." ></textarea>
            <button class="delete-note-btn">Delete</button>
        `
        note.querySelector('.delete-note-btn').addEventListener('click', () => {
            this.notesContainer.removeChild(note);
        });
        return note;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const notesManager = new NotesManager()
})