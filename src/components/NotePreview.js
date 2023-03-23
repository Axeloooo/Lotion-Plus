import React from "react";
import { useNavigate } from "react-router-dom";

function NotePreview({formatDate, activeNote, onDeleteNote}) {
    const navigate = useNavigate();

    if (!activeNote) return <div className="no-active-note">No note selected</div>;

    return (
        <div className="app-main">
        <header className="app-main-note-header">
            <div className="app-main-note-header-title">
                <h1 className="title">{activeNote.title}</h1>
                <p className="date">Last modified {formatDate(activeNote.lastModified)}</p>
            </div>
            <div className="app-main-note-header-buttons">
                <button onClick={() => navigate(`/notes/${activeNote.id}/edit`)}>Edit</button>
                <button onClick={() => onDeleteNote(activeNote.id)}>Delete</button>
            </div>
        </header>
        <div className="app-main-note-preview-container">
            <div className="app-main-note-preview-text" dangerouslySetInnerHTML={{ __html: activeNote.body}}/>
        </div>
        </div>
    );
}

export default NotePreview;