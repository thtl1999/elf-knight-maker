let WORD_DB

fetch('/cardnames.json')
    .then(response => {
        return response.json();
    })
    .then(function(word_json) {
        WORD_DB = [...new Set(word_json)]
    })

function add_card_result(){
    
}

function make_collage(){
    let user_string = document.getElementById('user-string').value
    
}