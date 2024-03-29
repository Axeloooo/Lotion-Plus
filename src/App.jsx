import React from "react";
import "./App.css";
import Main from "./components/Main";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { useState, useEffect } from "react";
import uuid from "react-uuid";
import NoteEditor from "./components/NoteEditor";
import NotePreview from "./components/NotePreview";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

function App() {
  const [sidebar, setSidebar] = useState(true);
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(false);
  const [user, setUser] = useState(
    localStorage.user ? JSON.parse(localStorage.user) : null
  );
  const [profile, setProfile] = useState(null);

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };

  const formatDate = (when) => {
    const formatted = new Date(when).toLocaleString("en-US", options);
    if (formatted === "Invalid Date") {
      return "";
    }
    return formatted;
  };

  useEffect(() => {
    if (user) {
      axios
        .get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
              Accept: "application/json",
            },
          }
        )
        .then((res) => {
          setProfile(res.data);
        })
        .catch((err) => console.log(err));
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        const res = await fetch(
          `${process.env.REACT_APP_GET_LAMBDA_URL}?email=${profile.email}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Access-Token": `${user.access_token}`,
            },
          }
        );
        const data = await res.json();
        setNotes(data);
      };
      fetchData();
    }
  }, [user, profile]);

  const onAddNote = async () => {
    const newNote = {
      id: uuid(),
      title: "Untitled Note",
      body: "",
      lastModified: Date.now(),
    };

    setNotes([newNote, ...notes]);
    setActiveNote(newNote.id);
  };

  const onUpdateNote = async (updatedNote) => {
    const updatedNotesArray = notes.map((note) => {
      if (note.id === activeNote) {
        return updatedNote;
      }
      return note;
    });

    setNotes(updatedNotesArray);
    await fetch(
      `${process.env.REACT_APP_POST_LAMBDA_URL}?email=${profile.email}&id=${updatedNote.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Token": `${user.access_token}`,
        },
        body: JSON.stringify(updatedNote),
      }
    );
  };

  const onDeleteNote = async (idToDelete) => {
    const answer = window.confirm("Are you sure?");
    if (answer) {
      await fetch(
        `${process.env.REACT_APP_DELETE_LAMBDA_URL}?email=${profile.email}&id=${idToDelete}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Access-Token": `${user.access_token}`,
          },
        }
      );
      setNotes(notes.filter((note) => note.id !== idToDelete));
      setActiveNote(false);
    }
  };

  const getActiveNote = () => {
    return notes.find((note) => note.id === activeNote);
  };

  const toggleSidebar = () => {
    setSidebar((prevState) => !prevState);
  };

  const logOut = () => {
    googleLogout();
    setProfile(null);
    localStorage.removeItem("user");
    setUser(null);
    setNotes([]);
  };

  const login = useGoogleLogin({
    onSuccess: (response) => {
      setUser(response);
      localStorage.setItem("user", JSON.stringify(response));
    },
    onError: (error) => console.log("Login Failed:", error),
  });

  return (
    <div className="app-container">
      <BrowserRouter>
        {user ? (
          <>
            <Header
              profile={profile}
              logout={logOut}
              openSidebar={toggleSidebar}
            />
            <Sidebar
              formatDate={formatDate}
              sidebar={sidebar}
              notes={notes}
              onAddNote={onAddNote}
              activeNote={activeNote}
              setActiveNote={setActiveNote}
            />
            <Routes>
              <Route path="/" element={<Main />} />
              <Route
                path="/notes/:id"
                element={
                  <NotePreview
                    formatDate={formatDate}
                    activeNote={getActiveNote()}
                    onDeleteNote={onDeleteNote}
                  />
                }
              />
              <Route
                path="/notes/:id/edit"
                element={
                  <NoteEditor
                    sidebar={sidebar}
                    activeNote={getActiveNote()}
                    onUpdateNote={onUpdateNote}
                    onDeleteNote={onDeleteNote}
                  />
                }
              />
            </Routes>
          </>
        ) : (
          <>
            <Header logout={logOut} openSidebar={toggleSidebar} />
            <div className="google-login-container">
              <button onClick={() => login()}>
                Sign in to Lotion with <img src={"/logo123.png"} alt="" />
              </button>
            </div>
          </>
        )}
      </BrowserRouter>
    </div>
  );
}

export default App;
