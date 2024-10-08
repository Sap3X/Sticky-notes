document.addEventListener('DOMContentLoaded', function () { // Ensure DOM is loaded before running script

    const noteContainer = document.getElementById("app");
    const addNoteButton = noteContainer.querySelector(".add-note");

    getNotes().forEach((note) => {
        const noteElement = createNoteElement(note.id, note.content);
        noteContainer.insertBefore(noteElement, addNoteButton);
    });

    addNoteButton.addEventListener("click", () => addNote());

    function getNotes() {
        return JSON.parse(localStorage.getItem("stickynotes-notes") || "[]");
    }

    function saveNotes(notes) {
        localStorage.setItem("stickynotes-notes", JSON.stringify(notes));
    }

    function createNoteElement(id, content) {
        const element = document.createElement("textarea");

        element.classList.add("note");
        element.value = content;
        element.placeholder = "Empty Sticky Note";

        // Update note content on change
        element.addEventListener("change", () => {
            updateNote(id, element.value);
        });

        // Delete note on double-click
        element.addEventListener("dblclick", () => {
            const doDelete = confirm("Are you sure you wish to delete this sticky note?");
            if (doDelete) {
                deleteNote(id, element);
            }
        });

        return element;
    }

    function addNote() {
        const notes = getNotes();
        const noteObject = {
            id: Math.floor(Math.random() * 100000),
            content: ""
        };

        const noteElement = createNoteElement(noteObject.id, noteObject.content);
        noteContainer.insertBefore(noteElement, addNoteButton);

        notes.push(noteObject);
        saveNotes(notes);
    }

    function updateNote(id, newContent) {
        const notes = getNotes();
        const targetNote = notes.find((note) => note.id == id);
        if (targetNote) {
            targetNote.content = newContent;
            saveNotes(notes);
        }
    }

    function deleteNote(id, element) {
        const notes = getNotes().filter((note) => note.id != id);
        saveNotes(notes);
        noteContainer.removeChild(element);
    }
});