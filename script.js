document.addEventListener('DOMContentLoaded', function () {
  const noteContainer = document.getElementById("app");
  const addNoteButton = document.querySelector(".add-note");

  getNotes().forEach(note => {
    const noteElement = createNoteElement(note.id, note.content, note.font, note.type);
    noteContainer.insertBefore(noteElement, addNoteButton);
  });

  addNoteButton.addEventListener("click", () => addNote());

  function getNotes() {
    return JSON.parse(localStorage.getItem("notes") || "[]");
  }

  function saveNotes(notes) {
    localStorage.setItem("notes", JSON.stringify(notes));
  }

  function createNoteElement(id, content = "", font = "Segoe UI", type = "richtext") {
    const container = document.createElement("div");
    container.classList.add("note-container");
    container.style.setProperty("--rotate", `${Math.random() * 6 - 3}deg`);

    const toolbar = document.createElement("div");
    toolbar.className = "toolbar";

    const fonts = ["Segoe UI", "Georgia", "Courier New", "Arial", "Comic Sans MS"];
    const fontSelect = document.createElement("select");
    fonts.forEach(f => {
      const opt = document.createElement("option");
      opt.value = f;
      opt.innerText = f;
      if (f === font) opt.selected = true;
      fontSelect.appendChild(opt);
    });

    const boldBtn = createToolbarButton("B", "bold");
    const italicBtn = createToolbarButton("I", "italic");
    const underlineBtn = createToolbarButton("U", "underline");

    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = type === "todo" ? "📝 Rich" : "☑️ To-Do";
    toggleBtn.style.fontSize = "12px";

    let contentElement;

    if (type === "todo") {
      contentElement = createTodoList(content);
    } else {
      contentElement = document.createElement("div");
      contentElement.className = "note";
      contentElement.contentEditable = true;
      contentElement.innerHTML = content;
      contentElement.style.fontFamily = font;
    }

    // Format button listeners
    boldBtn.onclick = () => document.execCommand("bold");
    italicBtn.onclick = () => document.execCommand("italic");
    underlineBtn.onclick = () => document.execCommand("underline");

    // Save on changes
    contentElement.addEventListener("input", () => {
      const notes = getNotes();
      const note = notes.find(n => n.id === id);
      if (note) {
        note.content = getContentHTML(contentElement);
        note.font = fontSelect.value;
        saveNotes(notes);
      }
    });

    // Font change
    fontSelect.addEventListener("change", () => {
      if (contentElement.style) contentElement.style.fontFamily = fontSelect.value;
      const notes = getNotes();
      const note = notes.find(n => n.id === id);
      if (note) {
        note.font = fontSelect.value;
        saveNotes(notes);
      }
    });

    // Toggle type
    toggleBtn.addEventListener("click", () => {
      const newType = type === "richtext" ? "todo" : "richtext";
      const notes = getNotes();
      const note = notes.find(n => n.id === id);
      if (note) {
        note.type = newType;
        note.content = getContentHTML(contentElement);
        saveNotes(notes);
        location.reload(); // reload for simplicity
      }
    });

    // Delete note
    contentElement.addEventListener("dblclick", () => {
      if (confirm("Delete this note?")) {
        deleteNote(id, container);
      }
    });

    toolbar.append(boldBtn, italicBtn, underlineBtn, fontSelect, toggleBtn);
    container.append(toolbar, contentElement);

    return container;
  }

  function createToolbarButton(text, command) {
    const btn = document.createElement("button");
    btn.innerHTML = text;
    btn.style.fontWeight = command === "bold" ? "bold" : "";
    btn.style.fontStyle = command === "italic" ? "italic" : "";
    btn.style.textDecoration = command === "underline" ? "underline" : "";
    return btn;
  }

  function createTodoList(contentHTML) {
    const wrapper = document.createElement("div");
    wrapper.className = "note";

    const list = document.createElement("ul");
    list.className = "todo-list";

    // Restore items if exist
    const lines = contentHTML.split("\n").filter(Boolean);
    lines.forEach(line => {
      const li = createTodoItem(line);
      list.appendChild(li);
    });

    const addBtn = document.createElement("button");
    addBtn.className = "todo-add";
    addBtn.textContent = "+ Add Task";

    addBtn.onclick = () => {
      const li = createTodoItem();
      list.appendChild(li);
    };

    wrapper.appendChild(list);
    wrapper.appendChild(addBtn);

    // Save on change
    wrapper.addEventListener("input", () => {
      const notes = getNotes();
      const note = notes.find(n => wrapper.contains(document.activeElement));
      if (note) {
        note.content = getContentHTML(wrapper);
        saveNotes(notes);
      }
    });

    return wrapper;
  }

  function createTodoItem(text = "") {
    const li = document.createElement("li");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    const input = document.createElement("input");
    input.type = "text";
    input.value = text;
    input.style.flex = 1;
    input.style.border = "none";
    input.style.outline = "none";
    input.style.background = "transparent";

    li.append(checkbox, input);
    return li;
  }

  function getContentHTML(element) {
    if (element.querySelectorAll) {
      const todos = [...element.querySelectorAll(".todo-list input[type='text']")];
      return todos.map(t => t.value.trim()).join("\n");
    } else {
      return element.innerHTML;
    }
  }

  function addNote() {
    const notes = getNotes();
    const newNote = {
      id: Date.now(),
      content: "",
      font: "Segoe UI",
      type: "richtext"
    };
    const element = createNoteElement(newNote.id, newNote.content, newNote.font, newNote.type);
    noteContainer.insertBefore(element, addNoteButton);
    notes.push(newNote);
    saveNotes(notes);
  }

  function deleteNote(id, element) {
    const notes = getNotes().filter(n => n.id !== id);
    saveNotes(notes);
    element.remove();
  }
});
