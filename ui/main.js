    var commentBtn = document.getElementById('comment_btn');
commentBtn.onclick = function () {
   
  //create a request object  
    var request = new XMLHttpRequest();
// capture the response and store it in a variable
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            // Take some action
            if(request.status === 200){
                //capture the list comments and it as a list
                var comments = request.responseText;
                console.log('comments is : ',comments);
                comments = JSON.parse(comments);
                console.log('comments is : ',comments);
                var comment_list = '';
                for(var i=0; i< comments.length; i++){
                    var t=i+1;
                    comment_list += '<p>' + 'comment '+t+': '+comments[i]+'</p>'+ '<hr>' ;
                }
                var ul = document.getElementById('comments');
                ul.innerHTML = comment_list;
            }
            
        }

    };
    //Make the  request
    var commentInput = document.getElementById('comment');
    var comment = commentInput.value;
    console.log('comment is : ',comment);
   request.open('GET', 'http://somasundarkr.imad.hasura-app.io/submit_comment?comment=' +comment, true);
   request.send(null);

};//button onclick function ends

  