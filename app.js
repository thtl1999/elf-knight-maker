let WORD_DB
let colors = ['color: #730240', 'color: #304173', 'color: #F2CB05', 'color: #594B04', 'color: #0D0D0D']
let color_index = 0
const removable_chars = [' ', '·', '－', '.', '「', '」', '.']
let unused_substrings = []
let minimum_length_value = 9999999
let minimum_length_substrings = []

let test = 'CNo.92 위해허룡 Heart－eartH Chaos Dragon'

fetch('/cardnames.json')
    .then(response => {
        return response.json();
    })
    .then(function(word_json) {
        WORD_DB = [...new Set(word_json)]
    })

function reset_page(){
    
}

function get_color(){
    color_index = (color_index + 1) % colors.length
    return colors[color_index]
}

function add_card_result(){

}

class Substr{
    constructor(card_name, card_start, card_end, user_start, user_end){
        this.card_name = card_name
        this.card_start = card_start
        this.card_end = card_end
        this.user_start = user_start
        this.user_end = user_end
    }

    is_contain(user_start, user_end){
        if (user_start >= this.user_start && user_end <= this.user_end)
            return true
        else
            return false
    }

    has_index(user_start){
        if (user_start >= this.user_start && user_start <= this.user_end)
            return true
        else
            return false
    }
}

function display_impossible(user_string, problem_index){
    console.log('impossible',problem_index)
}

function make_collage(){
    
    let user_string = document.getElementById('user-string').value
    let substrings = get_all_substrings(user_string)

    // Check if substrings contain user string
    for(let i=0;i<user_string.length;i++){
        let is_possible = substrings.some(substr =>{
            if(substr.has_index(i))
                return true
        })
        
        if(!is_possible){
            display_impossible(user_string, i)
            return
        }
    }

    // Initialize params
    minimum_length_value = 9999999
    minimum_length_substrings = []

    // DFS method to find optimal
    find_minimum(substrings, [], 0)
    console.log(minimum_length_substrings)
}

function find_minimum(s, current_substrs, current_index){
    let substr_has_index = []
    s.forEach(substr => {
        if (substr.has_index(current_index))
            substr_has_index.push(substr)
    })

    // End of user string (empty array)
    if (!substr_has_index.length){
        // Check if this is the new minimum
        if (current_substrs.length < minimum_length_value){
            // Update minimum value
            minimum_length_value = current_substrs.length
            // Shallow copy current substring array
            minimum_length_substrings = [...current_substrs]
        }
        return
    }

    substr_has_index.forEach(substr =>{
        // Find ahead with new substr
        current_index = substr.user_end + 1
        current_substrs.push(substr)
        find_minimum(s, current_substrs, current_index)
        // Restore sequence data
        current_substrs.pop()
    })
}

function get_all_substrings(user_string){
    unused_substrings = []
    let substrings = []

    WORD_DB.forEach(card_name => {
        // Find substrings in a word
        let card_substring_array = get_substrings(user_string, card_name)
        card_substring_array.forEach(substr => {
            // Try add to substring in array
            add_substring(substrings, substr)
        })
    })

    return substrings
}

function add_substring(substr_array, substr){
    for (let i = substr_array.length - 1; i >= 0; i--) {
        let s = substr_array[i]

        // If longer substring exist, exit
        if (s.is_contain(substr.user_start, substr.user_end)){
            unused_substrings.push(substr)
            return
        }

        // If shorter substring exist, delete shorter
        if (substr.is_contain(s.user_start, s.user_end)){
            substr_array.splice(i, 1)
        }
    }

    // Append substring array
    substr_array.push(substr)
}

function get_substrings(user_string, card_name){
    let substr_array = []

    for(let card_index = 0; card_index < card_name.length; card_index++){
        for (let user_index = 0; user_index < user_string.length; user_index++){
            // Do not start searching on removable char
            if (is_removable(card_name[card_index]) || is_removable(user_string[user_index]))
                continue

            let card_strlen = 0
            let user_strlen = 0

            while(card_index + card_strlen < card_name.length && user_index + user_strlen < user_string.length){
                let card_char = card_name[card_index + card_strlen]
                let user_char = user_string[user_index + user_strlen]
                let char_removable = false
                
                // If next char is removable, include
                let next_card_index = card_index + card_strlen + 1
                while(next_card_index < card_name.length && is_removable(card_name[next_card_index])){
                    card_strlen++
                    next_card_index++
                }
                let next_user_index = user_index + user_strlen + 1
                while(next_user_index < user_string.length && is_removable(user_string[next_user_index])){
                    user_strlen++
                    next_user_index++
                }

                // If found substring
                if (card_char.toLowerCase() === user_char.toLowerCase() || char_removable){
                    // Check if front card
                    if (user_index == 0 && card_index != 0)
                        break

                    // Cehck if end card
                    if (user_index + user_strlen == user_string.length - 1 && card_index + card_strlen != card_name.length - 1)
                        break

                    let substr = new Substr(card_name, card_index, card_index + card_strlen, user_index, user_index + user_strlen)
                    add_substring(substr_array, substr)
                }
                else
                    break

                card_strlen++
                user_strlen++
            }
        }
    }

    return substr_array
}

function is_removable(char){
    return removable_chars.includes(char)
}