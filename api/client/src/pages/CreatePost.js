import React, { useState } from 'react'
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import {Navigate} from "react-router-dom"

function CreatePost() {
    const [title,setTitle] = useState("")
    const [summary,setSummary] = useState("")
    const [content,setContent] = useState("")
    const[files,setFiles] = useState("")
    const [redirect,setRedirect] = useState(false)
    const modules = {
        toolbar:[
            [{"header":[1,2,false]}]
            ["bold","italic","underlin"]
        ]
    }
    async function createNewPost(ev){
        const data = new FormData()
        data.set("title", title)
        data.set("summary",summary)
        data.set("content",content)
        if (files.length > 0) {
            data.set("file", files[0]);
        }        ev.preventDefault()
        const response = await fetch("https://mern-blog-app-gsj4.vercel.app/post",{
            method:"POST",
            body:data,
            credentials:"include"
        })
        if(response.ok){
            setRedirect(true)
        }
    }
        if(redirect){
           return <Navigate to={"/"} />
        }
    
  return (
    <form onSubmit={createNewPost}>
        <input type='title' value={title} onChange={ev=>setTitle(ev.target.value)} placeholder='title'></input>
        <input type='summary' value={summary} onChange={ev=>setSummary(ev.target.value)} placeholder='summary'></input>
        <input type='file' onChange={ev=>setFiles(ev.target.files)}></input>
        <ReactQuill value={content} onChange={newValue=>setContent(newValue)} modules={modules}></ReactQuill>
        <button style={{marginTop:"5px"}}>Create post</button>
    </form>
  )
}

export default CreatePost
