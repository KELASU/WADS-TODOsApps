import "../App.css";
import { useState } from "react";
import { TodoForm } from "../components/TodoForm";
import { TodoList } from "../components/TodoList";
import React, { useEffect } from 'react';
import { doc, deleteDoc, updateDoc, collection, query, onSnapshot, orderBy, getDoc } from "@firebase/firestore";
import { auth, db, upload, logout } from "../firebase";
import defaultAvatar from "../images/profile.png";
import { Navigate } from 'react-router-dom';

function Todo({user, setAvatarImg}) {
  if(user == null) return <Navigate to="/login"/>

  const [todos, setTodos] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUnchecked, setShowUnchecked] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const docRef = doc(db, "users", user.uid);
    getDoc(docRef).then((docSnap) => {
      setUsername(docSnap.data().username);
    });
  }, [user]);

  useEffect(() => {
    const q = query(collection(db, "users", user.uid, "tasks"), orderBy("created", "desc"));
    onSnapshot(q, (querySnapshot) => {
      setTodos(querySnapshot.docs.map(doc => ({
        id: doc.id, 
        data: doc.data()})))
    });
    
    if(!user) setAvatarImg(user.photoURL);

  }, [user]);

  async function toggleTodo(id, completed) {
    const todoDocRef = doc(db, "users", user.uid, "tasks", id);
    try{
      await updateDoc(todoDocRef, {
        completed: !completed
      })
    } catch(err){
      alert(err);
    }

  }

  async function deleteTodo(id) {
    const todoDocRef = doc(db, "users", user.uid, "tasks", id);
    try{
      await deleteDoc(todoDocRef);
    } catch (err){
      alert(err);
    }
  }

  async function editTodo(id, newTitle) {
    if(newTitle === "") return;

    const todoDocRef = doc(db, "users", user.uid, "tasks", id);
    try{
      await updateDoc(todoDocRef,{
        title: newTitle
      })
    }
    catch (err){
      alert(err);
    }
  }

  function toggleUnchecked() {
    setShowUnchecked(!showUnchecked);
    return;
  }

  function handleFile(e) {
    if (e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  }

  function handleUpload() {
    upload(photo, user, setLoading);
    setPhoto(null);
  }

  function avatarRender() {
    if(user.photoURL) return user.photoURL;
    return defaultAvatar;
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex items-center h-20">
          <img id="avatar" src={avatarRender()} alt="Avatar"/>
          <h1 className="font-serif mr-1">Hello {username}!</h1>
          {user != null ? 
          <button className="btn mr-1 font-serif" onClick={logout}>Log out</button>
          :
          
            <Link to="/auth">
              <button className="btn mr-1 font-serif">Sign in</button>
            </Link>
          
          }
          <div className="">
            <label htmlFor="files" className="btn font-mono mr-3">Set picture</label>
            <input id="files" type="file" onChange={handleFile}/>
            {photo && <button disabled={loading} onClick={handleUpload} className="btn font-mono">Upload</button>}
          </div>
          
        </div>
        <div className="w-dvh h-dvh p-2 bg-indigo-800">
          <TodoForm user={user}/>
          <TodoList todos={todos} showUnchecked={showUnchecked} toggleUnchecked={toggleUnchecked} toggleTodo={toggleTodo} deleteTodo={deleteTodo} editTodo={editTodo}/>
        </div>
      </div>
    </>
  );
}

export default Todo;