import {Link} from "react-router-dom"
import {formatISO9075} from "date-fns";

export default function post({_id,title,summary,cover,content,author,createdAt}){
    return(
    <div className='post'>
    <div className='image'>        
    <Link to={`/post/${_id}`}>
    <img src={"https://mern-blog-app-1-qb9j.onrender.com/"+cover} alt=''/>
    </Link>
    </div>
    <div className='texts'>
        <Link to={`/post/${_id}`}>
    <h2>{title}</h2>
    </Link>
    <p className='info'> 
    {author && (
            <a className="author">{author.username}</a>
            )}
    <time>{formatISO9075(new Date(createdAt))}</time></p>
   
    <p className='summary'>{summary}</p>
    </div>
    </div> )
}
