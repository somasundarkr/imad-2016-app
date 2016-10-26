var express = require('express');
var morgan = require('morgan');
var path = require('path');

var app = express();
app.use(morgan('combined'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});
var articles = {
    'article-one':{
                    title : `Article One| SomasundarKr`,
                    heading: `Article One`,
                    date:`10/10/2016`,
                    content: `<p> This is the content of my First web app Article </p>`
    },
    'article-two':{
                    title : `Article Two| SomasundarKr`,
                    heading: `Article Two`,
                    date:`15/10/2016`,
                    content: `<p> This is the content for My Second Article </p>`
    },
    'article-three':{
                    title : `Article Three| SomasundarKr`,
                    heading: `Article Three`,
                    date:`19/10/2016`,
                    content:`<p> This is the content for My Third Webapp Article </p>`
    }
};
function createTemplate(data){
    var title = data.title;
    var date = data.date;
    var heading = data.heading;
    var content = data.content;
        
var htmlTemplate =`
<html>
                            <head>
                            <title> 
                                    ${title} 
                            </title>
                            <meta charset="utf-8">
                             <meta name="viewport" content="width=device-width, initial-scale=1" />
                              <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
                              <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
                              <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
                            <link href="/ui/style.css" rel="stylesheet" />
                            </head>
                            <body>
             <div class = "container">
                            <div><a href = "/">Home</a>
                            </div>
                            <hr/>
                                <h3>${heading}</h3>
                            <hr/>
                                <div>${date}</div>
                            <hr/>
                                <div> ${content} </div>
            </div>
                            </body>
</html>
                            `;
return htmlTemplate;    
}

var counter = 0;
app.get('/counter', function (req, res) {
   counter = counter + 1;
   res.send(counter.toString());
});

var comments=[];
app.get('/submit_comment',function(req,res){
    //to get the comments
 var comment=req.query.comment;
 comments.push(comment);
 console.log('comments is: ',comments);
 res.send(JSON.stringify(comments));

    //to render those comments on the page
});

app.get('/:articleName', function (req,res){
    var articleName = req.params.articleName;
    res.send(createTemplate(articles[articleName]));
});

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/madi.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.jpg'));
});


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
