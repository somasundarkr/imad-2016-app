    var commentBtn = document.getElementById('comment_btn');
commentBtn.onclick = function (){
   var commentInput = document.getElementById('comment');
    var comment = commentInput.value;
    console.log('comment is : ',comment);
    
    var request = new XMLHttpRequest();

    request.onreadystatechange = function(){
        if(request.readyState === XMLHttpRequest.DONE){
            if(request.status === 200){
                var comments = request.responseText;
                console.log('comments1 is : ',comments);
                comments = JSON.parse(comments);
                console.log('comments is : ',comments);
                var comment_list='';
                for(var i=0;i<comments.length;i++){
                    var t=i+1;
                    comment_list+='<p>'+'comment '+t+': '+comments[i]+'</p>'+ '<hr>' ;
                }
                var commentz = document.getElementById('comments');
                commentz.innerHTML = comment_list;
            }
            
        }

    };
   request.open('GET', 'http://somasundarkr.imad.hasura-app.io/submit_comment?comment=' +comment, true);
   request.send(null);

};//button onclick function ends

  