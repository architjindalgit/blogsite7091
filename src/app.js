const mongoose=require("mongoose");
const port= process.env.PORT || 3000;
const express=require("express");
const app=express();
const path=require("path");
//console.log(__dirname);
const publicPath=path.join(__dirname,"/../public");
app.use(express.static(publicPath));
const viewPath=path.join(__dirname,"/../templates/views");
app.set("views",viewPath);
app.set("view engine","ejs");
const bodyParser=require("body-parser");
app.use(bodyParser.urlencoded({
    extended: true
}))
mongoose.connect("mongodb://127.0.0.1:27017/blogs",{
    useNewUrlParser: true,
    useCreateIndex: true
});
const blogSchema= new mongoose.Schema(
    {
        title:
        {
            type: String,
            required: true,
            trim: true
        },
        body:
        {
            type: String,
            required: true,
            trim: true
        },
        img_src:
        {
            type: String,
            default: "http://www.bu.edu/careers/files/2017/10/desk-768x512.jpg"
        },
        created:
        {
            type: Date,
            default: Date.now
        },
        details:
        {
            type: String,
            required: true
        },
        createdby:
        {
            type: String
        }
    }
)
const Blog= mongoose.model("Blog",blogSchema);
const myblogs=mongoose.model("myblogs",blogSchema);
const userSchema= new mongoose.Schema({
    name: String,
    username: String,
    password: String
})
const User=mongoose.model("User",userSchema);
var username;
var alreadytaken=false;
app.post("/createUser",(req,res)=>
{
    const user_req=req.body.user.username;
    User.findOne({
        username: user_req
    }).then((user)=>
    {
        if(!user)
        {
            const newUser=new User(req.body.user);
            newUser.save().then(()=>
            {
                loggedIn=true;
                username=req.body.user.username;
                res.redirect("/blogs");
            })
        }
        else
        {
            alreadytaken= true;
            res.redirect("/");
        }
    }).catch(()=>
    {
        
    })
   
})
var success=true;
app.get("/login",(req,res)=>
{
   // const username=req.query.username;
    const password=req.query.password;
    User.find({
        username: req.query.username
    }).then((user)=>
    {
        if(user[0].password==password)
        {
            username= req.query.username;
            loggedIn=true;
            success=true;
            res.redirect("/blogs");
        }
        else
        {
            success=false;
            res.redirect("/");
        }
    }).catch(()=>
    {
        res.redirect("/");
    })
})
app.get("/",(req,res)=>
{
    if(success)
    res.render("homepage",{
        todisplay: success,
        alreadytaken: alreadytaken
    });
    else
    res.render("homepage",{
        todisplay: success,
        alreadytaken: alreadytaken
    })
})
var loggedIn=false;
app.get("/blogs",(req,res)=>
{
    if(loggedIn)
    {
        console.log(username);
        Blog.find({}).then((blogs)=>
        {
            res.render("blogs.ejs",{
                blogs: blogs,
                username: username
            })
        }).catch((err)=>
        {
            res.render("404",{
                err: err
            });
        })
    }
    else
    {
        res.redirect("/");
    }
  
})
app.get("/logout",(req,res)=>
{
    loggedIn=false;
    res.redirect("/");
})
app.get("/blogs/myblogs",(req,res)=>
{
    if(loggedIn)
    {
        myblogs.find({createdby: username}).then((blogs)=>
         {
        res.render("myblogs.ejs",{
            blogs:blogs,
            username: username
        })
        })
    }
    else
    {
        res.redirect("/");
    }
})
app.get("/blogs/new",(req,res)=>
{
    if(loggedIn)
    res.render("new",{
        username: username
    });
    else
    res.redirect("/");
})
app.post("/blogs",(req,res)=>
{
    if(req.body.blog["img_src"]=="")
    {
        req.body.blog["img_src"]="http://www.bu.edu/careers/files/2017/10/desk-768x512.jpg";
    }
    //console.log(req.body.blog);
    const myblog=new myblogs(req.body.blog);
    myblog.save();
    const blog=new Blog(req.body.blog);
    blog.save().then(()=>
    {
        res.redirect("/blogs");
    }).catch((err)=>
    {
        res.send("new");
    })
})
app.get("/details/:id",(req,res)=>{
    const _id=req.params.id;
    Blog.findById(_id).then((blog)=>
    {
       res.render("details",{
           blog: blog,
           username: username
       });
    }).catch(()=>
    {
        res.redirect("/blogs");
    })
})
app.get("/details/users/:id",(req,res)=>{
    const _id=req.params.id;
    myblogs.findById(_id).then((blog)=>
    {
       res.render("details2",{
           blog: blog,
           username: username
       });
    }).catch(()=>
    {
        res.redirect("/blogs");
    })
})
// app.get("/details/user/:id",(req,res)=>{
//     const _id=req.params.id;
//     Blog.findById(_id).then((blog)=>
//     {
//        res.render("details2",{
//            blog: blog
//        });
//     }).catch(()=>
//     {
//         res.redirect("/blogs");
//     })
// })
app.get("/blogs/del/:username",(req,res)=>
{
    const username=req.params.username;
    console.log("Username: ",username);
    myblogs.findOneAndDelete({
        createdby: username
    }).then(()=>
    {
        console.log("Deleted!!");
    })
    Blog.findOneAndDelete({createdby: username}).then(()=>
    {
        res.redirect("/blogs");
    });
})
app.listen(port,()=>
{
    console.log("Server has started!!");
})