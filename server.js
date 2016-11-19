var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');
var comment=$("#comment");
var submit_comment=$("#submit_comment");
var comment_list=$("#comment_list");
var comments_loader=$("#loader_comments");
var config = {
    user: 'somasundarkr',
    database: 'somasundarkr',
    host: 'db.imad.hasura-app.io',
    port: '5432',
    password: process.env.DB_PASSWORD
};

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(session({
    secret: 'someRandomSecretValue',
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30}
}));

function createTemplate (data) {
    var title = data.title;
    var date = data.date;
    var heading = data.heading;
    var content = data.content;
    
    var htmlTemplate = `
    <html>
            <head>
                    <title>${title}</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
                    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
                    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
                    <link href="/ui/style.css" rel="stylesheet" />
            </head>
                    <body>
                        <div class="container">
                            <div>
                            <a href="/">Home</a>
                            </div>
                            <hr/><h3>${heading}</h3>
                            <div>${date.toDateString()}</div>
                            <div class = para>${content}</div>
                            <hr/>
                            <div>
                            <h4>Comments</h4>
                            <textarea id="comment" rows="5" cols="100" placeholder="Enter your comment here..."></textarea>
                            <br/>
                                    <input type="submit" id="submit_comment" value="Submit" />
                            <br/>
                            <input type="hidden" value="${id}" id="article_id" />
				            <strong id="loader_comments"><span class='glyphicon glyphicon-comment' aria-hidden='true'></span> Loading...</strong>
				            <ul id="comment_list">
				            </ul>
                            </div>
                          </div>
                            <script type="text/javascript" src="https://code.jquery.com/jquery-3.1.1.min.js"></script>
                            <script type = "text/javascript" src = "/ui/main.js" ></script>
                    </body>
    </html>`;
    return htmlTemplate;
}
var rootURL=window.location.protocol+"//"+window.location.host; //http://somasundarkr.imad.hasura-app.io-->
	console.log(rootURL);
//comments specific

	
	submit_comment.click(function(){
		var comment_value=comment.val();
		if(comment_value.length>0){
			var article_id=$("#article_id").val();
			comment.css("outline","none");
			comments_loader.show();
			$.getJSON(rootURL+"/submit",{id:article_id,comment:comment_value}).done(function(comments){
				if(comments.content){
					comments_loader.fadeOut("slow");
					var list="";
					for(var i=comments.content.length-1;i>=0;i--){
						if(comments.id[i]==article_id){
							list+="<li><span class='glyphicon glyphicon-comment' aria-hidden='true'></span> "+escapeHtml(comments.content[i])+"<div class='text-small'><span class='glyphicon glyphicon-time' aria-hidden='true'></span> "+escapeHtml(comments.date[i])+"</div></li>";
						}
					}
					comment_list.html(list);
				}
			}).fail(function(){
				comments_loader.fadeOut("slow");
				comment_list.html("<li><div class='alert-error'><span class='glyphicon glyphicon-exclamation-sign' aria-hidden='true'></span> Error loading comments!<div></li>");
			});
		}else{
			comment.focus();
			comment.css("outline","1px solid #9b302e");
		}
	});
});
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

function hash (input, salt) {
    // How do we create a hash?
    var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');
    return ["pbkdf2Sync", "10000", salt, hashed.toString('hex')].join('$');
}


app.get('/hash/:input', function(req, res) {
   var hashedString = hash(req.params.input, 'this-is-some-random-string');
   res.send(hashedString);
});

app.post('/create-user', function (req, res) {
   // username, password
   // {"username": "somasundarkr", "password": "password"}
   // JSON
   var username = req.body.username;
   var password = req.body.password;
   var salt = crypto.randomBytes(128).toString('hex');
   var dbString = hash(password, salt);
   pool.query('INSERT INTO "user" (username, password) VALUES ($1, $2)', [username, dbString], function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          res.send('User successfully created: ' + username);
      }
   });
});

app.post('/login', function (req, res) {
   var username = req.body.username;
   var password = req.body.password;
   
   pool.query('SELECT * FROM "user" WHERE username = $1', [username], function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          if (result.rows.length === 0) {
              res.status(403).send('username/password is invalid');
          } else {
              // Match the password
              var dbString = result.rows[0].password;
              var salt = dbString.split('$')[2];
              var hashedPassword = hash(password, salt); // Creating a hash based on the password submitted and the original salt
              if (hashedPassword === dbString) {
                
                // Set the session
                req.session.auth = {userId: result.rows[0].id};
                // set cookie with a session id
                // internally, on the server side, it maps the session id to an object
                // { auth: {userId }}
                
                res.send('credentials correct!');
                
              } else {
                res.status(403).send('username/password is invalid');
              }
          }
      }
   });
});

app.get('/check-login', function (req, res) {
   if (req.session && req.session.auth && req.session.auth.userId) {
       // Load the user object
       pool.query('SELECT * FROM "user" WHERE id = $1', [req.session.auth.userId], function (err, result) {
           if (err) {
              res.status(500).send(err.toString());
           } else {
              res.send(result.rows[0].username);    
           }
       });
   } else {
       res.status(400).send('You are not logged in');
   }
});

app.get('/logout', function (req, res) {
   delete req.session.auth;
   res.send('<html><body>Logged out!<br/><br/><a href="/">Back to home</a></body></html>');
});

var pool = new Pool(config);

app.get('/get-articles', function (req, res) {
   // make a select request
   // return a response with the results
   pool.query('SELECT * FROM article ORDER BY date DESC', function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          res.send(JSON.stringify(result.rows));
      }
   });
});

app.get('/get-comments/:articleName', function (req, res) {
   // make a select request
   // return a response with the results
   pool.query('SELECT comment.*, "user".username FROM article, comment, "user" WHERE article.title = $1 AND article.id = comment.article_id AND comment.user_id = "user".id ORDER BY comment.timestamp DESC', [req.params.articleName], function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          res.send(JSON.stringify(result.rows));
      }
   });
});

app.post('/submit-comment/:articleName', function (req, res) {
   // Check if the user is logged in
    if (req.session && req.session.auth && req.session.auth.userId) {
        // First check if the article exists and get the article-id
        pool.query('SELECT * from article where title = $1', [req.params.articleName], function (err, result) {
            if (err) {
                res.status(500).send(err.toString());
            } else {
                if (result.rows.length === 0) {
                    res.status(400).send('Article not found');
                } else {
                    var articleId = result.rows[0].id;
                    // Now insert the right comment for this article
                    pool.query(
                        "INSERT INTO comment (comment, article_id, user_id) VALUES ($1, $2, $3)",
                        [req.body.comment, articleId, req.session.auth.userId],
                        function (err, result) {
                            if (err) {
                                res.status(500).send(err.toString());
                            } else {
                                res.status(200).send('Comment inserted!');
                            }
                        });
                }
            }
       });     
    } else {
        res.status(403).send('Only logged in users can comment');
    }
});

app.get('/articles/:articleName', function (req, res) {
  // SELECT * FROM article WHERE title = '\'; DELETE WHERE a = \'asdf'
  pool.query("SELECT * FROM article WHERE title = $1", [req.params.articleName], function (err, result) {
    if (err) {
        res.status(500).send(err.toString());
    } else{ 
        if (result.rows.length === 0) {
            res.status(404).send('Article not found');
        } else {
            var articleData = result.rows[0];
            res.send(createTemplate(articleData));
        }
    }
  });
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});


app.get('/ui/pic1.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'pic1.jpg'));
});

app.get('/ui/pic2.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'pic2.jpg'));
});

app.get('/ui/:fileName', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', req.params.fileName));
});

var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
