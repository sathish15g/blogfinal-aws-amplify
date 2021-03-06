import React, {Component} from "react";
import {listPosts} from '../graphql/queries'
import {API, graphqlOperation} from 'aws-amplify'
import DeletePost from "./DeletePost";
import EditPost from "./EditPost";
import {onCreatePost,onUpdatePost} from '../graphql/subscriptions'

class DisplayPosts extends Component{

    state = {
        posts : []
    }
  
    componentDidMount = async () => {
        this.getPosts()
        this.createPostListener = API.graphql(graphqlOperation(onCreatePost))
             .subscribe({
                 next: postData => {
                      const newPost = postData.value.data.onCreatePost
                      const prevPosts = this.state.posts.filter( post => post.id !== newPost.id)

                      const updatedPosts = [newPost, ...prevPosts]

                      this.setState({ posts: updatedPosts})
                 }
             })

             this.updatePostListener = API.graphql(graphqlOperation(onUpdatePost))
             .subscribe({
                  next: postData => {
                       
                       const updatePost = postData.value.data.onUpdatePost
                       const index = this.state.posts.findIndex(post => post.id === updatePost.id) //had forgotten to say updatePost.id!
                       const updatePosts = [
                           ...this.state.posts.slice(0, index),
                          updatePost,
                          ...this.state.posts.slice(index + 1)
                         ]

                         this.setState({ posts: updatePosts})

                  }
             })   
    }

    componentWillUnmount() {
        this.createPostListener.unsubcribe()
        this.updatePostListener.unsubcribe()
    }

    getPosts = async () => {
        const result = await API.graphql(graphqlOperation(listPosts))
        this.setState({posts : result.data.listPosts.items})
        console.log("All posts: ", result.data.listPosts.items)
    }

    render(){
        const { posts } = this.state
        return posts.map((post) => {
            return (
                <div  className="posts" style={rowStyle} key={post.id}>
                    <h1> {post.postTitle}</h1>
                    <span style= {{fontStyle : 'italic', color :'#0ca5e297'}}>
                        {"Wrote by: "} {post.postOwnerUsername}
                        {" On :"}
                        <time style= {{fontStyle : 'italic'}} key={post.id}>
                            {" "}
                            { new Date(post.createdAt).toDateString()}
                    </time> 
                    </span>
                    <p> {post.postBody} </p>

                    <br/>
                    <span>
                        <DeletePost/>
                    </span> 
                    <span>
                        <EditPost/>
                    </span>
                </div>
            )
        })
    }
}

const rowStyle = {
    background: "#f4f4f4",
    padding: '10px',
    border: '1px #ccc dotted',
    margin: '14px'

}

export default DisplayPosts;



