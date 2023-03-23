import ReactQuill from "react-quill";
import {useState, useEffect} from "react";
import "react-quill/dist/quill.snow.css";
import { Link } from "react-router-dom";

function NoteEditor({formatDate, sidebar, activeNote, onUpdateNote, onDeleteNote}) {
    const[value, setValue] = useState("");
    const[title, setTitle] = useState("");

    const dt = new Date();
    dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());

    const[date, setDate] = useState(dt.toISOString().slice(0, 16));

    useEffect(() => {
        if (activeNote) {
            setValue(activeNote.body);
            setTitle(activeNote.title);
        }
    }, [activeNote]);

    if (!activeNote) return <div className="no-active-note">No note selected</div>;

    const onEditField = (title, value, date) => {
        console.log(value);
        onUpdateNote({
            id: activeNote.id,
            title: title,
            body: value,
            lastModified: date,
        });
    };

    return (
    <div className="app-main">
        <header className="app-main-note-header">
            <div className="app-main-note-header-title">
                <input type="text" className="title" value={title} onChange={(e) =>  setTitle(e.target.value)} autoFocus />
                <input className="date" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)}/>
            </div>
            <div className="app-main-note-header-buttons">
                <Link to={`/notes/${activeNote.id}`}>
                <button onClick={() => onEditField(title, value, date)}>Save</button>
                </Link>
                <button onClick={() => onDeleteNote(activeNote.id)}>Delete</button>
            </div>
        </header>
        <div className="app-main-note-edit">
            <ReactQuill className="editor"value={value} onChange={setValue}/>
        </div>
    </div>
    );
}

export default NoteEditor;