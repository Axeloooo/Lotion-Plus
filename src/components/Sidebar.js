import {Link} from "react-router-dom";
function Sidebar({formatDate, sidebar, notes, onAddNote, activeNote, setActiveNote}) {

    const sortedNotes = notes.sort((a,b) => b.lastModified - a.lastModified);

    const noteBodyPreview = (text) => {
        if (text.length >= 80){
            return (text.substr(0,80) + "...");
        }
        return (text.substr(0,(text.length - 4)) + "...");
    }

    return (
    <div className={sidebar? "app-sidebar": "app-sidebar-closed"}>
        <div className="app-sidebar-header">
            <h1>Notes</h1>
            <Link to={`/notes/${activeNote.id}/edit`}>
            <button onClick={onAddNote}>Add</button>
            </Link>
        </div>
        <div className="app-sidebar-notes">
            {sortedNotes.map((note) => (
                <Link to={`/notes/${note.id}`}>
                <div className={`app-sidebar-note ${note.id === activeNote && "active"}`} onClick={() => setActiveNote(note.id)}>
                <div className="sidebar-note-title">
                    <strong>{note.title}</strong>
                </div>

                <small className="note-meta">
                    Last modified {formatDate(note.lastModified)}
                </small>
                <div className="sidebar-note-body" dangerouslySetInnerHTML={{__html: note.body && noteBodyPreview(note.body)}}/>
            </div>
            </Link>
            ))}    
        </div>
    </div>
    );
}

export default Sidebar;