let WORD_DB
let colors = ['color: #730240', 'color: #304173', 'color: #F2CB05', 'color: #594B04', 'color: #0D0D0D']
let color_index = 0

fetch('/cardnames.json')
    .then(response => {
        return response.json();
    })
    .then(function(word_json) {
        WORD_DB = [...new Set(word_json)]
    })

function get_color(){
    color_index = (color_index + 1) % colors.length
    return colors[color_index]
}

function add_card_result(){

}

function make_collage(){
    let user_string = document.getElementById('user-string').value
    
}